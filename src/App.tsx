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
      'main > *, main section [class*="rounded-2xl"], main section [class*="rounded-xl"]'
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
