import {
  InstituteSettings,
  HeroSlide,
  ShortcutItem,
  Course,
  Mentor,
  Student,
  PaymentRecord,
  RoutineItem,
  ResultRecord,
  AdmitCardRecord,
  LedgerItem,
  NoticeItem,
  GalleryItem,
  FreeNoteItem,
  DemoClassItem,
  ChatbotSettings,
  CertificateRecord,
  EnrollmentApplication,
  AdminCredentials
} from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { collection, doc, onSnapshot, setDoc, getDocs, Unsubscribe } from 'firebase/firestore';

// Default SVG assets for seals, signature, logos, and Bangla QR
export const DEFAULT_ASSETS = {
  // Official Gold & Navy Emblem Logo
  logo: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160"><defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="50%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23d97706"/></linearGradient><linearGradient id="navy" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="100%" stop-color="%231e3a8a"/></linearGradient></defs><circle cx="80" cy="80" r="76" fill="url(%23navy)" stroke="url(%23gold)" stroke-width="5"/><circle cx="80" cy="80" r="66" fill="none" stroke="url(%23gold)" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M40 68 L80 44 L120 68 L80 92 Z" fill="url(%23gold)"/><path d="M54 78 V104 C54 116 106 116 106 104 V78" fill="none" stroke="url(%23gold)" stroke-width="4"/><path d="M118 72 V108 L122 112" stroke="url(%23gold)" stroke-width="3" fill="none"/><circle cx="122" cy="113" r="3" fill="url(%23gold)"/><text x="80" y="132" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="%23ffffff" text-anchor="middle" letter-spacing="1">BS ZONE</text><text x="80" y="145" font-family="Arial, sans-serif" font-size="8" fill="url(%23gold)" text-anchor="middle">E-LEARNING &amp; IT</text></svg>`,
  
  // Founder Scanned Signature
  signature: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80"><path d="M25 50 C45 20, 60 70, 75 35 C90 10, 110 60, 125 40 C140 25, 155 55, 175 35 C190 20, 205 60, 220 45" fill="none" stroke="%231e3a8a" stroke-width="3" stroke-linecap="round"/><path d="M30 65 L210 52" stroke="%231e3a8a" stroke-width="2" stroke-linecap="round"/><text x="120" y="74" font-family="'Hind Siliguri', sans-serif" font-weight="600" font-size="12" fill="%230f172a" text-anchor="middle">বোরহানউদ্দিন মহিম</text></svg>`,
  
  // Scanned Signature Seal
  signatureSeal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140"><circle cx="70" cy="70" r="64" fill="none" stroke="%23dc2626" stroke-width="3" stroke-dasharray="6 3"/><circle cx="70" cy="70" r="54" fill="none" stroke="%23dc2626" stroke-width="1.5"/><text x="70" y="45" font-family="'Hind Siliguri', sans-serif" font-size="9" font-weight="bold" fill="%23dc2626" text-anchor="middle">বোরহানউদ্দিন মহিম</text><text x="70" y="65" font-family="'Hind Siliguri', sans-serif" font-size="8" fill="%23dc2626" text-anchor="middle">প্রতিষ্ঠাতা ও প্রধান শিক্ষক</text><text x="70" y="85" font-family="'Hind Siliguri', sans-serif" font-size="7.5" font-weight="bold" fill="%23dc2626" text-anchor="middle">BS E-Learning &amp; IT Zone</text><text x="70" y="105" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="%23dc2626" text-anchor="middle">★ VERIFIED ★</text></svg>`,
  
  // Official Institutional Seal
  institutionSeal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><circle cx="75" cy="75" r="70" fill="none" stroke="%23047857" stroke-width="3.5"/><circle cx="75" cy="75" r="58" fill="none" stroke="%23047857" stroke-width="1.5"/><path id="topCurve" d="M 25 75 A 50 50 0 0 1 125 75" fill="none"/><text fill="%23047857" font-size="10" font-weight="bold" font-family="Arial, sans-serif"><textPath href="%23topCurve" startOffset="50%" text-anchor="middle">BS E-LEARNING &amp; IT ZONE</textPath></text><circle cx="75" cy="75" r="28" fill="%23ecfdf5" stroke="%23047857" stroke-width="1.5"/><text x="75" y="73" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="%23047857" text-anchor="middle">OFFICIAL</text><text x="75" y="85" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="%23047857" text-anchor="middle">SEAL</text><path id="bottomCurve" d="M 25 75 A 50 50 0 0 0 125 75" fill="none"/><text fill="%23047857" font-size="9" font-weight="bold" font-family="'Hind Siliguri', sans-serif"><textPath href="%23bottomCurve" startOffset="50%" text-anchor="middle">★ গভঃ অনুমোদিত কোর্স কোড ★</textPath></text></svg>`,

  // Authentic Bangla QR SVG (Interoperable QR for bKash, Nagad, Rocket, Upay & All Banks)
  banglaQr: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380" width="320" height="380"><rect width="320" height="380" rx="20" fill="%23ffffff" stroke="%230f172a" stroke-width="2"/><rect x="15" y="15" width="290" height="50" rx="10" fill="%231e3a8a"/><text x="160" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="%23ffffff" text-anchor="middle">বাংলা কিউআর (BANGLA QR)</text><text x="160" y="54" font-family="'Hind Siliguri', sans-serif" font-size="10" fill="%23fbbf24" text-anchor="middle">বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপে স্ক্যান করুন</text><rect x="35" y="80" width="250" height="250" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5"/><g fill="%230f172a"><rect x="55" y="100" width="50" height="50" rx="6"/><rect x="63" y="108" width="34" height="34" rx="3" fill="%23ffffff"/><rect x="71" y="116" width="18" height="18" rx="2"/><rect x="215" y="100" width="50" height="50" rx="6"/><rect x="223" y="108" width="34" height="34" rx="3" fill="%23ffffff"/><rect x="231" y="116" width="18" height="18" rx="2"/><rect x="55" y="260" width="50" height="50" rx="6"/><rect x="63" y="268" width="34" height="34" rx="3" fill="%23ffffff"/><rect x="71" y="276" width="18" height="18" rx="2"/><rect x="120" y="105" width="14" height="14"/><rect x="145" y="105" width="22" height="14"/><rect x="180" y="105" width="14" height="22"/><rect x="120" y="135" width="28" height="14"/><rect x="160" y="135" width="14" height="28"/><rect x="185" y="145" width="14" height="14"/><rect x="135" y="170" width="50" height="50" rx="8" fill="%23d97706"/><circle cx="160" cy="195" r="14" fill="%23ffffff"/><text x="160" y="200" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="%23d97706" text-anchor="middle">BS</text><rect x="115" y="235" width="22" height="14"/><rect x="150" y="235" width="35" height="14"/><rect x="120" y="265" width="14" height="30"/><rect x="145" y="265" width="28" height="14"/><rect x="185" y="265" width="25" height="14"/><rect x="225" y="225" width="25" height="25"/><rect x="230" y="265" width="35" height="30"/></g><rect x="20" y="340" width="280" height="28" rx="6" fill="%23f1f5f9"/><text x="160" y="358" font-family="'Hind Siliguri', sans-serif" font-weight="bold" font-size="11" fill="%23334155" text-anchor="middle">bKash • Nagad • Rocket • Upay • All Banking Apps</text></svg>`,

  // Course Logos / Thumbnails
  courseLogos: {
    quran: `https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=400&q=80`,
    accounting: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80`,
    english: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80`,
    math: `https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=400&q=80`,
    computer: `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80`,
    general: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80`
  }
};

// Initial Institute Settings
const initialSettings: InstituteSettings = {
  name: "BS E-Learning & IT Zone",
  subName: "দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি",
  logoUrl: DEFAULT_ASSETS.logo,
  headerTextSize: 'normal',
  phone: "01612118307",
  hotline: "01612118307",
  email: "onlinetutionbyborhansir@gmail.com",
  address: "বাগানবাড়ি রোড, উত্তরা / মিরপুর শাখা, ঢাকা-১২৩০, বাংলাদেশ",
  founderName: "বোরহানউদ্দিন মহিম",
  founderTitle: "প্রতিষ্ঠাতা ও প্রধান শিক্ষক",
  founderSpeech: "আসসালামু আলাইকুম। প্রিয় শিক্ষার্থী ও অভিভাবকবৃন্দ, আধুনিক বিশ্বের চ্যালেঞ্জ মোকাবেলায় গুণগত শিক্ষা এবং প্র্যাকটিক্যাল আইটি দক্ষতার কোনো বিকল্প নেই। BS E-Learning & IT Zone-এ আমরা প্রতিটি শিক্ষার্থীকে পরম স্নেহে ও নিখুঁত পাঠদান কৌশলে বেসিক থেকে অ্যাডভান্সড লেভেল পর্যন্ত তৈরি করি। সহীহ কুরআন শিক্ষা থেকে শুরু করে মাধ্যমিক-উচ্চমাধ্যমিক অ্যাকাউন্টিং, গণিত, ইংরেজি এবং সরকারি মানসম্পন্ন কম্পিউটার অফিস অ্যাপ্লিকেশন—আমাদের প্রতিটি কোর্সে রয়েছে শতভাগ সাফল্যের নিশ্চয়তা। সততা, নৈতিকতা ও আধুনিক প্রযুক্তির সমন্বয়ে প্রতিটি শিক্ষার্থীর ভবিষ্যৎ উজ্জ্বল করাই আমাদের মূল লক্ষ্য।",
  founderPhotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  signatureUrl: DEFAULT_ASSETS.signature,
  signatureSealUrl: DEFAULT_ASSETS.signatureSeal,
  institutionSealUrl: DEFAULT_ASSETS.institutionSeal,
  primaryColor: "#1e3a8a",
  secondaryColor: "#d97706",
  welcomeText: "BS E-Learning & IT Zone-এ আপনাকে স্বাগতম! দেশসেরা অনলাইন ও অফলাইন শিখন প্ল্যাটফর্ম।",
  facebookUrl: "https://facebook.com",
  youtubeUrl: "https://youtube.com",
  tiktokUrl: "https://tiktok.com",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14602.700319451996!2d90.3700!3d23.7937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0c9b0e14d11%3A0xe54b9dfbc9fa3d0d!2sMirpur%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd",
  watermarkUrl: DEFAULT_ASSETS.logo,
  banglaQrUrl: DEFAULT_ASSETS.banglaQr,
  banglaQrHeading: "বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপের মাধ্যমে এই বাংলা কিউআর (Bangla QR) কোড স্ক্যান করে পেমেন্ট করুন",
  bkashNumber: "01612118307 (পার্সোনাল / মার্চেন্ট)",
  nagadNumber: "01612118307 (পার্সোনাল)",
  rocketNumber: "01612118307-7 (পার্সোনাল)",
  footerText: "BS E-Learning & IT Zone — আধুনিক একাডেমিক শিক্ষা ও প্র্যাকটিক্যাল আইটি স্কিল অর্জনের বিশ্বস্ত প্রতিষ্ঠান। অভিজ্ঞ শিক্ষক মণ্ডলী এবং ডিজিটাল ল্যাব সাপোর্ট।",
  footerCopyright: `© ${new Date().getFullYear()} BS E-Learning & IT Zone. সর্বস্বত্ব সংরক্ষিত।`,
  footerNotice: "ভর্তি ও পরীক্ষার সকল কার্যক্রম সরাসরি প্রধান শিক্ষক কর্তৃক অনুমোদিত।"
};

// Initial 3 Hero Slides
const initialSlides: HeroSlide[] = [
  {
    id: "slide-1",
    title: "BS E-Learning & IT Zone এ স্বাগতম",
    subText: "অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে বেসিক টু অ্যাডভান্সড একাডেমিক ও স্কিল ডেভেলপমেন্ট কোর্স। গড়ে তুলুন আপনার সফল ভবিষ্যৎ।",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    ctaText: "কোর্সসমূহ দেখুন",
    ctaAction: "courses",
    active: true
  },
  {
    id: "slide-2",
    title: "কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স (৬ মাস)",
    subText: "প্র্যাকটিক্যাল ল্যাব ও অনলাইন সাপোর্টে সরকারি সার্টিফিকেট অর্জনের অনন্য সুযোগ! সীমিত আসনে স্পেশাল অফার মূল্যে ভর্তি চলছে।",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    ctaText: "এখনই এনরোল করুন",
    ctaAction: "enroll",
    active: true
  },
  {
    id: "slide-3",
    title: "সহীহ কুরআন ও স্পোকেন ইংলিশ স্পেশাল ব্যাচ",
    subText: "সহজ ও প্রাঞ্জল পদ্ধতিতে তাজবীদ সহ কুরআন তিলাওয়াত এবং ফ্লুয়েন্ট স্পোকেন ইংলিশ দক্ষতা অর্জন করুন ঘরে বসেই।",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80",
    ctaText: "মাসিক ফি ও রুটিন",
    ctaAction: "fee",
    active: true
  }
];

// 13 Quick Action Shortcuts
const initialShortcuts: ShortcutItem[] = [
  { id: "sc-1", title: "কোর্সসমূহ", iconName: "BookOpen", badge: "১০টি কোর্স", color: "from-blue-600 to-indigo-700", target: "courses", enabled: true },
  { id: "sc-2", title: "নোটিস বোর্ড", iconName: "Bell", badge: "নতুন নোটিস", color: "from-amber-500 to-orange-600", target: "notice", enabled: true },
  { id: "sc-3", title: "ক্লাস রুটিন", iconName: "Calendar", badge: "লাইভ", color: "from-emerald-600 to-teal-700", target: "routine", enabled: true },
  { id: "sc-4", title: "গ্যালারি", iconName: "Image", badge: "ভিডিও ও ছবি", color: "from-purple-600 to-violet-700", target: "gallery", enabled: true },
  { id: "sc-5", title: "চ্যাটবট / হেল্প", iconName: "MessageSquare", badge: "২৪/৭ এআই", color: "from-cyan-600 to-blue-700", target: "chatbot", enabled: true },
  { id: "sc-6", title: "এডমিট কার্ড", iconName: "Ticket", badge: "পরীক্ষা", color: "from-rose-600 to-red-700", target: "admit", enabled: true },
  { id: "sc-7", title: "মাসিক ফি / পেমেন্ট", iconName: "CreditCard", badge: "বাংলা QR", color: "from-green-600 to-emerald-700", target: "fee", enabled: true },
  { id: "sc-8", title: "ফলাফল ও মার্কশিট", iconName: "BarChart3", badge: "অনলাইন রেজাল্ট", color: "from-indigo-600 to-blue-800", target: "marksheet", enabled: true },
  { id: "sc-9", title: "সার্টিফিকেট ডাউনলোড", iconName: "Award", badge: "অফিশিয়াল", color: "from-amber-600 to-yellow-600", target: "certificate", enabled: true },
  { id: "sc-10", title: "ফ্রি নোট ও সাজেশন", iconName: "FileText", badge: "পিডিএফ", color: "from-teal-600 to-cyan-700", target: "notes", enabled: true },
  { id: "sc-11", title: "ফ্রি ভিডিও ক্লাস", iconName: "PlayCircle", badge: "ডেমো লেকচার", color: "from-red-600 to-rose-700", target: "democlasses", enabled: true },
  { id: "sc-12", title: "আমাদের শিক্ষক", iconName: "Users", badge: "অভিজ্ঞ মেন্টর", color: "from-sky-600 to-blue-700", target: "mentors", enabled: true },
  { id: "sc-13", title: "প্রতিষ্ঠাতা ও ম্যানেজমেন্ট", iconName: "Award", badge: "পরিচালনা পরিষদ", color: "from-violet-600 to-purple-800", target: "founder", enabled: true },
  { id: "sc-14", title: "স্টুডেন্ট আইডি", iconName: "GraduationCap", badge: "আইডি কার্ড", color: "from-blue-700 to-indigo-800", target: "idcard", enabled: true },
];

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 14);
const offerExpiryISO = futureDate.toISOString();

// Complete 10 courses with individual logos, subjects, and exams
const initialCourses: Course[] = [
  {
    id: "course-quran",
    title: "সহীহ কুরআন শিক্ষা",
    logoUrl: DEFAULT_ASSETS.courseLogos.quran,
    duration: "ধারাবাহিক ব্যাচ",
    description: "সহজ পদ্ধতিতে তাজবীদ সহ সহীহ কুরআন তিলাওয়াত, মাখরাজ ও প্র্যাকটিক্যাল সূরা মুখস্থকরণ।",
    features: [
      "ভর্তি ফি: ৫০০ টাকা (প্রথম মাস সম্পূর্ণ অন্তর্ভুক্ত)",
      "দ্বিতীয় মাস থেকে নিয়মিত মাসিক ফি: ৫০০ টাকা",
      "সার্টিফিকেট সম্পূর্ণ ফ্রি (কোনো অতিরিক্ত চার্জ নেই)",
      "নারী ও পুরুষদের জন্য পৃথক ক্লাসের সুব্যবস্থা"
    ],
    admissionFee: 500,
    monthlyFee: 500,
    certificateFee: 0,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ৫০০ টাকা দিয়ে শুরু, দ্বিতীয় মাস থেকে মাসিক ৫০০ টাকা।",
    category: "ধর্মীয় ও নৈতিক শিক্ষা",
    subjects: ["হরফ ও মাখরাজ", "তাজবীদ রুলস", "মাদ্দ ও গুন্নাহ", "সূরা হিফজ ও তিলাওয়াত"],
    exams: ["মাখরাজ মূল্যায়ন", "তাজবীদ টেস্ট", "চূড়ান্ত তিলাওয়াত পরীক্ষা"]
  },
  {
    id: "course-ssc-acc",
    title: "এসএসসি হিসাববিজ্ঞান",
    logoUrl: DEFAULT_ASSETS.courseLogos.accounting,
    duration: "একাডেমিক পূর্ণাঙ্গ সেশন",
    description: "এসএসসি পরীক্ষার্থীদের হিসাববিজ্ঞানের সমস্ত অধ্যায় বেসিক থেকে সৃজনশীল ও নৈর্ব্যক্তিক সমাধান।",
    features: [
      "অফারমূল্যে ভর্তি ফি: ৮০০ টাকা (রেগুলার ১,০০০৳)",
      "মাসিক ফি: ৫০০ টাকা করে নিয়মিত প্রযোজ্য",
      "অধ্যায়ভিত্তিক বিশেষ হ্যান্ডনোট ও মডেল টেস্ট"
    ],
    admissionFee: 800,
    originalAdmissionFee: 1000,
    monthlyFee: 500,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 200,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ৮০০ টাকা (অফার), প্রতি মাসে নিয়মিত ৫০০ টাকা।",
    category: "একাডেমিক কোর্স",
    subjects: ["লেনদেন ও হিসাব সমীকরণ", "জাবেদা ও খতিয়ান", "রেওয়ামিল", "আর্থিক বিবরণী"],
    exams: ["অধ্যায়ভিত্তিক টেস্ট", "প্রাক-নির্বাচনী মডেল টেস্ট", "এসএসসি ফাইনাল প্রস্তুতি পরীক্ষা"]
  },
  {
    id: "course-hsc-acc",
    title: "এইচএসসি হিসাববিজ্ঞান",
    logoUrl: DEFAULT_ASSETS.courseLogos.accounting,
    duration: "এইচএসসি প্রথম ও দ্বিতীয় পত্র",
    description: "এইচএসসি হিসাববিজ্ঞান ১ম ও ২য় পত্রের কাঠিন্য দূর করে জিপিএ-৫ নিশ্চিতকরণ বিশেষ প্রোগ্রাম।",
    features: [
      "অফারমূল্যে ভর্তি ফি: ৮০০ টাকা (রেগুলার ১,০০০৳)",
      "মাসিক ফি: ৫০০ টাকা করে নিয়মিত প্রযোজ্য",
      "বিশ্ববিদ্যালয় ভর্তি পরীক্ষার বেসিক কভার"
    ],
    admissionFee: 800,
    originalAdmissionFee: 1000,
    monthlyFee: 500,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 200,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ৮০০ টাকা (অফার), প্রতি মাসে নিয়মিত ৫০০ টাকা।",
    category: "একাডেমিক কোর্স",
    subjects: ["হিসাববিজ্ঞান ১ম পত্র", "অংশীদারি কারবার", "কোম্পানির মূলধন", "উৎপাদন ব্যয় হিসাব"],
    exams: ["১ম পত্র ফাইনাল মডেল টেস্ট", "২য় পত্র ফাইনাল মডেল টেস্ট"]
  },
  {
    id: "course-class8-10-eng",
    title: "অষ্টম থেকে দশম শ্রেণি ইংরেজি",
    logoUrl: DEFAULT_ASSETS.courseLogos.english,
    duration: "ফুল একাডেমি সেশন",
    description: "ইংলিশ গ্রামার, রাইটিং এবং টেক্সটবুকের সমন্বয়ে দুর্বলতা দূরীকরণ ও বেসিক স্ট্রং করার কোর্স।",
    features: [
      "অফারমূল্যে ভর্তি ফি: ৮০০ টাকা (রেগুলার ১,০০০৳)",
      "মাসিক ফি: ৫০০ টাকা করে নিয়মিত প্রযোজ্য",
      "বেসিক ইংলিশ গ্রামার রুলস ও ভোকাবুলারি টেস্ট"
    ],
    admissionFee: 800,
    originalAdmissionFee: 1000,
    monthlyFee: 500,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 200,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ৮০০ টাকা (অফার), প্রতি মাসে নিয়মিত ৫০০ টাকা।",
    category: "একাডেমিক কোর্স",
    subjects: ["Grammar Fundamentals", "Right Form of Verbs", "Transformation", "Composition"],
    exams: ["Monthly Grammar Test", "Final Model Test"]
  },
  {
    id: "course-class8-10-math",
    title: "অষ্টম থেকে দশম শ্রেণি গণিত",
    logoUrl: DEFAULT_ASSETS.courseLogos.math,
    duration: "ফুল একাডেমিক সেশন",
    description: "গণিতের ভয় দূর করে প্রতিটি সূত্রের ব্যবহার ও জ্যামিতি-বীজগণিত-ত্রিকোণমিতিতে পূর্ণাঙ্গ দক্ষতা।",
    features: [
      "অফারমূল্যে ভর্তি ফি: ৮০০ টাকা (রেগুলার ১,০০০৳)",
      "মাসিক ফি: ৫০০ টাকা করে নিয়মিত প্রযোজ্য",
      "সহজ ও শর্টকাট টেকনিকে অঙ্ক সমাধান"
    ],
    admissionFee: 800,
    originalAdmissionFee: 1000,
    monthlyFee: 500,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 200,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ৮০০ টাকা (অফার), প্রতি মাসে নিয়মিত ৫০০ টাকা।",
    category: "একাডেমিক কোর্স",
    subjects: ["বীজগণিতীয় রাশি", "জ্যামিতি ও সম্পাদ্য", "ত্রিকোণমিতি ও পরিমিতি", "পরিসংখ্যান"],
    exams: ["জ্যামিতি মূল্যায়ন", "বীজগণিত টেস্ট", "ফাইনাল মডেল টেস্ট"]
  },
  {
    id: "course-math-eng-combo",
    title: "কম্বাইন অফার (গণিত + ইংরেজি একসাথে)",
    logoUrl: DEFAULT_ASSETS.courseLogos.general,
    duration: "সমন্বিত কম্বো কোর্স",
    description: "অষ্টম থেকে দশম শ্রেণির গণিত এবং ইংরেজি একসাথে সেরা ছাড়ে পড়ার সুবর্ণ সুযোগ।",
    features: [
      "ভর্তি ফি: ১,০০০ টাকা মাত্র",
      "পরবর্তী প্রতি মাসে মাসিক ফি: ৮০০ টাকা",
      "উভয় বিষয়ের স্পেশাল নোট ও প্রশ্নব্যাংক"
    ],
    admissionFee: 1000,
    monthlyFee: 800,
    certificateFee: 250,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ১,০০০ টাকা, প্রতি মাসে মাসিক ফি ৮০০ টাকা।",
    category: "স্পেশাল কম্বো অফার",
    subjects: ["গণিত বেসিক ও সৃজনশীল", "ইংরেজি গ্রামার ও রাইটিং"],
    exams: ["যৌথ মূল্যায়ন পরীক্ষা", "সেমিস্টার ফাইনাল"]
  },
  {
    id: "course-class1-7-all",
    title: "প্রথম থেকে সপ্তম শ্রেণির সকল বিষয়",
    logoUrl: DEFAULT_ASSETS.courseLogos.general,
    duration: "বছরব্যাপী ব্যাচ",
    description: "ছোট সোনামণিদের জন্য প্রতিটি বিষয়ের হাতেখড়ি, বাড়ির কাজ তদারকি ও নিয়মিত পরীক্ষা।",
    features: [
      "ভর্তি ফি: ১,০০০ টাকা",
      "প্রতি মাসে মাসিক ফি: ১,০০০ টাকা করে নিয়মিত প্রযোজ্য",
      "বাংলা, ইংরেজি, গণিত ও বিজ্ঞানে বিশেষ যত্ন"
    ],
    admissionFee: 1000,
    monthlyFee: 1000,
    certificateFee: 200,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ফি ১,০০০ টাকা, প্রতি মাসে মাসিক ফি ১,০০০ টাকা।",
    category: "প্রাথমিক ও জুনিয়র",
    subjects: ["বাংলা ও বানান", "প্রাথমিক গণিত", "ইংরেজি রিডিং ও রাইটিং", "সাধারণ বিজ্ঞান"],
    exams: ["প্রথম প্রান্তিক মূল্যায়ন", "দ্বিতীয় প্রান্তিক মূল্যায়ন", "বার্ষিক পরীক্ষা"]
  },
  {
    id: "course-computer-office",
    title: "কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস মেয়াদি)",
    logoUrl: DEFAULT_ASSETS.courseLogos.computer,
    duration: "৬ মাস (সরকারি মান)",
    description: "MS Word, Excel, PowerPoint, Access, Internet ও টাইপিংয়ে শতভাগ প্র্যাকটিক্যাল ট্রেনিং।",
    features: [
      "মোট কোর্স মূল্য: ৪,৫০০ টাকা | স্পেশাল অফার মূল্য: ৩,৫০০ টাকা",
      "প্রথমে ১,৫০০ টাকা দিয়ে ভর্তি হওয়া যাবে",
      "পরীক্ষা দেওয়ার সময় বাকি ফি পরিশোধ করতে হবে",
      "অনলাইন মার্কশিট-সার্টিফিকেটের পাশাপাশি সরকারি সার্টিফিকেট (Government Certificate) পাওয়ার বিশেষ সুবিধা"
    ],
    admissionFee: 1500,
    originalAdmissionFee: 4500,
    monthlyFee: 500,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 500,
    certificateFeeSecondTime: 0,
    hasGovtCert: true,
    paymentDetails: "ভর্তি ১,৫০০৳, পরীক্ষা পূর্বে বাকি কোর্স ফি, এবং সার্টিফিকেট ফি ৫০০৳।",
    category: "আইটি ও প্রফেশনাল",
    subjects: ["Computer Fundamentals & OS", "MS Word & Typing Speed", "MS Excel & Financial Formula", "MS PowerPoint & Access", "Internet & Email Communication"],
    exams: ["টাইপিং স্পিড টেস্ট", "এক্সেল প্র্যাকটিক্যাল ল্যাব", "কারিগরি বোর্ড ফাইনাল পরীক্ষা"]
  },
  {
    id: "course-spoken-english",
    title: "Spoken English (৪ মাস মেয়াদি)",
    logoUrl: DEFAULT_ASSETS.courseLogos.english,
    duration: "৪ মাস",
    description: "সহজ ভাষায় ফ্লুয়েন্ট স্পোকেন ইংলিশ, ব্রিটিশ প্রোনাউন্সিয়েশন এবং পাবলিক স্পিকিং প্র্যাকটিস।",
    features: [
      "মোট কোর্স মূল্য: ৪,০০০ টাকা",
      "শিক্ষার্থী চাইলে প্রথমে ২,০০০ টাকা দিয়ে ভর্তি হতে পারবে",
      "রিয়েল-টাইম কনভারসেশন ও প্রেজেন্টেশন সেশন"
    ],
    admissionFee: 2000,
    originalAdmissionFee: 4000,
    monthlyFee: 500,
    certificateFee: 300,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ২,০০০৳, বাকি ২,০০০৳ কোর্স চলাকালীন বা শেষে পরিশোধ।",
    category: "ভাষা ও যোগাযোগ",
    subjects: ["Pronunciation & Phonetics", "Daily Conversation Patterns", "Public Speaking & Presentation", "Listening & Accent Training"],
    exams: ["Oral Presentation Test", "Final Fluency Interview"]
  },
  {
    id: "course-basic-bangla-math-eng",
    title: "বাংলা, গণিত, ইংরেজি বেসিক কোর্স (৩ মাস মেয়াদি)",
    logoUrl: DEFAULT_ASSETS.courseLogos.general,
    duration: "৩ মাস মেয়াদি ফাউন্ডেশন",
    description: "যেকোনো বয়সের শিক্ষার্থীদের জন্য বাংলা উচ্চারণ-বানান, গণিতের নামতা-হিসাব ও ইংরেজির প্রাথমিক ভিত গড়ার কোর্স।",
    features: [
      "মোট কোর্স মূল্য: ৪,৫০০ টাকা (অফার মূল্য সহ)",
      "প্রথমে ২,০০০ টাকা দিয়ে ভর্তি হতে পারবে",
      "বাকি ২,৫০০ টাকা কিস্তিতে পরিশোধের সুবিধা"
    ],
    admissionFee: 2000,
    originalAdmissionFee: 5000,
    monthlyFee: 1000,
    offerTimerExpiry: offerExpiryISO,
    certificateFee: 500,
    certificateFeeSecondTime: 0,
    paymentDetails: "ভর্তি ২,০০০৳, ১ম মাসে ১,০০০৳, ২য় মাসে ১,০০০৳, সার্টিফিকেট উত্তোলনে ৫০০৳।",
    category: "ফাউন্ডেশন কোর্স",
    subjects: ["শুদ্ধ বাংলা উচ্চারণ ও বর্ণমালা", "সহজ গণিত ও নামতা", "ইংরেজি বেসিক শব্দ ও বাক্য"],
    exams: ["মৌখিক পরীক্ষা", "লিখিত বেসিক টেস্ট"]
  }
];

// Initial Mentors
const initialMentors: Mentor[] = [
  {
    id: "mentor-borhan",
    name: "বোরহানউদ্দিন মহিম",
    designation: "প্রতিষ্ঠাতা ও প্রধান শিক্ষক",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    qualifications: ["বি.বি.এ (অ্যাকাউন্টিং), এম.বি.এ (ফার্স্ট ক্লাস)", "ডিপ্লোমা ইন কম্পিউটার সায়েন্স & আইসিটি", "তাজবীদ ও হিফজ সার্টিফাইড ইন্সট্রাক্টর"],
    experience: "১০+ বছর সফল টিচিং ও আইটি ট্রেনিং অভিজ্ঞতা",
    specialist: ["সহীহ কুরআন শিক্ষা", "এসএসসি ও এইচএসসি হিসাববিজ্ঞান", "কম্পিউটার অফিস অ্যাপ্লিকেশন"],
    phone: "01612118307",
    whatsappNumber: "01612118307",
    email: "onlinetutionbyborhansir@gmail.com",
    bio: "বোরহানউদ্দিন মহিম BS E-Learning & IT Zone-এর প্রতিষ্ঠাতা ও প্রধান শিক্ষক। তিনি বিগত এক দশক ধরে হাজারো শিক্ষার্থীকে একাডেমিকে জিপিএ-৫ এবং আইটি খাতে সফল দক্ষ জনশক্তিতে রূপান্তর করেছেন।"
  },
  {
    id: "mentor-tahsin",
    name: "মো: তাহসিন আহমেদ",
    designation: "সিনিয়র ইংলিশ ফ্যাকাল্টি",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    qualifications: ["বি.এ (অনার্স), এম.এ (ইংরেজি সাহিত্য - ঢাবি)", "IELTS স্কোর: ৮.০"],
    experience: "৭ বছর ইংলিশ গ্রামার ও স্পোকেন ট্রেইনার",
    specialist: ["অষ্টম-দশম ইংরেজি", "Spoken English", "Phonetics & Vocabulary"],
    phone: "01710000001",
    whatsappNumber: "01710000001",
    email: "tahsin.eng@gmail.com",
    bio: "সহজ ও আনন্দদায়ক পদ্ধতিতে ইংরেজি ভাষা ও ব্যাকরণ শিক্ষাদানে পারদর্শী।"
  },
  {
    id: "mentor-arif",
    name: "ইঞ্জিনিয়ার আরিফুল ইসলাম",
    designation: "আইসিটি ও কম্পিউটার ট্রেইনার",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    qualifications: ["বি.এস.সি ইন সিএসই (ডুয়েট)", "কারিগরি শিক্ষা বোর্ড সার্টিফাইড ট্রেইনার"],
    experience: "৬ বছর আইসিটি ল্যাব পরিচালনা ও সফটওয়্যার ট্রেনিং",
    specialist: ["কম্পিউটার অফিস অ্যাপ্লিকেশন", "ডেটা এন্ট্রি", "গ্রাফিক্স বেসিকস"],
    phone: "01810000002",
    whatsappNumber: "01810000002",
    email: "arif.cse@gmail.com",
    bio: "হাতে-কলমে কম্পিউটার দক্ষতা বৃদ্ধি ও সরকারি সার্টিফিকেশনের জন্য প্রস্তুত করতে অভিজ্ঞ।"
  },
  {
    id: "mentor-sadia",
    name: "সাদিয়া আক্তার",
    designation: "গণিত ও প্রাইমারি বিভাগীয় প্রধান",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    qualifications: ["বি.এস.সি (অনার্স), এম.এস.সি (ফলিত গণিত)"],
    experience: "৫ বছর মাধ্যমিক গণিত পাঠদান অভিজ্ঞতা",
    specialist: ["অষ্টম থেকে দশম শ্রেণি গণিত", "১ম-৭ম শ্রেণির পাঠ্য বিষয়"],
    phone: "01910000003",
    whatsappNumber: "01910000003",
    email: "sadia.math@gmail.com",
    bio: "গণিতের জটিল সূত্রগুলোকে বাস্তব উদাহরণের মাধ্যমে সহজ করে উপস্থাপন করেন।"
  }
];

// Pre-seeded Students
const initialStudents: Student[] = [
  {
    id: "std-101",
    academicYear: "2026",
    courseId: "course-computer-office",
    roll: "101",
    name: "মোহাম্মদ আব্দুল্লাহ",
    fatherName: "রফিকুল ইসলাম",
    motherName: "নাসিমা বেগম",
    phone: "01712345678",
    address: "উত্তরা সেক্টর ৭, ঢাকা",
    trxId: "TRX987654321A",
    enrollmentDate: "2026-01-15",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    status: "active",
    hasPaidDues: true,
    admitCardBlocked: false
  },
  {
    id: "std-102",
    academicYear: "2026",
    courseId: "course-ssc-acc",
    roll: "102",
    name: "ফাতেমা তুজ জোহরা",
    fatherName: "আবুল কালাম",
    motherName: "শাহনাজ পারভীন",
    phone: "01812345679",
    address: "মিরপুর ১০, ঢাকা",
    trxId: "TRX887654321B",
    enrollmentDate: "2026-02-01",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    status: "active",
    hasPaidDues: true,
    admitCardBlocked: false
  },
  {
    id: "std-103",
    academicYear: "2026",
    courseId: "course-quran",
    roll: "103",
    name: "তানভীর হাসান",
    fatherName: "মো: কামরুল হাসান",
    motherName: "রোকেয়া বেগম",
    phone: "01912345680",
    address: "টঙ্গী, গাজীপুর",
    trxId: "TRX787654321C",
    enrollmentDate: "2026-02-10",
    photoUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
    status: "active",
    hasPaidDues: true,
    admitCardBlocked: false
  },
  {
    id: "std-104",
    academicYear: "2026",
    courseId: "course-math-eng-combo",
    roll: "104",
    name: "নুসরাত জাহান",
    fatherName: "জহিরুল হক",
    motherName: "নাজমিন আক্তার",
    phone: "01612345681",
    address: "মোহাম্মদপুর, ঢাকা",
    trxId: "TRX687654321D",
    enrollmentDate: "2026-02-15",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    status: "active",
    hasPaidDues: false,
    admitCardBlocked: true,
    blockedReason: "মাসিক ফি বকেয়া থাকায় এডমিট কার্ড স্থগিত রয়েছে।"
  }
];

// Pre-seeded Applications Queue for Bangla QR Payments
const initialApplications: EnrollmentApplication[] = [
  {
    id: "app-201",
    type: "admission",
    courseId: "course-computer-office",
    academicYear: "2026",
    studentName: "সাকিব আল হাসান",
    phone: "01755112233",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    fatherName: "মোঃ হাসান আলী",
    motherName: "মমতাজ বেগম",
    address: "উত্তরা, ঢাকা",
    amount: 1500,
    trxId: "QR998877A1",
    status: "pending",
    appliedDate: "2026-04-12"
  },
  {
    id: "app-202",
    type: "monthly",
    courseId: "course-ssc-acc",
    academicYear: "2026",
    roll: "102",
    studentName: "ফাতেমা তুজ জোহরা",
    phone: "01812345679",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    month: "এপ্রিল ২০২৬",
    amount: 500,
    trxId: "QR554433B2",
    status: "pending",
    appliedDate: "2026-04-13"
  }
];

// Pre-seeded Routine Items
const initialRoutines: RoutineItem[] = [
  { id: "r-1", academicYear: "2026", courseId: "course-computer-office", day: "শনিবার ও মঙ্গলবার", time: "সন্ধ্যা ০৭:০০ - ০৮:৩০", subject: "MS Word & Typing Practice", teacherName: "ইঞ্জিনিয়ার আরিফুল ইসলাম", room: "কম্পিউটার ল্যাব-১" },
  { id: "r-2", academicYear: "2026", courseId: "course-computer-office", day: "রবিবার ও বুধবার", time: "সন্ধ্যা ০৭:০০ - ০৮:৩০", subject: "MS Excel & Financial Formula", teacherName: "বোরহানউদ্দিন মহিম", room: "কম্পিউটার ল্যাব-১" },
  { id: "r-3", academicYear: "2026", courseId: "course-ssc-acc", day: "শনিবার, সোমবার, বুধবার", time: "বিকাল ০৪:০০ - ০৫:৩০", subject: "জাবেদা ও খতিয়ান সৃজনশীল", teacherName: "বোরহানউদ্দিন মহিম", room: "রুম ২০২" },
  { id: "r-4", academicYear: "2026", courseId: "course-quran", day: "প্রতিদিন (শুক্র বাদে)", time: "সকাল ০৬:৩০ - ০৭:৩০", subject: "তাজবীদ ও সহীহ তিলাওয়াত", teacherName: "বোরহানউদ্দিন মহিম", room: "অনলাইন জুমে" },
  { id: "r-5", academicYear: "2026", courseId: "course-math-eng-combo", day: "রবিবার ও বৃহস্পতিবার", time: "বিকাল ০৫:০০ - ০৬:৩০", subject: "গণিত জ্যামিতি ও ত্রিকোণমিতি", teacherName: "সাদিয়া আক্তার", room: "রুম ২০১" },
  { id: "r-6", academicYear: "2026", courseId: "course-spoken-english", day: "শুক্রবার ও সোমবার", time: "রাত ০৮:০০ - ০৯:৩০", subject: "Daily Life Conversations", teacherName: "মো: তাহসিন আহমেদ", room: "ইংলিশ লাউঞ্জ" }
];

// Pre-seeded Results
const initialResults: ResultRecord[] = [
  {
    id: "res-101",
    academicYear: "2026",
    courseId: "course-computer-office",
    roll: "101",
    studentName: "মোহাম্মদ আব্দুল্লাহ",
    fatherName: "রফিকুল ইসলাম",
    motherName: "নাসিমা বেগম",
    examType: "মিড-টার্ম অ্যাসেসমেন্ট",
    published: true,
    date: "2026-03-20",
    marks: [
      { subject: "কম্পিউটার ফান্ডামেন্টাল ও উইন্ডোজ", obtained: 92, total: 100, grade: "A+", gpa: 5.0 },
      { subject: "মাইক্রোসফট ওয়ার্ড ও বাংলা টাইপিং", obtained: 88, total: 100, grade: "A+", gpa: 5.0 },
      { subject: "মাইক্রোসফট এক্সেল ও ফর্মুলা", obtained: 85, total: 100, grade: "A+", gpa: 5.0 },
      { subject: "ব্যবহারিক ও মৌখিক পরীক্ষা", obtained: 95, total: 100, grade: "A+", gpa: 5.0 }
    ],
    totalMarks: 360,
    gpa: 5.0,
    grade: "A+"
  },
  {
    id: "res-102",
    academicYear: "2026",
    courseId: "course-ssc-acc",
    roll: "102",
    studentName: "ফাতেমা তুজ জোহরা",
    fatherName: "আবুল কালাম",
    motherName: "শাহনাজ পারভীন",
    examType: "মডেল টেস্ট ২০২৬",
    published: true,
    date: "2026-03-25",
    marks: [
      { subject: "হিসাববিজ্ঞান ১ম পত্র (সৃজনশীল)", obtained: 64, total: 70, grade: "A+", gpa: 5.0 },
      { subject: "হিসাববিজ্ঞান ১ম পত্র (এমসিকিউ)", obtained: 27, total: 30, grade: "A+", gpa: 5.0 }
    ],
    totalMarks: 91,
    gpa: 5.0,
    grade: "A+"
  }
];

// Pre-seeded Admit Cards with Fee-Control and Blocking Logic
const initialAdmitCards: AdmitCardRecord[] = [
  {
    id: "adm-101",
    academicYear: "2026",
    courseId: "course-computer-office",
    roll: "101",
    studentName: "মোহাম্মদ আব্দুল্লাহ",
    fatherName: "রফিকুল ইসলাম",
    motherName: "নাসিমা বেগম",
    examType: "ফাইনাল প্র্যাকটিক্যাল ও থিওরি পরীক্ষা ২০২৬",
    examDate: "২৫ মে ২০২৬, সকাল ১০:০০ টা",
    examCenter: "BS IT Zone ডিজিটাল কম্পিউটার ল্যাব, ঢাকা",
    published: true,
    instructions: [
      "পরীক্ষার শুরুর ৩০ মিনিট পূর্বে কেন্দ্রে উপস্থিত হতে হবে।",
      "এডমিট কার্ডের মূল কপি পরীক্ষা কক্ষে সাথে রাখা বাধ্যতামূলক।",
      "কোনো প্রকার মোবাইল ফোন বা ডিজিটাল ডিভাইস পরীক্ষা কক্ষে নিষিদ্ধ।"
    ],
    feeCleared: true,
    isBlocked: false
  },
  {
    id: "adm-102",
    academicYear: "2026",
    courseId: "course-ssc-acc",
    roll: "102",
    studentName: "ফাতেমা তুজ জোহরা",
    fatherName: "আবুল কালাম",
    motherName: "শাহনাজ পারভীন",
    examType: "এসএসসি ফাইনাল প্রস্তুতি মডেল টেস্ট",
    examDate: "২৮ মে ২০২৬, সকাল ১০:০০ টা",
    examCenter: "BS E-Learning মূল ক্যাম্পাস, হল রুম-০১",
    published: true,
    instructions: [
      "সঠিক রোল ও রেজিস্ট্রেশন নম্বর ওএমআর শিটে পূরণ করতে হবে।",
      "ক্যালকুলেটর ব্যবহার বিধিসম্মত সাধারণ সায়েন্টিফিক মডেল হতে হবে।"
    ],
    feeCleared: true,
    isBlocked: false
  },
  {
    id: "adm-104",
    academicYear: "2026",
    courseId: "course-math-eng-combo",
    roll: "104",
    studentName: "নুসরাত জাহান",
    fatherName: "জহিরুল হক",
    motherName: "নাজমিন আক্তার",
    examType: "অর্ধবার্ষিক মূল্যায়ন পরীক্ষা ২০২৬",
    examDate: "৩০ মে ২০২৬, সকাল ১০:০০ টা",
    examCenter: "BS E-Learning মূল ক্যাম্পাস, ঢাকা",
    published: true,
    instructions: [
      "বকেয়া ফি পরিশোধপূর্বক এডমিট কার্ড সচল করতে হবে।"
    ],
    feeCleared: false,
    isBlocked: true,
    blockedReason: "ফি বকেয়া থাকার কারণে এডমিট কার্ড স্থগিত রাখা হয়েছে। দ্রুত অফিসে যোগাযোগ করে বকেয়া পরিশোধ করুন।"
  }
];

// Pre-seeded Certificates with Admin Fee Control & Unlimited Re-download logic
const initialCertificates: CertificateRecord[] = [
  {
    id: "cert-101",
    academicYear: "2026",
    courseId: "course-computer-office",
    roll: "101",
    studentName: "মোহাম্মদ আব্দুল্লাহ",
    fatherName: "রফিকুল ইসলাম",
    motherName: "নাসিমা বেগম",
    address: "উত্তরা, ঢাকা",
    issueDate: "2026-04-10",
    certificateNo: "BS-IT-2026-00101",
    grade: "A+ (অসাধারণ)",
    isFirstIssue: false,
    feePaid: true,
    isFree: false,
    feeAmount: 500,
    hasEverPaid: true, // Already paid! All subsequent downloads are 100% FREE!
    hasGovtCert: true
  },
  {
    id: "cert-103",
    academicYear: "2026",
    courseId: "course-quran",
    roll: "103",
    studentName: "তানভীর হাসান",
    fatherName: "মো: কামরুল হাসান",
    motherName: "রোকেয়া বেগম",
    address: "টঙ্গী, গাজীপুর",
    issueDate: "2026-04-12",
    certificateNo: "BS-QR-2026-00103",
    grade: "মুমতাজ (Excellent)",
    isFirstIssue: true,
    feePaid: true,
    isFree: true, // Always completely free
    feeAmount: 0,
    hasEverPaid: true,
    hasGovtCert: false
  }
];

// Initial Financial Ledger
const initialLedger: LedgerItem[] = [
  { id: "leg-1", type: "income", category: "ভর্তি ফি", description: "মোহাম্মদ আব্দুল্লাহ - কম্পিউটার অফিস অ্যাপ্লিকেশন", amount: 1500, date: "2026-01-15", academicYear: "2026" },
  { id: "leg-2", type: "income", category: "ভর্তি ফি", description: "ফাতেমা তুজ জোহরা - এসএসসি হিসাববিজ্ঞান", amount: 800, date: "2026-02-01", academicYear: "2026" },
  { id: "leg-3", type: "income", category: "ভর্তি ফি", description: "তানভীর হাসান - সহীহ কুরআন শিক্ষা", amount: 500, date: "2026-02-10", academicYear: "2026" },
  { id: "leg-4", type: "income", category: "মাসিক ফি", description: "রোল ১০২ - ফেব্রুয়ারি মাসের নিয়মিত ফি", amount: 500, date: "2026-03-05", academicYear: "2026" },
  { id: "leg-5", type: "expense", category: "ল্যাব ও ইন্টারনেট", description: "হাই-স্পিড ব্রডব্যান্ড বিল ও বিদ্যুৎ বিল", amount: 2200, date: "2026-03-10", academicYear: "2026" },
  { id: "leg-6", type: "expense", category: "মুদ্রণ ও স্টেশনারি", description: "এডমিট কার্ড, প্রশ্নপত্র ও খাতা প্রিন্টিং", amount: 1200, date: "2026-03-15", academicYear: "2026" },
  { id: "leg-7", type: "income", category: "সার্টিফিকেট ফি", description: "রোল ১০১ - সরকারি সনদ প্রসেসিং ফি", amount: 500, date: "2026-04-05", academicYear: "2026" }
];

// Initial Notices with PDF support
const initialNotices: NoticeItem[] = [
  {
    id: "not-1",
    title: "২০২৬ শিক্ষাবর্ষে সকল কোর্সে বিশেষ ছাড়ে ভর্তি চলছে!",
    date: "১০ এপ্রিল ২০২৬",
    content: "BS E-Learning & IT Zone-এ ২০২৬ সেশনের নতুন ব্যাচে সীমিত আসনে অফার মূল্যে ভর্তি চলছে। কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সে অফার ফি ৩,৫০০৳ (প্রথমে ১,৫০০৳), এসএসসি/এইচএসসি হিসাববিজ্ঞানে অফার ভর্তি ফি ৮০০৳। বিস্তারিত তথ্যের জন্য আমাদের হটলাইনে যোগাযোগ করুন।",
    images: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
    ],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    pinned: true
  },
  {
    id: "not-2",
    title: "কম্পিউটার অফিস অ্যাপ্লিকেশন ল্যাব ক্লাস শিডিউল ও পরীক্ষা নোটিস",
    date: "১২ এপ্রিল ২০২৬",
    content: "আগামী শনিবার থেকে কম্পিউটার ল্যাব প্র্যাকটিক্যাল সেশন সন্ধ্যা ৭:০০ টা থেকে শুরু হবে। সকল শিক্ষার্থীকে সময়মতো ক্লাসে উপস্থিত থাকতে এবং আইডি কার্ড সাথে রাখার নির্দেশ দেওয়া হচ্ছে।",
    images: [],
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pinned: false
  }
];

// Initial Gallery Items
const initialGallery: GalleryItem[] = [
  { id: "gal-1", title: "কম্পিউটার প্র্যাকটিক্যাল ল্যাব সেশন", type: "image", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80", category: "ল্যাব ক্লাস", date: "২০২৬" },
  { id: "gal-2", title: "কুরআন শিক্ষা ব্যাচের সমাপ্তি ও দোয়া মাহফিল", type: "image", url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80", category: "অনুষ্ঠান", date: "২০২৬" },
  { id: "gal-3", title: "মেধাবী শিক্ষার্থীদের মাঝে সনদ ও পুরস্কার বিতরণী", type: "image", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80", category: "পুরস্কার বিতরণ", date: "২০২৬" },
  { id: "gal-4", title: "সরাসরি শিক্ষক-শিক্ষার্থী মতবিনিময় সভার ঝলক", type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", category: "ভিডিও লেকচার", date: "২০২৬" }
];

// Initial Free Notes with Image & PDF support
const initialNotes: FreeNoteItem[] = [
  {
    id: "fn-1",
    title: "এসএসসি হিসাববিজ্ঞান: জাবেদা ও রেওয়ামিল শর্টকাট সুপার নোট",
    subject: "হিসাববিজ্ঞান",
    classOrCourse: "এসএসসি ২০২৬",
    description: "সহজ নিয়ম ও শর্টকাট কৌশল সম্বলিত পিডিএফ লেকচার নোট। পরীক্ষায় শতভাগ কমন পাওয়ার উপযোগী।",
    previewImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "2.4 MB PDF",
    date: "২০২৬"
  },
  {
    id: "fn-2",
    title: "কম্পিউটার অফিস অ্যাপ্লিকেশন: শর্টকাট কি & এক্সেলে দরকারি ফর্মুলা শিট",
    subject: "কম্পিউটার বেসিক",
    classOrCourse: "৬ মাস মেয়াদি",
    description: "সবচেয়ে বেশি ব্যবহৃত ৫০টি কিবোর্ড শর্টকাট ও ভি-লুকআপ, সাম-ইফ ফর্মুলার পূর্ণাঙ্গ হ্যান্ডনোট।",
    previewImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "1.8 MB PDF",
    date: "২০২৬"
  },
  {
    id: "fn-3",
    title: "দৈনন্দিন জীবনে বহুল ব্যবহৃত ১০০টি Spoken English স্ট্রাকচার",
    subject: "ইংরেজি ভাষা",
    classOrCourse: "Spoken English",
    description: "অনর্গল ইংরেজিতে কথা বলার জন্য প্রয়োজনীয় বাক্য গঠন পদ্ধতি ও ভোকাবুলারি ব্যাংক।",
    previewImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "3.1 MB PDF",
    date: "২০২৬"
  }
];

// Initial Demo Classes with YouTube & Facebook Video Support
const initialDemoClasses: DemoClassItem[] = [
  {
    id: "dc-1",
    title: "সহীহ কুরআন শিক্ষা: মাখরাজের নিয়ম ও সহজ উচ্চারণ পদ্ধতি",
    courseId: "course-quran",
    instructor: "বোরহানউদ্দিন মহিম",
    duration: "২৫ মিনিট",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80",
    description: "আরবি ২৯টি হরফের সঠিক উচ্চারণ ও ক্বারিয়ানা ভঙ্গিতে তিলাওয়াত শেখার ১ম লেকচার।"
  },
  {
    id: "dc-2",
    title: "কম্পিউটার অফিস অ্যাপ্লিকেশন: এক্সেল ম্যাজিক ও অটো-ক্যালকুলেশন ট্রিক",
    courseId: "course-computer-office",
    instructor: "বোরহানউদ্দিন মহিম",
    duration: "৩০ মিনিট",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    description: "অফিসে কাজ করার জন্য এক্সেল ফর্মুলা ও মার্কশিট তৈরির সহজ টেকনিক শিখুন।"
  },
  {
    id: "dc-3",
    title: "এসএসসি হিসাববিজ্ঞান: রেওয়ামিল প্রস্তুতের সহজ ৫টি নিয়ম",
    courseId: "course-ssc-acc",
    instructor: "বোরহানউদ্দিন মহিম",
    duration: "২০ মিনিট",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    description: "কোন কোন ভুল রেওয়ামিলে ধরা পড়ে না এবং কীভাবে এক দেখায় রেওয়ামিল মেলাবেন।"
  }
];

// Dedicated AI Chatbot Settings for "BS Learning & IT Zone"
const initialChatbot: ChatbotSettings = {
  botName: "BS Learning নিজস্ব AI সহকারী",
  welcomeMessage: `আসসালামু আলাইকুম! আমি "BS Learning & IT Zone"-এর নিজস্ব স্মার্ট এআই সহকারী।

ওয়েবসাইটের যেকোনো কোর্স ফি, নোটিস, হ্যান্ডনোট, পরীক্ষার রুটিন বা নিয়মাবলী জানতে আমাকে প্রশ্ন করতে পারেন। এছাড়া যেকোনো জটিল অংক বা গণিত (যোগ, বিয়োগ, গুণ, ভাগ, বর্গমূল, শতকরা) মুহূর্তেই সমাধান করে দিতে পারি!`,
  basePrompt: `আপনি "BS Learning & IT Zone"-এর নিজস্ব ডেডিকেটেড স্মার্ট এআই অ্যাসিস্ট্যান্ট।
প্রতিষ্ঠাতা ও প্রধান শিক্ষক: বোরহানউদ্দিন মহিম।
পেমেন্ট সিস্টেম: যেকোনো ব্যাংকিং অ্যাপ, বিকাশ বা নগদ দিয়ে আমাদের "বাংলা কিউআর (Bangla QR)" স্ক্যান করে পেমেন্ট করা যায়।

আপনার দায়িত্বসমূহ:
১. এই ওয়েবসাইটের সমস্ত নিজস্ব তথ্য (নোটিস, হ্যান্ডনোট, কোর্স ফি, পরীক্ষার রুটিন, ফলাফল, সার্টিফিকেট) নির্ভুলভাবে উত্তর দেওয়া।
২. শিক্ষার্থীদের গণিত ও হিসাবের সমস্যার তাৎক্ষণিক সমাধান করা (যেমন: যোগ, বিয়োগ, গুণ, ভাগ, বর্গমূল, শতকরা ইত্যাদি বিল্ট-ইন সমাধান করে দেখানো)।
৩. অ্যাডমিনের প্রদানকৃত ৫০,০০০ শব্দের নলেজবেস ও তথ্য বক্সসমূহ থেকে নিখুঁত তথ্য প্রদান করা।`,
  knowledgeBaseText: `[১. প্রতিষ্ঠান পরিচিতি ও লক্ষ্য]
BS E-Learning & IT Zone একটি আধুনিক ও সরকারি মানসম্পন্ন শিক্ষা প্রতিষ্ঠান। আমাদের প্রধান লক্ষ্য শিক্ষার্থীদের প্রাতিষ্ঠানিক সিলেবাসের পাশাপাশি সময়োপযোগী প্র্যাকটিক্যাল আইটি দক্ষতা ও নৈতিক শিক্ষায় দক্ষ করে গড়ে তোলা।

[২. সুযোগ্য পরিচালনা ও শিক্ষক পরিষদ]
আমাদের প্রতিষ্ঠাতা ও প্রধান শিক্ষক জনাব বোরহানউদ্দিন মহিম। তিনি দীর্ঘ এক দশকেরও বেশি সময় ধরে শিক্ষকতা পেশায় সফলতার সাথে হাজারো শিক্ষার্থীকে জিপিএ-৫ এবং আইটি ফিল্ডে দক্ষ ফ্রিল্যান্সার হিসেবে গড়ে তুলেছেন। প্রতিটি শিক্ষার্থীর পড়ার অগ্রগতি তিনি ব্যক্তিগতভাবে তদারকি করেন।

[৩. চলমান কোর্সসমূহ ও অফার ফি নির্দেশিকা]
১. সহীহ কুরআন শিক্ষা কোর্স: ভর্তি ফি মাত্র ৫০০ টাকা (১ম মাস ফ্রি ক্লাস অন্তর্ভুক্ত), পরবর্তীতে মাসিক ফি ৫০০ টাকা। এই কোর্সের সার্টিফিকেট আজীবন সম্পূর্ণ ফ্রি!
২. এসএসসি হিসাববিজ্ঞান: স্পেশাল অফার ভর্তি ফি ৮০০ টাকা (রেগুলার ১,০০০৳)। মাসিক ফি ৫০০ টাকা।
৩. এইচএসসি হিসাববিজ্ঞান: স্পেশাল অফার ভর্তি ফি ৮০০ টাকা (রেগুলার ১,২০০৳)। মাসিক ফি ৫০০ টাকা।
৪. অষ্টম-দশম ইংরেজি একাডেমিক: ভর্তি ফি ৮০০ টাকা, মাসিক ফি ৫০০ টাকা।
৫. অষ্টম-দশম গণিত একাডেমিক: ভর্তি ফি ৮০০ টাকা, মাসিক ফি ৫০০ টাকা।
৬. গণিত ও ইংরেজি স্পেশাল কম্বো: ভর্তি ফি ১,২০০ টাকা, মাসিক ফি ৮০০ টাকা।
৭. ১ম থেকে ৭ম শ্রেণি সকল বিষয়: ভর্তি ফি ৮০০ টাকা, মাসিক ফি ৫০০ টাকা।
৮. কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস): অফার ভর্তি ফি মাত্র ১,৫০০ টাকা (প্রকৃত কোর্স ফি ৩,৫০০৳)। পরীক্ষা দেওয়ার পূর্বে বাকি ফি ও সরকারি সনদ ফি ৫০০ টাকা।
৯. Spoken English (৪ মাস): ভর্তি ফি ১,০০০ টাকা, মাসিক ফি ৫০০ টাকা।
১০. বেসিক ফাউন্ডেশন কোর্স (বাংলা, গণিত, ইংরেজি - ৩ মাস): ভর্তি ফি ১,০০০ টাকা।

[৪. বাংলা কিউআর (Bangla QR) পেমেন্ট নিয়ম]
আমাদের প্রতিষ্ঠানে ইন্টারঅপারেবল বাংলা কিউআর ব্যবহৃত হয়। বিকাশ, নগদ, রকেট, উপায় বা দেশের যেকোনো ব্যাংকিং অ্যাপ (City Touch, NexusPay, Cellfin, BRAC Astha ইত্যাদি) দিয়ে ওয়েবসাইট বা নোটিসে থাকা কিউআর কোড স্ক্যান করে সরাসরি ভর্তি ফি ও মাসিক ফি দেওয়া যায়। পেমেন্টের ট্রানজেকশন আইডি (TrxID) ভর্তি ফর্ম বা ফি ফর্মে সাবমিট করলেই স্বয়ংক্রিয়ভাবে আবেদন পেন্ডিং তালিকায় চলে আসে।

[৫. এডমিট কার্ড ও পরীক্ষা নিয়মাবলী]
প্রতিটি সেমিস্টার বা চূড়ান্ত পরীক্ষার পূর্বে এডমিট কার্ড প্রকাশিত হয়। শিক্ষার্থীদের নিয়মিত মাসিক ফি পরিশোধ থাকতে হবে। কোনো বকেয়া না থাকলে অ্যাডমিন প্যানেল থেকে এডমিট কার্ড সক্রিয় করা হয় এবং শিক্ষার্থীরা ওয়েবসাইট থেকে রোল দিয়ে কালার এডমিট কার্ড প্রিন্ট বা ডাউনলোড করতে পারে।

[৬. সার্টিফিকেট ও ভেরিফিকেশন]
কোর্স সমাপ্তির পর শিক্ষার্থীরা অনলাইন থেকে রোল সার্চ করে কিউআর কোড এবং অফিশিয়াল সিল-স্বাক্ষর সম্বলিত সার্টিফিকেট প্রিভিউ ও ডাউনলোড করতে পারেন। একবার সার্টিফিকেট ফি পরিশোধ করলে পরবর্তীতে যেকোনো সময় সম্পূর্ণ বিনামূল্যে আজীবন রি-ডাউনলোড করা যায়।`,
  infoBlocks: [
    {
      id: "info-1",
      title: "ভর্তি ও অনলাইন পেমেন্ট নির্দেশিকা",
      category: "ভর্তি ও পেমেন্ট",
      content: "অনলাইনে ভর্তি হতে কোর্সের পাশে 'ভর্তি হন' বাটনে ক্লিক করুন। এরপর প্রদর্শিত 'বাংলা কিউআর' স্ক্যান করে আপনার বিকাশ/নগদ/ব্যাংক অ্যাপ দিয়ে ফি প্রদান করুন এবং TrxID দিয়ে ফর্মটি সাবমিট করুন। অ্যাডমিন ভেরিফাই করার সাথে সাথেই আপনার ডাটাবেজ এন্ট্রি ও আইডি কার্ড তৈরি হয়ে যাবে।",
      keywords: ["ভর্তি", "পেমেন্ট", "অনলাইন ভর্তি", "কিউআর", "নগদ", "বিকাশ"],
      isActive: true
    },
    {
      id: "info-2",
      title: "কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স বিবরণী",
      category: "কোর্স তথ্য",
      content: "কম্পিউটার অফিস অ্যাপ্লিকেশন ৬ মাস মেয়াদী সরকারি মানসম্পন্ন কোর্স। এতে এমএস ওয়ার্ড, এক্সেল, পাওয়ারপয়েন্ট, অ্যাক্সেস, ইন্টারনেট ব্রাউজিং ও বাংলা-ইংরেজি টাইপিং শেখানো হয়। অফার ভর্তি ফি মাত্র ১,৫০০ টাকা। কোর্স শেষে সরকারি অনুমোদিত সার্টিফিকেট প্রদান করা হয়।",
      keywords: ["কম্পিউটার", "computer", "অফিস", "ওয়ার্ড", "এক্সেল", "সার্টিফিকেট"],
      isActive: true
    },
    {
      id: "info-3",
      title: "এডমিট কার্ড ডাউনলোড ও প্রিন্ট সমস্যা সমাধান",
      category: "এডমিট কার্ড",
      content: "এডমিট কার্ড ডাউনলোড করতে সমস্যা হলে নিশ্চিত করুন আপনার চলতি মাসের কোনো ফি বকেয়া নেই। ফি ক্লিয়ার থাকা সত্ত্বেও এডমিট ব্লক দেখালে হটলাইনে (01612118307) যোগাযোগ করে অ্যাডমিনকে আনব্লক করার অনুরোধ করুন। আনব্লক হওয়ার সাথে সাথেই আপনি প্রিন্ট করতে পারবেন।",
      keywords: ["এডমিট", "admit", "ব্লক", "ডাউনলোড", "পরীক্ষা", "রোল"],
      isActive: true
    },
    {
      id: "info-4",
      title: "সহীহ কুরআন শিক্ষা ও তাজবীদ কোর্স",
      category: "ধর্মীয় কোর্স",
      content: "সহীহ কুরআন শিক্ষা কোর্সে বিশুদ্ধ মাখরাজ, তাজবীদ, নামাজ শিক্ষা ও মাসয়ালা শেখানো হয়। এই কোর্সে ভর্তি ফি মাত্র ৫০০ টাকা (১ম মাস ফ্রি ক্লাস) এবং পরবর্তীতে মাসিক ফি ৫০০ টাকা। এই কোর্সের সার্টিফিকেট আজীবন সম্পূর্ণ ফ্রি!",
      keywords: ["কুরআন", "কোরআন", "তাজবীদ", "মাখরাজ", "quran", "নামাজ"],
      isActive: true
    }
  ],
  faqs: [
    {
      id: "faq-1",
      question: "কী কী কোর্স চালু আছে?",
      answer: "আমাদের প্রতিষ্ঠানে মোট ১০টি কোর্স চলমান: ১) সহীহ কুরআন শিক্ষা ২) এসএসসি হিসাববিজ্ঞান ৩) এইচএসসি হিসাববিজ্ঞান ৪) অষ্টম-দশম ইংরেজি ৫) অষ্টম-দশম গণিত ৬) গণিত+ইংরেজি কম্বো ৭) ১ম-৭ম শ্রেণির সকল বিষয় ৮) কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস) ৯) Spoken English (৪ মাস) এবং ১০) বাংলা, গণিত, ইংরেজি বেসিক কোর্স (৩ মাস)।",
      keywords: ["কোর্স", "কোর্সসমূহ", "course", "courses", "কি কি কোর্স", "তালিকা"]
    },
    {
      id: "faq-2",
      question: "পেমেন্ট কীভাবে করব এবং বাংলা কিউআর কী?",
      answer: "আমাদের ওয়েবসাইট থেকে ভর্তি বা মাসিক ফি পরিশোধের জন্য 'বাংলা কিউআর (Bangla QR)' ব্যবহার করা হয়। আপনি আপনার বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপ দিয়ে বাংলা কিউআর কোডটি স্ক্যান করে সহজে পেমেন্ট করতে পারবেন। পেমেন্টের পর প্রাপ্ত TrxID ফর্মে লিখে সাবমিট করুন।",
      keywords: ["পেমেন্ট", "কিউআর", "qr", "bangla qr", "বাংলা কিউআর", "ফি"]
    },
    {
      id: "faq-3",
      question: "এডমিট কার্ড ডাউনলোড করতে পারছি না কেন?",
      answer: "এডমিট কার্ড পেতে হলে আপনার কোনো মাসিক বা পরীক্ষার বকেয়া ফি থাকা যাবে না। ফি পরিশোধ সম্পন্ন হলে অ্যাডমিন অনুমোদনের পর আপনি রোল নম্বর দিয়ে সরাসরি প্রবেশপত্র ডাউনলোড ও প্রিন্ট করতে পারবেন।",
      keywords: ["এডমিট", "admit", "ব্লক", "স্থগিত", "ডাউনলোড"]
    },
    {
      id: "faq-4",
      question: "সার্টিফিকেট কি বারবার ডাউনলোড করা যায়?",
      answer: "হ্যাঁ! আপনি একবার নির্ধারিত ফি পরিশোধ করে (বা ফ্রি কোর্সের ক্ষেত্রে ফ্রিতে) সার্টিফিকেট ডাউনলোড করলে, পরবর্তীতে আপনার রোল দিয়ে যতবার খুশি সম্পূর্ণ ফ্রি-তে বারবার ডাউনলোড করতে পারবেন।",
      keywords: ["সার্টিফিকেট", "সনদ", "certificate", "ফ্রি ডাউনলোড"]
    }
  ],
  quickChips: [
    "কম্পিউটার কোর্সের ফি কত?",
    "২৫০ + ৩৫০ কত হয়?",
    "বাংলা কিউআর দিয়ে পেমেন্ট নিয়ম",
    "সহীহ কুরআন শিক্ষার ক্লাস সময়",
    "√৬২৫ এর বর্গমূল কত?",
    "নতুন কোনো নোটিস আছে?"
  ]
};

// Initial Credentials with Master PIN (6 to 11 digits)
const initialCredentials: AdminCredentials = {
  email: "onlinetutionbyborhansir@gmail.com",
  password: "01612118307",
  masterPin: "992288" // Master PIN (6 to 11 digits) for instant password recovery
};

// Automatic image compression utility for seals, signatures, logos & student photos.
// Compresses uploaded images to under 40KB so localStorage quota is never exceeded!
export const compressImage = (file: File | string, maxWidth = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof file === 'string') {
      if (file.startsWith('data:image/svg+xml') || file.length < 50000) {
        return resolve(file);
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxWidth) {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(typeof file === 'string' ? file : '');
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => {
      if (typeof file === 'string') resolve(file);
      else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

    if (typeof file === 'string') {
      img.src = file;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  });
};

class StorageService {
  private liveEventSource: EventSource | null = null;
  private currentDbVersion = 0;
  private unsubscribeFirestore: Unsubscribe | null = null;
  private isFirestoreReady = false;

  constructor() {
    this.initFirestoreSync();
    this.seedFirestoreIfEmpty();
    this.initLiveSync();
  }

  // 1. Firebase Firestore Real-Time Global Synchronization
  public initFirestoreSync() {
    if (typeof window === 'undefined') return;

    try {
      const colRef = collection(db, 'institute_data');
      this.unsubscribeFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          this.isFirestoreReady = true;
          let changedCount = 0;

          // Hydrate all documents on snapshot
          snapshot.docs.forEach((d) => {
            const key = d.id;
            const docData = d.data();
            if (docData && docData.data !== undefined) {
              this.setLocalSilently(key, docData.data);
              changedCount++;
            }
          });

          // Immediate notification on changes across application
          if (changedCount > 0 || !snapshot.empty) {
            window.dispatchEvent(
              new CustomEvent('bs_sync', {
                detail: { fromFirestore: true, count: changedCount }
              })
            );
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'institute_data');
        }
      );
    } catch (e) {
      console.warn('[Firestore] Real-time listener init notice:', e);
    }
  }

  // Push individual document to Firestore Cloud
  private async pushToFirestore<T>(key: string, value: T): Promise<void> {
    try {
      const docRef = doc(db, 'institute_data', key);
      await setDoc(
        docRef,
        {
          key,
          data: value,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `institute_data/${key}`);
    }
  }

  // Auto-seed Firestore on initial launch if empty
  public async seedFirestoreIfEmpty(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const colRef = collection(db, 'institute_data');
      const snap = await getDocs(colRef);
      if (snap.empty) {
        console.log('[Firestore] Seeding default institutional data to cloud...');
        const initialMap: Record<string, any> = {
          settings: initialSettings,
          slides: initialSlides,
          shortcuts: initialShortcuts,
          courses: initialCourses,
          mentors: initialMentors,
          students: initialStudents,
          routines: initialRoutines,
          results: initialResults,
          admit_cards: initialAdmitCards,
          certificates: initialCertificates,
          ledger: initialLedger,
          notices: initialNotices,
          notes: initialNotes,
          demo_classes: initialDemoClasses,
          gallery: initialGallery,
          chatbot: initialChatbot,
          applications: initialApplications,
          admin_creds: initialCredentials
        };

        for (const [k, v] of Object.entries(initialMap)) {
          await this.pushToFirestore(k, v);
        }
      }
    } catch (e) {
      console.warn('[Firestore] Seed check caught:', e);
    }
  }

  // Real-time synchronization across all browsers worldwide
  public initLiveSync() {
    if (typeof window === 'undefined') return;

    // 1. Initial hydration from server database
    this.hydrateFromServer();

    // 2. Establish live SSE stream as secondary channel
    try {
      this.liveEventSource = new EventSource('/api/live-sync');

      this.liveEventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SYNC_UPDATE' && payload.key) {
            this.setLocalSilently(payload.key, payload.value);
            window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: payload.key, value: payload.value, fromServer: true } }));
          } else if (payload.type === 'SYNC_ALL' || payload.type === 'AI_UPDATE') {
            this.hydrateFromServer();
          }
        } catch (e) {
          console.warn('[LiveSync] Message parse error:', e);
        }
      };
    } catch (e) {
      console.warn('[LiveSync] SSE setup error:', e);
    }

    // 3. Fallback polling every 5 seconds to guarantee 100% sync
    setInterval(() => {
      this.checkServerVersion();
    }, 5000);
  }

  private async checkServerVersion() {
    try {
      const res = await fetch('/api/sync/version');
      if (res.ok) {
        const { version } = await res.json();
        if (version && version > this.currentDbVersion) {
          this.hydrateFromServer();
        }
      }
    } catch {
      // Ignored
    }
  }

  private async hydrateFromServer() {
    try {
      const res = await fetch('/api/sync/all');
      if (res.ok) {
        const json = await res.json();
        if (json.data && typeof json.data === 'object') {
          for (const key of Object.keys(json.data)) {
            this.setLocalSilently(key, json.data[key]);
          }
          if (json.version) this.currentDbVersion = json.version;
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'all', fromServer: true } }));
        }
      }
    } catch {
      // Offline fallback
    }
  }

  private setLocalSilently<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`bs_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage quota catch on ${key}:`, e);
    }
  }

  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`bs_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    this.setLocalSilently(key, value);
    window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key, value } }));
    this.pushToFirestore(key, value);
    this.pushToServer(key, value);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('bs_master_gateway');
        bc.postMessage({ key, value, timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  }

  private async pushToServer(key: string, value: any) {
    try {
      await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch {
      // Safe catch
    }
  }

  public async syncAllToServer(): Promise<void> {
    try {
      const fullDb = {
        settings: this.getSettings(),
        slides: this.getSlides(),
        shortcuts: this.getShortcuts(),
        courses: this.getCourses(),
        mentors: this.getMentors(),
        students: this.getStudents(),
        applications: this.getApplications(),
        routines: this.getRoutines(),
        results: this.getResults(),
        admit_cards: this.getAdmitCards(),
        certificates: this.getCertificates(),
        ledger: this.getLedger(),
        notices: this.getNotices(),
        gallery: this.getGallery(),
        notes: this.getNotes(),
        demo_classes: this.getDemoClasses(),
        chatbot: this.getChatbot(),
        admin_creds: this.getAdminCredentials()
      };

      // Push all records to Cloud Firestore
      for (const [k, v] of Object.entries(fullDb)) {
        this.pushToFirestore(k, v);
      }

      await fetch('/api/sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: fullDb })
      });
    } catch (e) {
      console.warn('Sync all error:', e);
    }
  }

  getSettings(): InstituteSettings {
    return this.get<InstituteSettings>('settings', initialSettings);
  }
  saveSettings(settings: InstituteSettings): void {
    this.set('settings', settings);
  }

  getSlides(): HeroSlide[] {
    return this.get<HeroSlide[]>('slides', initialSlides);
  }
  saveSlides(slides: HeroSlide[]): void {
    this.set('slides', slides);
  }

  getShortcuts(): ShortcutItem[] {
    const list = this.get<ShortcutItem[]>('shortcuts', initialShortcuts);
    const hasFounder = list.some(s => s.target === 'founder');
    const hasIdCard = list.some(s => s.target === 'idcard');
    if (!hasFounder || !hasIdCard) {
      const merged = [...list];
      if (!hasFounder) {
        merged.push({ id: "sc-13", title: "প্রতিষ্ঠাতা ও ম্যানেজমেন্ট", iconName: "Award", badge: "পরিচালনা পরিষদ", color: "from-violet-600 to-purple-800", target: "founder", enabled: true });
      }
      if (!hasIdCard) {
        merged.push({ id: "sc-14", title: "স্টুডেন্ট আইডি", iconName: "GraduationCap", badge: "আইডি কার্ড", color: "from-blue-700 to-indigo-800", target: "idcard", enabled: true });
      }
      return merged;
    }
    return list;
  }
  saveShortcuts(shortcuts: ShortcutItem[]): void {
    this.set('shortcuts', shortcuts);
  }

  getCourses(): Course[] {
    return this.get<Course[]>('courses', initialCourses);
  }
  saveCourses(courses: Course[]): void {
    this.set('courses', courses);
  }

  getMentors(): Mentor[] {
    return this.get<Mentor[]>('mentors', initialMentors);
  }
  saveMentors(mentors: Mentor[]): void {
    this.set('mentors', mentors);
  }

  getStudents(): Student[] {
    return this.get<Student[]>('students', initialStudents);
  }
  saveStudents(students: Student[]): void {
    this.set('students', students);
  }

  getApplications(): EnrollmentApplication[] {
    return this.get<EnrollmentApplication[]>('applications', initialApplications);
  }
  saveApplications(apps: EnrollmentApplication[]): void {
    this.set('applications', apps);
  }

  getRoutines(): RoutineItem[] {
    return this.get<RoutineItem[]>('routines', initialRoutines);
  }
  saveRoutines(routines: RoutineItem[]): void {
    this.set('routines', routines);
  }

  getResults(): ResultRecord[] {
    return this.get<ResultRecord[]>('results', initialResults);
  }
  saveResults(results: ResultRecord[]): void {
    this.set('results', results);
  }

  getAdmitCards(): AdmitCardRecord[] {
    return this.get<AdmitCardRecord[]>('admit_cards', initialAdmitCards);
  }
  saveAdmitCards(cards: AdmitCardRecord[]): void {
    this.set('admit_cards', cards);
  }

  getCertificates(): CertificateRecord[] {
    return this.get<CertificateRecord[]>('certificates', initialCertificates);
  }
  saveCertificates(certs: CertificateRecord[]): void {
    this.set('certificates', certs);
  }

  getLedger(): LedgerItem[] {
    return this.get<LedgerItem[]>('ledger', initialLedger);
  }
  saveLedger(items: LedgerItem[]): void {
    this.set('ledger', items);
  }

  getNotices(): NoticeItem[] {
    return this.get<NoticeItem[]>('notices', initialNotices);
  }
  saveNotices(notices: NoticeItem[]): void {
    this.set('notices', notices);
  }

  getGallery(): GalleryItem[] {
    return this.get<GalleryItem[]>('gallery', initialGallery);
  }
  saveGallery(items: GalleryItem[]): void {
    this.set('gallery', items);
  }

  getNotes(): FreeNoteItem[] {
    return this.get<FreeNoteItem[]>('notes', initialNotes);
  }
  saveNotes(notes: FreeNoteItem[]): void {
    this.set('notes', notes);
  }

  getDemoClasses(): DemoClassItem[] {
    return this.get<DemoClassItem[]>('demo_classes', initialDemoClasses);
  }
  saveDemoClasses(items: DemoClassItem[]): void {
    this.set('demo_classes', items);
  }

  getChatbot(): ChatbotSettings {
    const data = this.get<ChatbotSettings>('chatbot', initialChatbot);
    return {
      ...initialChatbot,
      ...data,
      knowledgeBaseText: data.knowledgeBaseText !== undefined ? data.knowledgeBaseText : initialChatbot.knowledgeBaseText,
      infoBlocks: data.infoBlocks && Array.isArray(data.infoBlocks) && data.infoBlocks.length > 0 ? data.infoBlocks : (initialChatbot.infoBlocks || []),
      faqs: data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : (initialChatbot.faqs || []),
      quickChips: data.quickChips && Array.isArray(data.quickChips) ? data.quickChips : initialChatbot.quickChips,
    };
  }
  saveChatbot(settings: ChatbotSettings): void {
    this.set('chatbot', settings);
  }

  getAdminCredentials(): AdminCredentials {
    const creds = this.get<AdminCredentials>('admin_creds', initialCredentials);
    if (!creds.masterPin || creds.masterPin.length < 6 || creds.masterPin.length > 11) {
      creds.masterPin = "992288";
      this.saveAdminCredentials(creds);
    }
    return creds;
  }
  saveAdminCredentials(creds: AdminCredentials): void {
    this.set('admin_creds', creds);
  }

  getItem<T>(key: string, fallback: T): T {
    return this.get<T>(key, fallback);
  }

  setItem<T>(key: string, value: T): void {
    this.set<T>(key, value);
  }

  getChatMemory(): any[] {
    return this.get<any[]>('chat_memory', []);
  }

  saveChatMemory(memory: any[]): void {
    this.set('chat_memory', memory);
  }

  resetAll(): void {
    localStorage.clear();
    window.location.reload();
  }
}

export const storage = new StorageService();
