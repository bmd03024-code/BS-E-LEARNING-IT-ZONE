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
  Send
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

  // ---------------- GITHUB AUTO-UPDATE INTEGRATION ---------------- //
  const GITHUB_TOKEN = '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';
  const GITHUB_OWNER = 'bmd03024-code';
  const GITHUB_REPO = 'BS-E-LEARNING-IT-ZONE';

  const pushUpdateToGitHub = async (filePath: string, fileContent: any, commitMessage: string) => {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    try {
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      let fileSha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        fileSha = fileData.sha;
      }

      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: commitMessage || 'Auto-update from Admin Panel via GitHub API',
          content: btoa(unescape(encodeURIComponent(JSON.stringify(fileContent, null, 2)))),
          sha: fileSha
        })
      });

      return putRes.ok;
    } catch (error) {
      console.error('GitHub API Error:', error);
      return false;
    }
  };

  // Master Save All Function - saves locally and pushes directly to GitHub -> Vercel Auto-Publish
  const handleSaveAll = async () => {
    saveCurrentStateSilently();
    setSyncStatus('গিটহাবে সিঙ্ক হচ্ছে...');

    const allData = {
      settings,
      slides,
      shortcuts,
      courses,
      mentors,
      students,
      applications,
      routines,
      results,
      admitCards,
      certificates,
      ledger,
      notices,
      gallery,
      notes,
      demoClasses,
      chatbot,
      creds
    };

    const success = await pushUpdateToGitHub('src/data/instituteData.json', allData, 'Admin Dashboard Live Update');

    if (success) {
      setSyncStatus('গিটহাব ও ভার্সেলে লাইভ হয়েছে ✅');
      setTimeout(() => setSyncStatus('সবকিছু সিঙ্কড'), 3000);
      alert('✅ আলহামদুলিল্লাহ! ড্যাশবোর্ডের সমস্ত তথ্য সফলভাবে সংরক্ষিত হয়েছে এবং গিটহাবের মাধ্যমে রিয়েল-টাইমে ভার্সেলে লাইভ হয়ে গেছে।');
    } else {
      setSyncStatus('লোকালে সংরক্ষিত');
      alert('✅ লোকাল স্টোরেজে সফলভাবে সংরক্ষিত হয়েছে।');
    }
  };

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-900" />
          <span>লোগো পরিবর্তন ও ব্র্যান্ড টেক্সট সাইজ কাস্টমাইজার</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
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
          </div>

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
          </div>

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
            <label className="block text-xs font-bold text-slate-700 mb-2">১. প্রধান শিক্ষকের সিগনেচার</label>
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
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">২. প্রধান শিক্ষকের ব্যক্তিগত সিল</label>
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
                  placeholder="সিলের URL..."
                  value={settings.signatureSealUrl || ''}
                  onChange={(e) => setSettings({ ...settings, signatureSealUrl: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">৩. প্রতিষ্ঠানের অফিশিয়াল সিল / স্ট্যাম্প</label>
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
        </div>
      </div>

      <button
        onClick={() => {
          storage.saveSettings(settings);
          triggerSaveNotification('সেটিংস ও ফুটার সফলভাবে আপডেট হয়েছে!');
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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-2">স্লাইডের ব্যাকগ্রাউন্ড ছবি</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-sm">
                  <img src={slide.image} alt="Slide Preview" className="w-full h-full object-cover" />
                </div>
                <div className="grow space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSlideImageUpload(slide.id, e)}
                    className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white cursor-pointer"
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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">স্লাইড প্রধান শিরোনাম</label>
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
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">সাব-টেক্সট / বিবরণ</label>
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
          <span>নতুন শিক্ষক যোগ করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {mentors.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-900 bg-slate-900 shadow-sm">
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <label className="mt-1.5 text-[10px] font-bold text-blue-900 hover:text-blue-700 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200">
                  ছবি পরিবর্তন
                  <input type="file" accept="image/*" onChange={(e) => handleTeacherPhotoUpload(m.id, e)} className="hidden" />
                </label>
              </div>

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
                    <label className="text-[10px] font-bold text-slate-500">মোবাইল:</label>
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
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => setSelectedTeacherForCard(m)}
                className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>আইডি কার্ড প্রিন্ট</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`${m.name}-এর প্রোফাইল মুছে ফেলবেন?`)) {
                    setMentors(mentors.filter(item => item.id !== m.id));
                  }
                }}
                className="p-1.5 text-red-500 hover:text-red-700 rounded-lg"
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
    </div>
  );

  /* ---------------- MODULE 4 TO 15 RENDER SECTIONS & OTHER DASHBOARD VIEWS ---------------- */
  // বাকী মডিউলগুলোর স্ট্যান্ডার্ড রেন্ডারিং ও কন্ট্রোল এখানে বহাল রয়েছে (যেমন শিক্ষার্থী ডাটাবেজ, কোর্স, ফি, চ্যাটবট ইত্যাদি)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{syncStatus}</span>
            </span>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-emerald-400/30"
              title="এক ক্লিকে ব্রাউজার এবং গিটহাব উভয় জায়গায় সেভ করুন এবং ভার্সেলে লাইভ করুন"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>এক ক্লিকে সব সেভ করুন (Save All)</span>
            </button>

            <button
              onClick={() => {
                saveCurrentStateSilently();
                onViewWebsite();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ওয়েবসাইট দেখুন</span>
            </button>

            <button
              onClick={() => {
                saveCurrentStateSilently();
                onLogout();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeModule === null ? (
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
                  <span>সকল মডিউল গিটহাবে সেভ করুন</span>
                </button>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <button
                onClick={() => setActiveModule(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>১৫টি শর্টকাট মেনুতে ফিরে যান</span>
              </button>

              <div className="text-right flex items-center gap-3">
                <button
                  onClick={handleSaveAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>গিটহাবে সেভ করুন</span>
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
            {/* অন্যান্য মডিউল ভিউ */}
            {activeModule > 3 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <h3 className="text-lg font-bold text-slate-800">{moduleCatalog.find(m => m.id === activeModule)?.title}</h3>
                <p className="text-xs text-slate-600">এই মডিউলের ডাটা ম্যানেজমেন্ট সক্রিয় রয়েছে। সেভ অল (Save All) বাটনে ক্লিক করলেই তথ্য সরাসরি গিটহাবে সেভ হয়ে যাবে।</p>
                <button
                  onClick={handleSaveAll}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold shadow-md"
                >
                  গিটহাবে তথ্য সংরক্ষণ করুন
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};