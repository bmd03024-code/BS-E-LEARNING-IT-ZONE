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
import { storage, DEFAULT_ASSETS } from '../../services/storage';
import {
  Settings,
  Sliders,
  Users,
  GraduationCap,
  BarChart3,
  Ticket,
  DollarSign,
  BookOpen,
  Calendar,
  Layers,
  MessageSquare,
  LayoutGrid,
  FileText,
  ShieldAlert,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Printer,
  Download,
  Video,
  Play,
  Film,
  Pin,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles,
  Award,
  Lock,
  LogOut,
  X,
  QrCode,
  Image as ImageIcon,
  Edit,
  Check,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

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

  // Interactive Management & Print Modals
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [selectedAdmitCardForPrint, setSelectedAdmitCardForPrint] = useState<AdmitCardRecord | null>(null);
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<CertificateRecord | null>(null);

  // Listen to background sync events
  useEffect(() => {
    const handleSync = () => {
      setSyncStatus('লাইভ আপডেট হয়েছে');
      setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 2000);
    };
    window.addEventListener('bs_sync', handleSync);
    return () => window.removeEventListener('bs_sync', handleSync);
  }, []);

  const triggerSaveNotification = (msg: string = 'সংরক্ষণ সফল!') => {
    setSyncStatus(msg);
    setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 2500);
  };

  // The 14 Modules Catalog with exact user specifications
  const moduleCatalog = [
    { id: 1, title: 'প্রতিষ্ঠাতা, হেডার, ফুটার ও সিল-স্বাক্ষর', desc: 'লোগো পরিবর্তন, ফন্ট সাইজ, প্রধান শিক্ষকের বাণী/ছবি/স্বাক্ষর, সম্পূর্ণ ফুটার ও বাংলা কিউআর কন্ট্রোল', icon: Settings, color: 'from-blue-600 to-indigo-700' },
    { id: 2, title: 'হিরো স্লাইডার ম্যানেজমেন্ট', desc: 'হোম পেজের ৩টি স্লাইডের ছবি, শিরোনাম ও সাবটেক্সট এডিট এবং নতুন স্লাইড যোগ', icon: Sliders, color: 'from-amber-600 to-orange-700' },
    { id: 3, title: 'শিক্ষক মণ্ডলী প্রোফাইল ম্যানেজমেন্ট', desc: 'শিক্ষকদের তালিকা এডিট, ছবি, যোগ্যতা, নতুন শিক্ষক যুক্তকরণ ও টিচার আইডি কার্ড প্রিন্ট', icon: Users, color: 'from-emerald-600 to-teal-700' },
    { id: 4, title: 'শিক্ষার্থীদের ডাটাবেজ ও আইডি কার্ড প্রিন্ট', desc: 'শিক্ষাবর্ষ ও কোর্সভিত্তিক তালিকা, শিক্ষার্থী এডিট, আইডি কার্ড প্রিন্ট, সাইন কপি ও হাজিরা শিট', icon: GraduationCap, color: 'from-purple-600 to-indigo-800' },
    { id: 5, title: 'কোর্সভিত্তিক বিষয় ও পরীক্ষা অ্যাড', desc: 'কোর্সভিত্তিক ম্যানুয়ালি একাধিক বিষয় (Subjects) এবং পরীক্ষা (Exams) যুক্ত ও এডিট করা', icon: Layers, color: 'from-violet-600 to-purple-800' },
    { id: 6, title: 'এডমিট কার্ড ম্যানেজমেন্ট ও কন্ট্রোল', desc: 'এডমিট কার্ড এডিট, ফি পরিশোধ সাপেক্ষে পারমিশন কন্ট্রোল (Block/Unblock) ও প্রিন্ট', icon: Ticket, color: 'from-rose-600 to-red-700' },
    { id: 7, title: 'সার্টিফিকেট জেনারেটর ও ফি সিস্টেম', desc: 'অটো রোল সার্চে সনদ তৈরি, ফি নির্ধারণ/ফ্রি টগল এবং আজীবন ফ্রি রি-ডাউনলোড কন্ট্রোল', icon: Award, color: 'from-amber-600 to-yellow-600' },
    { id: 8, title: 'কোর্স ম্যানেজমেন্ট, ফি ও কোর্স লোগো', desc: 'নতুন কোর্স যোগ, কোর্স লোগো/থাম্বনেইল আপলোড, ভর্তি ফি, মাসিক ফি ও সনদ ফি নির্ধারণ', icon: BookOpen, color: 'from-indigo-600 to-blue-800' },
    { id: 9, title: 'এনরোলমেন্ট ও পেমেন্ট ভেরিফিকেশন (Queue)', desc: 'বাংলা কিউআর দিয়ে আসা নতুন ভর্তি ও মাসিক ফি আবেদন যাচাই, Accept (ডাটাবেজে যুক্ত) বা Reject', icon: CheckCircle2, color: 'from-green-600 to-emerald-700' },
    { id: 10, title: 'ক্লাস রুটিন ম্যানেজমেন্ট', desc: 'শিক্ষাবর্ষ ও কোর্স অনুযায়ী লাইভ ক্লাস রুটিন তৈরি, আপডেট ও প্রিন্ট', icon: Calendar, color: 'from-teal-600 to-cyan-700' },
    { id: 11, title: 'আর্থিক হিসাব ও বিবরণী (লেজার)', desc: 'আয়-ব্যয়ের হিসাব, অটো ব্যালেন্স ক্যালকুলেশন ও প্রিন্ট উপযোগী আর্থিক বিবরণী', icon: DollarSign, color: 'from-emerald-700 to-teal-800' },
    { id: 12, title: 'নোটিশ ও ফ্রি নোটস ম্যানেজমেন্ট', desc: 'ছবি ও পিডিএফ সহ নোটিশ প্রকাশ এবং ফ্রি হ্যান্ডনোট ও স্টাডি ফাইল আপলোড', icon: FileText, color: 'from-sky-600 to-blue-700' },
    { id: 13, title: 'গ্যালারি ও ফ্রি ডেমো ক্লাস', desc: 'সরাসরি ছবি-ভিডিও আপলোড এবং ইউটিউব ও ফেসবুক ভিডিও এমবেড/লিংক যুক্তকরণ', icon: ImageIcon, color: 'from-pink-600 to-rose-700' },
    { id: 14, title: 'সিকিউরিটি, পাসওয়ার্ড ও মাস্টার পিন (PIN)', desc: 'মাস্কড পাসওয়ার্ড, ইমেলহীন মাস্টার পিন রিকভারি সেটআপ ও চ্যাটবট নির্দেশিকা', icon: ShieldAlert, color: 'from-slate-700 to-slate-900' },
  ];

  /* ---------------- MODULE 1: GENERAL SETTINGS, LOGO, FOOTER & SEALS ---------------- */
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
      {/* 1. Logo & Text Size Control */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-900" />
          <span>লোগো পরিবর্তন ও ব্র্যান্ড টেক্সট সাইজ কাস্টমাইজার</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ওয়েবসাইটের মূল লোগো পরিবর্তন (Logo Upload & URL)</label>
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
                <p className="text-[10px] text-slate-500">সরাসরি ডিভাইস থেকে ছবি আপলোড করুন অথবা লিংক দিন</p>
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
              <option value="normal">স্বাভাবিক ফন্ট সাইজ (Standard Clamp)</option>
              <option value="large">বড় ফন্ট সাইজ (Large Text)</option>
              <option value="extra-large">অতিরিক্ত বড় ও বোল্ড (Extra Large Display)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">নির্বাচিত সাইজ অনুযায়ী হেডারের লোগো ও লেখার আকার নিয়ন্ত্রিত হবে</p>
          </div>
        </div>
      </div>

      {/* 2. Founder & Management Details */}
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

          {/* Founder Photo Upload & URL */}
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

          {/* Founder Signature Upload & URL */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">প্রধান শিক্ষকের অনুমোদিত স্বাক্ষর (Signature)</label>
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
                <input
                  type="text"
                  placeholder="স্বাক্ষরের URL..."
                  value={settings.signatureUrl}
                  onChange={(e) => setSettings({ ...settings, signatureUrl: e.target.value, signatureSealUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">এডমিট কার্ড, রেজাল্ট শিট, সার্টিফিকেট ও আইডি কার্ডে স্বয়ংক্রিয়ভাবে বসবে</p>
          </div>

          {/* Institute Official Seal Upload & URL */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">প্রতিষ্ঠানের অফিশিয়াল সিল / স্ট্যাম্প (Seal)</label>
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
                <input
                  type="text"
                  placeholder="সিলের URL..."
                  value={settings.institutionSealUrl}
                  onChange={(e) => setSettings({ ...settings, institutionSealUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">সব সনদে ও অফিশিয়াল নথিতে অফিশিয়াল যাচাই সিল হিসেবে প্রদর্শিত হবে</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠাতার বাণী / বক্তব্য (বাণী পরিবর্তন)</label>
            <textarea
              rows={4}
              value={settings.founderSpeech}
              onChange={(e) => setSettings({ ...settings, founderSpeech: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 3. Bangla QR Code & Heading */}
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
            <span className="text-[10px] text-slate-500 mt-1">নতুন কিউআর আপলোড করুন</span>
          </div>

          <div className="sm:col-span-8 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কিউআর কোডের উপরের শিরোনাম / টেক্সট (Heading)
              </label>
              <textarea
                rows={3}
                value={settings.banglaQrHeading}
                onChange={(e) => setSettings({ ...settings, banglaQrHeading: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                এখানে কোনো নির্দিষ্ট মোবাইল নম্বর শো করবে না; শুধু ব্যাংকিং বা এমএফএস অ্যাপ দিয়ে স্ক্যান করার নির্দেশনা থাকবে।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Complete Footer Control */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2">
          ওয়েবসাইটের ফুটার (Footer) সম্পূর্ণ এডিট ও নিয়ন্ত্রণ
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ফুটার টপ ওয়েলকাম ব্যানার টেক্সট</label>
              <input
                type="text"
                value={settings.welcomeText || ''}
                onChange={(e) => setSettings({ ...settings, welcomeText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ফুটার বিশেষ নোটিশ</label>
              <input
                type="text"
                value={settings.footerNotice || ''}
                onChange={(e) => setSettings({ ...settings, footerNotice: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ফুটার পরিচিতি ও বিস্তারিত টেক্সট</label>
            <textarea
              rows={2}
              value={settings.footerText || ''}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠানের ঠিকানা</label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">কপিরাইট টেক্সট</label>
              <input
                type="text"
                value={settings.footerCopyright || ''}
                onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">হটলাইন নম্বর</label>
              <input
                type="text"
                value={settings.hotline || ''}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">অফিশিয়াল ইমেইল</label>
              <input
                type="text"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ফেসবুক পেজ লিংক</label>
              <input
                type="text"
                value={settings.facebookUrl || ''}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইউটিউব চ্যানেল লিংক</label>
              <input
                type="text"
                value={settings.youtubeUrl || ''}
                onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">টিকটক প্রোফাইল লিংক</label>
              <input
                type="text"
                value={settings.tiktokUrl || ''}
                onChange={(e) => setSettings({ ...settings, tiktokUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">গুগল ম্যাপ এমবেড URL</label>
            <input
              type="text"
              value={settings.mapEmbedUrl || ''}
              onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          storage.saveSettings(settings);
          triggerSaveNotification('জেনারেল সেটিংস, লোগো ও ফুটার সফলভাবে আপডেট হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>সেটিংস ও ফুটার সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  /* ---------------- MODULE 2: HERO SLIDER MANAGEMENT ---------------- */
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
          <p className="text-xs text-slate-500">হোম পেজের প্রধান স্লাইডারের ছবি আপলোড, শিরোনাম ও বাটন পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => {
            const newSlide: HeroSlide = {
              id: `slide-${Date.now()}`,
              title: 'নতুন কোর্স বা সেমিনারের শিরোনাম',
              subText: 'স্লাইডের বিস্তারিত আকর্ষণীয় বিবরণ এখানে লিখুন।',
              image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
              ctaText: 'এখনই এনরোল করুন',
              ctaAction: 'courses',
              active: true
            };
            setSlides([...slides, newSlide]);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন স্লাইড যোগ করুন</span>
        </button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>স্লাইড #{index + 1}</span>
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slide.active}
                    onChange={(e) => {
                      const updated = slides.map(s => s.id === slide.id ? { ...s, active: e.target.checked } : s);
                      setSlides(updated);
                    }}
                    className="rounded text-blue-900"
                  />
                  <span>সক্রিয় (Active)</span>
                </label>
                <button
                  onClick={() => {
                    if (confirm('এই স্লাইডটি মুছে ফেলতে চান?')) {
                      setSlides(slides.filter(s => s.id !== slide.id));
                    }
                  }}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Image Upload & Preview */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">স্লাইডের ব্যাকগ্রাউন্ড ছবি (Upload & Preview)</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-sm">
                  <img src={slide.image} alt="Slide Preview" className="w-full h-full object-cover" />
                </div>
                <div className="grow space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSlideImageUpload(slide.id, e)}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="অথবা সরাসরি ইমেজ URL পেস্ট করুন..."
                    value={slide.image}
                    onChange={(e) => {
                      const updated = slides.map(s => s.id === slide.id ? { ...s, image: e.target.value } : s);
                      setSlides(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500">কম্পিউটার বা মোবাইল থেকে ছবি সিলেক্ট করলেই স্লাইড আপডেট হয়ে যাবে</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্লাইড প্রধান শিরোনাম (Heading)</label>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={slide.ctaText}
                    onChange={(e) => {
                      const updated = slides.map(s => s.id === slide.id ? { ...s, ctaText: e.target.value } : s);
                      setSlides(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বাটন অ্যাকশন</label>
                  <select
                    value={slide.ctaAction}
                    onChange={(e) => {
                      const updated = slides.map(s => s.id === slide.id ? { ...s, ctaAction: e.target.value } : s);
                      setSlides(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    <option value="courses">কোর্সসমূহ (Courses)</option>
                    <option value="enroll">ভর্তি আবেদন (Enroll)</option>
                    <option value="fee">মাসিক ফি (Fee)</option>
                    <option value="routine">ক্লাস রুটিন (Routine)</option>
                    <option value="founder">প্রতিষ্ঠাতা (Founder)</option>
                    <option value="notice">নোটিশ বোর্ড (Notice)</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">সাব-টেক্সট / বিবরণ (Sub Text)</label>
                <textarea
                  rows={2}
                  value={slide.subText}
                  onChange={(e) => {
                    const updated = slides.map(s => s.id === slide.id ? { ...s, subText: e.target.value } : s);
                    setSlides(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          storage.saveSlides(slides);
          triggerSaveNotification('হিরো স্লাইডার সফলভাবে আপডেট হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>স্লাইডার সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  /* ---------------- MODULE 3: FACULTY PROFILE MANAGEMENT ---------------- */
  const [selectedTeacherForCard, setSelectedTeacherForCard] = useState<Mentor | null>(null);

  const handleTeacherPhotoUpload = (teacherId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = mentors.map(item => item.id === teacherId ? { ...item, photoUrl: reader.result as string } : item);
        setMentors(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModule3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">শিক্ষক মণ্ডলী তালিকা ও প্রোফাইল এডিটর ({mentors.length} জন)</h3>
          <p className="text-xs text-slate-500">শিক্ষকদের ছবি আপলোড, তথ্য সংশোধন এবং টিচার আইডি কার্ড প্রিন্ট করুন</p>
        </div>
        <button
          onClick={() => setIsAddTeacherModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>ম্যানুয়াল শিক্ষক এন্ট্রি (নতুন শিক্ষক যোগ)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {mentors.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-4">
              {/* Photo & Upload */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-900 bg-slate-900 shadow-sm">
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <label className="mt-1.5 text-[10px] font-bold text-blue-900 hover:text-blue-700 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200">
                  ছবি পরিবর্তন
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTeacherPhotoUpload(m.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Basic Fields */}
              <div className="grow space-y-1.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">শিক্ষকের নাম:</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => {
                      const updated = mentors.map(item => item.id === m.id ? { ...item, name: e.target.value } : item);
                      setMentors(updated);
                    }}
                    className="font-bold text-xs sm:text-sm text-slate-900 border rounded-lg px-2.5 py-1 w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">পদবি:</label>
                    <input
                      type="text"
                      value={m.designation}
                      onChange={(e) => {
                        const updated = mentors.map(item => item.id === m.id ? { ...item, designation: e.target.value } : item);
                        setMentors(updated);
                      }}
                      className="text-xs font-semibold text-blue-900 border rounded-lg px-2 py-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">অভিজ্ঞতা:</label>
                    <input
                      type="text"
                      value={m.experience}
                      onChange={(e) => {
                        const updated = mentors.map(item => item.id === m.id ? { ...item, experience: e.target.value } : item);
                        setMentors(updated);
                      }}
                      className="text-xs text-slate-700 border rounded-lg px-2 py-1 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional details: Qualifications, Specialist & Bio */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500">শিক্ষাগত যোগ্যতা (কমা দিয়ে আলাদা করুন):</label>
                <input
                  type="text"
                  value={m.qualifications?.join(', ') || ''}
                  onChange={(e) => {
                    const qus = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const updated = mentors.map(item => item.id === m.id ? { ...item, qualifications: qus } : item);
                    setMentors(updated);
                  }}
                  className="text-xs border rounded-lg px-2.5 py-1 w-full font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">বিশেষ দক্ষতা / পাঠ্য বিষয় (কমা দিয়ে আলাদা করুন):</label>
                <input
                  type="text"
                  value={m.specialist?.join(', ') || ''}
                  onChange={(e) => {
                    const specs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const updated = mentors.map(item => item.id === m.id ? { ...item, specialist: specs } : item);
                    setMentors(updated);
                  }}
                  className="text-xs border rounded-lg px-2.5 py-1 w-full font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    value={m.phone || ''}
                    onChange={(e) => {
                      const updated = mentors.map(item => item.id === m.id ? { ...item, phone: e.target.value } : item);
                      setMentors(updated);
                    }}
                    className="text-xs border rounded-lg px-2 py-1 w-full font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">ইমেইল:</label>
                  <input
                    type="text"
                    value={m.email || ''}
                    onChange={(e) => {
                      const updated = mentors.map(item => item.id === m.id ? { ...item, email: e.target.value } : item);
                      setMentors(updated);
                    }}
                    className="text-xs border rounded-lg px-2 py-1 w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500">শিক্ষক পরিচিতি / বায়ো:</label>
                <textarea
                  rows={2}
                  value={m.bio || ''}
                  onChange={(e) => {
                    const updated = mentors.map(item => item.id === m.id ? { ...item, bio: e.target.value } : item);
                    setMentors(updated);
                  }}
                  className="text-xs border rounded-lg px-2.5 py-1 w-full leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => setSelectedTeacherForCard(m)}
                className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>টিচার আইডি কার্ড প্রিন্ট</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`${m.name}-এর প্রোফাইল মুছে ফেলবেন?`)) {
                    setMentors(mentors.filter(item => item.id !== m.id));
                  }
                }}
                className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          storage.saveMentors(mentors);
          triggerSaveNotification('শিক্ষক প্রোফাইল সফলভাবে আপডেট হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>শিক্ষক প্রোফাইল সংরক্ষণ করুন</span>
      </button>

      {/* Teacher ID Card Printable Modal */}
      {selectedTeacherForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b pb-2">শিক্ষক আইডি কার্ড প্রিভিউ ও প্রিন্ট</h4>

            <div className="printable-area relative bg-gradient-to-b from-blue-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400 text-center space-y-3 overflow-hidden">
              {/* Background watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                {settings.logoUrl && (
                  <img src={settings.logoUrl} alt="" className="w-44 h-44 object-contain" />
                )}
              </div>

              <div className="text-amber-400 font-extrabold text-sm tracking-wide">
                BS E-LEARNING &amp; IT ZONE
              </div>
              <div className="text-[10px] text-slate-300">শিক্ষক পরিচয়পত্র (TEACHER ID CARD)</div>

              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800">
                <img src={selectedTeacherForCard.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>

              <div>
                <h5 className="text-lg font-bold text-white">{selectedTeacherForCard.name}</h5>
                <p className="text-xs text-amber-300 font-semibold">{selectedTeacherForCard.designation}</p>
                <p className="text-[10px] text-slate-400 mt-1">{selectedTeacherForCard.experience}</p>
              </div>

              <div className="pt-3 border-t border-slate-700/80 flex items-end justify-between px-2 text-[10px]">
                <div className="flex flex-col items-start">
                  <img src={settings.institutionSealUrl} alt="" className="h-8 w-auto object-contain filter drop-shadow" />
                  <span className="text-[8px] text-amber-300 mt-0.5">অফিশিয়াল সিল</span>
                </div>
                <div className="text-center">
                  <img src={settings.signatureUrl} alt="" className="h-6 w-auto mx-auto filter invert brightness-200" />
                  <span className="text-[8px] text-amber-300">অনুমোদিত স্বাক্ষর</span>
                </div>
              </div>
            </div>

            <div className="no-print flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTeacherForCard(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------- MODULE 4: STUDENT DATABASE & ID CARD PRINT ---------------- */
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchRoll, setSearchRoll] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => {
    if (s.academicYear !== filterYear) return false;
    if (filterCourse !== 'all' && s.courseId !== filterCourse) return false;
    if (searchRoll && !s.roll.includes(searchRoll.trim())) return false;
    return true;
  });

  const renderModule4 = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষাবর্ষ নির্বাচন</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              <option value="2026">২০২৬ সেশন</option>
              <option value="2025">২০২৫ সেশন</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">কোর্স নির্বাচন</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
            >
              <option value="all">সকল কোর্স</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">রোল দিয়ে সার্চ</label>
            <input
              type="text"
              placeholder="রোল নম্বর..."
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <button
              onClick={() => {
                const nextRoll = (students.length + 101).toString();
                const newStd: Student = {
                  id: `std-${Date.now()}`,
                  academicYear: filterYear,
                  courseId: filterCourse === 'all' ? courses[0].id : filterCourse,
                  roll: nextRoll,
                  name: 'নতুন শিক্ষার্থী',
                  fatherName: 'পিতার নাম',
                  motherName: 'মাতার নাম',
                  phone: '01700000000',
                  address: 'ঢাকা',
                  photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                  trxId: `QR${Date.now().toString().slice(-6)}`,
                  enrollmentDate: new Date().toISOString().split('T')[0],
                  status: 'active',
                  hasPaidDues: true,
                  admitCardBlocked: false
                };
                setStudents([newStd, ...students]);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ম্যানুয়াল শিক্ষার্থী এন্ট্রি</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b flex justify-between items-center">
          <span className="font-bold text-sm text-slate-800">শিক্ষার্থী ডাটাবেজ তালিকা ({filteredStudents.length} জন)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b">
              <tr>
                <th className="py-2.5 px-3">ছবি</th>
                <th className="py-2.5 px-3">রোল</th>
                <th className="py-2.5 px-3">নাম</th>
                <th className="py-2.5 px-3">কোর্স</th>
                <th className="py-2.5 px-3">পিতা/মাতা</th>
                <th className="py-2.5 px-3">মোবাইল</th>
                <th className="py-2.5 px-3">ফি স্ট্যাটাস</th>
                <th className="py-2.5 px-3 text-right">আইডি কার্ড ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <img src={s.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'} alt="" className="w-8 h-8 rounded-full object-cover" />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.roll}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                  <td className="py-2.5 px-3 text-blue-800 font-medium truncate max-w-[120px]">
                    {courses.find(c => c.id === s.courseId)?.title || s.courseId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{s.fatherName || '-'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{s.phone}</td>
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => {
                        const updated = students.map(item => item.id === s.id ? { ...item, hasPaidDues: !item.hasPaidDues, admitCardBlocked: item.hasPaidDues } : item);
                        setStudents(updated);
                        storage.saveStudents(updated);
                      }}
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.hasPaidDues ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.hasPaidDues ? 'ফি পরিশোধিত' : 'ফি বকেয়া (স্থগিত)'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-2">
                    <button
                      onClick={() => setSelectedStudentForIdCard(s)}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>আইডি কার্ড</span>
                    </button>
                    <button
                      onClick={() => setEditingStudent(s)}
                      className="text-amber-700 hover:text-amber-900 text-xs font-bold"
                    >
                      এডিট
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`রোল ${s.roll} (${s.name})-কে মুছবেন?`)) {
                          const updated = students.filter(item => item.id !== s.id);
                          setStudents(updated);
                          storage.saveStudents(updated);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-xs font-bold"
                    >
                      মুছুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>শিক্ষার্থীর তথ্য সংশোধন (Edit Student)</span>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </h4>

            {/* Photo upload & URL */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0">
                <img src={editingStudent.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 grow">
                <label className="text-[10px] font-bold text-slate-600 block">শিক্ষার্থীর ছবি আপলোড:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setEditingStudent({ ...editingStudent, photoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-blue-900 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="অথবা ছবির URL..."
                  value={editingStudent.photoUrl || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, photoUrl: e.target.value })}
                  className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600">শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">রোল নম্বর:</label>
                <input
                  type="text"
                  value={editingStudent.roll}
                  onChange={(e) => setEditingStudent({ ...editingStudent, roll: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono font-bold text-blue-900"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">পিতার নাম (বাধ্যতামূলক):</label>
                <input
                  type="text"
                  value={editingStudent.fatherName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">মাতার নাম (বাধ্যতামূলক):</label>
                <input
                  type="text"
                  value={editingStudent.motherName || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600">শিক্ষাবর্ষ (সেশন):</label>
                <select
                  value={editingStudent.academicYear}
                  onChange={(e) => setEditingStudent({ ...editingStudent, academicYear: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                >
                  <option value="2026">২০২৬ সেশন</option>
                  <option value="2025">২০২৫ সেশন</option>
                  <option value="2024">২০২৪ সেশন</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="font-bold text-slate-600">কোর্স:</label>
                <select
                  value={editingStudent.courseId}
                  onChange={(e) => setEditingStudent({ ...editingStudent, courseId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg font-semibold bg-white"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="font-bold text-slate-600">ঠিকানা:</label>
                <input
                  type="text"
                  value={editingStudent.address || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  const updated = students.map(s => s.id === editingStudent.id ? editingStudent : s);
                  setStudents(updated);
                  storage.saveStudents(updated);
                  setEditingStudent(null);
                  triggerSaveNotification('শিক্ষার্থীর তথ্য আপডেট হয়েছে!');
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-sm"
              >
                আপডেট সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student ID Card Print Preview Modal */}
      {selectedStudentForIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl my-8">
            <h4 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
              <span>শিক্ষার্থী আইডি কার্ড প্রিভিউ ও প্রিন্ট</span>
              <button onClick={() => setSelectedStudentForIdCard(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </h4>

            {/* High-Fidelity Printable Area with Watermark, Parents Names, Seal & Signature */}
            <div className="printable-area relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400 text-center space-y-3 overflow-hidden">
              {/* Background Subtle Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Watermark" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 rounded-full border-8 border-dashed border-amber-400 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xl font-black text-amber-300">BS ZONE</span>
                    <span className="text-[10px] font-bold text-slate-300 mt-1">E-LEARNING &amp; IT</span>
                  </div>
                )}
              </div>

              {/* Institution Header */}
              <div className="relative z-10 pb-2 border-b border-amber-400/40">
                <div className="text-amber-400 font-extrabold text-sm tracking-wide">
                  BS E-LEARNING &amp; IT ZONE
                </div>
                <div className="text-[10px] text-slate-300">
                  {settings.subName || 'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি'}
                </div>
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] tracking-wide uppercase">
                  STUDENT IDENTITY CARD | পরিচয়পত্র
                </div>
              </div>

              {/* Student Photo */}
              <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800">
                <img
                  src={selectedStudentForIdCard.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Student Name & Roll */}
              <div className="relative z-10">
                <h5 className="text-base font-bold text-white">{selectedStudentForIdCard.name}</h5>
                <div className="inline-flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/90 text-amber-300 font-mono font-black text-xs border border-amber-400/30">
                    রোল: {selectedStudentForIdCard.roll}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                    সেশন: {toBengaliNum(selectedStudentForIdCard.academicYear)}
                  </span>
                </div>
              </div>

              {/* Personal & Parents Details (পিতার নাম ও মাতার নাম স্পষ্টভাবে) */}
              <div className="relative z-10 bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 text-xs space-y-1.5 text-left backdrop-blur-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-amber-300 font-bold shrink-0">কোর্স:</span>
                  <span className="font-semibold text-white text-right truncate pl-2">
                    {courses.find(c => c.id === selectedStudentForIdCard.courseId)?.title || selectedStudentForIdCard.courseId}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-amber-300 font-bold shrink-0">পিতার নাম:</span>
                  <span className="font-extrabold text-white text-right pl-2">
                    {selectedStudentForIdCard.fatherName || 'উল্লেখিত নেই'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-amber-300 font-bold shrink-0">মাতার নাম:</span>
                  <span className="font-extrabold text-white text-right pl-2">
                    {selectedStudentForIdCard.motherName || 'উল্লেখিত নেই'}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400 font-semibold shrink-0">মোবাইল:</span>
                  <span className="font-mono text-slate-200 text-right">{selectedStudentForIdCard.phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold shrink-0">ঠিকানা:</span>
                  <span className="text-slate-200 text-right truncate pl-2">{selectedStudentForIdCard.address || 'বাংলাদেশ'}</span>
                </div>
              </div>

              {/* Bottom Official Seal & Principal Signature */}
              <div className="relative z-10 pt-3 border-t border-slate-700/80 flex items-end justify-between px-1 text-[10px]">
                <div className="flex flex-col items-center">
                  <img
                    src={settings.institutionSealUrl}
                    alt="সিল"
                    className="h-9 w-auto object-contain filter drop-shadow"
                  />
                  <span className="text-[8px] text-amber-300 mt-0.5">অফিশিয়াল সিল</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <img
                    src={settings.signatureUrl}
                    alt="স্বাক্ষর"
                    className="h-6 w-auto mx-auto filter invert brightness-200"
                  />
                  <div className="w-24 border-t border-slate-600 mt-0.5 pt-0.5">
                    <p className="text-[9px] font-bold text-white">{settings.founderName}</p>
                    <p className="text-[7px] text-amber-300">প্রধান শিক্ষক</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudentForIdCard(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>আইডি কার্ড প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---------------- MODULE 5: SUBJECTS & EXAMS MANAGEMENT ---------------- */
  const [selectedCourseForSetup, setSelectedCourseForSetup] = useState<string>(courses[0]?.id || '');
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newExamInput, setNewExamInput] = useState('');

  const targetCourse = courses.find(c => c.id === selectedCourseForSetup) || courses[0];

  const handleAddSubject = () => {
    if (!newSubjectInput.trim()) return;
    const currentSubs = targetCourse.subjects || [];
    const updated = courses.map(c => c.id === targetCourse.id ? { ...c, subjects: [...currentSubs, newSubjectInput.trim()] } : c);
    setCourses(updated);
    storage.saveCourses(updated);
    setNewSubjectInput('');
    triggerSaveNotification('বিষয় যুক্ত হয়েছে!');
  };

  const handleAddExam = () => {
    if (!newExamInput.trim()) return;
    const currentExams = targetCourse.exams || [];
    const updated = courses.map(c => c.id === targetCourse.id ? { ...c, exams: [...currentExams, newExamInput.trim()] } : c);
    setCourses(updated);
    storage.saveCourses(updated);
    setNewExamInput('');
    triggerSaveNotification('পরীক্ষা যুক্ত হয়েছে!');
  };

  const renderModule5 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2">
          কোর্সভিত্তিক বিষয় (Subjects) ও পরীক্ষা (Exams) অ্যাড
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">কোর্স নির্বাচন করুন</label>
          <select
            value={selectedCourseForSetup}
            onChange={(e) => setSelectedCourseForSetup(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-blue-900"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
          {/* Subjects Manager */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>পাঠ্য বিষয়সমূহ ({targetCourse.subjects?.length || 0} টি)</span>
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন বিষয়ের নাম..."
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                className="grow px-3 py-1.5 border rounded-xl text-xs bg-white font-semibold"
              />
              <button
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold"
              >
                + বিষয় অ্যাড
              </button>
            </div>

            <div className="space-y-1.5">
              {(targetCourse.subjects || []).map((sub, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{idx + 1}. {sub}</span>
                  <button
                    onClick={() => {
                      const updatedSubs = (targetCourse.subjects || []).filter((_, i) => i !== idx);
                      const updated = courses.map(c => c.id === targetCourse.id ? { ...c, subjects: updatedSubs } : c);
                      setCourses(updated);
                      storage.saveCourses(updated);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Exams Manager */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>নির্ধারিত পরীক্ষাসমূহ ({targetCourse.exams?.length || 0} টি)</span>
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="নতুন পরীক্ষার নাম (যেমন: মডেল টেস্ট)..."
                value={newExamInput}
                onChange={(e) => setNewExamInput(e.target.value)}
                className="grow px-3 py-1.5 border rounded-xl text-xs bg-white font-semibold"
              />
              <button
                onClick={handleAddExam}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                + পরীক্ষা অ্যাড
              </button>
            </div>

            <div className="space-y-1.5">
              {(targetCourse.exams || []).map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">{idx + 1}. {ex}</span>
                  <button
                    onClick={() => {
                      const updatedExams = (targetCourse.exams || []).filter((_, i) => i !== idx);
                      const updated = courses.map(c => c.id === targetCourse.id ? { ...c, exams: updatedExams } : c);
                      setCourses(updated);
                      storage.saveCourses(updated);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------------- MODULE 6: ADMIT CARD MANAGEMENT & CONTROL ---------------- */
  const renderModule6 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2">
          এডমিট কার্ড কন্ট্রোল ও ফি পারমিশন
        </h3>
        <p className="text-xs text-slate-600">
          শিক্ষার্থী ফি পরিশোধ না করলে এখান থেকে তার এডমিট কার্ড স্থগিত (Block) করে রাখতে পারবেন।
        </p>

        <div className="space-y-3">
          {admitCards.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-blue-900 text-sm">রোল {a.roll}</span>
                <span className="ml-2 font-bold text-slate-900">{a.studentName}</span>
                <span className="ml-2 text-slate-500 text-xs">({courses.find(c => c.id === a.courseId)?.title})</span>
                <p className="text-[11px] text-slate-600 mt-1">{a.examType} • কেন্দ্র: {a.examCenter}</p>
                {a.isBlocked && (
                  <span className="text-[11px] font-bold text-red-600 block mt-0.5">
                    * এডমিট কার্ড ব্লকড: {a.blockedReason}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updated = admitCards.map(item => item.id === a.id ? {
                      ...item,
                      isBlocked: !item.isBlocked,
                      feeCleared: item.isBlocked,
                      blockedReason: item.isBlocked ? undefined : 'মাসিক ফি বকেয়া থাকায় এডমিট কার্ড ডাউনলোড বন্ধ রাখা হয়েছে।'
                    } : item);
                    setAdmitCards(updated);
                    storage.saveAdmitCards(updated);
                    triggerSaveNotification();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    a.isBlocked
                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                  }`}
                >
                  {a.isBlocked ? 'এডমিট ব্লকড (ক্লিক করে আনলক করুন)' : 'এডমিট সচল (Allowed)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------- MODULE 7: CERTIFICATE GENERATOR & FEE CONTROL ---------------- */
  const [certRollInput, setCertRollInput] = useState('');
  const [certCourseInput, setCertCourseInput] = useState(courses[0]?.id || '');
  const [certFeeInput, setCertFeeInput] = useState('0');
  const [certIsFree, setCertIsFree] = useState(true);

  const handleGenerateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const match = students.find(s => s.roll === certRollInput.trim());
    if (!match) {
      alert(`রোল ${certRollInput} দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি।`);
      return;
    }

    const newCert: CertificateRecord = {
      id: `cert-${Date.now()}`,
      academicYear: match.academicYear,
      courseId: certCourseInput,
      roll: match.roll,
      studentName: match.name,
      fatherName: match.fatherName,
      motherName: match.motherName,
      address: match.address || 'ঢাকা, বাংলাদেশ',
      issueDate: new Date().toISOString().split('T')[0],
      certificateNo: `BS-ZONE-${match.academicYear}-${match.roll.padStart(4, '0')}`,
      grade: 'A+ (প্রথম শ্রেণি)',
      isFirstIssue: true,
      feePaid: certIsFree,
      isFree: certIsFree,
      feeAmount: certIsFree ? 0 : Number(certFeeInput),
      hasEverPaid: certIsFree,
      hasGovtCert: !!courses.find(c => c.id === certCourseInput)?.hasGovtCert
    };

    const updated = [newCert, ...certificates.filter(c => c.roll !== match.roll)];
    setCertificates(updated);
    storage.saveCertificates(updated);
    triggerSaveNotification('সার্টিফিকেট তৈরি ও কনফিগার সফল!');
    alert(`রোল ${match.roll} (${match.name})-এর সনদপত্র সফলভাবে তৈরি করা হয়েছে।`);
  };

  const renderModule7 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2">
          সার্টিফিকেট জেনারেটর ও ফি নির্ধারণ
        </h3>
        <p className="text-xs text-slate-600">
          রোল দিলে নাম-ঠিকানা অটো-ফেচ হবে। ফি নির্ধারণ করলে শিক্ষার্থী ফি দিয়ে কিনবে; ফ্রি রাখলে ফ্রিতে পাবে। একবার পেমেন্ট করলে আজীবন ফ্রি রি-ডাউনলোড পাবে।
        </p>

        <form onSubmit={handleGenerateCertificate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">কোর্স নির্বাচন</label>
            <select
              value={certCourseInput}
              onChange={(e) => setCertCourseInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর রোল *</label>
            <input
              type="text"
              required
              placeholder="যেমন: 101"
              value={certRollInput}
              onChange={(e) => setCertRollInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-blue-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">সনদ ফি অপশন</label>
            <div className="flex items-center gap-2">
              <label className="text-xs flex items-center gap-1 font-semibold">
                <input
                  type="checkbox"
                  checked={certIsFree}
                  onChange={(e) => setCertIsFree(e.target.checked)}
                  className="rounded text-blue-900"
                />
                <span>সম্পূর্ণ ফ্রি</span>
              </label>
              {!certIsFree && (
                <input
                  type="number"
                  placeholder="টাকা"
                  value={certFeeInput}
                  onChange={(e) => setCertFeeInput(e.target.value)}
                  className="w-24 px-2 py-1.5 border rounded-lg text-xs font-bold"
                />
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>সনদপত্র ক্রিয়েট করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b">
          <span className="font-bold text-sm text-slate-800">তৈরিকৃত সনদপত্রের তালিকা ({certificates.length} টি)</span>
        </div>
        <div className="divide-y divide-slate-200 text-xs">
          {certificates.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-blue-900">রোল {c.roll}</span>
                <span className="ml-2 font-bold text-slate-900">{c.studentName}</span>
                <span className="ml-2 text-slate-500">সনদ নং: {c.certificateNo}</span>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  ফি স্ট্যাটাস: <b>{c.isFree ? 'সম্পূর্ণ ফ্রি' : `${c.feeAmount}৳ (পরিশোধিত: ${c.hasEverPaid ? 'হ্যাঁ - আনলিমিটেড ফ্রি' : 'না'})`}</b>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-emerald-800 bg-emerald-100 font-bold text-[11px]">লাইভ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ---------------- MODULE 8: COURSE MANAGEMENT & LOGO ---------------- */
  const handleCourseLogoUpload = (courseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updated = courses.map(item => item.id === courseId ? { ...item, logoUrl: reader.result as string } : item);
        setCourses(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModule8 = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">কোর্স ম্যানেজমেন্ট, ফি নির্ধারণ ও লোগো</h3>
          <p className="text-xs text-slate-500">নতুন কোর্স যোগ, কোর্স লোগো/আইকন আপলোড, মূল ফি, অফার ডিসকাউন্ট ও কাউন্টডাউন টাইমার কন্ট্রোল</p>
        </div>
        <button
          onClick={() => {
            const newC: Course = {
              id: `course-${Date.now()}`,
              title: 'নতুন আধুনিক কোর্স',
              logoUrl: DEFAULT_ASSETS.courseLogos.general,
              duration: '৩ মাস',
              description: 'কোর্সের বাস্তবমুখী সিলেবাস ও প্র্যাকটিক্যাল ল্যাব বিবরণ।',
              features: ['দক্ষ মেন্টর সাপোর্ট', 'লাইভ প্রজেক্ট ও অ্যাসাইনমেন্ট', 'সরকারি মানসম্পন্ন সনদ'],
              originalAdmissionFee: 1500,
              admissionFee: 1000,
              monthlyFee: 500,
              offerTimerExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              certificateFee: 0,
              certificateFeeSecondTime: 0,
              hasGovtCert: true,
              paymentDetails: 'ভর্তি ফি ১,০০০ টাকা। দ্বিতীয় মাস থেকে নিয়মিত মাসিক ফি।',
              category: 'আইটি ও প্রফেশনাল স্কিল',
              subjects: ['মৌলিক বিষয়', 'অ্যাডভান্সড মডিউল'],
              exams: ['মাসিক মূল্যায়ন', 'চূড়ান্ত পরীক্ষা']
            };
            setCourses([...courses, newC]);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কোর্স যোগ করুন</span>
        </button>
      </div>

      <div className="space-y-5">
        {courses.map((c) => {
          const original = c.originalAdmissionFee || c.admissionFee;
          const current = c.admissionFee;
          const savings = original > current ? original - current : 0;
          const discountPercent = original > current ? Math.round((savings / original) * 100) : 0;

          return (
            <div key={c.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              {/* Top Row: Course Title & Category */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div className="grow space-y-1 w-full sm:w-auto">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">কোর্সের নাম ও শিরোনাম:</label>
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => {
                      const updated = courses.map(item => item.id === c.id ? { ...item, title: e.target.value } : item);
                      setCourses(updated);
                    }}
                    className="font-bold text-sm sm:text-base text-blue-950 border rounded-xl px-3 py-1.5 w-full sm:w-96"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!c.hasGovtCert}
                      onChange={(e) => {
                        const updated = courses.map(item => item.id === c.id ? { ...item, hasGovtCert: e.target.checked } : item);
                        setCourses(updated);
                      }}
                      className="rounded text-blue-900"
                    />
                    <span>সরকারি সনদ ব্যাজ</span>
                  </label>

                  <button
                    onClick={() => {
                      if (confirm(`'${c.title}' কোর্সটি মুছে ফেলতে চান?`)) {
                        setCourses(courses.filter(item => item.id !== c.id));
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course Logo / Thumbnail Upload & Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">কোর্স লোগো / থাম্বনেইল (Upload & Preview)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-20 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-sm">
                    <img src={c.logoUrl || DEFAULT_ASSETS.courseLogos.general} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="grow space-y-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCourseLogoUpload(c.id, e)}
                      className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="অথবা সরাসরি ইমেজ URL পেস্ট করুন..."
                      value={c.logoUrl || ''}
                      onChange={(e) => {
                        const updated = courses.map(item => item.id === c.id ? { ...item, logoUrl: e.target.value } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Fee, Discount & Countdown Timer Controls */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    <span>ফি নির্ধারণ, ডিসকাউন্ট ও অফার টাইমার</span>
                  </h4>

                  {savings > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-2xs">
                      {savings}৳ সেভিংস ({discountPercent}% ডিসকাউন্ট সক্রিয়)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      মূল ভর্তি ফি (টাকা)
                    </label>
                    <input
                      type="number"
                      value={c.originalAdmissionFee || c.admissionFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = courses.map(item => item.id === c.id ? { ...item, originalAdmissionFee: val } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">কাটা মূল্য হিসেবে শো করবে</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-900 mb-1">
                      অফার ভর্তি ফি (টাকা) *
                    </label>
                    <input
                      type="number"
                      value={c.admissionFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = courses.map(item => item.id === c.id ? { ...item, admissionFee: val } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border border-blue-300 rounded-lg text-xs font-extrabold text-blue-900 bg-white"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold">শিক্ষার্থী এই ফি পরিশোধ করবে</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      মাসিক ফি (টাকা / ০ = নেই)
                    </label>
                    <input
                      type="number"
                      value={c.monthlyFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = courses.map(item => item.id === c.id ? { ...item, monthlyFee: val } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold text-emerald-800 bg-white"
                    />
                    <span className="text-[10px] text-slate-400">দ্বিতীয় মাস থেকে প্রযোজ্য</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      সার্টিফিকেট ফি (টাকা / ০ = ফ্রি)
                    </label>
                    <input
                      type="number"
                      value={c.certificateFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const updated = courses.map(item => item.id === c.id ? { ...item, certificateFee: val } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">০ হলে 'সনদ ফ্রি' শো করবে</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      অফারের শেষ তারিখ (টাইমার)
                    </label>
                    <input
                      type="date"
                      value={c.offerTimerExpiry?.split('T')[0] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = courses.map(item => item.id === c.id ? { ...item, offerTimerExpiry: val } : item);
                        setCourses(updated);
                      }}
                      className="w-full px-2 py-1.5 border rounded-lg text-xs font-semibold bg-white"
                    />
                    <span className="text-[10px] text-slate-400">কাউন্টডাউন টাইমার নিয়ন্ত্রণ</span>
                  </div>
                </div>
              </div>

              {/* Course Meta: Duration, Category & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">কোর্সের মেয়াদ (যেমন: ৩ মাস, ৬ মাস)</label>
                  <input
                    type="text"
                    value={c.duration}
                    onChange={(e) => {
                      const updated = courses.map(item => item.id === c.id ? { ...item, duration: e.target.value } : item);
                      setCourses(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={c.category}
                    onChange={(e) => {
                      const updated = courses.map(item => item.id === c.id ? { ...item, category: e.target.value } : item);
                      setCourses(updated);
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">কোর্সের বিস্তারিত বর্ণনা (Description)</label>
                  <textarea
                    rows={2}
                    value={c.description}
                    onChange={(e) => {
                      const updated = courses.map(item => item.id === c.id ? { ...item, description: e.target.value } : item);
                      setCourses(updated);
                    }}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Course Features / Highlights */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">কোর্সের প্রধান বৈশিষ্ট্য ও সুবিধাসমূহ (Features):</label>
                  <button
                    onClick={() => {
                      const updated = courses.map(item => item.id === c.id ? {
                        ...item,
                        features: [...item.features, 'নতুন আকর্ষণীয় সুবিধা']
                      } : item);
                      setCourses(updated);
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                  >
                    + সুবিধা যোগ করুন
                  </button>
                </div>

                <div className="space-y-1.5">
                  {c.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const newFeats = [...c.features];
                          newFeats[fIdx] = e.target.value;
                          const updated = courses.map(item => item.id === c.id ? { ...item, features: newFeats } : item);
                          setCourses(updated);
                        }}
                        className="w-full px-2.5 py-1 border rounded-lg text-xs"
                      />
                      <button
                        onClick={() => {
                          const newFeats = c.features.filter((_, i) => i !== fIdx);
                          const updated = courses.map(item => item.id === c.id ? { ...item, features: newFeats } : item);
                          setCourses(updated);
                        }}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          storage.saveCourses(courses);
          triggerSaveNotification('কোর্স তথ্য ও ফি সফলভাবে আপডেট হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>কোর্সসমূহ সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  /* ---------------- MODULE 9: ENROLLMENT & PAYMENT QUEUE (ACCEPT / REJECT) ---------------- */
  const renderModule9 = () => {
    const pendingApps = applications.filter(a => a.status === 'pending');
    const processedApps = applications.filter(a => a.status !== 'pending');

    const handleAcceptApp = (app: EnrollmentApplication) => {
      if (app.type === 'admission') {
        // Auto generate next roll
        const courseStds = students.filter(s => s.courseId === app.courseId && s.academicYear === app.academicYear);
        const nextRoll = (courseStds.length + 101).toString();

        const newStd: Student = {
          id: `std-${Date.now()}`,
          academicYear: app.academicYear,
          courseId: app.courseId,
          roll: nextRoll,
          name: app.studentName,
          phone: app.phone,
          photoUrl: app.photoUrl,
          fatherName: app.fatherName,
          motherName: app.motherName,
          address: app.address,
          trxId: app.trxId,
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'active',
          hasPaidDues: true
        };

        const updatedStds = [newStd, ...students];
        setStudents(updatedStds);
        storage.saveStudents(updatedStds);

        // Add to ledger
        const newLedger: LedgerItem = {
          id: `leg-${Date.now()}`,
          type: 'income',
          category: 'ভর্তি ফি',
          description: `${app.studentName} (রোল ${nextRoll}) ভর্তি [Trx: ${app.trxId}]`,
          amount: app.amount,
          date: new Date().toISOString().split('T')[0],
          academicYear: app.academicYear
        };
        const updatedLedger = [newLedger, ...ledger];
        setLedger(updatedLedger);
        storage.saveLedger(updatedLedger);
      }

      // Mark app accepted
      const updatedApps = applications.map(a => a.id === app.id ? { ...a, status: 'accepted' as const } : a);
      setApplications(updatedApps);
      storage.saveApplications(updatedApps);
      triggerSaveNotification('আবেদন গৃহীত ও ডাটাবেজে যুক্ত হয়েছে!');
    };

    const handleRejectApp = (app: EnrollmentApplication) => {
      const reason = prompt('প্রত্যাখ্যানের কারণ লিখুন:', 'ভুল TrxID বা অপর্যাপ্ত তথ্য');
      const updatedApps = applications.map(a => a.id === app.id ? { ...a, status: 'rejected' as const, rejectionReason: reason || undefined } : a);
      setApplications(updatedApps);
      storage.saveApplications(updatedApps);
      triggerSaveNotification('আবেদন প্রত্যাখ্যাত হয়েছে!');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
            <span>পেন্ডিং ভর্তি ও মাসিক ফি আবেদন তালিকা ({pendingApps.length} টি)</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-bold">
              ভেরিফিকেশন আবশ্যক
            </span>
          </h3>

          {pendingApps.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">বর্তমানে কোনো পেন্ডিং আবেদন নেই।</p>
          ) : (
            <div className="space-y-3">
              {pendingApps.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={app.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-blue-900" />
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.type === 'admission' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {app.type === 'admission' ? 'নতুন ভর্তি' : `মাসিক ফি (${app.month})`}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{app.studentName}</h4>
                      <p className="text-xs text-slate-600">ফোন: <span className="font-mono">{app.phone}</span> | কোর্স: {courses.find(c => c.id === app.courseId)?.title}</p>
                      <p className="text-xs font-mono font-bold text-emerald-800">TrxID: {app.trxId} • {toBengaliNum(app.amount)}৳</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptApp(app)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept (গ্রহণ করুন)</span>
                    </button>
                    <button
                      onClick={() => handleRejectApp(app)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject (বাতিল)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b">
            <span className="font-bold text-sm text-slate-800">নিষ্পত্তিকৃত আবেদন তালিকা ({processedApps.length} টি)</span>
          </div>
          <div className="divide-y divide-slate-200 text-xs">
            {processedApps.map(a => (
              <div key={a.id} className="p-3.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900">{a.studentName}</span>
                  <span className="ml-2 text-slate-500">({a.phone})</span>
                  <span className="ml-2 font-mono text-emerald-700">{a.trxId}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${a.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {a.status === 'accepted' ? 'গৃহীত (Accepted)' : 'বাতিল (Rejected)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- MODULE 10: ROUTINE ---------------- */
  const renderModule10 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-900">ক্লাস রুটিন শিডিউল ({routines.length} টি)</h3>
        <button
          onClick={() => {
            const newR: RoutineItem = {
              id: `r-${Date.now()}`,
              academicYear: '2026',
              courseId: courses[0]?.id || '',
              day: 'শনিবার ও মঙ্গলবার',
              time: 'সন্ধ্যা ০৭:০০ - ০৮:৩০',
              subject: 'নতুন বিষয়',
              teacherName: 'বোরহানউদ্দিন মহিম',
              room: 'রুম ২০১'
            };
            setRoutines([...routines, newR]);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>রুটিন যুক্ত করুন</span>
        </button>
      </div>

      <div className="space-y-3">
        {routines.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-2 items-center justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 grow">
              <input
                type="text"
                value={r.day}
                onChange={(e) => setRoutines(routines.map(item => item.id === r.id ? { ...item, day: e.target.value } : item))}
                className="border rounded-lg px-2 py-1 text-xs font-bold"
              />
              <input
                type="text"
                value={r.time}
                onChange={(e) => setRoutines(routines.map(item => item.id === r.id ? { ...item, time: e.target.value } : item))}
                className="border rounded-lg px-2 py-1 text-xs"
              />
              <input
                type="text"
                value={r.subject}
                onChange={(e) => setRoutines(routines.map(item => item.id === r.id ? { ...item, subject: e.target.value } : item))}
                className="border rounded-lg px-2 py-1 text-xs font-bold text-blue-900"
              />
              <input
                type="text"
                value={r.teacherName}
                onChange={(e) => setRoutines(routines.map(item => item.id === r.id ? { ...item, teacherName: e.target.value } : item))}
                className="border rounded-lg px-2 py-1 text-xs"
              />
            </div>
            <button
              onClick={() => setRoutines(routines.filter(item => item.id !== r.id))}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          storage.saveRoutines(routines);
          triggerSaveNotification('রুটিন সংরক্ষিত হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 text-white font-bold text-sm"
      >
        রুটিন সংরক্ষণ করুন
      </button>
    </div>
  );

  /* ---------------- MODULE 11: LEDGER ---------------- */
  const renderModule11 = () => {
    const totalInc = ledger.filter(l => l.type === 'income').reduce((a, b) => a + b.amount, 0);
    const totalExp = ledger.filter(l => l.type === 'expense').reduce((a, b) => a + b.amount, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center">
            <span className="text-xs font-bold text-emerald-700">মোট আয়</span>
            <h4 className="text-2xl font-black text-emerald-900 mt-1">{toBengaliNum(totalInc)} টাকা</h4>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-center">
            <span className="text-xs font-bold text-rose-700">মোট ব্যয়</span>
            <h4 className="text-2xl font-black text-rose-900 mt-1">{toBengaliNum(totalExp)} টাকা</h4>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-center">
            <span className="text-xs font-bold text-blue-800">নেট ব্যালেন্স</span>
            <h4 className="text-2xl font-black text-blue-950 mt-1">{toBengaliNum(totalInc - totalExp)} টাকা</h4>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>আর্থিক বিবরণী প্রিন্ট</span>
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- MODULE 12: NOTICES & FREE NOTES ---------------- */
  const renderModule12 = () => (
    <div className="space-y-6">
      {/* Notices */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-base font-bold text-slate-900">নোটিস বোর্ড (ছবি ও পিডিএফ ফাইল সহ)</h3>
          <button
            onClick={() => {
              const newN: NoticeItem = {
                id: `not-${Date.now()}`,
                title: 'নতুন নোটিস শিরোনাম',
                date: new Date().toLocaleDateString('bn-BD'),
                content: 'নোটিসের বিস্তারিত বিবরণ...',
                images: [],
                pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                pinned: false
              };
              setNotices([newN, ...notices]);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold"
          >
            + নোটিস যোগ করুন
          </button>
        </div>

        <div className="space-y-3">
          {notices.map((n) => (
            <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <input
                type="text"
                value={n.title}
                onChange={(e) => setNotices(notices.map(item => item.id === n.id ? { ...item, title: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs font-bold"
              />
              <textarea
                rows={2}
                value={n.content}
                onChange={(e) => setNotices(notices.map(item => item.id === n.id ? { ...item, content: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="পিডিএফ ডাউনলোড লিংক (PDF URL)..."
                  value={n.pdfUrl || ''}
                  onChange={(e) => setNotices(notices.map(item => item.id === n.id ? { ...item, pdfUrl: e.target.value } : item))}
                  className="w-full px-2 py-1 rounded-lg border text-xs font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Notes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-base font-bold text-slate-900">ফ্রি নোটস ও সাজেশনস (ছবি, টেক্সট ও পিডিএফ)</h3>
          <button
            onClick={() => {
              const newFn: FreeNoteItem = {
                id: `fn-${Date.now()}`,
                title: 'নতুন হ্যান্ডনোট শিরোনাম',
                subject: 'সাধারণ বিষয়',
                classOrCourse: 'সকল শিক্ষার্থী',
                description: 'নোটসের বিস্তারিত বিষয়বস্তু...',
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                date: '২০২৬'
              };
              setNotes([newFn, ...notes]);
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold"
          >
            + ফ্রি নোট যুক্ত করুন
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((fn) => (
            <div key={fn.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <input
                type="text"
                value={fn.title}
                onChange={(e) => setNotes(notes.map(item => item.id === fn.id ? { ...item, title: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs font-bold text-blue-900"
              />
              <input
                type="text"
                placeholder="পিডিএফ লিংক..."
                value={fn.pdfUrl || ''}
                onChange={(e) => setNotes(notes.map(item => item.id === fn.id ? { ...item, pdfUrl: e.target.value, fileUrl: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          storage.saveNotices(notices);
          storage.saveNotes(notes);
          triggerSaveNotification('নোটিস ও নোটস সংরক্ষিত হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 text-white font-bold text-sm"
      >
        নোটিস ও নোটস সংরক্ষণ করুন
      </button>
    </div>
  );

  /* ---------------- MODULE 13: GALLERY & DEMO CLASSES ---------------- */
  const renderModule13 = () => (
    <div className="space-y-6">
      {/* Demo Classes with YouTube & Facebook */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-base font-bold text-slate-900">ফ্রি ডেমো ক্লাস (ভিডিও, ফেসবুক ও ইউটিউব লিংক)</h3>
          <button
            onClick={() => {
              const newDc: DemoClassItem = {
                id: `dc-${Date.now()}`,
                title: 'নতুন ডেমো ভিডিও লেকচার',
                courseId: courses[0]?.id || '',
                instructor: 'বোরহানউদ্দিন মহিম',
                duration: '২৫ মিনিট',
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                description: 'ক্লাস বিবরণী...'
              };
              setDemoClasses([newDc, ...demoClasses]);
            }}
            className="px-3 py-1.5 rounded-xl bg-red-700 text-white text-xs font-bold"
          >
            + ডেমো ক্লাস যোগ করুন
          </button>
        </div>

        <div className="space-y-3">
          {demoClasses.map((dc) => (
            <div key={dc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <input
                type="text"
                value={dc.title}
                onChange={(e) => setDemoClasses(demoClasses.map(item => item.id === dc.id ? { ...item, title: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs font-bold text-slate-900"
              />
              <input
                type="text"
                placeholder="YouTube / Facebook Video Embed URL..."
                value={dc.videoUrl}
                onChange={(e) => setDemoClasses(demoClasses.map(item => item.id === dc.id ? { ...item, videoUrl: e.target.value } : item))}
                className="w-full px-2 py-1 rounded-lg border text-xs font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          storage.saveDemoClasses(demoClasses);
          storage.saveGallery(gallery);
          triggerSaveNotification('গ্যালারি ও ক্লাস সংরক্ষিত হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 text-white font-bold text-sm"
      >
        সংরক্ষণ করুন
      </button>
    </div>
  );

  /* ---------------- MODULE 14: SECURITY & MASTER PIN ---------------- */
  const [adminEmail, setAdminEmail] = useState(creds.email);
  const [adminPass, setAdminPass] = useState(creds.password);
  const [masterPin, setMasterPin] = useState(creds.masterPin || '992288');

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPin.trim().length < 6 || masterPin.trim().length > 11) {
      alert('মাস্টার পিন (Master PIN) অবশ্যই সর্বনিম্ন ৬ থেকে সর্বোচ্চ ১১ ডিজিটের মধ্যে হতে হবে!');
      return;
    }
    const newCreds: AdminCredentials = {
      email: adminEmail.trim(),
      password: adminPass.trim(),
      masterPin: masterPin.trim()
    };
    storage.saveAdminCredentials(newCreds);
    setCreds(newCreds);
    triggerSaveNotification('ক্রেডেনশিয়ালস ও মাস্টার পিন সফলভাবে আপডেট হয়েছে!');
    alert('অ্যাডমিন পাসওয়ার্ড ও মাস্টার পিন সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const renderModule14 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>অ্যাডমিন আইডি, গোপন পাসওয়ার্ড ও মাস্টার পিন (Master PIN)</span>
        </h3>
        <p className="text-xs text-slate-600">
          পাসওয়ার্ড ভুলে গেলে ইমেলের ঝামেলা ছাড়াই এই ৬-১১ ডিজিটের মাস্টার পিন দিয়ে তাৎক্ষণিক নতুন পাসওয়ার্ড সেট করা যাবে।
        </p>

        <form onSubmit={handleUpdateCreds} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন আইডি (Email)</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">গোপন পাসওয়ার্ড (Password — সর্বদা মাস্কড)</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono tracking-widest font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                মাস্টার পিন (Master PIN) *
              </label>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                সর্বনিম্ন ৬ - সর্বোচ্চ ১১ ডিজিট
              </span>
            </div>
            <input
              type="text"
              required
              minLength={6}
              maxLength={11}
              placeholder="যেমন: 992288 (৬ থেকে ১১ ডিজিট)"
              value={masterPin}
              onChange={(e) => setMasterPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-widest font-bold text-amber-700 bg-amber-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              লগইন স্ক্রিনে "পাসওয়ার্ড ভুলে গেছেন?" চাপলে এই পিনটি লিখেই পাসওয়ার্ড পরিবর্তন করা যাবে।
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md"
          >
            ক্রেডেনশিয়ালস ও মাস্টার পিন সেভ করুন
          </button>
        </form>
      </div>

      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <span className="font-bold text-xs text-slate-800">ফ্যাক্টরি রিসেট (ডিফল্ট ডাটা)</span>
          <p className="text-[11px] text-slate-500">সমস্ত ডেমো ডাটা পুনরায় প্রাথমিক অবস্থায় নিয়ে যাবে।</p>
        </div>
        <button
          onClick={() => {
            if (confirm('আপনি কি সমস্ত ডাটা ডিফল্ট ব্লুপ্রিন্ট স্টেট-এ রিসেট করতে চান?')) {
              storage.resetAll();
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
        >
          রিসেট করুন
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Admin Top Bar */}
      <header className="no-print bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              BS
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">অ্যাডমিন কন্ট্রোল রুম</h2>
              <span className="text-[11px] text-amber-300 font-semibold">{settings.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{syncStatus}</span>
            </span>

            <button
              onClick={onViewWebsite}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeModule === null ? (
          /* 14 Module Dashboard */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  শর্টকাট ড্যাশবোর্ড (১৪টি মডিউল)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  যেকোনো একটি মডিউলে ক্লিক করে সংশ্লিষ্ট ডাটাবেজ এডিট ও প্রিন্ট করুন
                </p>
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-white rounded-full border border-slate-300 text-slate-700">
                লগইন আইডি: {creds.email}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {moduleCatalog.map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl transition-all duration-200 text-left flex flex-col justify-between hover:-translate-y-1 active:translate-y-0"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-md bg-gradient-to-br ${m.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">মডিউল #{m.id}</span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors mt-0.5 leading-snug">
                        {m.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span>মডিউলে প্রবেশ করুন</span>
                      <span>&rarr;</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Module View */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <button
                onClick={() => setActiveModule(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>১৪টি শর্টকাট মেনুতে ফিরে যান</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-bold text-amber-600">মডিউল #{activeModule}</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {moduleCatalog.find(m => m.id === activeModule)?.title}
                </h2>
              </div>
            </div>

            {activeModule === 1 && renderModule1()}
            {activeModule === 2 && renderModule2()}
            {activeModule === 3 && renderModule3()}
            {activeModule === 4 && renderModule4()}
            {activeModule === 5 && renderModule5()}
            {activeModule === 6 && renderModule6()}
            {activeModule === 7 && renderModule7()}
            {activeModule === 8 && renderModule8()}
            {activeModule === 9 && renderModule9()}
            {activeModule === 10 && renderModule10()}
            {activeModule === 11 && renderModule11()}
            {activeModule === 12 && renderModule12()}
            {activeModule === 13 && renderModule13()}
            {activeModule === 14 && renderModule14()}
          </div>
        )}
      </main>
    </div>
  );
};
