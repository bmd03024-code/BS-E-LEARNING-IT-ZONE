import React, { useState } from 'react';
import { storage } from '../../services/storage';
import { Shield, Lock, Mail, X, KeyRound, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Master PIN recovery state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const creds = storage.getAdminCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email.trim() === creds.email && password.trim() === creds.password) {
      onLoginSuccess();
    } else {
      setError('ভুল ইউজার আইডি অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।');
    }
  };

  const handleMasterPinReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (enteredPin.trim().length < 6 || enteredPin.trim().length > 11) {
      setError('মাস্টার পিন অবশ্যই সর্বনিম্ন ৬ থেকে সর্বোচ্চ ১১ ডিজিটের মধ্যে হতে হবে।');
      return;
    }

    if (enteredPin.trim() !== creds.masterPin) {
      setError('ভুল মাস্টার পিন (Master PIN)! সঠিক পিন প্রদান করুন।');
      return;
    }

    if (newPassword.trim().length < 4) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    storage.saveAdminCredentials({
      ...creds,
      password: newPassword.trim()
    });

    setPassword(newPassword.trim());
    setResetSuccess(true);

    setTimeout(() => {
      setIsForgotMode(false);
      setResetSuccess(false);
      setEnteredPin('');
      setNewPassword('');
      setError(null);
    }, 2000);
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setEnteredPin('');
    setNewPassword('');
    setError(null);
    setIsForgotMode(false);
    setResetSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 relative text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 mx-auto flex items-center justify-center shadow-lg mb-3">
            <Shield className="w-7 h-7" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white">
            অ্যাডমিন কন্ট্রোল রুম
          </h3>
          <p className="text-xs text-amber-300 font-medium mt-1">
            BS E-Learning &amp; IT Zone • সিকিউরড গেটওয়ে
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccess ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!
              </h4>
              <p className="text-xs text-slate-600">
                লগইন স্ক্রিনে ফিরে যাওয়া হচ্ছে...
              </p>
            </div>
          ) : isForgotMode ? (
            /* Master PIN Recovery Form */
            <form onSubmit={handleMasterPinReset} className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-900">
                  <KeyRound className="w-4 h-4 text-blue-700" />
                  <span>মাস্টার পিন (Master PIN) রিকভারি</span>
                </p>
                <p className="text-[11px] text-slate-700">
                  অ্যাডমিন প্যানেলে নির্ধারিত ৬-১১ ডিজিটের সুরক্ষিত ও গোপন মাস্টার পিন ব্যবহার করে তাৎক্ষণিক পাসওয়ার্ড রিসেট করুন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গোপন মাস্টার পিন (Master PIN) লিখুন * (৬-১১ ডিজিট)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={11}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest text-center font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নতুন গোপন পাসওয়ার্ড * (সর্বদা মাস্কড)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-600 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>মাস্টার পিন দিয়ে পাসওয়ার্ড রিসেট করুন</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false);
                  setError(null);
                }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                লগইনে ফিরে যান
              </button>
            </form>
          ) : (
            /* Regular Login Form - Password strictly masked by default */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অ্যাডমিন আইডি (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="অ্যাডমিন ইমেইল / ইউজার আইডি"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    গোপন পাসওয়ার্ড * (সুরক্ষিত ও মাস্কড)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-blue-800 hover:text-blue-950 underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন? (মাস্টার পিন)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
