/**
 * ============================================================================
 * Supabase Database & Real-Time Sync Client for BS E-Learning & IT Zone
 * ============================================================================
 * 
 * Provides PostgreSQL storage, Real-time sync, and backup capabilities
 * to completely eliminate reliance on exhausted Firebase quotas.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
  autoSync: boolean;
}

export interface SupabaseConnectionStatus {
  connected: boolean;
  message: string;
  tableExists?: boolean;
  rowCount?: number;
  latencyMs?: number;
}

// Storage keys
const STORAGE_KEY_URL = 'bs_supabase_url';
const STORAGE_KEY_KEY = 'bs_supabase_anon_key';
const STORAGE_KEY_TABLE = 'bs_supabase_table';
const STORAGE_KEY_AUTOSYNC = 'bs_supabase_autosync';

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;
  private activeChannel: any = null;
  private currentUrl: string = '';
  private currentKey: string = '';
  private tableName: string = 'institute_data';

  private constructor() {
    this.initFromStoredConfig();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Load Supabase configuration from environment or localStorage
   */
  public getConfig(): SupabaseConfig {
    const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_URL || '') : '';
    const envKey = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '') : '';

    let storedUrl = '';
    let storedKey = '';
    let storedTable = 'institute_data';
    let storedAutoSync = true;

    if (typeof window !== 'undefined' && window.localStorage) {
      storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
      storedKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
      storedTable = localStorage.getItem(STORAGE_KEY_TABLE) || 'institute_data';
      const autoStr = localStorage.getItem(STORAGE_KEY_AUTOSYNC);
      storedAutoSync = autoStr !== null ? autoStr === 'true' : true;
    }

    return {
      url: storedUrl || envUrl,
      anonKey: storedKey || envKey,
      tableName: storedTable || 'institute_data',
      autoSync: storedAutoSync
    };
  }

  /**
   * Save configuration to localStorage
   */
  public saveConfig(config: Partial<SupabaseConfig>) {
    if (typeof window === 'undefined' || !window.localStorage) return;

    if (config.url !== undefined) {
      localStorage.setItem(STORAGE_KEY_URL, config.url.trim());
      this.currentUrl = config.url.trim();
    }
    if (config.anonKey !== undefined) {
      localStorage.setItem(STORAGE_KEY_KEY, config.anonKey.trim());
      this.currentKey = config.anonKey.trim();
    }
    if (config.tableName !== undefined) {
      localStorage.setItem(STORAGE_KEY_TABLE, config.tableName.trim());
      this.tableName = config.tableName.trim();
    }
    if (config.autoSync !== undefined) {
      localStorage.setItem(STORAGE_KEY_AUTOSYNC, config.autoSync ? 'true' : 'false');
    }

    // Re-initialize client with new credentials
    this.initClient(this.currentUrl, this.currentKey);
  }

  /**
   * Initialize Supabase client
   */
  private initFromStoredConfig() {
    const config = this.getConfig();
    if (config.url && config.anonKey) {
      this.initClient(config.url, config.anonKey);
    }
  }

  private initClient(url: string, key: string) {
    if (!url || !key) {
      this.client = null;
      return;
    }

    try {
      // Validate basic URL structure
      new URL(url);
      this.client = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      this.currentUrl = url;
      this.currentKey = key;
    } catch (e) {
      console.warn('[Supabase] Failed to initialize client:', e);
      this.client = null;
    }
  }

  /**
   * Get raw Supabase client
   */
  public getClient(): SupabaseClient | null {
    if (!this.client) {
      const config = this.getConfig();
      if (config.url && config.anonKey) {
        this.initClient(config.url, config.anonKey);
      }
    }
    return this.client;
  }

  /**
   * Check if Supabase client is configured
   */
  public isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.url && config.anonKey);
  }

  /**
   * Test Supabase connection and table presence
   */
  public async testConnection(customUrl?: string, customKey?: string): Promise<SupabaseConnectionStatus> {
    const url = customUrl || this.getConfig().url;
    const key = customKey || this.getConfig().anonKey;
    const table = this.getConfig().tableName || 'institute_data';

    if (!url || !key) {
      return {
        connected: false,
        message: 'সুপারবেস প্রজেক্ট URL এবং Anon Key প্রদান করুন।'
      };
    }

    try {
      new URL(url);
    } catch {
      return {
        connected: false,
        message: 'সুপারবেস URL সঠিক নয়। উদাহরণ: https://xyzcompany.supabase.co'
      };
    }

    const testClient = createClient(url, key);
    const start = Date.now();

    try {
      // Attempt to query the table
      const { data, error, count } = await testClient
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);

      const latencyMs = Date.now() - start;

      if (error) {
        // Table might not exist yet (code 42P01 in Postgres)
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return {
            connected: true,
            tableExists: false,
            latencyMs,
            message: `সুপারবেস সফলভাবে কানেক্ট হয়েছে (${latencyMs}ms), তবে '${table}' টেবিলটি এখনো তৈরি করা হয়নি। নিচে দেয়া SQL কোড কপি করে Supabase SQL Editor-এ রান করুন।`
          };
        }
        return {
          connected: false,
          message: `কানেকশন এরর: ${error.message} (${error.code || 'Error'})`
        };
      }

      return {
        connected: true,
        tableExists: true,
        rowCount: count ?? (data ? data.length : 0),
        latencyMs,
        message: `সুপারবেস ডেটাবেজ সম্পূর্ণ সক্রিয় ও কানেক্টেড! লেটেন্সি: ${latencyMs}ms, মোট রেকর্ড: ${count ?? 0}টি।`
      };
    } catch (err: any) {
      return {
        connected: false,
        message: `সার্ভার কানেকশন ব্যর্থ হয়েছে: ${err?.message || 'Unknown network error'}`
      };
    }
  }

  /**
   * SQL Schema generator for easy copy-paste into Supabase SQL Editor
   */
  public getSQLSchema(): string {
    const table = this.getConfig().tableName || 'institute_data';
    return `-- ==================================================================
-- BS E-LEARNING & IT ZONE: Supabase Database Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==================================================================

-- 1. Create table for instant real-time institute data
CREATE TABLE IF NOT EXISTS public.${table} (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow Anyone (Public) to Read Data
DROP POLICY IF EXISTS "Public Read Access" ON public.${table};
CREATE POLICY "Public Read Access"
  ON public.${table}
  FOR SELECT
  USING (true);

-- 4. Policy: Allow Anyone with Anon Key to Insert/Update Data
DROP POLICY IF EXISTS "Public Upsert Access" ON public.${table};
CREATE POLICY "Public Upsert Access"
  ON public.${table}
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Enable Real-Time Broadcast on ${table}
ALTER PUBLICATION supabase_realtime ADD TABLE public.${table};

-- 6. Trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_${table}_updated_at ON public.${table};
CREATE TRIGGER update_${table}_updated_at
  BEFORE UPDATE ON public.${table}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;
  }

  /**
   * Push full state or single collection to Supabase
   */
  public async pushData(id: string, dataPayload: any): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'সুপারবেস ক্লায়েন্ট কনফিগার করা হয়নি।' };
    }

    const table = this.getConfig().tableName || 'institute_data';

    try {
      const { error } = await client
        .from(table)
        .upsert(
          {
            id,
            data: dataPayload,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('[Supabase Push Error]:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: `সুপারবেসে '${id}' সফলভাবে সিঙ্ক হয়েছে!` };
    } catch (e: any) {
      console.error('[Supabase Push Exception]:', e);
      return { success: false, message: e?.message || 'Unknown push error' };
    }
  }

  /**
   * Push entire institute database state to Supabase
   */
  public async syncAllToSupabase(fullState: Record<string, any>): Promise<{ success: boolean; message: string; count?: number }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'সুপারবেস কনফিগার করা নেই। অনুগ্রহ করে URL ও Key দিন।' };
    }

    const table = this.getConfig().tableName || 'institute_data';

    try {
      const rows = Object.entries(fullState).map(([key, val]) => ({
        id: key,
        data: val,
        updated_at: new Date().toISOString()
      }));

      // Also save the master combined database as a single bundle for instant 1-shot hydration
      rows.push({
        id: 'master_bundle',
        data: fullState,
        updated_at: new Date().toISOString()
      });

      const { error } = await client
        .from(table)
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        return { success: false, message: `আপলোড ব্যর্থ: ${error.message}` };
      }

      return {
        success: true,
        count: rows.length,
        message: `আলহামদুলিল্লাহ! সর্বমোট ${rows.length}টি মডিউলের ডেটা সুপারবেস ক্লাউডে সম্পূর্ণভাবে সিঙ্ক হয়েছে।`
      };
    } catch (e: any) {
      return { success: false, message: `ব্যর্থ হয়েছে: ${e?.message || 'Network error'}` };
    }
  }

  /**
   * Pull entire state from Supabase
   */
  public async pullAllFromSupabase(): Promise<{ success: boolean; data?: Record<string, any>; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'সুপারবেস ক্লায়েন্ট কনফিগার করা হয়নি।' };
    }

    const table = this.getConfig().tableName || 'institute_data';

    try {
      const { data, error } = await client
        .from(table)
        .select('*');

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, message: 'সুপারবেসে কোনো ডেটা পাওয়া যায়নি।' };
      }

      // Check if master_bundle exists for full state
      const masterBundle = data.find((row: any) => row.id === 'master_bundle');
      if (masterBundle && masterBundle.data) {
        return {
          success: true,
          data: masterBundle.data,
          message: 'সুপারবেস থেকে সম্পূর্ণ মাস্টার বান্ডল ডেটা লোড হয়েছে।'
        };
      }

      // Otherwise assemble map of id -> data
      const assembled: Record<string, any> = {};
      data.forEach((row: any) => {
        if (row.id && row.data !== undefined) {
          assembled[row.id] = row.data;
        }
      });

      return {
        success: true,
        data: assembled,
        message: `সুপারবেস থেকে ${Object.keys(assembled).length}টি কালেকশন সফলভাবে নামিয়ে আনা হয়েছে।`
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Error pulling data' };
    }
  }

  /**
   * Setup real-time listener for live sync across devices
   */
  public subscribeToRealtime(onDataUpdate: (key: string, data: any) => void): () => void {
    const client = this.getClient();
    if (!client) {
      return () => {};
    }

    const table = this.getConfig().tableName || 'institute_data';

    try {
      if (this.activeChannel) {
        client.removeChannel(this.activeChannel);
      }

      this.activeChannel = client
        .channel(`public:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload: any) => {
            const newRecord = payload.new;
            if (newRecord && newRecord.id) {
              if (newRecord.id === 'master_bundle' && typeof newRecord.data === 'object') {
                Object.entries(newRecord.data).forEach(([k, v]) => {
                  onDataUpdate(k, v);
                });
              } else {
                onDataUpdate(newRecord.id, newRecord.data);
              }
            }
          }
        )
        .subscribe((status: string) => {
          console.log(`[Supabase Realtime] Channel status:`, status);
        });

      return () => {
        if (this.activeChannel && client) {
          client.removeChannel(this.activeChannel);
          this.activeChannel = null;
        }
      };
    } catch (e) {
      console.warn('[Supabase Realtime] Subscription error:', e);
      return () => {};
    }
  }
}

export const supabaseService = SupabaseService.getInstance();
