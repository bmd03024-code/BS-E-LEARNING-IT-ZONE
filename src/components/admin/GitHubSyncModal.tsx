import React, { useState, useEffect } from 'react';
import { InstituteSettings } from '../../types';
import { storage } from '../../services/storage';
import { githubDataService } from '../../services/githubDataService';
import {
  X,
  GitBranch,
  Github,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  Zap
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  onUpdateSettings: (newSettings: InstituteSettings) => void;
  triggerNotification: (msg: string) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  triggerNotification
}) => {
  const currentCfg = githubDataService.getConfig();
  const [token, setToken] = useState(settings.githubToken || currentCfg.token || '');
  const [repo, setRepo] = useState(settings.githubRepo || currentCfg.repo || 'bmd03024-code/BS-E-LEARNING-IT-ZONE');
  const [branch, setBranch] = useState(settings.githubBranch || currentCfg.branch || 'main');
  const [autoPush, setAutoPush] = useState(settings.githubAutoPushEnabled !== false && currentCfg.autoPushEnabled !== false);

  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected?: boolean;
    message?: string;
    repoName?: string;
    defaultBranch?: string;
  } | null>(null);

  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success?: boolean;
    message?: string;
    commitUrl?: string;
    commitSha?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      testGitHubConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testGitHubConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await githubDataService.testConnection(token.trim(), repo.trim());
      setConnectionStatus({
        connected: res.connected,
        message: res.message,
        repoName: res.fullName,
        defaultBranch: res.defaultBranch
      });
    } catch (e: any) {
      setConnectionStatus({
        connected: false,
        message: 'নেটওয়ার্ক এরর অথবা GitHub সার্ভার রেসপন্স পাওয়া যায়নি।'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = () => {
    const updated: InstituteSettings = {
      ...settings,
      githubToken: token.trim(),
      githubRepo: repo.trim(),
      githubBranch: branch.trim(),
      githubAutoPushEnabled: autoPush
    };
    onUpdateSettings(updated);
    storage.saveSettings(updated);
    githubDataService.saveConfig({
      token: token.trim(),
      repo: repo.trim(),
      branch: branch.trim(),
      autoPushEnabled: autoPush
    });
    triggerNotification('GitHub কনফিগারেশন সংরক্ষিত হয়েছে!');
    alert('✅ GitHub একক ডাটাবেজ কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleManualPush = async () => {
    setPushing(true);
    setPushResult(null);

    // Save configuration first
    handleSaveConfig();

    try {
      const fullDb = storage.getFullDatabase();
      const res = await githubDataService.commitAndPush(
        fullDb,
        `Admin Auto-Sync: Updates to BS E-Learning database [${new Date().toLocaleString('bn-BD')}]`,
        token.trim()
      );

      if (res.success) {
        setPushResult({
          success: true,
          message: res.message,
          commitUrl: res.commitUrl,
          commitSha: res.commitSha
        });
        triggerNotification('GitHub-এ পুশ সম্পন্ন! Vercel স্বয়ংক্রিয়ভাবে নতুন বিল্ড শুরু করেছে।');
      } else {
        setPushResult({
          success: false,
          message: res.message || 'GitHub পুশ ব্যর্থ হয়েছে। অনুগ্রহ করে টোকেন ও পারমিশন চেক করুন।'
        });
      }
    } catch (e: any) {
      setPushResult({
        success: false,
        message: e?.message || 'পুশ করার সময় অপ্রত্যাশিত ত্রুটি ঘটেছে।'
      });
    } finally {
      setPushing(false);
    }
  };

  const handlePullFromGitHub = async () => {
    setPulling(true);
    try {
      const res = await githubDataService.pullLatestData();
      if (res.success) {
        triggerNotification('GitHub থেকে সর্বশেষ ডাটা সফলভাবে নামানো হয়েছে!');
        alert('✅ আলহামদুলিল্লাহ! GitHub রিপোজিটরির data/institute_db.json থেকে সর্বশেষ ডাটা আপনার ব্রাউজারে সিঙ্ক হয়েছে।');
      } else {
        alert('⚠️ GitHub থেকে ডাটা রিড করা যায়নি। ইন্টারনেট সংযোগ ও রিপোজিটরি নাম পরীক্ষা করুন।');
      }
    } catch (e: any) {
      alert(`⚠️ ত্রুটি: ${e?.message || 'GitHub থেকে ডাটা নামানো যায়নি'}`);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Github className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>GitHub একক ডাটাবেজ &amp; Vercel সিঙ্ক</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Single Source of Truth
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              GitHub হবে একমাত্র মূল ডাটা সোর্স। Admin থেকে পুশ করলেই Vercel অটো ডিপ্লয় হবে এবং সব ব্রাউজারে আপডেট দেখা যাবে।
            </p>
          </div>
        </div>

        {/* How It Works Explainer */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 mb-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>অটোমেশন পাইপলাইন কীভাবে কাজ করে:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
            <li>
              অ্যাডমিন প্যানেলে যেকোনো মডিউল পরিবর্তন বা সেভ করা মাত্রই সম্পূর্ণ ডাটাবেজ <span className="font-mono text-emerald-300">data/institute_db.json</span> ফাইলে সেভ হয়।
            </li>
            <li>
              GitHub Personal Access Token দিয়ে আপনার রিপোজিটরিতে (<span className="font-mono text-blue-300">{repo}</span>) নতুন কমিট তৈরি হয়ে নিরাপদে পুশ হয়।
            </li>
            <li>
              Vercel যেহেতু GitHub-এর সাথে কানেক্টেড, পুশ পাওয়া মাত্রই Vercel স্বয়ংক্রিয়ভাবে লাইভ সাইট রি-ডিপ্লয় করে।
            </li>
            <li>
              অন্যান্য ভিজিটর ও ব্রাউজার সরাসরি GitHub Raw Content এবং Vercel থেকে সর্বশেষ তথ্য রিয়েল-টাইমে দেখতে পায়।
            </li>
          </ol>
        </div>

        {/* Connection Status Box */}
        <div className="mb-6">
          {testingConnection ? (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 flex items-center gap-2 text-xs text-slate-300">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>GitHub এপিআই কানেকশন যাচাই করা হচ্ছে...</span>
            </div>
          ) : connectionStatus ? (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                connectionStatus.connected
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
              }`}
            >
              {connectionStatus.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {connectionStatus.connected ? 'GitHub রিপোজিটরি সংযুক্ত ও প্রস্তুত!' : 'কানেকশন সতর্কবার্তা:'}
                </p>
                <p className="text-[11px] leading-relaxed">{connectionStatus.message}</p>
                {!connectionStatus.connected && (
                  <p className="text-[10px] text-amber-300/90 pt-1">
                    পরামর্শ: <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline font-bold text-amber-200">GitHub Settings &rarr; Developer Settings &rarr; Personal access tokens</a> থেকে "repo" পারমিশনসহ একটি নতুন Classic Token তৈরি করে নিচের বক্সে পেস্ট করুন।
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 mb-6">
          {/* GitHub Token */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>GitHub Personal Access Token (PAT) *</span>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showToken ? 'হাইড করুন' : 'টোকেন দেখুন'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                required
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-emerald-400/90 mt-1.5 flex items-start gap-1.5 font-medium bg-emerald-950/30 p-2 rounded-xl border border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>Once the Personal Access Token is entered and saved, it will remain active until its expiration date, ensuring continuous operation for automated deployments and synchronization without needing manual updates.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Repository Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                GitHub Repository (Owner/Repo) *
              </label>
              <input
                type="text"
                required
                value={repo}
                onChange={e => setRepo(e.target.value)}
                placeholder="bmd03024-code/BS-E-LEARNING-IT-ZONE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Target Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Branch *
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Auto Push on Save Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700">
            <div>
              <span className="block text-xs font-bold text-white">সেভ করার সাথে সাথে অটো-পুশ চালু রাখুন</span>
              <span className="block text-[11px] text-slate-400">
                ড্যাশবোর্ডে যেকোনো তথ্য পরিবর্তন করলে স্বয়ংক্রিয়ভাবে GitHub-এ কমিট হবে
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPush}
                onChange={e => setAutoPush(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>

        {/* Push Result Notice */}
        {pushResult && (
          <div
            className={`p-4 rounded-2xl border text-xs mb-6 space-y-1.5 ${
              pushResult.success
                ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200'
                : 'bg-rose-950/60 border-rose-600/80 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {pushResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{pushResult.message}</span>
            </div>
            {pushResult.commitUrl && (
              <a
                href={pushResult.commitUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-emerald-300 hover:underline pt-1"
              >
                <span>কমিট দেখুন: {pushResult.commitSha?.substring(0, 7)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={testingConnection}
              onClick={testGitHubConnection}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>কানেকশন টেস্ট</span>
            </button>

            <button
              type="button"
              disabled={pulling}
              onClick={handlePullFromGitHub}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              title="GitHub রিপোজিটরির data/institute_db.json থেকে সর্বশেষ ডাটা ব্রাউজারে রিফ্রেশ করুন"
            >
              <Download className={`w-3.5 h-3.5 ${pulling ? 'animate-bounce' : ''}`} />
              <span>{pulling ? 'ডাটা আসছে...' : 'GitHub থেকে রিফ্রেশ'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
            >
              কনফিগ সেভ
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              বন্ধ করুন
            </button>

            <button
              type="button"
              disabled={pushing}
              onClick={handleManualPush}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${pushing ? 'animate-pulse' : ''}`} />
              <span>{pushing ? 'পুশ হচ্ছে...' : 'এখনই GitHub-এ পুশ করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
