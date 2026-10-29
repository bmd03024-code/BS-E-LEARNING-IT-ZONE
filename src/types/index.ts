export interface InstituteSettings {
  name: string;
  subName: string;
  subNameEnglish?: string;
  logoUrl?: string;
  headerTextSize?: 'normal' | 'large' | 'extra-large';
  phone: string;
  hotline: string;
  email: string;
  address: string;
  addressEnglish?: string;
  founderName: string;
  founderNameEnglish?: string;
  founderTitle: string;
  founderTitleEnglish?: string;
  founderSpeech: string;
  founderSpeechEnglish?: string;
  founderPhotoUrl: string;
  signatureUrl: string;
  signatureSealUrl: string;
  institutionSealUrl: string;
  primaryColor: string;
  secondaryColor: string;
  welcomeText: string;
  welcomeTextEnglish?: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  mapEmbedUrl: string;
  // Watermark for official certificates, admit cards, and student ID cards
  watermarkUrl?: string;
  // Bangla QR Payment System
  banglaQrUrl: string;
  banglaQrHeading: string;
  banglaQrHeadingEnglish?: string;
  // Direct MFS Payment Numbers
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  // Footer Customizations
  footerText?: string;
  footerTextEnglish?: string;
  footerCopyright?: string;
  footerNotice?: string;
  footerNoticeEnglish?: string;
  // GitHub Single Source of Truth & Vercel Auto-Deployment
  githubRepo?: string;
  githubBranch?: string;
  githubToken?: string;
  githubAutoPushEnabled?: boolean;
  githubLastCommitSha?: string;
  githubLastSyncTime?: number;
}

export interface HeroSlide {
  id: string;
  title: string;
  titleEnglish?: string;
  subText: string;
  subTextEnglish?: string;
  image: string;
  ctaText: string;
  ctaTextEnglish?: string;
  ctaAction: string;
  active: boolean;
}

export interface ShortcutItem {
  id: string;
  title: string;
  titleEnglish?: string;
  iconName: string;
  badge?: string;
  color: string;
  target: string;
  enabled: boolean;
}

export interface Course {
  id: string;
  title: string;
  titleEnglish?: string;
  descriptionEnglish?: string;
  categoryEnglish?: string;
  subjectsEnglish?: string[];
  examsEnglish?: string[];
  logoUrl?: string; // Course-specific logo / thumbnail
  duration: string;
  durationEnglish?: string;
  description: string;
  features: string[];
  featuresEnglish?: string[];
  admissionFee: number;
  originalAdmissionFee?: number;
  monthlyFee: number;
  offerTimerExpiry?: string;
  certificateFee: number;
  certificateFeeSecondTime: number;
  hasGovtCert?: boolean;
  paymentDetails: string;
  paymentDetailsEnglish?: string;
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
  nameEnglish?: string;
  designationEnglish?: string;
  qualificationsEnglish?: string[];
  experienceEnglish?: string;
  specialistEnglish?: string[];
  bioEnglish?: string;
  addressEnglish?: string;
  commentsEnglish?: string;
}

export interface Student {
  id: string;
  academicYear: string;
  courseId: string;
  roll: string;
  registrationNo?: string;
  name: string;
  englishName?: string;
  fatherName?: string;
  fatherNameEnglish?: string;
  motherName?: string;
  motherNameEnglish?: string;
  phone: string;
  address?: string;
  addressEnglish?: string;
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
  studentName: string; // Required Bengali name
  studentNameEnglish?: string; // English spelling for records
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
  fatherNameEnglish?: string;
  motherNameEnglish?: string;
  addressEnglish?: string;
  rejectionReasonEnglish?: string;
}

export interface PaymentRecord {
  id: string;
  studentId?: string;
  roll: string;
  academicYear: string;
  courseId: string;
  studentName?: string;
  studentNameEnglish?: string;
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
  dayEnglish?: string;
  timeEnglish?: string;
  subjectEnglish?: string;
  teacherNameEnglish?: string;
  roomEnglish?: string;
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
  address?: string;
  phone?: string;
  examType: string;
  published: boolean;
  date: string;
  marks: SubjectMark[];
  totalMarks: number;
  gpa: number;
  grade: string;
  studentNameEnglish?: string;
  fatherNameEnglish?: string;
  motherNameEnglish?: string;
  addressEnglish?: string;
  examTypeEnglish?: string;
  marksEnglish?: SubjectMark[];
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
  studentNameEnglish?: string;
  fatherNameEnglish?: string;
  motherNameEnglish?: string;
  examTypeEnglish?: string;
  examCenterEnglish?: string;
  instructionsEnglish?: string[];
  blockedReasonEnglish?: string;
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
  categoryEnglish?: string;
  descriptionEnglish?: string;
  titleEnglish?: string;
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
  titleEnglish?: string;
  contentEnglish?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  type: 'image' | 'video' | 'embed';
  url: string;
  category: string;
  date: string;
  titleEnglish?: string;
  captionEnglish?: string;
  categoryEnglish?: string;
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
  titleEnglish?: string;
  subjectEnglish?: string;
  classOrCourseEnglish?: string;
  descriptionEnglish?: string;
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
  titleEnglish?: string;
  instructorEnglish?: string;
  durationEnglish?: string;
  descriptionEnglish?: string;
}

export interface ChatbotInfoBlock {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords?: string[];
  isActive: boolean;
  updatedAt?: string;
  titleEnglish?: string;
  categoryEnglish?: string;
  contentEnglish?: string;
  keywordsEnglish?: string[];
}

export interface ChatbotFAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  questionEnglish?: string;
  answerEnglish?: string;
  keywordsEnglish?: string[];
}

export type AIProviderType = 'gemini' | 'groq' | 'openrouter' | 'local_only';

export interface AISettings {
  activeProvider: AIProviderType;
  geminiApiKey?: string;
  geminiModel?: string; // e.g. 'gemini-2.5-flash'
  groqApiKey?: string;
  groqModel?: string; // e.g. 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'
  openrouterApiKey?: string;
  openrouterModel?: string; // e.g. 'meta-llama/llama-3.2-3b-instruct:free', 'google/gemini-2.0-flash-exp:free'
  systemPrompt?: string;
  fallbackToLocal?: boolean;
}

export interface ChatbotSettings {
  botName?: string;
  botNameEnglish?: string;
  welcomeMessage?: string;
  welcomeMessageEnglish?: string;
  basePrompt: string;
  basePromptEnglish?: string;
  // Large comprehensive knowledge base text (capacity ~50,000 words)
  knowledgeBaseText?: string;
  knowledgeBaseTextEnglish?: string;
  // Multiple distinct information blocks added by admin
  infoBlocks?: ChatbotInfoBlock[];
  faqs: ChatbotFAQ[];
  quickChips?: string[];
  quickChipsEnglish?: string[];
  // Dynamic Multi-AI API switching settings (Gemini, Groq, OpenRouter)
  aiSettings?: AISettings;
}

export interface CertificateRecord {
  id: string;
  studentId?: string;
  academicYear: string;
  courseId: string;
  roll: string;
  registrationNo?: string;
  studentName: string;
  studentNameEnglish?: string;
  fatherName?: string;
  fatherNameEnglish?: string;
  motherName?: string;
  motherNameEnglish?: string;
  address?: string;
  addressEnglish?: string;
  issueDate: string;
  certificateNo: string;
  grade: string;
  isFirstIssue: boolean;
  feePaid: boolean;
  isFree: boolean; // Admin controlled: whether certificate is free
  feeAmount: number; // Admin determined fee
  hasEverPaid: boolean; // Once paid, re-downloads are free unlimited times
  hasGovtCert: boolean;
  certificateTitle?: string;
  certificateTitleEnglish?: string;
  bodyText?: string;
  bodyTextEnglish?: string;
  institutionName?: string;
  institutionNameEnglish?: string;
  institutionSubName?: string;
  institutionSubNameEnglish?: string;
  founderName?: string;
  founderNameEnglish?: string;
  founderTitle?: string;
  founderTitleEnglish?: string;
  duration?: string;
  durationEnglish?: string;
  courseTitle?: string;
  courseTitleEnglish?: string;
  published?: boolean;
}

export interface AdminCredentials {
  email: string;
  password: string;
  masterPin: string; // Master PIN for instant password recovery without email
}
