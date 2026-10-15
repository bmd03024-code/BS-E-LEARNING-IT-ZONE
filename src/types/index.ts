export interface InstituteSettings {
  name: string;
  subName: string;
  logoUrl?: string;
  headerTextSize?: 'normal' | 'large' | 'extra-large';
  phone: string;
  hotline: string;
  email: string;
  address: string;
  founderName: string;
  founderTitle: string;
  founderSpeech: string;
  founderPhotoUrl: string;
  signatureUrl: string;
  signatureSealUrl: string;
  institutionSealUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeText: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  mapEmbedUrl: string;
  // Watermark for official certificates, admit cards, and student ID cards
  watermarkUrl?: string;
  // Bangla QR Payment System
  banglaQrUrl: string;
  banglaQrHeading: string;
  // Direct MFS Payment Numbers
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  // Footer Customizations
  footerText?: string;
  footerCopyright?: string;
  footerNotice?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subText: string;
  image: string;
  ctaText: string;
  ctaAction: string;
  active: boolean;
}

export interface ShortcutItem {
  id: string;
  title: string;
  iconName: string;
  badge?: string;
  color: string;
  target: string;
  enabled: boolean;
}

export interface Course {
  id: string;
  title: string;
  logoUrl?: string; // Course-specific logo / thumbnail
  duration: string;
  description: string;
  features: string[];
  admissionFee: number;
  originalAdmissionFee?: number;
  monthlyFee: number;
  offerTimerExpiry?: string;
  certificateFee: number;
  certificateFeeSecondTime: number;
  hasGovtCert?: boolean;
  paymentDetails: string;
  category: string;
  subjects?: string[];
  exams?: string[];
}

export interface Mentor {
  id: string;
  name: string;
  designation: string;
  photoUrl: string;
  qualifications: string[];
  experience: string;
  specialist: string[];
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  bio: string;
  address?: string;
  comments?: string;
}

export interface Student {
  id: string;
  academicYear: string;
  courseId: string;
  roll: string;
  name: string;
  fatherName?: string;
  motherName?: string;
  phone: string;
  address?: string;
  trxId: string;
  enrollmentDate: string;
  photoUrl?: string;
  status: 'active' | 'completed';
  hasPaidDues?: boolean;
  admitCardBlocked?: boolean;
  blockedReason?: string;
}

export interface EnrollmentApplication {
  id: string;
  type: 'admission' | 'monthly';
  courseId: string;
  academicYear: string;
  studentName: string; // Required
  phone: string; // Required
  photoUrl: string; // Required
  fatherName?: string; // Optional
  motherName?: string; // Optional
  address?: string; // Optional
  roll?: string; // For monthly fee
  month?: string; // For monthly fee
  amount: number;
  trxId: string; // Required
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
  rejectionReason?: string;
}

export interface PaymentRecord {
  id: string;
  studentId?: string;
  roll: string;
  academicYear: string;
  courseId: string;
  studentName?: string;
  amount: number;
  trxId: string;
  paymentType: 'admission' | 'monthly' | 'certificate';
  month?: string;
  paymentMethod: 'Bangla QR';
  date: string;
  verified: boolean;
}

export interface RoutineItem {
  id: string;
  academicYear: string;
  courseId: string;
  day: string;
  time: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface ExamSetup {
  id: string;
  courseId: string;
  examName: string;
  subjects: string[];
}

export interface SubjectMark {
  subject: string;
  obtained: number;
  total: number;
  grade: string;
  gpa: number;
}

export interface ResultRecord {
  id: string;
  academicYear: string;
  courseId: string;
  roll: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  examType: string;
  published: boolean;
  date: string;
  marks: SubjectMark[];
  totalMarks: number;
  gpa: number;
  grade: string;
}

export interface AdmitCardRecord {
  id: string;
  studentId?: string;
  academicYear: string;
  courseId: string;
  roll: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  examType: string;
  examDate: string;
  examTime?: string;
  examCenter: string;
  published: boolean;
  instructions: string[];
  studentPhoto?: string;
  feeCleared?: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
}

export interface LedgerItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  title?: string;
  amount: number;
  date: string;
  academicYear: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  content: string;
  images: string[];
  pdfUrl?: string;
  videoUrl?: string;
  pinned?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  type: 'image' | 'video' | 'embed';
  url: string;
  category: string;
  date: string;
}

export interface FreeNoteItem {
  id: string;
  title: string;
  subject: string;
  classOrCourse: string;
  description: string;
  previewImage?: string;
  fileUrl: string;
  pdfUrl?: string;
  images?: string[];
  fileSize?: string;
  date: string;
}

export interface DemoClassItem {
  id: string;
  title: string;
  courseId: string;
  instructor: string;
  duration: string;
  videoUrl: string;
  thumbnail?: string;
  description: string;
}

export interface ChatbotInfoBlock {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords?: string[];
  isActive: boolean;
  updatedAt?: string;
}

export interface ChatbotFAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface ChatbotSettings {
  botName?: string;
  welcomeMessage?: string;
  basePrompt: string;
  // Large comprehensive knowledge base text (capacity ~50,000 words)
  knowledgeBaseText?: string;
  // Multiple distinct information blocks added by admin
  infoBlocks?: ChatbotInfoBlock[];
  faqs: ChatbotFAQ[];
  quickChips?: string[];
}

export interface CertificateRecord {
  id: string;
  studentId?: string;
  academicYear: string;
  courseId: string;
  roll: string;
  studentName: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  issueDate: string;
  certificateNo: string;
  grade: string;
  isFirstIssue: boolean;
  feePaid: boolean;
  isFree: boolean; // Admin controlled: whether certificate is free
  feeAmount: number; // Admin determined fee
  hasEverPaid: boolean; // Once paid, re-downloads are free unlimited times
  hasGovtCert: boolean;
}

export interface AdminCredentials {
  email: string;
  password: string;
  masterPin: string; // Master PIN for instant password recovery without email
}
