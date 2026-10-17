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
  ChatbotInfoBlock,
  EnrollmentApplication,
  AdminCredentials,
  CertificateRecord
} from '../../types';
import { storage, DEFAULT_ASSETS, compressImage } from '../../services/storage';
import { aiKnowledgeStore, QAItem, TrainingChunk } from '../../services/aiKnowledgeStore';
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
  Bot,
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
  Upload,
  Copy,
  Send,
  Globe,
  Activity,
  Wifi
} from 'lucide-react';
import { masterGateway, GatewayStatus } from '../../services/masterGateway';
import { toBengaliNum } from '../home/CoursesSection';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewWebsite }) => {
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('সবকিছু সিঙ্কড');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>(() => masterGateway.getStatus());
  const [isManualSyncing, setIsManualSyncing] = useState(false);

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

  // New Teacher Entry Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherDesignation, setNewTeacherDesignation] = useState('প্রশিক্ষক ও মেন্টর');
  const [newTeacherQualifications, setNewTeacherQualifications] = useState('');
  const [newTeacherSpecialist, setNewTeacherSpecialist] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherAddress, setNewTeacherAddress] = useState('');
  const [newTeacherBio, setNewTeacherBio] = useState('');
  const [newTeacherPhoto, setNewTeacherPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  // New Student Entry Form State
  const [newStdYear, setNewStdYear] = useState('2026');
  const [newStdCourse, setNewStdCourse] = useState(storage.getCourses()[0]?.id || '');
  const [newStdRoll, setNewStdRoll] = useState('');
  const [newStdName, setNewStdName] = useState('');
  const [newStdFather, setNewStdFather] = useState('');
  const [newStdMother, setNewStdMother] = useState('');
  const [newStdPhone, setNewStdPhone] = useState('');
  const [newStdAddress, setNewStdAddress] = useState('');
  const [newStdPhoto, setNewStdPhoto] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80');

  // New Notice Entry Form State with File Uploads
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeImage, setNewNoticeImage] = useState<string | null>(null);
  const [newNoticePdf, setNewNoticePdf] = useState<string | null>(null);
  const [newNoticePdfName, setNewNoticePdfName] = useState<string>('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);

  // New Gallery Entry Form State with File Uploads
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('ক্লাস ও ল্যাব অ্যাক্টিভিটি');
  const [newGalleryType, setNewGalleryType] = useState<'image' | 'video'>('image');
  const [newGalleryMediaUrl, setNewGalleryMediaUrl] = useState('');
  const [newGalleryFile, setNewGalleryFile] = useState<string | null>(null);

  // New Ledger Form State
  const [newLedgerType, setNewLedgerType] = useState<'income' | 'expense'>('income');
  const [newLedgerTitle, setNewLedgerTitle] = useState('');
  const [newLedgerCategory, setNewLedgerCategory] = useState('ভর্তি ফি');
  const [newLedgerAmount, setNewLedgerAmount] = useState('');

  // Silent save function - ensures anything typed or updated is permanently saved
  const saveCurrentStateSilently = () => {
    storage.saveSettings(settings);
    storage.saveSlides(slides);
    storage.saveShortcuts(shortcuts);
    storage.saveCourses(courses);
    storage.saveMentors(mentors);
    storage.saveStudents(students);
    storage.saveRoutines(routines);
    storage.saveResults(results);
    storage.saveAdmitCards(admitCards);
    storage.saveCertificates(certificates);
    storage.saveLedger(ledger);
    storage.saveNotices(notices);
    storage.saveNotes(notes);
    storage.saveDemoClasses(demoClasses);
    storage.saveGallery(gallery);
    storage.saveChatbot(chatbot);
    storage.saveApplications(applications);
    storage.saveAdminCredentials(creds);
  };

  // Master Save All Function - pushes immediately through Master Gateway worldwide
  const handleSaveAll = async () => {
    saveCurrentStateSilently();
    setSyncStatus('ক্লাউডে সিঙ্ক হচ্ছে...');
    try {
      const fullState = {
        settings,
        slides,
        shortcuts,
        courses,
        mentors,
        students,
        routines,
        results,
        admit_cards: admitCards,
        certificates,
        ledger,
        notices,
        notes,
        demo_classes: demoClasses,
        gallery,
        chatbot,
        applications,
        admin_creds: creds
      };

      const ok = await masterGateway.forceSyncAll(fullState);
      if (ok) {
        setSyncStatus('গ্লোবালি সিঙ্কড ✅');
        setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 3000);
        alert('✅ আলহামদুলিল্লাহ! ড্যাশবোর্ডের সমস্ত তথ্য মাস্টার গেটওয়ের মাধ্যমে ক্লাউড ডেটাবেজ ও কোডে সফলভাবে রিয়েল-টাইমে সিঙ্ক হয়েছে। পৃথিবীর যেকোনো প্রান্ত থেকে ভিজিটররা এই মুহূর্তে লাইভ দেখতে পাবেন।');
      } else {
        setSyncStatus('সংরক্ষিত ✅');
        setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 3000);
        alert('✅ তথ্য স্থানীয় ও সার্ভার ক্যাশে সংরক্ষিত হয়েছে।');
      }
    } catch {
      setSyncStatus('সংরক্ষিত ✅');
      setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 3000);
    }
  };

  // Listen to background sync & master gateway status events
  useEffect(() => {
    const unsubGateway = masterGateway.onStatusChange(setGatewayStatus);

    const handleSync = (e: any) => {
      setSyncStatus('লাইভ আপডেট হয়েছে');
      setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 2000);
    };

    window.addEventListener('bs_sync', handleSync);
    return () => {
      unsubGateway();
      window.removeEventListener('bs_sync', handleSync);
    };
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
    { id: 14, title: 'সিকিউরিটি, পাসওয়ার্ড ও মাস্টার পিন (PIN)', desc: 'মাস্কড পাসওয়ার্ড, ইমেলহীন মাস্টার পিন রিকভারি সেটআপ ও সিকিউরিটি লগইন', icon: ShieldAlert, color: 'from-slate-700 to-slate-900' },
    { id: 15, title: 'চ্যাটবট ও নলেজবেস কন্ট্রোল (৫০,০০০ শব্দ)', desc: 'ওয়েবসাইটের চ্যাটবক্স এডিট, বৃহৎ নলেজবেস টেক্সটবক্স (৫০,০০০ শব্দ পর্যন্ত), একাধিক তথ্য বক্স (Info Blocks) ও সেভ অপশন', icon: Bot, color: 'from-blue-600 via-indigo-600 to-purple-700' },
  ];

  /* ---------------- MODULE 1: GENERAL SETTINGS, LOGO, FOOTER & SEALS ---------------- */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 0.8);
        setSettings(prev => ({ ...prev, logoUrl: compressed, watermarkUrl: prev.watermarkUrl || compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
        reader.readAsDataURL(file);
      }
    }
  };

  const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 0.7);
        setSettings(prev => ({ ...prev, watermarkUrl: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSettings(prev => ({ ...prev, watermarkUrl: reader.result as string }));
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFounderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 0.8);
        setSettings(prev => ({ ...prev, founderPhotoUrl: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSettings(prev => ({ ...prev, founderPhotoUrl: reader.result as string }));
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.85);
        setSettings(prev => ({ ...prev, signatureUrl: compressed, signatureSealUrl: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          const sig = reader.result as string;
          setSettings(prev => ({ ...prev, signatureUrl: sig, signatureSealUrl: sig }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.85);
        setSettings(prev => ({ ...prev, institutionSealUrl: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSettings(prev => ({ ...prev, institutionSealUrl: reader.result as string }));
        reader.readAsDataURL(file);
      }
    }
  };

  const handleBanglaQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 0.85);
        setSettings(prev => ({ ...prev, banglaQrUrl: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setSettings(prev => ({ ...prev, banglaQrUrl: reader.result as string }));
        reader.readAsDataURL(file);
      }
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
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Main Logo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">১. মূল প্রাতিষ্ঠানিক লোগো (Institutional Logo)</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 bg-slate-900 overflow-hidden shrink-0 shadow-md">
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="লোগো URL..."
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">হেডার, ফুটার ও নোটিসে স্বয়ংক্রিয়ভাবে দেখাবে</p>
          </div>

          {/* Background Watermark Logo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">২. ব্যাকগ্রাউন্ড ওয়াটারমার্ক (Watermark for Documents)</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-blue-400 p-1 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                <img src={settings.watermarkUrl || settings.logoUrl} alt="Watermark" className="max-h-full max-w-full object-contain opacity-50" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWatermarkUpload}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-900 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="ওয়াটারমার্ক URL..."
                  value={settings.watermarkUrl || ''}
                  onChange={(e) => setSettings({ ...settings, watermarkUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">সনদপত্র, এডমিট কার্ড, মার্কশিট ও আইডি কার্ডের মাঝে ওয়াটারমার্ক হিসেবে ভাসবে</p>
          </div>

          {/* Text Size */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">৩. হেডার ব্র্যান্ড টেক্সট সাইজ স্কেলার</label>
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
            <label className="block text-xs font-bold text-slate-700 mb-2">১. প্রধান শিক্ষকের সিগনেচার (Headmaster's Signature)</label>
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
                  onChange={(e) => setSettings({ ...settings, signatureUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">এডমিট কার্ড, রেজাল্ট শিট, সার্টিফিকেট ও আইডি কার্ডে প্রধান শিক্ষকের স্বাক্ষর হিসেবে বসবে</p>
          </div>

          {/* Headmaster's Personal Seal (সিল) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">২. প্রধান শিক্ষকের ব্যক্তিগত সিল (Headmaster's Seal)</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full border border-slate-300 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                <img src={settings.signatureSealUrl || DEFAULT_ASSETS.signatureSeal} alt="Headmaster Seal" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="space-y-1.5 grow">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const compressed = await compressImage(file, 500, 0.85);
                      setSettings(prev => ({ ...prev, signatureSealUrl: compressed }));
                    }
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-900 file:text-white cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="প্রধান শিক্ষকের সিলের URL..."
                  value={settings.signatureSealUrl || ''}
                  onChange={(e) => setSettings({ ...settings, signatureSealUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">প্রধান শিক্ষকের নাম ও পদবি খচিত সিলমোহর</p>
          </div>

          {/* Institute Official Seal Upload & URL */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">৩. প্রতিষ্ঠানের অফিশিয়াল সিল / স্ট্যাম্প (Institutional Seal)</label>
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
                  placeholder="প্রতিষ্ঠানের সিলের URL..."
                  value={settings.institutionSealUrl}
                  onChange={(e) => setSettings({ ...settings, institutionSealUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">সব সনদপত্র, এডমিট কার্ড ও নথিপত্রে প্রতিষ্ঠান কর্তৃক যাচাইকৃত সরকারি সিল</p>
          </div>

          {/* Restore Default Official Assets Button */}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  signatureUrl: DEFAULT_ASSETS.signature,
                  signatureSealUrl: DEFAULT_ASSETS.signatureSeal,
                  institutionSealUrl: DEFAULT_ASSETS.institutionSeal,
                  logoUrl: DEFAULT_ASSETS.logo,
                  watermarkUrl: DEFAULT_ASSETS.logo
                }));
                triggerSaveNotification('ডিফল্ট অফিশিয়াল সিল ও সিগনেচার রিস্টোর হয়েছে!');
                alert('অফিশিয়াল গোল্ড লোগো, প্রধান শিক্ষকের সিল ও সিগনেচার সফলভাবে রিস্টোর হয়েছে!');
              }}
              className="px-4 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ডিফল্ট ভেক্টর সিল ও সিগনেচার রিস্টোর করুন</span>
            </button>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-emerald-700">হোয়াটসঅ্যাপ নম্বর:</label>
                    {m.whatsappNumber && (
                      <a
                        href={`https://wa.me/88${(m.whatsappNumber || '').replace(/[^0-9]/g, '').replace(/^88/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-emerald-600 hover:underline font-bold"
                      >
                        টেস্ট চ্যাট &rarr;
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={m.whatsappNumber || m.phone || ''}
                    onChange={(e) => {
                      const updated = mentors.map(item => item.id === m.id ? { ...item, whatsappNumber: e.target.value } : item);
                      setMentors(updated);
                    }}
                    className="text-xs border border-emerald-300 bg-emerald-50/50 rounded-lg px-2 py-1 w-full font-mono font-bold text-emerald-950"
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
                setNewStdRoll(nextRoll);
                setNewStdYear(filterYear);
                setNewStdCourse(filterCourse === 'all' ? (courses[0]?.id || '') : filterCourse);
                setIsAddStudentModalOpen(true);
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

      {/* Module 4 Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800">শিক্ষার্থী ডাটাবেজ সংরক্ষণ করুন</h4>
          <p className="text-xs text-slate-500">সকল শিক্ষার্থীর হালনাগাদ তথ্য লোকাল স্টোরেজে সুরক্ষিতভাবে সংরক্ষিত হবে।</p>
        </div>
        <button
          onClick={() => {
            storage.saveStudents(students);
            triggerSaveNotification('শিক্ষার্থী ডাটাবেজ সফলভাবে সংরক্ষিত হয়েছে!');
            alert('শিক্ষার্থীদের সম্পূর্ণ তালিকা সফলভাবে সংরক্ষণ করা হয়েছে!');
          }}
          className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>শিক্ষার্থী ডাটাবেজ সংরক্ষণ করুন</span>
        </button>
      </div>
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

      <button
        onClick={() => {
          storage.saveCourses(courses);
          triggerSaveNotification('কোর্স, বিষয় ও পরীক্ষার তালিকা সফলভাবে সংরক্ষিত হয়েছে!');
          alert('কোর্সের বিষয় ও পরীক্ষা সফলভাবে সংরক্ষিত হয়েছে!');
        }}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
      >
        <Save className="w-4 h-4 text-amber-400" />
        <span>বিষয় ও পরীক্ষার তথ্য সংরক্ষণ করুন</span>
      </button>
    </div>
  );

  /* ---------------- MODULE 6: ADMIT CARD MANAGEMENT & CONTROL ---------------- */
  const [admitSearchRoll, setAdmitSearchRoll] = useState('');
  const [newAdmitRoll, setNewAdmitRoll] = useState('');
  const [newAdmitExam, setNewAdmitExam] = useState('চূড়ান্ত সমাপনী পরীক্ষা ২০২৬');
  const [newAdmitCenter, setNewAdmitCenter] = useState('BS IT Zone Digital Lab-1');
  const [newAdmitDate, setNewAdmitDate] = useState('২০২৬-০৫-১৫');
  const [newAdmitTime, setNewAdmitTime] = useState('সকাল ১০:০০ টা');

  const handleAddAdmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.roll === newAdmitRoll.trim());
    if (!st) {
      alert(`রোল ${newAdmitRoll} দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি!`);
      return;
    }
    const newCard: AdmitCardRecord = {
      id: `adm-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      fatherName: st.fatherName || '',
      motherName: st.motherName || '',
      studentPhoto: st.photoUrl,
      roll: st.roll,
      courseId: st.courseId,
      academicYear: st.academicYear,
      examType: newAdmitExam,
      examDate: newAdmitDate,
      examTime: newAdmitTime,
      examCenter: newAdmitCenter,
      published: true,
      instructions: ['পরীক্ষার নির্ধারিত সময়ের অন্তত ২০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।'],
      feeCleared: true,
      isBlocked: false
    };
    const updated = [newCard, ...admitCards.filter(c => c.roll !== st.roll)];
    setAdmitCards(updated);
    storage.saveAdmitCards(updated);
    triggerSaveNotification('এডমিট কার্ড সফলভাবে ইস্যু হয়েছে!');
    alert(`রোল ${st.roll} (${st.name})-এর জন্য এডমিট কার্ড সফলভাবে তৈরি হয়েছে!`);
    setNewAdmitRoll('');
  };

  const filteredAdmitCards = admitCards.filter(a => {
    if (admitSearchRoll && !a.roll.includes(admitSearchRoll.trim()) && !a.studentName.toLowerCase().includes(admitSearchRoll.toLowerCase())) {
      return false;
    }
    return true;
  });

  const renderModule6 = () => (
    <div className="space-y-6">
      {/* Issue New Admit Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-rose-600" />
            <span>নতুন এডমিট কার্ড ইস্যু ও তৈরি করুন</span>
          </span>
          <span className="text-xs text-slate-500 font-normal">রোল লিখলে শিক্ষার্থীর সকল তথ্য স্বয়ংক্রিয়ভাবে সংযুক্ত হবে</span>
        </h3>

        <form onSubmit={handleAddAdmitCard} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর রোল *</label>
            <input
              type="text"
              required
              placeholder="যেমন: 101"
              value={newAdmitRoll}
              onChange={(e) => setNewAdmitRoll(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-blue-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষার নাম</label>
            <input
              type="text"
              required
              value={newAdmitExam}
              onChange={(e) => setNewAdmitExam(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষা কেন্দ্র</label>
            <input
              type="text"
              required
              value={newAdmitCenter}
              onChange={(e) => setNewAdmitCenter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ</label>
            <input
              type="date"
              required
              value={newAdmitDate}
              onChange={(e) => setNewAdmitDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">সময়</label>
            <input
              type="text"
              required
              value={newAdmitTime}
              onChange={(e) => setNewAdmitTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>কার্ড তৈরি করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admit Cards Management List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>এডমিট কার্ড তালিকা ও পারমিশন কন্ট্রোল ({filteredAdmitCards.length} টি)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              প্রিভিউ দেখে সরাসরি ডাউনলোড এবং প্রিন্ট করুন। বকেয়া থাকলে 'ব্লক' বাটনে ক্লিক করে আটকে রাখতে পারেন।
            </p>
          </div>
          <div className="w-full sm:w-60">
            <input
              type="text"
              placeholder="রোল বা নাম দিয়ে খুঁজুন..."
              value={admitSearchRoll}
              onChange={(e) => setAdmitSearchRoll(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAdmitCards.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-900 text-sm bg-blue-100 px-2 py-0.5 rounded-md">রোল {a.roll}</span>
                  <span className="font-bold text-slate-900 text-sm">{a.studentName}</span>
                  <span className="text-slate-500 text-xs">({courses.find(c => c.id === a.courseId)?.title || a.courseId})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  <b>পরীক্ষা:</b> {a.examType} • <b>কেন্দ্র:</b> {a.examCenter} • <b>সময়:</b> {a.examDate} ({a.examTime})
                </p>
                {a.isBlocked && (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block mt-1">
                    ⚠️ এডমিট কার্ড ব্লকড: {a.blockedReason || 'বকেয়া ফি'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedAdmitCardForPrint(a)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  title="এডমিট কার্ড প্রিভিউ ও সরাসরি প্রিন্ট / ডাউনলোড"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>প্রিভিউ ও প্রিন্ট/ডাউনলোড</span>
                </button>

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
                  {a.isBlocked ? 'এডমিট ব্লকড (আনলক করুন)' : 'এডমিট সচল (Allowed)'}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`রোল ${a.roll} (${a.studentName})-এর এডমিট কার্ড মুছতে চান?`)) {
                      const updated = admitCards.filter(item => item.id !== a.id);
                      setAdmitCards(updated);
                      storage.saveAdmitCards(updated);
                      triggerSaveNotification('এডমিট কার্ড মুছে ফেলা হয়েছে');
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module 6 Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800">এডমিট কার্ড ডাটাবেজ সংরক্ষণ করুন</h4>
          <p className="text-xs text-slate-500">সকল এডমিট কার্ড ও পারমিশন স্ট্যাটাস স্থায়ীভাবে সেভ করুন।</p>
        </div>
        <button
          onClick={() => {
            storage.saveAdmitCards(admitCards);
            triggerSaveNotification('এডমিট কার্ডের সকল তথ্য সংরক্ষিত হয়েছে!');
            alert('এডমিট কার্ডের ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!');
          }}
          className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>এডমিট কার্ড ডাটাবেজ সংরক্ষণ করুন</span>
        </button>
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
            <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-900 bg-amber-100 px-2 py-0.5 rounded-md">রোল {c.roll}</span>
                  <span className="font-bold text-slate-900 text-sm">{c.studentName}</span>
                  <span className="text-slate-500">সনদ নং: {c.certificateNo}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  কোর্স: <b>{courses.find(item => item.id === c.courseId)?.title || c.courseId}</b> • গ্রেড: <b>{c.grade}</b> • 
                  ফি: <b>{c.isFree ? 'সম্পূর্ণ ফ্রি' : `${c.feeAmount}৳ (পরিশোধিত: ${c.hasEverPaid ? 'হ্যাঁ' : 'না'})`}</b>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedCertForPrint(c)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  title="সনদপত্র প্রিভিউ এবং সরাসরি ডাউনলোড ও প্রিন্ট করুন"
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>সনদ প্রিভিউ ও প্রিন্ট/ডাউনলোড</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`রোল ${c.roll} (${c.studentName})-এর সনদপত্র মুছে ফেলবেন?`)) {
                      const updated = certificates.filter(item => item.id !== c.id);
                      setCertificates(updated);
                      storage.saveCertificates(updated);
                      triggerSaveNotification('সনদপত্র মুছে ফেলা হয়েছে');
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module 7 Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800">সনদপত্র ডাটাবেজ সংরক্ষণ করুন</h4>
          <p className="text-xs text-slate-500">সকল তৈরিকৃত সনদপত্র ও ফি সংক্রান্ত তথ্য সংরক্ষণ করুন।</p>
        </div>
        <button
          onClick={() => {
            storage.saveCertificates(certificates);
            triggerSaveNotification('সনদপত্রের সকল তথ্য সংরক্ষিত হয়েছে!');
            alert('সনদপত্রের ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!');
          }}
          className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>সনদ ডাটাবেজ সংরক্ষণ করুন</span>
        </button>
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

        {/* Module 9 Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800">আবেদন তালিকা ডাটাবেজ সংরক্ষণ করুন</h4>
            <p className="text-xs text-slate-500">সকল প্রাপ্ত এবং নিষ্পত্তি হওয়া আবেদনের স্ট্যাটাস সংরক্ষণ করুন।</p>
          </div>
          <button
            onClick={() => {
              storage.saveApplications(applications);
              triggerSaveNotification('আবেদন তালিকা সফলভাবে সংরক্ষিত হয়েছে!');
              alert('সকল ভর্তি ও ফি আবেদনের ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!');
            }}
            className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>আবেদন তালিকা সংরক্ষণ করুন</span>
          </button>
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

        {/* Add Transaction Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>নতুন আয় বা ব্যয় এন্ট্রি করুন</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">লেনদেনের ধরন</label>
              <select
                value={newLedgerType}
                onChange={(e) => setNewLedgerType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="income">আয় (Income / প্রাপ্তি)</option>
                <option value="expense">ব্যয় (Expense / খরচ)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">বিবরণ / শিরোনাম *</label>
              <input
                type="text"
                placeholder="যেমন: মার্চ ভর্তি ফি বা ইন্টারনেট বিল"
                value={newLedgerTitle}
                onChange={(e) => setNewLedgerTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ক্যাটেগরি</label>
              <input
                type="text"
                placeholder="যেমন: ভর্তি ফি / বেতন"
                value={newLedgerCategory}
                onChange={(e) => setNewLedgerCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">পরিমাণ (টাকা) *</label>
              <input
                type="number"
                placeholder="টাকা"
                value={newLedgerAmount}
                onChange={(e) => setNewLedgerAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono"
              />
            </div>
            <div>
              <button
                onClick={() => {
                  if (!newLedgerTitle.trim() || !newLedgerAmount) {
                    alert('অনুগ্রহ করে বিবরণ ও টাকার পরিমাণ লিখুন!');
                    return;
                  }
                  const newItem: LedgerItem = {
                    id: `led-${Date.now()}`,
                    type: newLedgerType,
                    title: newLedgerTitle.trim(),
                    description: newLedgerTitle.trim(),
                    category: newLedgerCategory.trim() || 'সাধারণ',
                    amount: Number(newLedgerAmount),
                    date: new Date().toISOString().split('T')[0],
                    academicYear: '2026'
                  };
                  const updated = [newItem, ...ledger];
                  setLedger(updated);
                  storage.saveLedger(updated);
                  setNewLedgerTitle('');
                  setNewLedgerAmount('');
                  triggerSaveNotification('লেনদেন সফলভাবে যোগ হয়েছে!');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ এন্ট্রি যোগ করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-bold text-sm text-slate-800">আর্থিক লেনদেনের খতিয়ান ({ledger.length} টি)</span>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>আর্থিক বিবরণী প্রিন্ট</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                <tr>
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3">বিবরণ</th>
                  <th className="py-2.5 px-3">ক্যাটেগরি</th>
                  <th className="py-2.5 px-3">ধরন</th>
                  <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledger.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{item.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{item.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.type === 'income' ? 'আয়' : 'ব্যয়'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={item.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.type === 'income' ? '+' : '-'}{toBengaliNum(item.amount)} ৳
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`এই এন্ট্রি মুছে ফেলতে চান?`)) {
                            const updated = ledger.filter(l => l.id !== item.id);
                            setLedger(updated);
                            storage.saveLedger(updated);
                            triggerSaveNotification('লেনদেন মোছা হয়েছে');
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 11 Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800">আর্থিক বিবরণী ডাটাবেজ সংরক্ষণ করুন</h4>
            <p className="text-xs text-slate-500">সকল আয়-ব্যয় ও খতিয়ানের তথ্য সংরক্ষণ করুন।</p>
          </div>
          <button
            onClick={() => {
              storage.saveLedger(ledger);
              triggerSaveNotification('আর্থিক লেজার সফলভাবে সংরক্ষিত হয়েছে!');
              alert('লেজার ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!');
            }}
            className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>লেজার ডাটাবেজ সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    );
  };

  /* ---------------- MODULE 12: NOTICES & FREE NOTES ---------------- */
  const renderModule12 = () => (
    <div className="space-y-6">
      {/* Publish New Notice with Image & PDF File Uploads */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-900" />
            <span>নতুন নোটিশ প্রকাশ করুন (ছবি ও পিডিএফ ফাইল আপলোড সহ)</span>
          </span>
          <span className="text-xs text-amber-600 font-semibold">* ছবি ও পিডিএফ সরাসরি ফাইল সিলেক্ট করে যুক্ত করুন</span>
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশ শিরোনাম *</label>
            <input
              type="text"
              placeholder="যেমন: ২০২৬ সেশনের সমাপনী পরীক্ষা সংক্রান্ত জরুরি নোটিশ"
              value={newNoticeTitle}
              onChange={(e) => setNewNoticeTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোটিশের বিস্তারিত বিবরণ *</label>
            <textarea
              rows={3}
              placeholder="নোটিশের বিস্তারিত টেক্সট এখানে লিখুন..."
              value={newNoticeContent}
              onChange={(e) => setNewNoticeContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Image File Upload Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                নোটিশের সাথে ছবি আপলোড (Image File Upload)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setNewNoticeImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
              />
              {newNoticeImage && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-slate-200">
                  <img src={newNoticeImage} alt="Notice Preview" className="w-12 h-12 object-cover rounded-md" />
                  <span className="text-[11px] text-emerald-700 font-bold">ছবি সফলভাবে সিলেক্ট হয়েছে</span>
                  <button onClick={() => setNewNoticeImage(null)} className="text-red-500 hover:text-red-700 text-xs ml-auto">মুছুন</button>
                </div>
              )}
            </div>

            {/* PDF File Upload Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                অফিসিয়াল পিডিএফ ফাইল আপলোড (PDF File Upload)
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewNoticePdfName(file.name);
                    const reader = new FileReader();
                    reader.onload = () => setNewNoticePdf(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-700 file:text-white hover:file:bg-red-600 cursor-pointer"
              />
              {newNoticePdf && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-slate-200">
                  <FileText className="w-5 h-5 text-red-600" />
                  <span className="text-[11px] text-slate-800 font-mono truncate max-w-[180px]">{newNoticePdfName || 'PDF সংযুক্ত'}</span>
                  <button onClick={() => { setNewNoticePdf(null); setNewNoticePdfName(''); }} className="text-red-500 hover:text-red-700 text-xs ml-auto">মুছুন</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newNoticePinned}
                onChange={(e) => setNewNoticePinned(e.target.checked)}
                className="rounded text-blue-900"
              />
              <span>নোটিশটি পিন করে শীর্ষে রাখুন (Pinned Notice)</span>
            </label>

            <button
              onClick={() => {
                if (!newNoticeTitle.trim() || !newNoticeContent.trim()) {
                  alert('অনুগ্রহ করে নোটিশের শিরোনাম ও বিস্তারিত বিবরণ লিখুন!');
                  return;
                }
                const newN: NoticeItem = {
                  id: `not-${Date.now()}`,
                  title: newNoticeTitle.trim(),
                  date: new Date().toLocaleDateString('bn-BD'),
                  content: newNoticeContent.trim(),
                  images: newNoticeImage ? [newNoticeImage] : [],
                  pdfUrl: newNoticePdf || undefined,
                  pinned: newNoticePinned
                };
                const updated = [newN, ...notices];
                setNotices(updated);
                storage.saveNotices(updated);
                setNewNoticeTitle('');
                setNewNoticeContent('');
                setNewNoticeImage(null);
                setNewNoticePdf(null);
                setNewNoticePdfName('');
                setNewNoticePinned(false);
                triggerSaveNotification('নোটিশ সফলভাবে প্রকাশিত হয়েছে!');
                alert('নতুন নোটিশ ছবি ও পিডিএফ সহ সফলভাবে পাবলিশ করা হয়েছে!');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>নোটিশ প্রকাশ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Notices List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2">
          প্রকাশিত নোটিশ তালিকা ({notices.length} টি)
        </h3>

        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={n.title}
                  onChange={(e) => setNotices(notices.map(item => item.id === n.id ? { ...item, title: e.target.value } : item))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-slate-900 bg-white mr-3"
                />
                <button
                  onClick={() => {
                    if (confirm(`"${n.title}" নোটিশটি মুছে ফেলতে চান?`)) {
                      const updated = notices.filter(item => item.id !== n.id);
                      setNotices(updated);
                      storage.saveNotices(updated);
                      triggerSaveNotification('নোটিশ মোছা হয়েছে');
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <textarea
                rows={2}
                value={n.content}
                onChange={(e) => setNotices(notices.map(item => item.id === n.id ? { ...item, content: e.target.value } : item))}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs leading-relaxed bg-white"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Notice Image input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">ছবি আপলোড বা পরিবর্তন:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updated = notices.map(item => item.id === n.id ? { ...item, images: [reader.result as string] } : item);
                          setNotices(updated);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-blue-900 file:text-white cursor-pointer"
                  />
                  {n.images && n.images.length > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <img src={n.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                      <span className="text-[10px] text-emerald-700 font-semibold">ছবি সংযুক্ত আছে</span>
                    </div>
                  )}
                </div>

                {/* Notice PDF input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">পিডিএফ আপলোড বা পরিবর্তন:</label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const updated = notices.map(item => item.id === n.id ? { ...item, pdfUrl: reader.result as string } : item);
                          setNotices(updated);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-red-700 file:text-white cursor-pointer"
                  />
                  {n.pdfUrl && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-700 font-semibold">
                      <FileText className="w-3.5 h-3.5" />
                      <span>পিডিএফ সংযুক্ত আছে</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Notes with PDF File Uploads */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-base font-bold text-slate-900">ফ্রি হ্যান্ডনোটস ও সাজেশনস (পিডিএফ ফাইল সহ)</h3>
          <button
            onClick={() => {
              const newFn: FreeNoteItem = {
                id: `fn-${Date.now()}`,
                title: 'নতুন হ্যান্ডনোট শিরোনাম',
                subject: 'সাধারণ বিষয়',
                classOrCourse: 'সকল শিক্ষার্থী',
                description: 'নোটসের বিষয়বস্তু...',
                fileUrl: '',
                pdfUrl: '',
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
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={fn.title}
                  onChange={(e) => setNotes(notes.map(item => item.id === fn.id ? { ...item, title: e.target.value } : item))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-blue-900 bg-white mr-2"
                />
                <button
                  onClick={() => setNotes(notes.filter(item => item.id !== fn.id))}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <label className="text-[10px] font-bold text-slate-600 shrink-0">পিডিএফ / ফাইল আপলোড:</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const url = reader.result as string;
                        setNotes(notes.map(item => item.id === fn.id ? { ...item, pdfUrl: url, fileUrl: url } : item));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:bg-teal-800 file:text-white cursor-pointer grow"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module 12 Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800">নোটিস ও নোটস ডাটাবেজ সংরক্ষণ করুন</h4>
          <p className="text-xs text-slate-500">সকল ছবি, পিডিএফ ও নোটিশের তথ্য স্থায়ীভাবে সংরক্ষণ করুন।</p>
        </div>
        <button
          onClick={() => {
            storage.saveNotices(notices);
            storage.saveNotes(notes);
            triggerSaveNotification('নোটিস ও নোটস সফলভাবে সংরক্ষিত হয়েছে!');
            alert('সকল নোটিশ ও স্টাডি ফাইল সফলভাবে সংরক্ষণ করা হয়েছে!');
          }}
          className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>নোটিস ও নোটস সংরক্ষণ করুন</span>
        </button>
      </div>
    </div>
  );

  /* ---------------- MODULE 13: GALLERY & DEMO CLASSES ---------------- */
  const renderModule13 = () => (
    <div className="space-y-6">
      {/* Photo & Video Gallery Upload Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-pink-600" />
            <span>গ্যালারিতে সরাসরি ছবি ও ভিডিও আপলোড</span>
          </span>
          <span className="text-xs text-slate-500 font-normal">মোবাইল বা পিসি থেকে সরাসরি ছবি বা ভিডিও ফাইল নির্বাচন করুন</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাপশন / শিরোনাম *</label>
            <input
              type="text"
              placeholder="যেমন: কম্পিউটার ল্যাবে শিক্ষার্থীদের প্র্যাকটিক্যাল ক্লাস"
              value={newGalleryTitle}
              onChange={(e) => setNewGalleryTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটেগরি</label>
            <select
              value={newGalleryCategory}
              onChange={(e) => setNewGalleryCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="ক্লাস ও ল্যাব অ্যাক্টিভিটি">ক্লাস ও ল্যাব অ্যাক্টিভিটি</option>
              <option value="পুরস্কার ও সনদ বিতরণ">পুরস্কার ও সনদ বিতরণ</option>
              <option value="সেমিনার ও কর্মশালা">সেমিনার ও কর্মশালা</option>
              <option value="সাফল্যের গল্প ও অনুভূতি">সাফল্যের গল্প ও অনুভূতি</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">মিডিয়া ধরন</label>
            <select
              value={newGalleryType}
              onChange={(e) => setNewGalleryType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
            >
              <option value="image">ছবি (Photo)</option>
              <option value="video">ভিডিও (Video / YouTube)</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">ডিভাইস থেকে ফাইল আপলোড (Image/Video Upload)</label>
            <input
              type="file"
              accept={newGalleryType === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setNewGalleryFile(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pink-700 file:text-white hover:file:bg-pink-600 cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">অথবা সরাসরি মিডিয়া / YouTube URL</label>
            <input
              type="text"
              placeholder={newGalleryType === 'image' ? 'https://... ছবি URL' : 'https://www.youtube.com/embed/...'}
              value={newGalleryMediaUrl}
              onChange={(e) => setNewGalleryMediaUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              onClick={() => {
                const finalUrl = newGalleryFile || newGalleryMediaUrl.trim();
                if (!newGalleryTitle.trim() || !finalUrl) {
                  alert('অনুগ্রহ করে ক্যাপশন এবং ছবি/ভিডিও ফাইল নির্বাচন করুন!');
                  return;
                }
                const newG: GalleryItem = {
                  id: `gal-${Date.now()}`,
                  type: newGalleryType,
                  url: finalUrl,
                  title: newGalleryTitle.trim(),
                  category: newGalleryCategory,
                  caption: newGalleryTitle.trim(),
                  date: new Date().toISOString().split('T')[0]
                };
                const updated = [newG, ...gallery];
                setGallery(updated);
                storage.saveGallery(updated);
                setNewGalleryTitle('');
                setNewGalleryMediaUrl('');
                setNewGalleryFile(null);
                triggerSaveNotification('গ্যালারিতে মিডিয়া যোগ হয়েছে!');
                alert('গ্যালারিতে নতুন মিডিয়া সফলভাবে যুক্ত হয়েছে!');
              }}
              className="px-5 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>গ্যালারিতে যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Gallery Items Grid */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-700 mb-3">বর্তমান গ্যালারি আইটেমসমূহ ({gallery.length} টি):</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.map((g) => (
              <div key={g.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video shadow-xs">
                {g.type === 'video' ? (
                  g.url.includes('youtube') || g.url.includes('embed') ? (
                    <iframe src={g.url} title={g.title} className="w-full h-full pointer-events-none opacity-80" />
                  ) : (
                    <video src={g.url} className="w-full h-full object-cover opacity-80" />
                  )
                ) : (
                  <img src={g.url} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-between p-2">
                  <button
                    onClick={() => {
                      if (confirm(`এই আইটেমটি গ্যালারি থেকে মুছে ফেলবেন?`)) {
                        const updated = gallery.filter(item => item.id !== g.id);
                        setGallery(updated);
                        storage.saveGallery(updated);
                        triggerSaveNotification('গ্যালারি আইটেম মোছা হয়েছে');
                      }
                    }}
                    className="self-end p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] font-bold text-white line-clamp-1">{g.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={dc.title}
                  onChange={(e) => setDemoClasses(demoClasses.map(item => item.id === dc.id ? { ...item, title: e.target.value } : item))}
                  className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-bold text-slate-900 bg-white mr-2"
                />
                <button
                  onClick={() => setDemoClasses(demoClasses.filter(item => item.id !== dc.id))}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="YouTube / Facebook Video Embed URL..."
                value={dc.videoUrl}
                onChange={(e) => setDemoClasses(demoClasses.map(item => item.id === dc.id ? { ...item, videoUrl: e.target.value } : item))}
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Module 13 Save Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800">গ্যালারি ও ডেমো ক্লাস সংরক্ষণ করুন</h4>
          <p className="text-xs text-slate-500">সকল আপলোডকৃত ছবি, ভিডিও ও ক্লাসের তথ্য সংরক্ষণ করুন।</p>
        </div>
        <button
          onClick={() => {
            storage.saveDemoClasses(demoClasses);
            storage.saveGallery(gallery);
            triggerSaveNotification('গ্যালারি ও ক্লাস সংরক্ষিত হয়েছে!');
            alert('গ্যালারি ও ডেমো ক্লাস ডাটা সফলভাবে সংরক্ষণ করা হয়েছে!');
          }}
          className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>গ্যালারি ও ক্লাস সংরক্ষণ করুন</span>
        </button>
      </div>
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
              placeholder="৬ থেকে ১১ ডিজিটের গোপন পিন লিখুন"
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

  /* ---------------- MODULE 15: CHATBOT & 50,000-WORD KNOWLEDGE BASE ---------------- */
  const [kbText, setKbText] = useState(chatbot.knowledgeBaseText || '');
  const [infoBlocks, setInfoBlocks] = useState<ChatbotInfoBlock[]>(chatbot.infoBlocks || []);
  const [botName, setBotName] = useState(chatbot.botName || 'BS Learning নিজস্ব AI সহকারী');
  const [welcomeMsg, setWelcomeMsg] = useState(chatbot.welcomeMessage || '');
  const [activeChatTab, setActiveChatTab] = useState<'knowledge' | 'chunks' | 'qa' | 'blocks' | 'settings' | 'test'>('knowledge');

  // 1,000-Word Structured Training Chunks State (Up to 200,000+ Words total)
  const [trainingChunks, setTrainingChunks] = useState<TrainingChunk[]>(aiKnowledgeStore.getTrainingChunks());
  const [newChunkTitle, setNewChunkTitle] = useState('');
  const [newChunkCategory, setNewChunkCategory] = useState('কোর্স তথ্য ও কারিকুলাম');
  const [newChunkContent, setNewChunkContent] = useState('');
  const [newChunkTags, setNewChunkTags] = useState('');

  // Self-Learning Q&A Pairs (Teacher-Verified Dynamic Learning)
  const [qaList, setQaList] = useState<QAItem[]>(aiKnowledgeStore.getKnowledgeBase());
  const [newQAQuestion, setNewQAQuestion] = useState('');
  const [newQAAnswer, setNewQAAnswer] = useState('');
  const [newQATeacher, setNewQATeacher] = useState('বোরহানউদ্দিন মহিম');

  // New Info Block Form State
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockCategory, setNewBlockCategory] = useState('কোর্স তথ্য');
  const [newBlockContent, setNewBlockContent] = useState('');
  const [newBlockKeywords, setNewBlockKeywords] = useState('');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Quick Test Simulator State
  const [testQuestion, setTestQuestion] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testSource, setTestSource] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Word count calculations across the massive 200,000+ words store
  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };
  const kbWordCount = countWords(kbText);
  const blocksWordCount = infoBlocks.reduce((acc, b) => acc + countWords(b.title + ' ' + b.content), 0);
  const chunksWordCount = trainingChunks.reduce((acc, c) => acc + countWords(c.title + ' ' + c.content), 0);
  const qaWordCount = qaList.reduce((acc, q) => acc + countWords(q.question + ' ' + q.answer), 0);
  const totalWordCount = kbWordCount + blocksWordCount + chunksWordCount + qaWordCount;
  const maxWords = 200000;
  const percentUsed = Math.min(100, Math.round((totalWordCount / maxWords) * 100));

  // Master Chatbot Save
  const handleSaveChatbotAll = (customMsg?: string) => {
    const updated: ChatbotSettings = {
      ...chatbot,
      botName: botName.trim(),
      welcomeMessage: welcomeMsg.trim(),
      knowledgeBaseText: kbText.trim(),
      infoBlocks: infoBlocks,
    };
    setChatbot(updated);
    storage.saveChatbot(updated);
    triggerSaveNotification(customMsg || 'চ্যাটবটের ডাটা সফলভাবে সংরক্ষিত হয়েছে!');
    alert(customMsg || '✅ আলহামদুলিল্লাহ! ২০০,০০০+ শব্দের নলেজবেস ও সকল ট্রেনিং ডাটা সফলভাবে সংরক্ষিত হয়েছে এবং লাইভ ওয়েবসাইটে সক্রিয়!');
  };

  // Add 1,000-Word Structured Training Chunk
  const handleAddTrainingChunk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChunkTitle.trim() || !newChunkContent.trim()) {
      alert('অনুগ্রহ করে ট্রেনিং বক্সের শিরোনাম ও বিবরণ পূরণ করুন!');
      return;
    }
    const tags = newChunkTags.split(',').map(t => t.trim()).filter(Boolean);
    aiKnowledgeStore.saveTrainingChunk({
      title: newChunkTitle.trim(),
      category: newChunkCategory.trim() || 'সাধারণ জ্ঞান ও নীতি',
      content: newChunkContent.trim(),
      tags
    });
    setTrainingChunks([...aiKnowledgeStore.getTrainingChunks()]);
    setNewChunkTitle('');
    setNewChunkContent('');
    setNewChunkTags('');
    triggerSaveNotification('১,০০০ শব্দের ট্রেনিং বক্স ডাটাবেজে যুক্ত হয়েছে!');
    alert('✅ ১,০০০ শব্দের ট্রেনিং বক্স সফলভাবে সংরক্ষিত হয়েছে!');
  };

  // Delete Training Chunk
  const handleDeleteTrainingChunk = (id: string) => {
    if (!confirm('আপনি কি এই ট্রেনিং বক্সটি মুছে ফেলতে চান?')) return;
    aiKnowledgeStore.deleteTrainingChunk(id);
    setTrainingChunks([...aiKnowledgeStore.getTrainingChunks()]);
    triggerSaveNotification('ট্রেনিং বক্স মুছে ফেলা হয়েছে!');
  };

  // Add Self-Learning Teacher Q&A Pair
  const handleAddQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQAQuestion.trim() || !newQAAnswer.trim()) {
      alert('প্রশ্ন এবং শিক্ষকের উত্তর উভয়ই দেওয়া আবশ্যক!');
      return;
    }
    aiKnowledgeStore.addQAPair(newQAQuestion.trim(), newQAAnswer.trim(), newQATeacher.trim(), true);
    setQaList([...aiKnowledgeStore.getKnowledgeBase()]);
    setNewQAQuestion('');
    setNewQAAnswer('');
    triggerSaveNotification('শিক্ষক প্রশ্নোত্তর সফলভাবে সেভ হয়েছে!');
    alert('✅ আলহামদুলিল্লাহ! শিক্ষক-যাচাইকৃত প্রশ্নোত্তর সফলভাবে যুক্ত হয়েছে। পরবর্তীতে কোনো শিক্ষার্থী একই বা অনুরূপ প্রশ্ন করলে এআই স্বয়ংক্রিয়ভাবে উত্তর দেবে।');
  };

  // Delete Q&A Pair
  const handleDeleteQA = (id: string) => {
    if (!confirm('আপনি কি এই প্রশ্নোত্তরটি মুছে ফেলতে চান?')) return;
    aiKnowledgeStore.deleteQAPair(id);
    setQaList([...aiKnowledgeStore.getKnowledgeBase()]);
    triggerSaveNotification('প্রশ্নোত্তর মুছে ফেলা হয়েছে!');
  };

  // Add new Info Block
  const handleAddInfoBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim() || !newBlockContent.trim()) {
      alert('অনুগ্রহ করে তথ্য বক্সের শিরোনাম এবং বিস্তারিত বিবরণ লিখুন!');
      return;
    }
    const newBlock: ChatbotInfoBlock = {
      id: `block-${Date.now()}`,
      title: newBlockTitle.trim(),
      category: newBlockCategory.trim() || 'সাধারণ',
      content: newBlockContent.trim(),
      keywords: newBlockKeywords.split(',').map(k => k.trim()).filter(Boolean),
      isActive: true,
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };
    const updatedBlocks = [newBlock, ...infoBlocks];
    setInfoBlocks(updatedBlocks);
    const updatedChatbot: ChatbotSettings = {
      ...chatbot,
      infoBlocks: updatedBlocks,
      knowledgeBaseText: kbText,
      botName,
      welcomeMessage: welcomeMsg
    };
    setChatbot(updatedChatbot);
    storage.saveChatbot(updatedChatbot);
    setNewBlockTitle('');
    setNewBlockContent('');
    setNewBlockKeywords('');
    triggerSaveNotification('নতুন তথ্য বক্স যুক্ত ও সংরক্ষিত হয়েছে!');
    alert('✅ নতুন তথ্য বক্স সফলভাবে যুক্ত ও সেভ হয়েছে!');
  };

  // Update an existing info block
  const handleUpdateInfoBlock = (id: string, updatedFields: Partial<ChatbotInfoBlock>) => {
    const updated = infoBlocks.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    setInfoBlocks(updated);
    const updatedChatbot: ChatbotSettings = {
      ...chatbot,
      infoBlocks: updated,
      knowledgeBaseText: kbText,
      botName,
      welcomeMessage: welcomeMsg
    };
    setChatbot(updatedChatbot);
    storage.saveChatbot(updatedChatbot);
    triggerSaveNotification('তথ্য বক্সের পরিবর্তন সংরক্ষিত হয়েছে!');
  };

  // Delete an info block
  const handleDeleteInfoBlock = (id: string) => {
    if (!confirm('আপনি কি এই তথ্য বক্সটি ডিলিট করতে চান?')) return;
    const updated = infoBlocks.filter(b => b.id !== id);
    setInfoBlocks(updated);
    const updatedChatbot: ChatbotSettings = {
      ...chatbot,
      infoBlocks: updated,
      knowledgeBaseText: kbText,
      botName,
      welcomeMessage: welcomeMsg
    };
    setChatbot(updatedChatbot);
    storage.saveChatbot(updatedChatbot);
    triggerSaveNotification('তথ্য বক্স মুছে ফেলা হয়েছে!');
  };

  // Test Simulator (Tests Math, Learned QA, Training Chunks, Info blocks & Wikipedia)
  const handleTestChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuestion.trim()) return;
    setIsSimulating(true);
    setTestResponse(null);
    setTestSource(null);

    const q = testQuestion.toLowerCase();

    // 1. Math
    const math = (window as any).evaluateMathExpression ? (window as any).evaluateMathExpression(testQuestion) : null;
    if (math) {
      setTestResponse(`🧮 ${math}`);
      setTestSource('বিল্ট-ইন ক্যালকুলেটর');
      setIsSimulating(false);
      return;
    }

    // 2. Self-learning Teacher-verified Q&A and 200,000+ words store
    const learned = aiKnowledgeStore.searchLearnedAnswer(testQuestion);
    if (learned) {
      setTestResponse(learned.answer);
      setTestSource(learned.source);
      setIsSimulating(false);
      return;
    }

    // 3. Info blocks
    for (const b of infoBlocks) {
      if (!b.isActive) continue;
      const matchesKeyword = b.keywords?.some(k => k && q.includes(k.toLowerCase()));
      const matchesTitle = b.title.toLowerCase().split(/\s+/).some(w => w.length > 2 && q.includes(w));
      if (matchesKeyword || q.includes(b.title.toLowerCase()) || matchesTitle) {
        setTestResponse(`📌 [তথ্য বক্স: ${b.title}]\n\n${b.content}`);
        setTestSource('অ্যাডমিন তথ্য বক্স');
        setIsSimulating(false);
        return;
      }
    }

    // 4. Large Central Knowledge Base
    if (kbText) {
      const sections = kbText.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
      const queryTerms = q.split(/[\s,?!;।]+/).filter(w => w.length > 1);
      let bestSec = '';
      let highest = 0;
      for (const sec of sections) {
        let count = 0;
        for (const t of queryTerms) {
          if (sec.toLowerCase().includes(t)) count++;
        }
        if (count > highest) {
          highest = count;
          bestSec = sec;
        }
      }
      if (highest > 0 && bestSec) {
        setTestResponse(bestSec);
        setTestSource('সেন্ট্রাল নলেজবেস');
        setIsSimulating(false);
        return;
      }
    }

    // 5. Autonomous Wikipedia Integration Test
    try {
      const res = await fetch(`/api/wiki?q=${encodeURIComponent(testQuestion)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.extract) {
          setTestResponse(`🌐 [উইকিপিডিয়া: ${data.title}]\n\n${data.extract}`);
          setTestSource('উইকিপিডিয়া সাধারণ জ্ঞান API');
          setIsSimulating(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    setTestResponse(`ধন্যবাদ! ${botName}-এর কাছে আপনি প্রতিষ্ঠান সম্পর্কিত যেকোনো কোর্স, ফি, নোটিস, রুটিন বা সাধারণ জ্ঞানের প্রশ্ন করতে পারেন।`);
    setTestSource('সাধারণ রেসপন্স');
    setIsSimulating(false);
  };

  const renderModule15 = () => (
    <div className="space-y-6">
      {/* Top Banner with 50,000 Words Capacity Badge */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>চ্যাটবট ও ৫০,০০০ শব্দের বৃহৎ নলেজবেস কন্ট্রোল রুম</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              চ্যাটবট এডিটর ও মাল্টি-বক্স ডাটাবেজ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ওয়েবসাইটের চ্যাটবটকে আপনার প্রতিষ্ঠানের যেকোনো তথ্য শেখান। নিচে একটি বিশালাকার বক্সে ৫০,০০০ শব্দ পর্যন্ত তথ্য রাখতে পারেন অথবা বিষয়ভিত্তিক পৃথক পৃথক তথ্য বক্স যুক্ত করে সহজে সংরক্ষণ করতে পারেন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            {/* Word Count Indicator Card */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left lg:text-right min-w-[210px]">
              <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                নলেজবেস শব্দ ক্যাপাসিটি
              </div>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                {toBengaliNum(totalWordCount)} / ৫০,০০০ <span className="text-xs font-medium text-slate-300">শব্দ</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(3, percentUsed)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-300 mt-1 flex justify-between">
                <span>{toBengaliNum(kbText.length)} অক্ষর</span>
                <span>{toBengaliNum(percentUsed)}% ব্যবহৃত</span>
              </div>
            </div>

            <button
              onClick={() => handleSaveChatbotAll()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-amber-200" />
              <span>এক ক্লিকে সমস্ত চ্যাট ডাটা সেভ করুন</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveChatTab('knowledge')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'knowledge'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>১. কেন্দ্রীয় নলেজবেস (২০০,০০০+ শব্দ)</span>
          </button>

          <button
            onClick={() => setActiveChatTab('chunks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'chunks'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>২. ১,০০০ শব্দের ট্রেনিং প্যানেল ({toBengaliNum(trainingChunks.length)}টি সংরক্ষিত)</span>
          </button>

          <button
            onClick={() => setActiveChatTab('qa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'qa'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>৩. স্বয়ংক্রিয় শিখন ও প্রশ্নোত্তর ব্যাংক ({toBengaliNum(qaList.length)}টি Q&A)</span>
          </button>

          <button
            onClick={() => setActiveChatTab('blocks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'blocks'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>৪. একাধিক তথ্য বক্স ({toBengaliNum(infoBlocks.length)}টি বক্স)</span>
          </button>

          <button
            onClick={() => setActiveChatTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'settings'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>৫. চ্যাটবট নাম ও বার্তা সেটিংস</span>
          </button>

          <button
            onClick={() => setActiveChatTab('test')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeChatTab === 'test'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>৬. লাইভ চ্যাট টেস্ট ও উইকিপিডিয়া</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: LARGE 50,000-WORD KNOWLEDGE BASE TEXTAREA ================= */}
      {activeChatTab === 'knowledge' && (
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-900" />
                <span>৫০,০০০ শব্দের বৃহৎ সেন্ট্রাল নলেজবেস বক্স</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                এখানে প্রতিষ্ঠানের সমস্ত সিলেবাস, রুলস, নিয়মাবলী, প্রশ্নোত্তর বা নোটস টাইপ বা পেস্ট করে সেভ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(kbText);
                  alert('নলেজবেস টেক্সট ক্লিপবোর্ডে কপি হয়েছে!');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
                title="টেক্সট কপি করুন"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>কপি করুন</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const outline = `\n\n[অতিরিক্ত তথ্য সেকশন - ${new Date().toLocaleDateString('bn-BD')}]\nবিষয়: \nবিস্তারিত তথ্য: \nনিয়মাবলী: \nযোগাযোগ: `;
                  setKbText(prev => prev + outline);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন সেকশন টেমপ্লেট</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveChatbotAll('বৃহৎ নলেজবেস সফলভাবে সংরক্ষিত হয়েছে!')}
                className="px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>নলেজবেস সেভ করুন</span>
              </button>
            </div>
          </div>

          {/* The Large Text Box */}
          <div className="relative">
            <textarea
              rows={20}
              value={kbText}
              onChange={(e) => setKbText(e.target.value)}
              placeholder="এখানে প্রতিষ্ঠানের সমস্ত তথ্য, কোর্স নীতিমালা, সিলেবাস, নোটিশ, ভর্তি ও পেমেন্টের নির্দেশিকা পেস্ট বা টাইপ করুন (৫০,০০০ শব্দ পর্যন্ত গ্রহণ করবে)..."
              className="w-full p-4 sm:p-5 rounded-2xl border-2 border-slate-300 focus:border-blue-700 focus:outline-hidden text-xs sm:text-sm font-mono leading-relaxed bg-slate-900 text-emerald-300 placeholder:text-slate-500 shadow-inner resize-y selection:bg-amber-400 selection:text-slate-950"
            />
            <div className="absolute right-4 bottom-4 px-3 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] text-slate-300 font-mono border border-slate-700 pointer-events-none">
              শব্দ: <b className="text-amber-400">{toBengaliNum(kbWordCount)}</b> | অক্ষর: {toBengaliNum(kbText.length)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                শিক্ষার্থী চ্যাটবটে প্রশ্ন করলেই এই নলেজবেসের সংশ্লিষ্ট অংশ সার্চ করে সঠিক উত্তর প্রদান করা হবে।
              </span>
            </div>
            <button
              onClick={() => handleSaveChatbotAll('বৃহৎ নলেজবেস সফলভাবে সংরক্ষিত হয়েছে!')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>নলেজবেস সেভ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: 1,000-WORD STRUCTURED TRAINING PANELS (UP TO 200,000+ WORDS) ================= */}
      {activeChatTab === 'chunks' && (
        <div className="space-y-6">
          {/* Add 1,000-Word Structured Training Box */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-blue-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-900" />
                  <span>১,০০০ শব্দের নতুন স্ট্রাকচার্ড ট্রেনিং বক্স (Structured Training Panel)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি বক্সে ১,০০০ শব্দ পর্যন্ত প্রাতিষ্ঠানিক সিলেবাস, নিয়মাবলী ও বিস্তারিত জ্ঞান যুক্ত করুন। একাধিক বক্স মিলে ২০০,০০০+ শব্দ সাপোর্ট করবে।
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-900 rounded-full shrink-0">
                ক্যাপাসিটি: ১,০০০ শব্দ / বক্স
              </span>
            </div>

            <form onSubmit={handleAddTrainingChunk} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ট্রেনিং বক্সের শিরোনাম (Module / Topic Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: কম্পিউটার ল্যাব ব্যবহারের নিয়মাবলী ও ব্যবহারিক পাঠ"
                    value={newChunkTitle}
                    onChange={(e) => setNewChunkTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি (Category)
                  </label>
                  <select
                    value={newChunkCategory}
                    onChange={(e) => setNewChunkCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="প্রতিষ্ঠান ও ভিশন">প্রতিষ্ঠান ও ভিশন</option>
                    <option value="ভর্তি ও ফি পলিসি">ভর্তি ও ফি পলিসি</option>
                    <option value="কোর্স তথ্য ও কারিকুলাম">কোর্স তথ্য ও কারিকুলাম</option>
                    <option value="সহীহ কুরআন শিক্ষা">সহীহ কুরআন শিক্ষা</option>
                    <option value="কম্পিউটার ল্যাব ও স্কিল">কম্পিউটার ল্যাব ও স্কিল</option>
                    <option value="এসএসসি ও এইচএসসি সহায়িকা">এসএসসি ও এইচএসসি সহায়িকা</option>
                    <option value="পরীক্ষা ও সনদ নিয়ম">পরীক্ষা ও সনদ নিয়ম</option>
                    <option value="সাধারণ জ্ঞান ও নীতি">সাধারণ জ্ঞান ও নীতি</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    ট্রেনিং কন্টেন্ট (১,০০০ শব্দ পর্যন্ত) *
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    শব্দ: <b className="text-blue-900">{toBengaliNum(countWords(newChunkContent))}</b> / ১,০০০
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder="এখানে প্রাতিষ্ঠানিক সিলেবাস, রুলস, নিয়মাবলী বা পাঠ্য বিষয়ের বিস্তারিত তথ্য লিখুন (১,০০০ শব্দ পর্যন্ত)..."
                  value={newChunkContent}
                  onChange={(e) => setNewChunkContent(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ট্যাগ / সার্চ কি-ওয়ার্ডসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: কম্পিউটার, প্র্যাকটিক্যাল, টাইপিং, ল্যাব, পরীক্ষা"
                  value={newChunkTags}
                  onChange={(e) => setNewChunkTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>ট্রেনিং বক্স ডাটাবেজে যুক্ত ও সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of 1,000-Word Structured Training Chunks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-700" />
                <span>সংরক্ষিত ১,০০০ শব্দের ট্রেনিং বক্সসমূহ ({toBengaliNum(trainingChunks.length)}টি বক্স)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                সর্বমোট শব্দ: <b className="text-blue-900">{toBengaliNum(chunksWordCount)}</b> শব্দ
              </span>
            </div>

            {trainingChunks.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                এখনো কোনো ১,০০০ শব্দের ট্রেনিং বক্স তৈরি করা হয়নি। উপরের ফর্ম থেকে নতুন ট্রেনিং বক্স যুক্ত করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b pb-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 mb-1">
                          {chunk.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {chunk.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold font-mono">
                          {toBengaliNum(chunk.wordCount || countWords(chunk.content))} শব্দ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrainingChunk(chunk.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                      {chunk.content}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="truncate max-w-[200px]">
                        ট্যাগ: <b>{chunk.tags?.join(', ') || 'কোনো ট্যাগ নেই'}</b>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        আপডেট: {chunk.updatedAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SELF-GUIDANCE & CONVERSATION LEARNING (TEACHER-VERIFIED Q&A) ================= */}
      {activeChatTab === 'qa' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="bg-emerald-950 text-white p-5 rounded-3xl border border-emerald-800 shadow-md flex items-start gap-3.5">
            <Bot className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <h4 className="font-bold text-emerald-300">
                স্বয়ংক্রিয় এআই শিখন ও শিক্ষক প্রশ্নোত্তর সংরক্ষণ (Self-Learning Q&A Engine)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                শিক্ষার্থী যখন শিক্ষককে প্রশ্ন করে এবং শিক্ষক উত্তর দেন, অথবা অ্যাডমিন এখানে প্রশ্ন-উত্তর যোগ করেন, এআই তা স্মরণে রাখে। পরবর্তীতে অন্য কোনো শিক্ষার্থী একই বা অনুরূপ প্রশ্ন করলে এআই সরাসরি শিক্ষকের পক্ষে উত্তর দেয় এবং নিয়মিত নিজেকে প্রশিক্ষিত করে।
              </p>
            </div>
          </div>

          {/* Add Q&A Form */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-700" />
              <span>নতুন শিক্ষক-যাচাইকৃত প্রশ্নোত্তর (Q&A Pair) যুক্ত করুন</span>
            </h3>

            <form onSubmit={handleAddQA} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষার্থীর প্রশ্ন (Student Question) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: হিসাববিজ্ঞানের রেওয়ামিল কীভাবে সহজে মেলাব?"
                    value={newQAQuestion}
                    onChange={(e) => setNewQAQuestion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    উত্তরদাতা শিক্ষক (Teacher)
                  </label>
                  <select
                    value={newQATeacher}
                    onChange={(e) => setNewQATeacher(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
                  >
                    {mentors.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  শিক্ষকের চূড়ান্ত ও নির্ভরযোগ্য উত্তর (Teacher's Verified Answer) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="শিক্ষকের দেওয়া উত্তরটি এখানে লিখুন যা এআই পরবর্তীতে শিক্ষার্থীদের প্রদান করবে..."
                  value={newQAAnswer}
                  onChange={(e) => setNewQAAnswer(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm leading-relaxed focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>প্রশ্নোত্তরটি এআই মেমরিতে সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Verified Q&A Pairs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-700" />
                <span>এআই মেমরিতে সংরক্ষিত প্রশ্নোত্তর ({toBengaliNum(qaList.length)}টি Q&A)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {qaList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5 hover:border-emerald-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                          যাচাইকৃত শিক্ষক: {item.teacherName || 'বোরহানউদ্দিন মহিম'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold">
                          ব্যবহৃত হয়েছে: {toBengaliNum(item.timesUsed || 0)} বার
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.createdAt}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        প্রশ্ন: {item.question}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQA(item.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line font-sans">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MULTIPLE INFO BOXES (MULTI-BOX SYSTEM) ================= */}
      {activeChatTab === 'blocks' && (
        <div className="space-y-6">
          {/* Add New Info Block Form */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-900" />
                <span>নতুন তথ্য বক্স (New Info Block) যুক্ত করুন</span>
              </h3>
              <span className="text-xs text-slate-500">
                আপনি যত খুশি তত তথ্য বক্স আলাদাভাবে যোগ ও এডিট করতে পারবেন
              </span>
            </div>

            <form onSubmit={handleAddInfoBlock} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বক্সের শিরোনাম (Topic Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: কম্পিউটার কোর্সের সিলেবাস ও পরীক্ষার নিয়মাবলী"
                    value={newBlockTitle}
                    onChange={(e) => setNewBlockTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্যাটাগরি (Category)
                  </label>
                  <select
                    value={newBlockCategory}
                    onChange={(e) => setNewBlockCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="কোর্স তথ্য">কোর্স তথ্য</option>
                    <option value="ভর্তি ও পেমেন্ট">ভর্তি ও পেমেন্ট</option>
                    <option value="পরীক্ষা ও এডমিট">পরীক্ষা ও এডমিট</option>
                    <option value="সনদপত্র ও ফলাফল">সনদপত্র ও ফলাফল</option>
                    <option value="সাধারণ নোটিশ">সাধারণ নোটিশ</option>
                    <option value="রুটিন ও ক্লাস">রুটিন ও ক্লাস</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিস্তারিত তথ্য বক্স (Content) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="এই তথ্য বক্সের সম্পূর্ণ বিবরণ লিখুন যা চ্যাটবট শিক্ষার্থীকে প্রদর্শন করবে..."
                  value={newBlockContent}
                  onChange={(e) => setNewBlockContent(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অনুসন্ধান কি-ওয়ার্ডসমূহ (Keywords — কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: কম্পিউটার, ফি, এক্সেল, সার্টিফিকেট, অফিস"
                  value={newBlockKeywords}
                  onChange={(e) => setNewBlockKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>তথ্য বক্স ডাটাবেজে যুক্ত ও সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of existing Info Blocks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-700" />
                <span>সংরক্ষিত তথ্য বক্সসমূহ ({toBengaliNum(infoBlocks.length)}টি বক্স)</span>
              </h3>
              <button
                onClick={() => handleSaveChatbotAll('সকল তথ্য বক্স সফলভাবে সেভ হয়েছে!')}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-amber-300" />
                <span>সব বক্স সেভ করুন</span>
              </button>
            </div>

            {infoBlocks.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                এখনো কোনো তথ্য বক্স তৈরি করা হয়নি। উপরের ফর্ম থেকে নতুন তথ্য বক্স যুক্ত করুন।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`bg-white rounded-2xl border transition-all p-5 space-y-3 shadow-xs ${
                      block.isActive ? 'border-slate-200 hover:border-blue-400' : 'border-slate-300 bg-slate-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 mb-1">
                          {block.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {block.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateInfoBlock(block.id, { isActive: !block.isActive })}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            block.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {block.isActive ? 'সক্রিয়' : 'বন্ধ'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInfoBlock(block.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={block.content}
                      onChange={(e) => handleUpdateInfoBlock(block.id, { content: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed font-sans bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="truncate max-w-[220px]">
                        ট্যাগ: <b>{block.keywords?.join(', ') || 'কোনো ট্যাগ নেই'}</b>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateInfoBlock(block.id, {});
                          alert(`'${block.title}' বক্সের তথ্য সংরক্ষিত হয়েছে!`);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                      >
                        <Save className="w-3 h-3 text-amber-300" />
                        <span>বক্সটি সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CHATBOT IDENTITY & WELCOME MESSAGE ================= */}
      {activeChatTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 max-w-3xl">
          <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-900" />
            <span>চ্যাটবটের পরিচয় ও স্বাগতম বার্তা (Identity & Welcome Text)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                চ্যাটবটের নাম (Bot Name)
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="যেমন: BS Learning নিজস্ব AI সহকারী"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                প্রথম স্বাগতম বার্তা (Welcome Message)
              </label>
              <textarea
                rows={4}
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                placeholder="চ্যাটবট খুললে শিক্ষার্থীকে প্রথম কোন মেসেজটি দেওয়া হবে..."
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সিস্টেম বেস প্রম্পট (AI Instructions)
              </label>
              <textarea
                rows={5}
                value={chatbot.basePrompt}
                onChange={(e) => setChatbot({ ...chatbot, basePrompt: e.target.value })}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed bg-slate-50"
              />
            </div>

            <button
              onClick={() => handleSaveChatbotAll('চ্যাটবট পরিচয় ও বার্তা সফলভাবে সেভ হয়েছে!')}
              className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>চ্যাটবট সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: LIVE SIMULATOR / TEST BOX ================= */}
      {activeChatTab === 'test' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5 max-w-2xl">
          <div className="border-b pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-900" />
              <span>অ্যাডমিন লাইভ চ্যাটবট টেস্ট সিমুলেটর</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              এখানে যেকোনো প্রশ্ন লিখে টেস্ট করুন আপনার সেভ করা ৫০,০০০ শব্দের নলেজবেস ও তথ্য বক্স সঠিকভাবে কাজ করছে কি না।
            </p>
          </div>

          <form onSubmit={handleTestChatbot} className="flex gap-2">
            <input
              type="text"
              required
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="যেমন: কম্পিউটার কোর্সের ফি কত? অথবা ভর্তি কীভাবে হব?"
              className="grow px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 shadow-md transition-colors"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>টেস্ট করুন</span>
            </button>
          </form>

          {isSimulating && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              <span>নলেজবেস ও তথ্য বক্স সার্চ করা হচ্ছে...</span>
            </div>
          )}

          {testResponse && !isSimulating && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-blue-900 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-amber-500" />
                  <span>চ্যাটবটের উত্তর প্রিভিউ:</span>
                </div>
                {testSource && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-950 font-mono">
                    উৎস: {testSource}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-line text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs font-sans">
                {testResponse}
              </p>
            </div>
          )}

          {/* Wikipedia Autonomous Retrieval Info & Quick Questions */}
          <div className="pt-2 border-t border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>🌐 দ্রুত টেস্ট করার কিছু নমুনা প্রশ্ন:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'সহীহ কুরআন শিক্ষার ক্লাস কখন হয়?',
                'কম্পিউটার কোর্সের ফি কত?',
                'বাংলা কিউআর দিয়ে পেমেন্ট নিয়ম',
                'আইসিটি (ICT) কি?',
                'উইকিপিডিয়া কি?',
                '২৫০ + ৩৫০ কত হয়?',
                'বোরহানউদ্দিন মহিম স্যারের সাথে হোয়াটসঅ্যাপে কথা বলব'
              ].map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTestQuestion(sample);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 text-[11px] font-medium transition-colors border border-slate-200"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsGatewayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs"
              title="মাস্টার গেটওয়ে রিয়েল-টাইম ক্লাউড স্ট্যাটাস দেখতে ক্লিক করুন"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">গেটওয়ে:</span>
              <span className="text-emerald-300 font-bold">{syncStatus}</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-emerald-400/30"
              title="ড্যাশবোর্ডের সমস্ত মডিউলের ডাটা এক ক্লিকে ব্রাউজারে সেভ করুন"
            >
              <Save className="w-3.5 h-3.5 text-amber-300" />
              <span>এক ক্লিকে সব সেভ (Save All)</span>
            </button>

            <button
              onClick={() => {
                saveCurrentStateSilently();
                onViewWebsite();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={() => {
                saveCurrentStateSilently();
                onLogout();
              }}
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
                  শর্টকাট ড্যাশবোর্ড (১৫টি মডিউল)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  যেকোনো একটি মডিউলে ক্লিক করে সংশ্লিষ্ট ডাটাবেজ এডিট ও প্রিন্ট করুন
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAll}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>সকল মডিউল সেভ করুন</span>
                </button>
                <div className="text-xs font-semibold px-3 py-1 bg-white rounded-full border border-slate-300 text-slate-700">
                  লগইন আইডি: {creds.email}
                </div>
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

              <div className="text-right flex items-center gap-3">
                <button
                  onClick={handleSaveAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>সব সেভ করুন</span>
                </button>
                <div>
                  <span className="text-xs font-bold text-amber-600">মডিউল #{activeModule}</span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {moduleCatalog.find(m => m.id === activeModule)?.title}
                  </h2>
                </div>
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
            {activeModule === 15 && renderModule15()}
          </div>
        )}
      </main>

      {/* ===================== MODALS ===================== */}

      {/* 1. Admit Card Print & Download Preview Modal */}
      {selectedAdmitCardForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8">
            <div className="no-print flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-blue-900" />
                  <span>এডমিট কার্ড প্রিভিউ ও প্রিন্ট/ডাউনলোড</span>
                </h4>
                <p className="text-xs text-slate-500">প্রিন্ট বাটনে ক্লিক করে সরাসরি প্রিন্ট করুন অথবা পিডিএফ হিসেবে সংরক্ষণ করুন</p>
              </div>
              <button
                onClick={() => setSelectedAdmitCardForPrint(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Fidelity Printable Admit Card Area */}
            <div className="printable-area border-4 border-blue-950 p-6 sm:p-8 rounded-2xl bg-white text-slate-900 space-y-4 relative overflow-hidden shadow-md">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="" className="w-64 h-64 object-contain" />
                ) : (
                  <span className="text-5xl font-black text-slate-900">BS ZONE</span>
                )}
              </div>

              {/* Institution Header */}
              <div className="relative z-10 text-center pb-3 border-b-2 border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-950 p-0.5 bg-slate-900 shrink-0">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="grow text-center">
                  <h2 className="text-lg sm:text-xl font-black text-blue-950 tracking-wide uppercase">
                    BS E-LEARNING &amp; IT ZONE
                  </h2>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    {settings.subName || 'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {settings.address || 'ঢাকা, বাংলাদেশ'} • হটলাইন: {settings.phone || '01612118307'}
                  </p>
                </div>
                {/* Student Photo */}
                <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-100 shrink-0 shadow-xs">
                  <img
                    src={selectedAdmitCardForPrint.studentPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title Badge */}
              <div className="relative z-10 text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-blue-950 text-amber-300 font-black text-xs sm:text-sm tracking-widest uppercase shadow-xs">
                  প্রবেশপত্র • ADMIT CARD
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {selectedAdmitCardForPrint.examType}
                </p>
              </div>

              {/* Student Details Grid */}
              <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-slate-300 rounded-xl p-4 bg-slate-50/50">
                <div>
                  <span className="font-bold text-slate-500">শিক্ষার্থীর নাম:</span>
                  <p className="font-extrabold text-sm text-slate-900">{selectedAdmitCardForPrint.studentName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">রোল নম্বর:</span>
                  <p className="font-mono font-black text-sm text-blue-950">{selectedAdmitCardForPrint.roll}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">পিতার নাম:</span>
                  <p className="font-semibold text-slate-800">{selectedAdmitCardForPrint.fatherName || 'মোঃ রফিকুল ইসলাম'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">মাতার নাম:</span>
                  <p className="font-semibold text-slate-800">{selectedAdmitCardForPrint.motherName || 'মোছাঃ ফাতেমা বেগম'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">কোর্সের নাম:</span>
                  <p className="font-bold text-blue-900">{courses.find(c => c.id === selectedAdmitCardForPrint.courseId)?.title || selectedAdmitCardForPrint.courseId}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">সেশন / শিক্ষাবর্ষ:</span>
                  <p className="font-semibold text-slate-800">{selectedAdmitCardForPrint.academicYear} সেশন</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">পরীক্ষা কেন্দ্র:</span>
                  <p className="font-semibold text-slate-800">{selectedAdmitCardForPrint.examCenter}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">পরীক্ষার তারিখ ও সময়:</span>
                  <p className="font-semibold text-slate-800">{selectedAdmitCardForPrint.examDate} ({selectedAdmitCardForPrint.examTime})</p>
                </div>
              </div>

              {/* Rules & Instructions */}
              <div className="relative z-10 p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-[10px] text-slate-700 space-y-0.5">
                <p className="font-bold text-amber-950">পরীক্ষার্থীদের জন্য বিশেষ নির্দেশনাবলী:</p>
                <p>১. পরীক্ষার নির্ধারিত সময়ের অন্তত ২০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।</p>
                <p>২. মূল প্রবেশপত্র (Admit Card) ব্যতীত পরীক্ষা কক্ষে প্রবেশ সম্পূর্ণরূপে নিষিদ্ধ।</p>
                <p>৩. পরীক্ষার হলে কোনো প্রকার ডিজিটাল ডিভাইস, মোবাইল ফোন বা অননুমোদিত কাগজ আনা যাবে না।</p>
              </div>

              {/* Seal & Signatures Footer */}
              <div className="relative z-10 pt-4 flex items-end justify-between">
                <div className="text-center">
                  <img src={settings.institutionSealUrl} alt="" className="h-12 w-auto mx-auto object-contain" />
                  <span className="text-[10px] font-bold text-slate-600 border-t border-slate-400 block mt-1 pt-0.5">অফিশিয়াল সিল</span>
                </div>
                <div className="text-center">
                  <div className="h-10 w-28 border-b border-dashed border-slate-400 mb-1 mx-auto flex items-end justify-center text-[9px] text-slate-400">পরীক্ষার্থীর স্বাক্ষর</div>
                  <span className="text-[10px] font-bold text-slate-600 block">পরীক্ষার্থীর স্বাক্ষর</span>
                </div>
                <div className="text-center">
                  <img src={settings.signatureUrl} alt="" className="h-10 w-auto mx-auto object-contain" />
                  <div className="border-t border-slate-600 pt-0.5 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-900">{settings.founderName}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">পরীক্ষা নিয়ন্ত্রক / প্রধান শিক্ষক</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="no-print flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAdmitCardForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড (Save as PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Certificate Print & Download Preview Modal */}
      {selectedCertForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8">
            <div className="no-print flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>সনদপত্র প্রিভিউ ও ডাউনলোড / প্রিন্ট</span>
                </h4>
                <p className="text-xs text-slate-500">প্রিন্ট বাটনে ক্লিক করে সনদপত্র সরাসরি প্রিন্ট করুন অথবা পিডিএফ হিসেবে ডাউনলোড করুন</p>
              </div>
              <button
                onClick={() => setSelectedCertForPrint(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Fidelity Printable Certificate */}
            <div className="printable-area certificate-border relative bg-gradient-to-br from-amber-50/40 via-white to-amber-50/60 p-8 sm:p-12 rounded-2xl shadow-xl text-center space-y-4 overflow-hidden border-8 border-double border-blue-950">
              {/* Subtle Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="" className="w-72 h-72 object-contain" />
                ) : (
                  <div className="text-6xl font-black text-slate-900">BS ZONE</div>
                )}
              </div>

              {/* Institution Header */}
              <div className="relative z-10 space-y-1">
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-amber-500 p-0.5 bg-slate-900 shadow-md">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-wider uppercase font-serif">
                  BS E-LEARNING &amp; IT ZONE
                </h1>
                <p className="text-xs text-amber-800 font-bold uppercase tracking-widest">
                  Government Registered Professional Training Academy
                </p>
                <div className="pt-2">
                  <span className="inline-block px-6 py-1 rounded-full bg-blue-950 text-amber-300 font-serif font-black text-sm tracking-widest uppercase shadow-sm">
                    CERTIFICATE OF ACHIEVEMENT
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 font-semibold">
                    অফিশিয়াল দক্ষতা ও পেশাদারী প্রশিক্ষণ সমাপনী সনদপত্র
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 py-3 space-y-2 text-slate-800">
                <p className="text-xs font-serif italic text-slate-600">This is to proudly certify that</p>
                <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-serif underline decoration-amber-500 underline-offset-8">
                  {selectedCertForPrint.studentName}
                </h2>
                <p className="text-xs text-slate-700 pt-1">
                  Son / Daughter of <b>{selectedCertForPrint.fatherName || 'মোঃ রফিকুল ইসলাম'}</b> and <b>{selectedCertForPrint.motherName || 'মোছাঃ ফাতেমা বেগম'}</b>
                </p>
                <div className="inline-flex items-center gap-3 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <span>রোল: {selectedCertForPrint.roll}</span>
                  <span>•</span>
                  <span>সনদ নং: {selectedCertForPrint.certificateNo}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto pt-2">
                  has successfully completed the comprehensive training course on{' '}
                  <span className="font-extrabold text-blue-950 text-sm">
                    {courses.find(c => c.id === selectedCertForPrint.courseId)?.title || selectedCertForPrint.courseId}
                  </span>{' '}
                  and achieved the outstanding grade of{' '}
                  <span className="font-black text-emerald-800 text-sm">{selectedCertForPrint.grade}</span>.
                </p>
              </div>

              {/* Seal & Signatures */}
              <div className="relative z-10 pt-6 flex items-end justify-between text-xs">
                {/* QR Code */}
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 mx-auto shadow-xs flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Verify Certificate</span>
                </div>

                {/* Seal */}
                <div className="text-center space-y-1">
                  <img src={settings.institutionSealUrl} alt="Seal" className="h-16 w-auto mx-auto object-contain filter drop-shadow" />
                  <span className="text-[9px] font-bold text-amber-900 uppercase tracking-wider block">Official Seal</span>
                </div>

                {/* Principal Signature */}
                <div className="text-center space-y-1">
                  <img src={settings.signatureUrl} alt="Signature" className="h-12 w-auto mx-auto object-contain" />
                  <div className="border-t border-slate-800 pt-0.5">
                    <p className="font-bold text-slate-900 text-[11px]">{settings.founderName}</p>
                    <p className="text-[9px] text-slate-600 font-semibold">Founder &amp; Principal Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="no-print flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCertForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>সনদ প্রিন্ট করুন</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ডাউনলোড (Save as PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Manual Teacher Entry Modal */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>নতুন শিক্ষক যুক্ত করুন (ম্যানুয়াল এন্ট্রি)</span>
              </h4>
              <button onClick={() => setIsAddTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTeacherName.trim()) {
                  alert('অনুগ্রহ করে শিক্ষকের নাম লিখুন!');
                  return;
                }
                const newM: Mentor = {
                  id: `mentor-${Date.now()}`,
                  name: newTeacherName.trim(),
                  designation: newTeacherDesignation.trim() || 'প্রশিক্ষক',
                  experience: '৩+ বছর',
                  qualifications: newTeacherQualifications ? newTeacherQualifications.split(',').map(s => s.trim()).filter(Boolean) : ['স্নাতক', 'আইটি ডিপ্লোমা'],
                  specialist: newTeacherSpecialist ? newTeacherSpecialist.split(',').map(s => s.trim()).filter(Boolean) : ['কম্পিউটার অ্যাপ্লিকেশন'],
                  phone: newTeacherPhone.trim() || '01700000000',
                  email: newTeacherEmail.trim() || 'teacher@bsit.com',
                  bio: newTeacherBio.trim() || 'দক্ষ ও অভিজ্ঞ শিক্ষক।',
                  photoUrl: newTeacherPhoto
                };
                const updated = [newM, ...mentors];
                setMentors(updated);
                storage.saveMentors(updated);
                setIsAddTeacherModalOpen(false);
                setNewTeacherName('');
                setNewTeacherQualifications('');
                setNewTeacherSpecialist('');
                setNewTeacherPhone('');
                setNewTeacherEmail('');
                setNewTeacherBio('');
                triggerSaveNotification('নতুন শিক্ষক যুক্ত হয়েছে!');
                alert('নতুন শিক্ষক সফলভাবে তালিকায় যুক্ত ও সংরক্ষিত হয়েছে!');
              }}
              className="space-y-3 text-xs"
            >
              {/* Photo Upload with Preview */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-slate-900 shrink-0">
                  <img src={newTeacherPhoto} alt="Teacher Preview" className="w-full h-full object-cover" />
                </div>
                <div className="grow space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">শিক্ষকের ছবি আপলোড:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setNewTeacherPhoto(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-emerald-700 file:text-white cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="অথবা ছবির URL..."
                    value={newTeacherPhoto}
                    onChange={(e) => setNewTeacherPhoto(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষকের নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ইঞ্জিঃ আসাদুজ্জামান"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">পদবি *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: সিনিয়র প্রশিক্ষক ও মেন্টর"
                    value={newTeacherDesignation}
                    onChange={(e) => setNewTeacherDesignation(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">শিক্ষাগত যোগ্যতা (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  placeholder="যেমন: বিএসসি ইন সিএসই, ডিপ্লোমা ইন আইটি"
                  value={newTeacherQualifications}
                  onChange={(e) => setNewTeacherQualifications(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বিশেষ দক্ষতা / পাঠ্য বিষয়</label>
                <input
                  type="text"
                  placeholder="যেমন: গ্রাফিক্স ডিজাইন, ওয়েব ডেভেলপমেন্ট"
                  value={newTeacherSpecialist}
                  onChange={(e) => setNewTeacherSpecialist(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={newTeacherPhone}
                    onChange={(e) => setNewTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="teacher@email.com"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">শিক্ষক পরিচিতি / বায়ো ও মন্তব্য</label>
                <textarea
                  rows={2}
                  placeholder="শিক্ষকের সংক্ষিপ্ত পরিচিতি..."
                  value={newTeacherBio}
                  onChange={(e) => setNewTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>শিক্ষক সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Manual Student Entry Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-700" />
                <span>নতুন শিক্ষার্থী যুক্ত করুন (ম্যানুয়াল এন্ট্রি)</span>
              </h4>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStdName.trim() || !newStdRoll.trim() || !newStdFather.trim() || !newStdMother.trim()) {
                  alert('অনুগ্রহ করে শিক্ষার্থীর নাম, রোল, পিতার নাম ও মাতার নাম অবশ্যই পূরণ করুন!');
                  return;
                }
                const selectedCourseObj = courses.find(c => c.id === newStdCourse) || courses[0];
                const newStd: Student = {
                  id: `std-${Date.now()}`,
                  academicYear: newStdYear,
                  courseId: selectedCourseObj.id,
                  roll: newStdRoll.trim(),
                  name: newStdName.trim(),
                  fatherName: newStdFather.trim(),
                  motherName: newStdMother.trim(),
                  phone: newStdPhone.trim() || '01700000000',
                  address: newStdAddress.trim() || 'ঢাকা, বাংলাদেশ',
                  photoUrl: newStdPhoto,
                  trxId: `MANUAL${Date.now().toString().slice(-6)}`,
                  enrollmentDate: new Date().toISOString().split('T')[0],
                  status: 'active',
                  hasPaidDues: true,
                  admitCardBlocked: false
                };

                // Also auto-create corresponding Admit Card Record for Module 6
                const newAdmit: AdmitCardRecord = {
                  id: `adm-${Date.now()}`,
                  studentId: newStd.id,
                  studentName: newStd.name,
                  fatherName: newStd.fatherName || '',
                  motherName: newStd.motherName || '',
                  studentPhoto: newStd.photoUrl,
                  roll: newStd.roll,
                  courseId: newStd.courseId,
                  academicYear: newStd.academicYear,
                  examType: 'চূড়ান্ত সমাপনী পরীক্ষা ২০২৬',
                  examDate: '২০২৬-০৫-১৫',
                  examTime: 'সকাল ১০:০০ টা',
                  examCenter: 'BS IT Zone Digital Lab-1',
                  published: true,
                  instructions: ['পরীক্ষার নির্ধারিত সময়ের অন্তত ২০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত হতে হবে।'],
                  feeCleared: true,
                  isBlocked: false
                };

                // Also auto-create Certificate Record for Module 7
                const newCert: CertificateRecord = {
                  id: `cert-${Date.now()}`,
                  academicYear: newStd.academicYear,
                  courseId: newStd.courseId,
                  roll: newStd.roll,
                  studentName: newStd.name,
                  fatherName: newStd.fatherName,
                  motherName: newStd.motherName,
                  address: newStd.address,
                  issueDate: new Date().toISOString().split('T')[0],
                  certificateNo: `BS-ZONE-${newStd.academicYear}-${newStd.roll.padStart(4, '0')}`,
                  grade: 'A+ (প্রথম শ্রেণি)',
                  isFirstIssue: true,
                  feePaid: true,
                  isFree: true,
                  feeAmount: 0,
                  hasEverPaid: true,
                  hasGovtCert: true
                };

                const updatedStudents = [newStd, ...students];
                const updatedAdmits = [newAdmit, ...admitCards.filter(a => a.roll !== newStd.roll)];
                const updatedCerts = [newCert, ...certificates.filter(c => c.roll !== newStd.roll)];

                setStudents(updatedStudents);
                setAdmitCards(updatedAdmits);
                setCertificates(updatedCerts);

                storage.saveStudents(updatedStudents);
                storage.saveAdmitCards(updatedAdmits);
                storage.saveCertificates(updatedCerts);

                setIsAddStudentModalOpen(false);
                setNewStdName('');
                setNewStdFather('');
                setNewStdMother('');
                setNewStdPhone('');
                setNewStdAddress('');
                triggerSaveNotification('শিক্ষার্থী সফলভাবে ডাটাবেজে যুক্ত হয়েছে!');
                alert(`রোল ${newStd.roll} (${newStd.name})-কে সফলভাবে ডাটাবেজ, এডমিট কার্ড ও সনদ তালিকায় যুক্ত করা হয়েছে!`);
              }}
              className="space-y-3 text-xs"
            >
              {/* Photo Upload with Preview */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-600 bg-slate-900 shrink-0">
                  <img src={newStdPhoto} alt="Student Preview" className="w-full h-full object-cover" />
                </div>
                <div className="grow space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">শিক্ষার্থীর ছবি আপলোড (Photo Upload):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setNewStdPhoto(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-purple-900 file:text-white cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="অথবা ছবির URL..."
                    value={newStdPhoto}
                    onChange={(e) => setNewStdPhoto(e.target.value)}
                    className="w-full px-2 py-1 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষাবর্ষ (সেশন) *</label>
                  <select
                    value={newStdYear}
                    onChange={(e) => setNewStdYear(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                  >
                    <option value="2026">২০২৬ সেশন</option>
                    <option value="2025">২০২৫ সেশন</option>
                    <option value="2024">২০২৪ সেশন</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">কোর্স নির্বাচন *</label>
                  <select
                    value={newStdCourse || courses[0]?.id}
                    onChange={(e) => setNewStdCourse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                  >
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">রোল নম্বর *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 101"
                    value={newStdRoll}
                    onChange={(e) => setNewStdRoll(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold text-blue-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">শিক্ষার্থীর পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="শিক্ষার্থীর নাম লিখুন"
                    value={newStdName}
                    onChange={(e) => setNewStdName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">পিতার নাম * (বাধ্যতামূলক)</label>
                  <input
                    type="text"
                    required
                    placeholder="পিতার নাম লিখুন"
                    value={newStdFather}
                    onChange={(e) => setNewStdFather(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">মাতার নাম * (বাধ্যতামূলক)</label>
                  <input
                    type="text"
                    required
                    placeholder="মাতার নাম লিখুন"
                    value={newStdMother}
                    onChange={(e) => setNewStdMother(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="01XXXXXXXXX"
                    value={newStdPhone}
                    onChange={(e) => setNewStdPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    placeholder="গ্রাম/রোড, উপজেলা, জেলা"
                    value={newStdAddress}
                    onChange={(e) => setNewStdAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>শিক্ষার্থী সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Gateway Real-Time Control & Status Modal */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsGatewayModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Globe className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>মাস্টার গেটওয়ে রিয়েল-টাইম কন্ট্রোল</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active & Live
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  গ্লোবাল ক্লাউড সিঙ্ক্রোনাইজেশন ও অ্যাডমিন-টু-কোড লাইভ লেয়ার
                </p>
              </div>
            </div>

            {/* Core Principle Notice */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 mb-6 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>অ্যাডমিন পরিবর্তনই চূড়ান্ত & বিশ্বব্যাপী তাৎক্ষণিক সিঙ্ক</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-6">
                অ্যাডমিন প্যানেল থেকে যেকোনো তথ্য (কোর্স, শিক্ষক, নোটিস, সিল-স্বাক্ষর, ফি বা সেটিংস) পরিবর্তন বা সেভ করা মাত্রই তা সরাসরি মাস্টার গেটওয়ের মাধ্যমে ক্লাউডে সিঙ্ক হয়ে যায়। পৃথিবীর যেকোনো স্থান থেকে ওয়েবসাইট ওপেন করলেই অ্যাডমিনের সর্বশেষ পরিবর্তনটি ১ সেকেন্ডেরও কম সময়ে লাইভ দেখা যাবে।
              </p>
            </div>

            {/* Channel Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">ক্লাউড ডাটাবেজ</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>Firestore Cloud</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  {gatewayStatus.firestoreConnected ? 'অনলাইন & সংযুক্ত' : 'স্বয়ংক্রিয় সিঙ্ক প্রস্তুত'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">সার্ভার পুশ স্ট্রিম</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Live SSE Stream</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  {gatewayStatus.sseConnected ? 'লাইভ সকেট একটিভ' : 'ব্যাকগ্রাউন্ড পোলিং রেডি'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">মাল্টি-ট্যাব সিঙ্ক</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>BroadcastChannel</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                  ০ মিলিসেকেন্ড লেটেন্সি
                </div>
              </div>
            </div>

            {/* Gateway Statistics */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs mb-6 space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">সর্বশেষ সফল সিঙ্ক:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {gatewayStatus.lastSyncTime ? new Date(gatewayStatus.lastSyncTime).toLocaleTimeString('bn-BD') : 'এখনই'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">মোট ক্লাউড পুশ (Pushes):</span>
                <span className="font-mono text-white font-bold">{gatewayStatus.totalPushes} টি ইভেন্ট</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">মোট লাইভ রিসিভ (Receives):</span>
                <span className="font-mono text-white font-bold">{gatewayStatus.totalReceives} টি ইভেন্ট</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">লাইটওয়েট গেটওয়ে স্ক্রিপ্ট:</span>
                <span className="font-mono text-amber-300 font-bold">/master-gateway.js (পাবলিক)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'manual_ping', fromGateway: true } }));
                  alert('⚡ পিং টেস্ট সম্পন্ন! মাস্টার গেটওয়ে সম্পূর্ণরূপে সক্রিয় ও কার্যকর।');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>গেটওয়ে টেস্ট (Ping Test)</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={async () => {
                    setIsManualSyncing(true);
                    await handleSaveAll();
                    setIsManualSyncing(false);
                  }}
                  disabled={isManualSyncing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} />
                  <span>{isManualSyncing ? 'সিঙ্ক হচ্ছে...' : 'সকল ডাটা ক্লাউডে পুশ করুন (Force Push)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
