import React, { useState, useEffect } from 'react';
import {
  InstituteSettings,
  HeroSlide,
  ShortcutItem,
  Course,
  Mentor,
  Student,
  RoutineItem,
  ResultRecord,
  AdmitCardRecord,
  LedgerItem,
  NoticeItem,
  GalleryItem,
  FreeNoteItem,
  DemoClassItem,
  ChatbotSettings,
  EnrollmentApplication,
  AdminCredentials,
  CertificateRecord
} from '../../types';
import { storage } from '../../services/storage';
import {
  Settings,
  Sliders,
  Users,
  GraduationCap,
  Layers,
  Ticket,
  DollarSign,
  BookOpen,
  Calendar,
  FileText,
  ShieldAlert,
  Save,
  Plus,
  Trash2,
  Award,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewWebsite }) => {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('সবকিছু সিঙ্কড');

  // Load live data from storage
  const [settings, setSettings] = useState<InstituteSettings>(storage.getSettings());
  const [slides, setSlides] = useState<HeroSlide[]>(storage.getSlides());
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(storage.getShortcuts());
  const [courses, setCourses] = useState<Course[]>(storage.getCourses());
  const [mentors, setMentors] = useState<Mentor[]>(storage.getMentors());
  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [applications, setApplications] = useState<EnrollmentApplication[]>(storage.getApplications());
  const [routines, setRoutines] = useState<RoutineItem[]>(storage.getRoutines());
  const [results, setResults] = useState<ResultRecord[]>(storage.getResults());
  const [admitCards, setAdmitCards] = useState<AdmitCardRecord[]>(storage.getAdmitCards());
  const [certificates, setCertificates] = useState<CertificateRecord[]>(storage.getCertificates());
  const [ledger, setLedger] = useState<LedgerItem[]>(storage.getLedger());
  const [notices, setNotices] = useState<NoticeItem[]>(storage.getNotices());
  const [gallery, setGallery] = useState<GalleryItem[]>(storage.getGallery());
  const [notes, setNotes] = useState<FreeNoteItem[]>(storage.getNotes());
  const [demoClasses, setDemoClasses] = useState<DemoClassItem[]>(storage.getDemoClasses());
  const [chatbot, setChatbot] = useState<ChatbotSettings>(storage.getChatbot());
  const [creds, setCreds] = useState<AdminCredentials>(storage.getAdminCredentials());

  // Listen to background sync events
  useEffect(() => {
    const handleSync = () => {
      setSyncStatus('লাইভ আপডেট হয়েছে');
      setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 2000);
    };
    window.addEventListener('bs_sync', handleSync);
    return () => window.removeEventListener('bs_sync', handleSync);
  }, []);

  const triggerSaveNotification = (msg: string = 'সংরক্ষণ সফল!') => {
    setSyncStatus(msg);
    setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 2500);
  };

  // The 14 Modules Catalog
  const moduleCatalog = [
    { id: 1, title: 'প্রতিষ্ঠাতা, হেডার, ফুটার ও সিল-স্বাক্ষর', desc: 'লোগো পরিবর্তন, ফন্ট সাইজ, প্রধান শিক্ষকের বাণী/ছবি/স্বাক্ষর, সম্পূর্ণ ফুটার ও বাংলা কিউআর কন্ট্রোল', icon: Settings, color: 'from-blue-600 to-indigo-700' },
    { id: 2, title: 'হিরো স্লাইডার ম্যানেজমেন্ট', desc: 'হোম পেজের ৩টি স্লাইডের ছবি, শিরোনাম ও সাবটেক্সট এডিট এবং নতুন স্লাইড যোগ', icon: Sliders, color: 'from-amber-600 to-orange-700' },
    { id: 3, title: 'শিক্ষক মণ্ডলী প্রোফাইল ম্যানেজমেন্ট', desc: 'শিক্ষকদের তালিকা এডিট, ছবি, যোগ্যতা, নতুন শিক্ষক যুক্তকরণ ও টিচার আইডি কার্ড প্রিন্ট', icon: Users, color: 'from-emerald-600 to-teal-700' },
    { id: 4, title: 'শিক্ষার্থীদের ডাটাবেজ ও আইডি কার্ড প্রিন্ট', desc: 'শিক্ষাবর্ষ ও কোর্সভিত্তিক তালিকা, শিক্ষার্থী এডিট, আইডি কার্ড প্রিন্ট, সাইন কপি ও হাজিরা শিট', icon: GraduationCap, color: 'from-purple-600 to-indigo-800' },
    { id: 5, title: 'কোর্সভিত্তিক বিষয় ও পরীক্ষা অ্যাড', desc: 'কোর্সভিত্তিক ম্যানুয়ালি একাধিক বিষয় (Subjects) এবং পরীক্ষা (Exams) যুক্ত ও এডিট করা', icon: Layers, color: 'from-violet-600 to-purple-800' },
    { id: 6, title: 'এডমিট কার্ড ম্যানেজমেন্ট ও কন্ট্রোল', desc: 'এডমিট কার্ড এডিট, ফি পরিশোধ সাপেক্ষে পারমিশন কন্ট্রোল (Block/Unblock) ও প্রিন্ট', icon: Ticket, color: 'from-rose-600 to-red-700' },
    { id: 7, title: 'সার্টিফিকেট জেনারেটর ও ফি সিস্টেম', desc: 'অটো রোল সার্চে সনদ তৈরি, ফি নির্ধারণ/ফ্রি টগল এবং আজীবন ফ্রি রি-ডাউনলোড কন্ট্রোল', icon: Award, color: 'from-amber-600 to-yellow-600' },
    { id: 8, title: 'কোর্স ম্যানেজমেন্ট, ফি ও কোর্স লোগো', desc: 'নতুন কোর্স যোগ, কোর্স লোগো/থাম্বনেইল আপলোড, ভর্তি ফি, মাসিক ফি ও সনদ ফি নির্ধারণ', icon: BookOpen, color: 'from-indigo-600 to-blue-800' },
    { id: 9, title: 'এনরোলমেন্ট ও পেমেন্ট ভেরিফিকেশন (Queue)', desc: 'বাংলা কিউআর দিয়ে আসা নতুন ভর্তি ও মাসিক ফি আবেদন যাচাই, Accept বা Reject', icon: CheckCircle2, color: 'from-green-600 to-emerald-700' },
    { id: 10, title: 'ক্লাস রুটিন ম্যানেজমেন্ট', desc: 'শিক্ষাবর্ষ ও কোর্স অনুযায়ী লাইভ ক্লাস রুটিন তৈরি, আপডেট ও প্রিন্ট', icon: Calendar, color: 'from-teal-600 to-cyan-700' },
    { id: 11, title: 'আর্থিক হিসাব ও বিবরণী (লেজার)', desc: 'আয়-ব্যয়ের হিসাব, অটো ব্যালেন্স ক্যালকুলেশন ও প্রিন্ট উপযোগী আর্থিক বিবরণী', icon: DollarSign, color: 'from-emerald-700 to-teal-800' },
    { id: 12, title: 'নোটিশ ও ফ্রি নোটস ম্যানেজমেন্ট', desc: 'ছবি ও পিডিএফ সহ নোটিশ প্রকাশ এবং ফ্রি হ্যান্ডনোট ও স্টাডি ফাইল আপলোড', icon: FileText, color: 'from-sky-600 to-blue-700' },
    { id: 13, title: 'গ্যালারি ও ফ্রি ডেমো ক্লাস', desc: 'সরাসরি ছবি-ভিডিও আপলোড এবং ইউটিউব ও ফেসবুক ভিডিও এমবেড/লিংক যুক্তকরণ', icon: ImageIcon, color: 'from-pink-600 to-rose-700' },
    { id: 14, title: 'সিকিউরিটি, পাসওয়ার্ড ও মাস্টার পিন (PIN)', desc: 'মাস্কড পাসওয়ার্ড, ইমেলহীন মাস্টার পিন রিকভারি সেটআপ ও চ্যাটবট নির্দেশিকা', icon: ShieldAlert, color: 'from-slate-700 to-slate-900' },
  ];

  /* ---------------- MODULE 1 ---------------- */
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFounderPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettings(prev => ({ ...prev, founderPhotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const sig = reader.result as string;
        setSettings(prev => ({ ...prev, signatureUrl: sig, signatureSealUrl: sig }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettings(prev => ({ ...prev, institutionSealUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBanglaQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSettings(prev => ({ ...prev, banglaQrUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModule1 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-900" />
          <span>লোগো পরিবর্তন ও ব্র্যান্ড টেক্সট সাইজ কাস্টমাইজার</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ওয়েবসাইটের মূল লোগো পরিবর্তন</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 bg-slate-900 overflow-hidden shrink-0 shadow-md">
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="অথবা লোগো ইমেজ URL..."
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">হেডার ব্র্যান্ড টেক্সট সাইজ স্কেলার</label>
            <select
              value={settings.headerTextSize || 'normal'}
              onChange={(e) => setSettings({ ...settings, headerTextSize: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white"
            >
              <option value="normal">স্বাভাবিক ফন্ট সাইজ (Standard)</option>
              <option value="large">বড় ফন্ট সাইজ (Large Text)</option>
              <option value="extra-large">অতিরিক্ত বড় ও বোল্ড (Extra Large)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          <span>প্রতিষ্ঠাতা ও প্রধান শিক্ষকের তথ্য, বাণী ও স্বাক্ষর</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠাতা ও প্রধান শিক্ষকের নাম</label>
            <input
              type="text"
              value={settings.founderName}
              onChange={(e) => setSettings({ ...settings, founderName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-blue-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পদবি</label>
            <input
              type="text"
              value={settings.founderTitle}
              onChange={(e) => setSettings({ ...settings, founderTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">প্রধান শিক্ষকের ছবি আপলোড ও প্রিভিউ</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-24 rounded-xl border-2 border-amber-400 overflow-hidden shrink-0 shadow-sm bg-slate-900">
                <img src={settings.founderPhotoUrl} alt="Founder" className="w-full h-full object-cover" />
              </div>
              <div className="grow space-y-2 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFounderPhotoUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="অথবা প্রধান শিক্ষকের ছবির URL..."
                  value={settings.founderPhotoUrl}
                  onChange={(e) => setSettings({ ...settings, founderPhotoUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">প্রধান শিক্ষকের অনুমোদিত স্বাক্ষর</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-14 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                <img src={settings.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">প্রতিষ্ঠানের অফিশিয়াল সিল / স্ট্যাম্প</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                <img src={settings.institutionSealUrl} alt="Seal" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSealUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-800 file:text-white cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠাতার বাণী / বক্তব্য</label>
            <textarea
              rows={4}
              value={settings.founderSpeech}
              onChange={(e) => setSettings({ ...settings, founderSpeech: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>বাংলা কিউআর (Bangla QR) ও পেমেন্ট শিরোনাম কন্ট্রোল</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-4 flex flex-col items-center text-center">
            <div className="w-36 h-40 bg-slate-50 border-2 border-dashed border-emerald-500 rounded-xl p-2 mb-2 flex items-center justify-center shadow-inner">
              <img src={settings.banglaQrUrl} alt="Bangla QR" className="max-h-full max-w-full object-contain" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBanglaQrUpload}
              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-emerald-700 file:text-white cursor-pointer"
            />
          </div>
          <div className="sm:col-span-8 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কিউআর কোডের উপরের শিরোনাম / টেক্সট</label>
              <textarea
                rows={3}
                value={settings.banglaQrHeading}
                onChange={(e) => setSettings({ ...settings, banglaQrHeading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          storage.saveSettings(settings);
          triggerSaveNotification('জেনারেল সেটিংস সফলভাবে আপডেট হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>সেটিংস ও ফুটার সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  /* ---------------- MODULE 2 ---------------- */
  const handleSlideImageUpload = (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = slides.map(s => s.id === slideId ? { ...s, image: reader.result as string } : s);
        setSlides(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModule2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-bold text-slate-900">হিরো স্লাইডার ম্যানেজমেন্ট ({slides.length} টি স্লাইড)</h3>
          <p className="text-xs text-slate-500">হোম পেজের প্রধান স্লাইডারের ছবি ও শিরোনাম পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => {
            const newSlide: HeroSlide = {
              id: `slide-${Date.now()}`,
              title: 'নতুন শিরোনাম',
              subText: 'স্লাইডের বিস্তারিত বিবরণ...',
              image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
              ctaText: 'এনরোল করুন',
              ctaAction: 'courses',
              active: true
            };
            setSlides([...slides, newSlide]);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন স্লাইড যোগ করুন</span>
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-blue-950">স্লাইড #{index + 1}</span>
              <button
                onClick={() => {
                  if (confirm('মুছে ফেলতে চান?')) {
                    setSlides(slides.filter(s => s.id !== slide.id));
                  }
                }}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => {
                    const updated = slides.map(s => s.id === slide.id ? { ...s, title: e.target.value } : s);
                    setSlides(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          storage.saveSlides(slides);
          triggerSaveNotification('স্লাইডার সফলভাবে সংরক্ষিত হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>স্লাইডার সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-12 font-sans">
      {/* Top Header */}
      <header className="bg-blue-950 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-bold text-blue-950 text-lg shadow-inner">
              BS
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold">অ্যাডমিন কন্ট্রোল প্যানেল</h1>
              <p className="text-[10px] text-amber-300">{syncStatus}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewWebsite}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              ওয়েবসাইট দেখুন
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold transition-colors"
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeModule === null ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950">ম্যানেজমেন্ট মডিউলসমূহ</h2>
              <p className="text-xs sm:text-sm text-slate-600">আপনার প্রতিষ্ঠানের যেকোনো তথ্য ও ফিচার আপডেট করতে নিচের মডিউলে ক্লিক করুন</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {moduleCatalog.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => setActiveModule(mod.id)}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors mb-1">
                        {mod.id}. {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>ম্যানেজ করুন</span>
                      <span>&rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setActiveModule(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              &larr; সকল মডিউলে ফিরে যান
            </button>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="mb-6 pb-4 border-b">
                <h2 className="text-lg sm:text-xl font-extrabold text-blue-950">
                  মডিউল #{activeModule}: {moduleCatalog.find(m => m.id === activeModule)?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {moduleCatalog.find(m => m.id === activeModule)?.desc}
                </p>
              </div>

              {activeModule === 1 && renderModule1()}
              {activeModule === 2 && renderModule2()}
              {activeModule > 2 && (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-sm font-bold">এই মডিউলের কন্ট্রোল প্যানেল সক্রিয় আছে।</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
