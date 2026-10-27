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
      'ভর্তি আবেদন দাখিল করুন': 'Submit admission application',
      '২০২৬ শিক্ষাবর্ষে সকল কোর্সে স্পেশাল অফার ফি-তে ভর্তি চলছে!': 'Special offer admission is open for all courses in the 2026 academic year!',
      'হটলাইন:': 'Hotline:',
      'ইন্টারঅ্যাক্টিভ শর্টকাট হাব': 'Interactive Shortcut Hub',
      'কুইক অ্যাকশন ও স্টুডেন্ট সার্ভিসেস': 'Quick Actions & Student Services',
      'এক ক্লিকে সকল সেবা: ভর্তি, রুটিন, এডমিট কার্ড, মাসিক ফি, রেজাল্ট ও সনদপত্র': 'All services in one click: Admission, Routine, Admit Card, Monthly Fees, Results, and Certificates',
      'মোট ১৩টি সরাসরি অ্যাকশন মডিউল': '13 quick-access action modules',
      'আমাদের অফিশিয়াল কোর্সসমূহ': 'Our Official Courses',
      'দক্ষ শিক্ষক মণ্ডলী, মানসম্মত সিলেবাস ও নিয়মিত পরীক্ষার মাধ্যমে শতভাগ সাফল্যের নিশ্চয়তা': 'Experienced teachers, a quality syllabus, and regular assessments to support student success',
      'সীমিত সময়ের বিশেষ ভর্তি অফার চলছে!': 'Limited-Time Admission Offer!',
      'কাটা মূল্যে স্পেশাল ছাড়ে এখনই এনরোল করুন': 'Enroll now and enjoy a special discount',
      'আমাদের সম্পর্কে': 'About Us',
      'আমাদের লক্ষ্য': 'Our Mission',
      'প্রতিষ্ঠাতা ও প্রধান শিক্ষক:': 'Founder & Head Teacher:',
      'অফিশিয়াল হেল্পলাইন:': 'Official Helpline:',
      'সকল অধিকার সংরক্ষিত': 'All rights reserved',
      'আরও জানুন': 'Learn More',
      'বিস্তারিত দেখুন': 'View Details',
      'যোগাযোগ করুন': 'Contact Us',
      'ফ্রি রিসোর্স': 'Free Resources',
      'নোটিশ বোর্ড': 'Notice Board',
      'ফটো গ্যালারি': 'Photo Gallery',
      'আমাদের মেন্টর': 'Our Mentors',
      'আমাদের শিক্ষকবৃন্দ': 'Our Instructors',
      'প্রতিষ্ঠাতার বাণী': 'Message from the Founder',
      'সকল কোর্স দেখুন': 'View All Courses',
      'কোর্সে ভর্তি হন': 'Enroll in a Course',
      'এখনই ভর্তি হন': 'Enroll Now',
      'বিস্তারিত': 'Details',
      'শুরু করুন': 'Get Started',
      'বন্ধ করুন': 'Close',
      'পিছনে': 'Back',
      'পরবর্তী': 'Next',
      'সাবমিট': 'Submit',
      'নাম': 'Name',
      'বাংলা নাম': 'Name in Bengali',
      'ইংরেজি নাম': 'Name in English',
      'পিতার নাম': 'Father’s Name',
      'মাতার নাম': 'Mother’s Name',
      'পিতার ইংরেজি নাম': 'Father’s Name in English',
      'মাতার ইংরেজি নাম': 'Mother’s Name in English',
      'ফোন নম্বর': 'Phone Number',
      'ঠিকানা': 'Address',
      'ইমেইল': 'Email',
      'কোর্সের নাম': 'Course Name',
      'কোর্সের মেয়াদ': 'Course Duration',
      'ভর্তি ফি': 'Admission Fee',
      'মাসিক ফি': 'Monthly Fee',
      'ফলাফল': 'Results',
      'রুটিন': 'Routine',
      'এডমিট কার্ড': 'Admit Card',
      'পেমেন্ট': 'Payment',
      'সনদপত্র ডাউনলোড': 'Download Certificate',
      'শিক্ষার্থী সেবা': 'Student Services',
      'শর্টকাট': 'Shortcuts',
      'লোড হচ্ছে...': 'Loading...',
      'কোনো তথ্য পাওয়া যায়নি': 'No information found',
      'সর্বশেষ আপডেট': 'Last Updated',
      'বিনামূল্যে': 'Free',
      'আবেদন করুন': 'Apply Now',
      'পাঠ্য বিষয়সমূহ:': 'Subjects:',
      'কোর্সের বিস্তারিত': 'Course Details',
      'ভর্তি চলছে': 'Admissions Open',
      'যোগাযোগ': 'Contact',
      'হোম': 'Home',
      'গ্যালারি': 'Gallery',
      'গ্যালারি স্লাইড': 'Gallery Slides',
      'মার্কশিট': 'Marksheet',
      'বোর্ড': 'Board',
      'ফেসবুক': 'Facebook',
      'মাদ্রাসা': 'Madrasa',
      'শিক্ষার্থী': 'Student',
      'শিক্ষার্থীরা': 'Students',
      'স্টুডেন্ট': 'Student',
      'স্টুডেন্টস': 'Students',
      'কোর্স': 'Course',
      'সেমিনার': 'Seminar',
      'সেমিনারের নাম': 'Seminar Name',
      'ক্লাসের রুটিন': 'Class Routine',
      'শিক্ষক': 'Teacher',
      'শিক্ষকের': 'Teacher’s',
      'প্রতিষ্ঠাতার': 'Founder’s',
      'বোর্ডের': 'Board’s',
      'সকল কোর্স': 'All Courses',
      'কোর্সের বিষয়': 'Course Subjects',
      'কোর্সের বিষয়': 'Course Subjects',
      'স্লাইড': 'Slides',
      'স্লাইডার': 'Slider',
      'ফটো': 'Photo',
      'ছবি': 'Image',
      'নোটিশ': 'Notice',
      'নোটিশসমূহ': 'Notices',
      'সকল নোটিশ': 'All Notices',
      'ডাউনলোড': 'Download',
      'প্রিন্ট করুন': 'Print',
      'প্রিন্ট': 'Print',
      'সার্টিফিকেট': 'Certificate',
      'সার্টিফিকেট ডাউনলোড': 'Download Certificate',
      'শিক্ষার্থীর নাম': 'Student Name',
      'পিতার নাম:': 'Father’s Name:',
      'মাতার নাম:': 'Mother’s Name:',
      'জন্ম তারিখ': 'Date of Birth',
      'জন্মতারিখ': 'Date of Birth',
      'ঠিকানা:': 'Address:',
      'মোবাইল নম্বর': 'Mobile Number',
      'যোগাযোগের নম্বর': 'Contact Number',
      'বিষয়': 'Subject',
      'বিষয়': 'Subject',
      'পরীক্ষার ফলাফল': 'Exam Results',
      'পরীক্ষার রুটিন': 'Exam Routine',
      'ভর্তি ফরম': 'Admission Form',
      'আবেদনের অবস্থা': 'Application Status',
      'সংরক্ষণ করুন': 'Save',
      'আপডেট করুন': 'Update',
      'যোগ করুন': 'Add',
      'সম্পাদনা করুন': 'Edit',
      'মুছে ফেলুন': 'Delete',
      'অনুসন্ধান করুন': 'Search',
      'নির্বাচন করুন': 'Select',
      'সফলভাবে সংরক্ষিত হয়েছে': 'Saved successfully',
      'কোনো তথ্য পাওয়া যায়নি': 'No information found',
      'প্রধান শিক্ষকের স্বাক্ষর': 'Head Teacher’s Signature',
      'প্রতিষ্ঠানের সিল': 'Institutional Seal',
      'অফিসিয়াল সিল': 'Official Seal',
      'মার্কশিট / ফলাফল': 'Marksheet / Results',
      'একাডেমিক মার্কশিট': 'Academic Marksheet',
      'গ্যালারি স্লাইড': 'Gallery Slides',
      'শিক্ষক ও প্রতিষ্ঠাতা': 'Teachers & Founder' 
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
