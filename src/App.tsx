import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { Course, Student } from './types';
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

  // App Data with Real-Time Synced State
  const [settings, setSettings] = useState(storage.getSettings());
  const [slides, setSlides] = useState(storage.getSlides());
  const [shortcuts, setShortcuts] = useState(storage.getShortcuts());
  const [courses, setCourses] = useState(storage.getCourses());
  const [mentors, setMentors] = useState(storage.getMentors());
  const [notices, setNotices] = useState(storage.getNotices());
  const [gallery, setGallery] = useState(storage.getGallery());
  const [notes, setNotes] = useState(storage.getNotes());
  const [demoClasses, setDemoClasses] = useState(storage.getDemoClasses());

  // Modals state
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [marksheetModalOpen, setMarksheetModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  // Sync listener to immediately reflect admin changes on the frontend
  useEffect(() => {
    const handleStorageSync = () => {
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

    window.addEventListener('bs_sync', handleStorageSync);
    return () => window.removeEventListener('bs_sync', handleStorageSync);
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
        // Let user scroll to bottom or floating chatbot
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
        onLogout={() => setIsAdminLoggedIn(false)}
        onViewWebsite={() => setIsAdminLoggedIn(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Header & Branding with CSS clamp and Admin Panel Entry Button */}
      <Header
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onNavigate={handleNavigate}
        hotline={settings.hotline}
      />

      {/* Main Frontend Page Flow */}
      <main className="grow">
        {/* 2. Hero Slider (3 slides dynamic) */}
        <HeroSlider
          slides={slides}
          onCtaClick={handleNavigate}
        />

        {/* 3. Quick Action Shortcuts Grid (13 Items) */}
        <QuickActionGrid
          shortcuts={shortcuts}
          onActionClick={handleNavigate}
        />

        {/* 4. Principal / Founder Message Section (বোরহানউদ্দিন মহিম) */}
        <FounderMessage
          settings={settings}
          onExploreCourses={() => handleNavigate('courses')}
        />

        {/* 6. Courses Section with Dynamic Pricing & Countdown Timer */}
        <CoursesSection
          courses={courses}
          onEnrollCourse={handleEnrollCourse}
        />

        {/* 7. Directly Visible Monthly Fee Payment Section with QR Code */}
        <MonthlyFeePaymentSection
          courses={courses}
          settings={settings}
        />

        {/* 5. Mentors / Faculty Section with Popup Biography */}
        <MentorsSection
          mentors={mentors}
        />

        {/* 10. Official Notice Board with Collapsible Images & Videos */}
        <NoticeSection
          notices={notices}
        />

        {/* 13. Free Study Notes & Video Demo Lectures */}
        <FreeResourcesSection
          notes={notes}
          demoClasses={demoClasses}
        />

        {/* 10. Gallery (Photos, Videos, Embeds) */}
        <GallerySection
          gallery={gallery}
        />
      </main>

      {/* 12. Footer with Google Maps, Social Media & Dynamic Welcome Text */}
      <Footer
        settings={settings}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* 11. Floating Smart Chatbot Widget */}
      <FloatingChatbot />

      {/* Modals */}
      <EnrollModal
        isOpen={enrollModalOpen}
        course={selectedCourseForEnroll}
        courses={courses}
        settings={settings}
        onClose={() => setEnrollModalOpen(false)}
        onSuccess={() => {
          // Success callback
        }}
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

      {/* Admin Login Gateway Modal */}
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
