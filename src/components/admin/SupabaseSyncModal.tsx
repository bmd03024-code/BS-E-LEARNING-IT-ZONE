import React, { useState, useEffect } from 'react';
import { InstituteSettings } from '../../types';
import { supabaseService, SupabaseConnectionStatus } from '../../services/supabaseClient';
import { masterGateway } from '../../services/masterGateway';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Zap,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  onUpdateSettings: (newSettings: InstituteSettings) => void;
  triggerNotification: (msg: string) => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  triggerNotification
}) => {
  const currentConfig = supabaseService.getConfig();
  const [url, setUrl] = useState(settings.supabaseUrl || currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(settings.supabaseAnonKey || currentConfig.anonKey || '');
  const [tableName, setTableName] = useState(settings.supabaseTableName || currentConfig.tableName || 'institute_data');
  const [autoSync, setAutoSync] = useState(settings.supabaseAutoSyncEnabled !== false && currentConfig.autoSync !== false);

  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus | null>(null);

  const [syncingToCloud, setSyncingToCloud] = useState(false);
  const [pullingFromCloud, setPullingFromCloud] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = supabaseService.getConfig();
      if (cfg.url || settings.supabaseUrl) {
        testConnectionNow(settings.supabaseUrl || cfg.url, settings.supabaseAnonKey || cfg.anonKey);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testConnectionNow = async (testUrl?: string, testKey?: string) => {
    setTestingConnection(true);
    setConnectionStatus(null);
    setSyncMessage(null);
    try {
      const res = await supabaseService.testConnection(testUrl || url, testKey || anonKey);
      setConnectionStatus(res);
      if (res.connected) {
        masterGateway.reconnectSupabase();
      }
    } catch (err: any) {
      setConnectionStatus({
        connected: false,
        message: err?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = () => {
    supabaseService.saveConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'institute_data',
      autoSync
    });

    const updatedSettings: InstituteSettings = {
      ...settings,
      supabaseUrl: url.trim(),
      supabaseAnonKey: anonKey.trim(),
      supabaseTableName: tableName.trim() || 'institute_data',
      supabaseAutoSyncEnabled: autoSync
    };

    onUpdateSettings(updatedSettings);
    masterGateway.reconnectSupabase();
    triggerNotification('সুপারবেস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
    testConnectionNow(url.trim(), anonKey.trim());
  };

  const handleUploadAllToSupabase = async () => {
    setSyncingToCloud(true);
    setSyncMessage(null);

    // Save config first
    supabaseService.saveConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      tableName: tableName.trim() || 'institute_data',
      autoSync
    });

    try {
      // Gather all keys from localStorage
      const fullState: Record<string, any> = {};
      const knownKeys = [
        'settings', 'slides', 'shortcuts', 'courses', 'mentors', 'students',
        'routines', 'results', 'admit_cards', 'certificates', 'ledger',
        'notices', 'notes', 'demo_classes', 'gallery', 'chatbot',
        'applications', 'admin_creds'
      ];

      for (const k of knownKeys) {
        try {
          const raw = localStorage.getItem(`bs_${k}`);
          if (raw) {
            fullState[k] = JSON.parse(raw);
          }
        } catch {}
      }

      const res = await supabaseService.syncAllToSupabase(fullState);
      if (res.success) {
        setSyncMessage({
          type: 'success',
          text: res.message || 'সম্পূর্ণ ডেটাবেজ সফলভাবে সুপারবেস ক্লাউডে আপলোড করা হয়েছে!'
        });
        triggerNotification('সুপারবেস ক্লাউডে সমস্ত ডেটা সিঙ্ক সম্পন্ন!');
        testConnectionNow();
      } else {
        setSyncMessage({
          type: 'error',
          text: res.message || 'আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে টেবিল ও পলিসি চেক করুন।'
        });
      }
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: `আপলোড এরর: ${err?.message || 'অজানা ত্রুটি'}`
      });
    } finally {
      setSyncingToCloud(false);
    }
  };

  const handlePullFromSupabase = async () => {
    if (!confirm('সতর্কতা: সুপারবেস থেকে ডেটা লোড করলে বর্তমান ব্রাউজারের ডেটা সুপারবেসের ডেটা দিয়ে আপডেট হবে। আপনি কি এগিয়ে যেতে চান?')) {
      return;
    }

    setPullingFromCloud(true);
    setSyncMessage(null);

    try {
      const res = await supabaseService.pullAllFromSupabase();
      if (res.success && res.data) {
        Object.entries(res.data).forEach(([k, v]) => {
          try {
            localStorage.setItem(`bs_${k}`, JSON.stringify(v));
            localStorage.setItem(`bs_${k}_time`, Date.now().toString());
          } catch {}
        });

        setSyncMessage({
          type: 'success',
          text: `সফলভাবে সুপারবেস থেকে ${Object.keys(res.data).length}টি মডিউলের ডেটা লোড হয়েছে। পেজ রিফ্রেশ করুন।`
        });
        triggerNotification('সুপারবেস থেকে ডেটা সফলভাবে রিসিভ হয়েছে!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncMessage({
          type: 'error',
          text: res.message || 'সুপারবেসে কোনো সংরক্ষিত তথ্য পাওয়া যায়নি।'
        });
      }
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: `ডাউনলোড এরর: ${err?.message || 'অজানা ত্রুটি'}`
      });
    } finally {
      setPullingFromCloud(false);
    }
  };

  const handleCopySql = () => {
    const sql = supabaseService.getSQLSchema();
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    triggerNotification('SQL কোড ক্লিপবোর্ডে কপি হয়েছে!');
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-wide">সুপারবেস (Supabase) ডেটাবেজ ইন্টিগ্রেশন</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PostgreSQL Realtime
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                ফায়ারবেস কোটা সীমাবদ্ধতা মুক্ত শক্তিশালী ক্লাউড ডেটাবেজ ও লাইভ সিঙ্ক
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Indicator */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    connectionStatus?.connected
                      ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse'
                      : connectionStatus === null
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>লাইভ স্ট্যাটাস:</span>
                    <span
                      className={
                        connectionStatus?.connected
                          ? 'text-emerald-700 font-extrabold'
                          : 'text-slate-600'
                      }
                    >
                      {testingConnection
                        ? 'কানেকশন পরীক্ষা করা হচ্ছে...'
                        : connectionStatus?.connected
                        ? 'সফলভাবে সংযুক্ত (Connected)'
                        : 'সংযুক্ত নয় (Not Connected)'}
                    </span>
                  </h4>
                  {connectionStatus && (
                    <p className="text-[11px] text-slate-600 mt-0.5">{connectionStatus.message}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => testConnectionNow()}
                disabled={testingConnection || !url || !anonKey}
                className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${testingConnection ? 'animate-spin' : ''}`} />
                <span>পুনরায় টেস্ট করুন</span>
              </button>
            </div>
          </div>

          {/* Sync Result Notice */}
          {syncMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-medium border ${
                syncMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {syncMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <p className="flex-1">{syncMessage.text}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                <span>Supabase Project URL</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Supabase ড্যাশবোর্ড খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="text"
                placeholder="https://xyzabcdefghijklmn.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                পাবেন: Project Settings &rarr; Configuration &rarr; API &rarr; Project URL
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Supabase Anon / Public Key (API Key)
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full pr-10 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                পাবেন: Project Settings &rarr; Configuration &rarr; API &rarr; Project API keys &rarr; <code>anon public</code>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  টেবিলের নাম (Table Name)
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div>
                  <span className="block text-xs font-bold text-slate-800">স্বয়ংক্রিয় লাইভ সিঙ্ক</span>
                  <span className="text-[10px] text-slate-500">পরিবর্তন সাথে সাথে ক্লাউডে যাবে</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick SQL Schema Setup Guide (Collapsible) */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-700" />
                <h5 className="text-xs font-extrabold text-emerald-950">
                  ১-ক্লিকে সুপারবেস স্কিমা ও টেবিল তৈরি করুন (SQL Schema)
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                {showSqlGuide ? 'লুকান' : 'কোড দেখুন'}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              সুপারবেসে <code>{tableName}</code> টেবিলটি তৈরি না থাকলে নিচের বোতামে চাপ দিয়ে প্রস্তুতকৃত SQL কোডটি কপি করুন এবং Supabase ড্যাশবোর্ডের <b>SQL Editor</b>-এ পেস্ট করে <b>RUN</b> চাপুন।
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                {sqlCopied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{sqlCopied ? 'SQL কপি হয়েছে!' : 'SQL কোড কপি করুন'}</span>
              </button>
              <a
                href="https://supabase.com/dashboard/project/_/sql"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <span>Supabase SQL Editor খুলুন</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            {showSqlGuide && (
              <pre className="p-3 bg-slate-900 text-emerald-300 text-[10px] font-mono rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                {supabaseService.getSQLSchema()}
              </pre>
            )}
          </div>

          {/* Action Operations */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>ডেটাবেজ ব্যাকআপ ও মাইগ্রেশন অ্যাকশন</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleUploadAllToSupabase}
                disabled={syncingToCloud || !url || !anonKey}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 text-emerald-300 ${syncingToCloud ? 'animate-bounce' : ''}`} />
                <span>
                  {syncingToCloud ? 'আপলোড হচ্ছে...' : 'সম্পূর্ণ ডেটা সুপারবেসে আপলোড করুন'}
                </span>
              </button>

              <button
                onClick={handlePullFromSupabase}
                disabled={pullingFromCloud || !url || !anonKey}
                className="p-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-50"
              >
                <DownloadCloud className={`w-4 h-4 text-blue-600 ${pullingFromCloud ? 'animate-bounce' : ''}`} />
                <span>
                  {pullingFromCloud ? 'লোড হচ্ছে...' : 'সুপারবেস থেকে ডেটা নামিয়ে আনুন'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>RLS সিকিউরিটি ও পোস্টগ্রেস ব্যাকড রিয়েল-টাইম আর্কিটেকচার</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handleSaveConfig}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>কনফিগারেশন সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
