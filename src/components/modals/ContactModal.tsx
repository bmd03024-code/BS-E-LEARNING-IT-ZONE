import React, { useState } from 'react';
import { InstituteSettings } from '../../types';
import { X, PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, settings }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold text-white">যোগাযোগ ও ভর্তি সহায়তা</h3>
          <p className="text-xs text-slate-300 mt-0.5">সরাসরি প্রধান শিক্ষক বা ভর্তি বিভাগের সাথে যোগাযোগ করুন</p>
        </div>

        <div className="p-6 space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">আপনার বার্তা সফলভাবে পাঠানো হয়েছে!</h4>
              <p className="text-xs text-slate-600">আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>হটলাইন ও বিকাশ: <b className="font-mono text-slate-900">{settings.hotline}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ইমেইল: <b className="font-mono text-slate-900">{settings.email}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>ঠিকানা: <b>{settings.address}</b></span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কোন কোর্সে আগ্রহী বা আপনার বার্তা *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="কোর্সের নাম বা প্রশ্ন লিখুন..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>বার্তা পাঠিয়ে দিন</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
