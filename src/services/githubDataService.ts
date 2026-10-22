/**
 * ============================================================================
 * BS E-Learning & IT Zone - GitHub Single Source of Truth Data Service
 * ============================================================================
 * 
 * Architecture:
 * 1. GitHub Repository is the SINGLE Source of Truth:
 *    All institutional data (courses, mentors, students, settings, notices, etc.)
 *    is persisted in `data/institute_db.json` and `public/institute_db.json`.
 * 2. Admin Mutations -> Direct GitHub Commit:
 *    When admin saves changes, data is securely committed to GitHub (via Client REST API
 *    or Server Proxy).
 * 3. Vercel Auto-Deploy & Live Sync:
 *    Every commit to the main branch automatically triggers a Vercel build & deployment.
 * 4. Multi-Browser Instant Hydration:
 *    Clients pull fresh data directly from GitHub Raw Content API (with cache-busting)
 *    and fallback to `/institute_db.json`, ensuring all visitors see the latest updates.
 * 5. Cross-Tab Sync via Web BroadcastChannel API.
 */

export interface GitHubConfig {
  repo: string;          // e.g. "bmd03024-code/BS-E-LEARNING-IT-ZONE"
  branch: string;        // e.g. "main"
  token: string;         // GitHub Personal Access Token (classic `repo` or fine-grained Contents: write)
  autoPushEnabled: boolean;
  dataPath: string;      // default: "data/institute_db.json"
}

export interface GitHubCommitResult {
  success: boolean;
  message: string;
  commitSha?: string;
  commitUrl?: string;
  timestamp?: number;
  error?: string;
}

export interface GitHubConnectionResult {
  connected: boolean;
  fullName?: string;
  defaultBranch?: string;
  canPush?: boolean;
  message?: string;
}

const STORAGE_KEYS = {
  TOKEN: 'bs_github_token',
  REPO: 'bs_github_repo',
  BRANCH: 'bs_github_branch',
  AUTOPUSH: 'bs_github_autopush',
  LAST_SHA: 'bs_github_last_sha',
  LAST_SYNC: 'bs_github_last_sync'
};

const DEFAULT_REPO = 'bmd03024-code/BS-E-LEARNING-IT-ZONE';
const DEFAULT_BRANCH = 'main';
const DEFAULT_PATH = 'data/institute_db.json';

class GitHubDataService {
  private static instance: GitHubDataService;
  private channel: BroadcastChannel | null = null;
  private autoPollTimer: any = null;
  private pendingPushTimeout: any = null;

  private constructor() {
    this.setupBroadcastChannel();
    this.setupFocusListener();
  }

  public static getInstance(): GitHubDataService {
    if (!GitHubDataService.instance) {
      GitHubDataService.instance = new GitHubDataService();
    }
    return GitHubDataService.instance;
  }

  private setupBroadcastChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    try {
      this.channel = new BroadcastChannel('bs_github_data_sync');
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'GITHUB_SYNC_UPDATED') {
          console.log('[GitHub Sync] Received cross-tab update from another tab');
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'all', fromGitHub: true } }));
        }
      };
    } catch (e) {
      console.warn('[GitHub Sync] BroadcastChannel setup notice:', e);
    }
  }

  private setupFocusListener() {
    if (typeof window === 'undefined') return;
    // When user switches back to this browser tab, check for fresh data from GitHub
    window.addEventListener('focus', () => {
      const lastSync = Number(localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || 0);
      // If last sync was more than 30 seconds ago, pull fresh data
      if (Date.now() - lastSync > 30000) {
        this.pullLatestData().catch(() => {});
      }
    });
  }

  /**
   * Retrieve current GitHub configuration from localStorage / defaults
   */
  public getConfig(): GitHubConfig {
    if (typeof window === 'undefined') {
      return {
        repo: DEFAULT_REPO,
        branch: DEFAULT_BRANCH,
        token: '',
        autoPushEnabled: true,
        dataPath: DEFAULT_PATH
      };
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
    const repo = localStorage.getItem(STORAGE_KEYS.REPO) || DEFAULT_REPO;
    const branch = localStorage.getItem(STORAGE_KEYS.BRANCH) || DEFAULT_BRANCH;
    const autoPush = localStorage.getItem(STORAGE_KEYS.AUTOPUSH) !== 'false';

    return {
      repo: repo.trim(),
      branch: branch.trim(),
      token: token.trim(),
      autoPushEnabled: autoPush,
      dataPath: DEFAULT_PATH
    };
  }

  /**
   * Save GitHub configuration
   */
  public saveConfig(config: Partial<GitHubConfig>): void {
    if (typeof window === 'undefined') return;
    if (config.token !== undefined) localStorage.setItem(STORAGE_KEYS.TOKEN, config.token.trim());
    if (config.repo !== undefined) localStorage.setItem(STORAGE_KEYS.REPO, config.repo.trim());
    if (config.branch !== undefined) localStorage.setItem(STORAGE_KEYS.BRANCH, config.branch.trim());
    if (config.autoPushEnabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.AUTOPUSH, config.autoPushEnabled ? 'true' : 'false');
    }
  }

  /**
   * Test connection to GitHub repository using personal access token
   */
  public async testConnection(token?: string, repo?: string): Promise<GitHubConnectionResult> {
    const cfg = this.getConfig();
    const finalToken = (token !== undefined ? token : cfg.token).trim();
    const finalRepo = (repo !== undefined ? repo : cfg.repo).trim();

    if (!finalRepo) {
      return { connected: false, message: 'রিপোজিটরির নাম দেওয়া হয়নি (যেমন: bmd03024-code/BS-E-LEARNING-IT-ZONE)' };
    }

    try {
      // 1. Try server endpoint first if available
      try {
        const srvRes = await fetch(`/api/github/status?token=${encodeURIComponent(finalToken)}&repo=${encodeURIComponent(finalRepo)}`);
        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success && srvData.connected) {
            return {
              connected: true,
              fullName: srvData.fullName,
              defaultBranch: srvData.defaultBranch,
              canPush: Boolean(finalToken),
              message: `কানেক্টেড! রিপোজিটরি: ${srvData.fullName} (ডিফল্ট ব্রাঞ্চ: ${srvData.defaultBranch})`
            };
          }
        }
      } catch {
        // Fallback to direct client-side GitHub REST API (100% works on Vercel static)
      }

      // 2. Direct client-side GitHub REST API
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      if (finalToken) {
        headers['Authorization'] = `Bearer ${finalToken}`;
      }

      const res = await fetch(`https://api.github.com/repos/${finalRepo}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const canPush = Boolean(data.permissions ? data.permissions.push : finalToken);
        return {
          connected: true,
          fullName: data.full_name,
          defaultBranch: data.default_branch,
          canPush,
          message: `কানেক্টেড! রিপোজিটরি: ${data.full_name} (${canPush ? 'রাইট পারমিশন সক্রিয় ✅' : 'রিড-অনলি পারমিশন'})`
        };
      } else {
        const err = await res.json().catch(() => ({}));
        return {
          connected: false,
          message: err.message || `GitHub HTTP Error ${res.status}: টোকেন বা রিপোজিটরি নাম পরীক্ষা করুন`
        };
      }
    } catch (e: any) {
      return {
        connected: false,
        message: e?.message || 'GitHub সংযোগে ত্রুটি ঘটেছে'
      };
    }
  }

  /**
   * Pull latest database from GitHub raw content or local static file
   * (Ensures multi-browser synchronization)
   */
  public async pullLatestData(): Promise<{ success: boolean; data?: Record<string, any>; source?: string }> {
    const cfg = this.getConfig();
    let data: Record<string, any> | null = null;
    let source = '';

    const timestamp = Date.now();

    // 1. Attempt GitHub Raw Content API (Direct Single Source of Truth)
    if (cfg.repo && cfg.branch) {
      const rawUrl = `https://raw.githubusercontent.com/${cfg.repo}/${cfg.branch}/${cfg.dataPath}?t=${timestamp}`;
      try {
        const res = await fetch(rawUrl, { cache: 'no-store' });
        if (res.ok) {
          const parsed = await res.json();
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            data = parsed;
            source = `GitHub Raw (${cfg.repo}@${cfg.branch})`;
          }
        }
      } catch (e) {
        console.warn('[GitHub Sync] Raw fetch notice:', e);
      }
    }

    // 2. Fallback to server REST API / static paths (Vercel public file)
    if (!data) {
      const candidatePaths = ['/api/sync/all', '/institute_db.json', '/data/institute_db.json'];
      for (const p of candidatePaths) {
        try {
          const res = await fetch(`${p}?t=${timestamp}`, { cache: 'no-store' });
          const cType = res.headers.get('content-type') || '';
          if (res.ok && cType.includes('application/json')) {
            const parsed = await res.json();
            const actual = parsed.data || parsed;
            if (actual && typeof actual === 'object' && Object.keys(actual).length > 0) {
              data = actual;
              source = p;
              break;
            }
          }
        } catch {}
      }
    }

    if (data && typeof data === 'object') {
      // Save all keys into LocalStorage
      for (const key of Object.keys(data)) {
        try {
          localStorage.setItem(`bs_${key}`, JSON.stringify(data[key]));
        } catch {}
      }
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(timestamp));

      // Broadcast update to all components in current window
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'all', source } }));

      // Broadcast to other tabs
      try {
        if (this.channel) {
          this.channel.postMessage({ type: 'GITHUB_SYNC_UPDATED', timestamp });
        }
      } catch {}

      return { success: true, data, source };
    }

    return { success: false };
  }

  /**
   * Helper to encode UTF-8 string to Base64 in browser and node environments
   */
  private toBase64(str: string): string {
    try {
      // Modern browser safe UTF-8 base64
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
  }

  /**
   * Commit and push database to GitHub
   * Works on both Vercel Static (via direct GitHub REST API) and Node.js Server (via /api/github/push)
   */
  public async commitAndPush(
    database: Record<string, any>,
    commitMessage?: string,
    customToken?: string
  ): Promise<GitHubCommitResult> {
    const cfg = this.getConfig();
    const token = (customToken || cfg.token).trim();
    const repo = cfg.repo.trim();
    const branch = cfg.branch.trim();
    const msg = commitMessage || `Admin Auto-Sync: Updates to institute data [${new Date().toISOString()}]`;

    if (!repo) {
      return { success: false, message: 'GitHub রিপোজিটরির নাম কনফিগার করা হয়নি।' };
    }

    const jsonString = JSON.stringify(database, null, 2);

    // 1. Try server endpoint first (when running on Express full-stack)
    try {
      const srvRes = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          repo,
          branch,
          content: database,
          message: msg
        })
      });

      if (srvRes.ok) {
        const srvData = await srvRes.json();
        if (srvData.success) {
          if (srvData.commitSha) localStorage.setItem(STORAGE_KEYS.LAST_SHA, srvData.commitSha);
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
          this.broadcastCommit(srvData.commitSha);
          return {
            success: true,
            message: srvData.message || 'সফলভাবে GitHub-এ ডাটা কমিট ও পুশ হয়েছে! Vercel স্বয়ংক্রিয়ভাবে নতুন বিল্ড শুরু করেছে।',
            commitSha: srvData.commitSha,
            commitUrl: srvData.commitUrl,
            timestamp: Date.now()
          };
        }
      }
    } catch {
      // Fallback to direct client-side GitHub REST API
    }

    // 2. Direct client-side GitHub REST API (100% works on Vercel Static!)
    if (!token) {
      return {
        success: false,
        message: 'GitHub Personal Access Token প্রয়োজন। অনুগ্রহ করে Admin Panel > GitHub সেটিংসে টোকেন দিন।'
      };
    }

    try {
      const contentBase64 = this.toBase64(jsonString);

      // Files to update in repository: primary data file and public fallback
      const filesToUpdate = [cfg.dataPath, 'public/institute_db.json'];
      let lastCommitSha = '';
      let lastCommitUrl = '';

      for (const filePath of filesToUpdate) {
        // Step A: Get current file SHA if exists
        let currentSha: string | undefined;
        try {
          const checkRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (checkRes.ok) {
            const fileInfo = await checkRes.json();
            currentSha = fileInfo.sha;
          }
        } catch {}

        // Step B: Put commit
        const putPayload: any = {
          message: `${msg} (${filePath})`,
          content: contentBase64,
          branch
        };
        if (currentSha) {
          putPayload.sha = currentSha;
        }

        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putPayload)
        });

        if (putRes.ok) {
          const putData = await putRes.json();
          lastCommitSha = putData.commit?.sha || lastCommitSha;
          lastCommitUrl = putData.commit?.html_url || lastCommitUrl;
        } else {
          const errData = await putRes.json().catch(() => ({}));
          console.warn(`[GitHub Push Warning] Failed for ${filePath}:`, errData);
          if (filePath === cfg.dataPath) {
            return {
              success: false,
              message: errData.message || `GitHub Commit Failed (${putRes.status}): টোকেন পারমিশন ও ব্রাঞ্চ নাম চেক করুন`,
              error: errData.message
            };
          }
        }
      }

      if (lastCommitSha) {
        localStorage.setItem(STORAGE_KEYS.LAST_SHA, lastCommitSha);
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(Date.now()));
        this.broadcastCommit(lastCommitSha);
      }

      return {
        success: true,
        message: 'সফলভাবে GitHub রিপোজিটরিতে ডাটা কমিট ও পুশ হয়েছে! Vercel স্বয়ংক্রিয়ভাবে লাইভ সাইট ডিপ্লয় শুরু করেছে।',
        commitSha: lastCommitSha,
        commitUrl: lastCommitUrl || `https://github.com/${repo}/commit/${lastCommitSha}`,
        timestamp: Date.now()
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'GitHub-এ পুশ করার সময় নেটওয়ার্ক ত্রুটি ঘটেছে।'
      };
    }
  }

  private broadcastCommit(sha?: string) {
    try {
      if (this.channel) {
        this.channel.postMessage({ type: 'GITHUB_SYNC_UPDATED', sha, timestamp: Date.now() });
      }
    } catch {}
  }

  /**
   * Debounced Auto-Push for Admin changes
   */
  public triggerAutoPush(getFullDatabase: () => Record<string, any>, delayMs = 3500) {
    const cfg = this.getConfig();
    if (!cfg.autoPushEnabled || !cfg.token) return;

    if (this.pendingPushTimeout) {
      clearTimeout(this.pendingPushTimeout);
    }

    this.pendingPushTimeout = setTimeout(() => {
      const db = getFullDatabase();
      this.commitAndPush(db, `Admin Auto-Sync: ${new Date().toLocaleTimeString('bn-BD')}`)
        .then((res) => {
          if (res.success) {
            console.log('[GitHub Auto-Push] Success:', res.commitSha);
          }
        })
        .catch((err) => {
          console.warn('[GitHub Auto-Push Catch]:', err);
        });
    }, delayMs);
  }

  /**
   * Start periodic auto-polling for fresh data
   */
  public startAutoPoll(intervalSeconds = 60) {
    if (this.autoPollTimer) clearInterval(this.autoPollTimer);
    this.autoPollTimer = setInterval(() => {
      this.pullLatestData().catch(() => {});
    }, intervalSeconds * 1000);
  }

  public stopAutoPoll() {
    if (this.autoPollTimer) {
      clearInterval(this.autoPollTimer);
      this.autoPollTimer = null;
    }
  }
}

export const githubDataService = GitHubDataService.getInstance();
