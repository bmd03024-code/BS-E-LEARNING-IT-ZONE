import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { masterGateway } from './services/masterGateway';
import { Course } from './types';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroSlider } from './components/home/HeroSlider';
import { QuickActionGrid } from './components/home/QuickActionGrid';
import { FounderMessage } from './components/home/FounderMessage';
import { CoursesSection } from './components/home/CoursesSection';
import { MentorsSection } from './components/home/MentorsSection';
import { MonthlyFeePaymentSection } from './components/home/MonthlyFeePaymentSection';
import { NoticeSection } from './components/home/NoticeSection';
import { GallerySection } from './components/home/GallerySection';
import { FreeResourcesSection } from './components/home/FreeResourcesSection';
import { FloatingChatbot } from './components/chatbot/FloatingChatbot';
import { FloatingToolsSuite } from './components/tools/FloatingToolsSuite';

// Modals
import { EnrollModal } from './components/modals/EnrollModal';
import { AdmitCardModal } from './components/modals/AdmitCardModal';
import { MarksheetModal } from './components/modals/MarksheetModal';
import { CertificateModal } from './components/modals/CertificateModal';
import { RoutineModal } from './components/modals/RoutineModal';
import { ContactModal } from './components/modals/ContactModal';
import { StudentIdCardModal } from './components/modals/StudentIdCardModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [language, setLanguage] = useState<'bn' | 'en'>(() => (localStorage.getItem('bs_site_language') as 'bn' | 'en') || 'bn');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // App Data States
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [slides, setSlides] = useState(() => storage.getSlides());
  const [shortcuts, setShortcuts] = useState(() => storage.getShortcuts());
  const [courses, setCourses] = useState(() => storage.getCourses());
  const [mentors, setMentors] = useState(() => storage.getMentors());
  const [notices, setNotices] = useState(() => storage.getNotices());
  const [gallery, setGallery] = useState(() => storage.getGallery());
  const [notes, setNotes] = useState(() => storage.getNotes());
  const [demoClasses, setDemoClasses] = useState(() => storage.getDemoClasses());

  // Modals state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [marksheetModalOpen, setMarksheetModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  // Remember the selected language and translate shared public UI labels.
  useEffect(() => {
    localStorage.setItem('bs_site_language', language);
    document.documentElement.lang = language;
    const bnToEn: Record<string, string> = {
      'ভর্তি চলছে': 'Admissions Open',
      'কোর্সসমূহ': 'Courses',
      'প্রতিষ্ঠাতা ও ম্যানেজমেন্ট': 'Founder & Management',
      'ক্লাস রুটিন': 'Class Routine',
      'মাসিক ফি / পেমেন্ট': 'Monthly Fee / Payment',
      'মার্কশিট / ফলাফল': 'Marksheet / Results',
      'সনদপত্র': 'Certificate',
      'শিক্ষকবৃন্দ': 'Our Instructors',
      'স্মার্ট AI': 'Smart AI',
      'নির্ধারিত কোর্স ফি ও বিশেষ অফার প্যাকেজ': 'Course Fees & Special Offers',
      'আমাদের অফিশিয়াল কোর্সসমূহ': 'Our Courses',
      'সীমিত সময়ের বিশেষ ভর্তি অফার চলছে!': 'Limited-time admission offer!',
      'কাটা মূল্যে স্পেশাল ছাড়ে এখনই এনরোল করুন': 'Enroll now and enjoy a special discount',
      'দিন': 'Days', 'ঘণ্টা': 'Hours', 'মিনিট': 'Minutes', 'সেকেন্ড': 'Seconds',
      'সরকারি সনদ': 'Government certificate', 'সনদ ফ্রি': 'Free certificate',
      'ভর্তি ফি:': 'Admission fee:', 'মাসিক ফি:': 'Monthly fee:',
      'মাসিক ফি নেই': 'No monthly fee', 'সনদ ফি:': 'Certificate fee:',
      'সম্পূর্ণ ফ্রি': 'Completely free', 'পাঠ্য বিষয়সমূহ:': 'Subjects:',
      'এনরোল করুন': 'Enroll now', 'মেয়াদ:': 'Duration:',
      'অনলাইন ভর্তি ও কোর্স রেজিস্ট্রেশন': 'Online Admission & Course Registration',
      'বাংলা নাম * (আবশ্যিক)': 'Name in Bengali * (Required)',
      'ইংরেজি নাম * (আবশ্যিক)': 'Name in English * (Required)',
      'বাংলায় পূর্ণ নাম লিখুন': 'Enter full name in Bengali',
      'ইংরেজিতে পূর্ণ নাম লিখুন': 'Enter full name in English',
      'ভর্তি আবেদন দাখিল করুন': 'Submit admission application'
    };
    const enToBn = Object.fromEntries(Object.entries(bnToEn).map(([bn, en]) => [en, bn]));
    const dictionary = language === 'en' ? bnToEn : enToBn;
    const translate = (root: Node) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      nodes.forEach(node => {
        const value = node.nodeValue || '';
        const trimmed = value.trim();
        if (trimmed && dictionary[trimmed]) node.nodeValue = value.replace(trimmed, dictionary[trimmed]);
      });
      if (root instanceof HTMLElement) {
        [root, ...Array.from(root.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]'))].forEach(el => {
          ['placeholder', 'title', 'aria-label'].forEach(attr => {
            const value = el.getAttribute(attr);
            if (value && dictionary[value]) el.setAttribute(attr, dictionary[value]);
          });
        });
      }
    };
    translate(document.body);
    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translate(node);
        });
        if (record.type === 'characterData' && record.target.parentNode) translate(record.target.parentNode);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  // Robust Real-Time Sync function for all tabs and admin updates
  const refreshAppData = () => {
    setSettings(storage.getSettings());
    setSlides(storage.getSlides());
    setShortcuts(storage.getShortcuts());
    setCourses(storage.getCourses());
    setMentors(storage.getMentors());
    setNotices(storage.getNotices());
    setGallery(storage.getGallery());
    setNotes(storage.getNotes());
    setDemoClasses(storage.getDemoClasses());
  };

  useEffect(() => {
    // Immediate initial sync on mount
    refreshAppData();

    // Subscribe to Master Gateway real-time updates (Firestore + SSE + Broadcast)
    const unsubGateway = masterGateway.subscribe(() => {
      refreshAppData();
    });

    // Listen to custom sync events triggered from admin panel or storage service
    const handleCustomSync = () => {
      refreshAppData();
    };

    // Listen to cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('bs_')) {
        refreshAppData();
      }
    };

    window.addEventListener('bs_sync', handleCustomSync);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleCustomSync);

    return () => {
      unsubGateway();
      window.removeEventListener('bs_sync', handleCustomSync);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleCustomSync);
    };
  }, []);

  // Replay subtle reveal animations whenever page sections/cards enter the viewport.
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const targets = document.querySelectorAll(
      'main > *, main section [class*="rounded-2xl"], main section [class*="rounded-xl"], main section .qr-slide-in'
    );
    targets.forEach((target) => target.classList.add('scroll-reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // Universal Navigation & Shortcut Handler
  const handleNavigate = (target: string) => {
    switch (target) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'courses': {
        const el = document.getElementById('courses-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'founder': {
        const el = document.getElementById('founder-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'idcard':
        setIdCardModalOpen(true);
        break;
      case 'enroll':
        setSelectedCourseForEnroll(courses[0] || null);
        setEnrollModalOpen(true);
        break;
      case 'admit':
        setAdmitModalOpen(true);
        break;
      case 'marksheet':
        setMarksheetModalOpen(true);
        break;
      case 'certificate':
        setCertificateModalOpen(true);
        break;
      case 'routine':
        setRoutineModalOpen(true);
        break;
      case 'fee': {
        const el = document.getElementById('fee-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'notice': {
        const el = document.getElementById('notice-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'gallery': {
        const el = document.getElementById('gallery-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'notes':
      case 'democlasses': {
        const el = document.getElementById('free-resources-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'mentors': {
        const el = document.getElementById('mentors-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      }
      case 'contact':
        setContactModalOpen(true);
        break;
      case 'chatbot':
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  const handleEnrollCourse = (course: Course) => {
    setSelectedCourseForEnroll(course);
    setEnrollModalOpen(true);
  };

  // If Admin is logged in, show full-suite Admin Dashboard
  if (isAdminLoggedIn) {
    return (
      <AdminDashboard
        onLogout={() => {
          setIsAdminLoggedIn(false);
          refreshAppData();
        }}
        onViewWebsite={() => {
          setIsAdminLoggedIn(false);
          refreshAppData();
        }}
      />
    );
  }

  return (
    <div className="page-enter min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      <Header
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onNavigate={handleNavigate}
        hotline={settings.hotline}
        logoUrl={settings.logoUrl}
        headerTextSize={settings.headerTextSize}
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="grow">
        <HeroSlider
          slides={slides}
          onCtaClick={handleNavigate}
        />

        <QuickActionGrid
          shortcuts={shortcuts}
          onActionClick={handleNavigate}
        />

        <FounderMessage
          settings={settings}
          onExploreCourses={() => handleNavigate('courses')}
        />

        <CoursesSection
          courses={courses}
          onEnrollCourse={handleEnrollCourse}
        />

        <MonthlyFeePaymentSection
          courses={courses}
          settings={settings}
        />

        <MentorsSection
          mentors={mentors}
        />

        <NoticeSection
          notices={notices}
        />

        <FreeResourcesSection
          notes={notes}
          demoClasses={demoClasses}
        />

        <GallerySection
          gallery={gallery}
        />
      </main>

      <Footer
        settings={settings}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onNavigate={handleNavigate}
      />

      <FloatingChatbot />
      <FloatingToolsSuite />

      {/* Modals */}
      <EnrollModal
        isOpen={enrollModalOpen}
        course={selectedCourseForEnroll}
        courses={courses}
        settings={settings}
        onClose={() => setEnrollModalOpen(false)}
        onSuccess={() => {}}
      />

      <AdmitCardModal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        courses={courses}
      />

      <MarksheetModal
        isOpen={marksheetModalOpen}
        onClose={() => setMarksheetModalOpen(false)}
        courses={courses}
      />

      <CertificateModal
        isOpen={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        courses={courses}
      />

      <RoutineModal
        isOpen={routineModalOpen}
        onClose={() => setRoutineModalOpen(false)}
        courses={courses}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        settings={settings}
      />

      <StudentIdCardModal
        isOpen={idCardModalOpen}
        onClose={() => setIdCardModalOpen(false)}
        courses={courses}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginModalOpen(false);
          setIsAdminLoggedIn(true);
        }}
      />
    </div>
  );
         }
