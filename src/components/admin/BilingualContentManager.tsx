import React, { useEffect, useMemo, useState } from 'react';

type ContentRecord = Record<string, any>;

export interface BilingualSection {
  id: string;
  label: string;
  items: ContentRecord[];
  onChange: (items: ContentRecord[]) => void;
}

interface BilingualContentManagerProps {
  sections: BilingualSection[];
  onSave: () => void | Promise<void>;
}

const EXCLUDED_KEYS = /(^(id|courseId|studentId|academicYear|roll|phone|hotline|email|trxId|transactionId|date|issueDate|enrollmentDate|appliedDate|examDate|examTime|time|year|amount|fee|gpa|totalMarks|obtained|total|published|active|enabled|isActive|isFree|feePaid|hasEverPaid|hasGovtCert|pinned|type|status|paymentMethod|primaryColor|secondaryColor|headerTextSize|target|iconName|url|videoUrl|fileUrl|pdfUrl|photoUrl|previewImage|thumbnail|image|images|logoUrl|watermarkUrl|signatureUrl|signatureSealUrl|institutionSealUrl|founderPhotoUrl|banglaQrUrl|mapEmbedUrl|facebookUrl|youtubeUrl|tiktokUrl|githubToken|password|masterPin|keywords|marks)$/i)|url|token|password|pin|secret|photo|image|logo|signature|seal|icon|color|trx/i;

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  title: 'Title',
  subName: 'Subtitle',
  description: 'Description',
  subText: 'Subtitle text',
  ctaText: 'Button text',
  badge: 'Badge',
  founderName: 'Founder name',
  founderTitle: 'Founder designation',
  founderSpeech: 'Founder message',
  welcomeText: 'Welcome message',
  footerText: 'Footer text',
  footerCopyright: 'Copyright text',
  footerNotice: 'Footer notice',
  address: 'Address',
  designation: 'Designation',
  qualifications: 'Qualifications',
  experience: 'Experience',
  specialist: 'Specialization',
  bio: 'Biography',
  comments: 'Comments',
  category: 'Category',
  content: 'Content',
  subject: 'Subject',
  subjects: 'Subjects',
  exams: 'Exams',
  examType: 'Exam type',
  examCenter: 'Exam center',
  teacherName: 'Teacher name',
  instructor: 'Instructor',
  room: 'Room',
  day: 'Day',
  duration: 'Duration',
  features: 'Features',
  paymentDetails: 'Payment details',
  certificateTitle: 'Certificate title',
  bodyText: 'Certificate body',
  institutionName: 'Institution name',
  institutionSubName: 'Institution subtitle',
  courseTitle: 'Course title',
  studentName: 'Student name',
  fatherName: 'Father name',
  motherName: 'Mother name',
  rejectionReason: 'Rejection reason',
  question: 'Question',
  answer: 'Answer',
  botName: 'Chatbot name',
  welcomeMessage: 'Welcome message',
  basePrompt: 'Base prompt',
  knowledgeBaseText: 'Knowledge base',
  quickChips: 'Quick prompts',
  keywords: 'Keywords',
  categoryEnglish: 'English category',
};

const ENGLISH_KEY_OVERRIDES: Record<string, Record<string, string>> = {
  courses: { title: 'titleEnglish', description: 'descriptionEnglish', category: 'categoryEnglish', subjects: 'subjectsEnglish', exams: 'examsEnglish' },
  students: { name: 'englishName', fatherName: 'fatherNameEnglish', motherName: 'motherNameEnglish' },
  applications: { studentName: 'studentNameEnglish' },
  certificates: { studentName: 'studentNameEnglish' },
};

function englishKey(sectionId: string, field: string) {
  return ENGLISH_KEY_OVERRIDES[sectionId]?.[field] || `${field}English`;
}

function isEditableTextField(key: string, value: unknown): boolean {
  if (key.endsWith('English')) return false;
  if (EXCLUDED_KEYS.test(key)) return false;
  if (typeof value === 'string') return value.trim().length > 0 || /^(name|title|description|content|category|subject|bio|designation|founderSpeech|welcomeText|footerText|footerNotice|footerCopyright|address|answer|question|basePrompt|knowledgeBaseText|botName|welcomeMessage)$/i.test(key);
  return Array.isArray(value) && value.every(v => typeof v === 'string');
}

function toText(value: unknown): string {
  return Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : '';
}

const APP_TRANSLATIONS: Record<string, string> = {
      'সহীহ কুরআন শিক্ষা': 'Quran Recitation & Tajweed',
      'এসএসসি হিসাববিজ্ঞান': 'SSC Accounting',
      'এইচএসসি হিসাববিজ্ঞান': 'HSC Accounting',
      'অষ্টম থেকে দশম শ্রেণি ইংরেজি': 'English for Grades 8–10',
      'অষ্টম থেকে দশম শ্রেণি গণিত': 'Mathematics for Grades 8–10',
      'কম্বাইন অফার (গণিত + ইংরেজি একসাথে)': 'Combo Offer (Mathematics + English)',
      'প্রথম থেকে সপ্তম শ্রেণির সকল বিষয়': 'All Subjects for Grades 1–7',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস মেয়াদি)': 'Computer Office Applications (6 Months)',
      'Spoken English (৪ মাস মেয়াদি)': 'Spoken English (4 Months)',
      'বাংলা, গণিত, ইংরেজি বেসিক কোর্স (৩ মাস মেয়াদি)': 'Bangla, Mathematics & English Basics (3 Months)',
      'ধারাবাহিক ব্যাচ': 'Ongoing Batch',
      'একাডেমিক পূর্ণাঙ্গ সেশন': 'Full Academic Session',
      'এইচএসসি প্রথম ও দ্বিতীয় পত্র': 'HSC First and Second Papers',
      'ফুল একাডেমি সেশন': 'Full Academic Session',
      'ফুল একাডেমিক সেশন': 'Full Academic Session',
      'সমন্বিত কম্বো কোর্স': 'Combined Course Package',
      'বছরব্যাপী ব্যাচ': 'Year-round Batch',
      '৬ মাস (সরকারি মান)': '6 Months (Government Standard)',
      '৪ মাস': '4 Months',
      '৩ মাস মেয়াদি ফাউন্ডেশন': '3-Month Foundation Course',
      'সহজ পদ্ধতিতে তাজবীদ সহ সহীহ কুরআন তিলাওয়াত, মাখরাজ ও প্র্যাকটিক্যাল সূরা মুখস্থকরণ।': 'Learn accurate Quran recitation with Tajweed, correct articulation, and practical Surah memorization.',
      'এসএসসি পরীক্ষার্থীদের হিসাববিজ্ঞানের সমস্ত অধ্যায় বেসিক থেকে সৃজনশীল ও নৈর্ব্যক্তিক সমাধান।': 'Master all SSC Accounting chapters from the basics, including creative and multiple-choice questions.',
      'এইচএসসি হিসাববিজ্ঞান ১ম ও ২য় পত্রের কাঠিন্য দূর করে জিপিএ-৫ নিশ্চিতকরণ বিশেষ প্রোগ্রাম।': 'A focused program to master HSC Accounting Papers 1 and 2 and prepare for top grades.',
      'ইংলিশ গ্রামার, রাইটিং এবং টেক্সটবুকের সমন্বয়ে দুর্বলতা দূরীকরণ ও বেসিক স্ট্রং করার কোর্স।': 'Strengthen English fundamentals through grammar, writing, and textbook practice.',
      'গণিতের ভয় দূর করে প্রতিটি সূত্রের ব্যবহার ও জ্যামিতি-বীজগণিত-ত্রিকোণমিতিতে পূর্ণাঙ্গ দক্ষতা।': 'Build confidence in mathematics and develop skills in geometry, algebra, and trigonometry.',
      'ছোট সোনামণিদের জন্য প্রতিটি বিষয়ের হাতেখড়ি, বাড়ির কাজ তদারকি ও নিয়মিত পরীক্ষা।': 'A supportive program for young learners with homework guidance and regular assessments.',
      'MS Word, Excel, PowerPoint, Access, Internet ও টাইপিংয়ে শতভাগ প্র্যাকটিক্যাল ট্রেনিং।': 'Hands-on training in MS Word, Excel, PowerPoint, Access, internet use, and typing.',
      'সহজ ভাষায় ফ্লুয়েন্ট স্পোকেন ইংলিশ, ব্রিটিশ প্রোনাউন্সিয়েশন এবং পাবলিক স্পিকিং প্র্যাকটিস।': 'Practice fluent spoken English, British pronunciation, and public speaking in a simple, practical way.',
      'ধর্মীয় ও নৈতিক শিক্ষা': 'Religious & Moral Education',
      'একাডেমিক কোর্স': 'Academic Course',
      'স্পেশাল কম্বো অফার': 'Special Combo Offer',
      'প্রাথমিক ও জুনিয়র': 'Primary & Junior',
      'আইটি ও প্রফেশনাল': 'IT & Professional',
      'ভাষা ও যোগাযোগ': 'Language & Communication',
      'ভর্তি ফি: ৫০০ টাকা (প্রথম মাস সম্পূর্ণ অন্তর্ভুক্ত)': 'Admission fee: BDT 500 (includes the full first month)',
      'দ্বিতীয় মাস থেকে নিয়মিত মাসিক ফি: ৫০০ টাকা': 'Monthly fee from the second month: BDT 500',
      'সার্টিফিকেট সম্পূর্ণ ফ্রি (কোনো অতিরিক্ত চার্জ নেই)': 'Certificate is free (no additional charge)',
      'নারী ও পুরুষদের জন্য পৃথক ক্লাসের সুব্যবস্থা': 'Separate classes available for women and men',
      'স্বাগতম': 'Welcome',
      'আমাদের প্রতিষ্ঠানে স্বাগতম': 'Welcome to Our Institute',
      'BS E-Learning & IT Zone এ স্বাগতম': 'Welcome to BS E-Learning & IT Zone',
      'BS E-Learning & IT Zone-এ আপনাকে স্বাগতম! দেশসেরা অনলাইন ও অফলাইন শিখন প্ল্যাটফর্ম।': 'Welcome to BS E-Learning & IT Zone! A leading online and offline learning platform.',
      'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি': 'A Digital Academy for Skills & Success',
      'অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে বেসিক টু অ্যাডভান্সড একাডেমিক ও স্কিল ডেভেলপমেন্ট কোর্স। গড়ে তুলুন আপনার সফল ভবিষ্যৎ।': 'Academic and skill-development courses from basic to advanced levels, guided by experienced instructors. Build a successful future.',
      'কোর্সসমূহ দেখুন': 'Explore Courses',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স (৬ মাস)': 'Computer Office Applications Course (6 Months)',
      'প্র্যাকটিক্যাল ল্যাব ও অনলাইন সাপোর্টে সরকারি সার্টিফিকেট অর্জনের অনন্য সুযোগ! সীমিত আসনে স্পেশাল অফার মূল্যে ভর্তি চলছে।': 'Gain practical lab experience and online support. Enrollment is open for a limited-time offer.',
      'এখনই এনরোল করুন': 'Enroll Now',
      'সহীহ কুরআন ও স্পোকেন ইংলিশ স্পেশাল ব্যাচ': 'Quran Recitation & Spoken English Special Batch',
      'সহজ ও প্রাঞ্জল পদ্ধতিতে তাজবীদ সহ কুরআন তিলাওয়াত এবং ফ্লুয়েন্ট স্পোকেন ইংলিশ দক্ষতা অর্জন করুন ঘরে বসেই।': 'Learn Quran recitation with Tajweed and develop spoken English skills from home.',
      'মাসিক ফি ও রুটিন': 'Monthly Fees & Routine',
      'আমাদের প্রতিষ্ঠানের লক্ষ্য': 'Our Mission',
      'আমাদের সম্পর্কে জানুন': 'About Our Institute',
      'আমাদের সেবা সমূহ': 'Our Services',
      'আমাদের সেবাসমূহ': 'Our Services',
      'আমাদের কোর্সসমূহ': 'Our Courses',
      'কেন আমাদের নির্বাচন করবেন': 'Why Choose Us',
      'শিক্ষার্থীদের সাফল্য': 'Student Success',
      'ভর্তি সংক্রান্ত তথ্য': 'Admission Information',
      'যোগাযোগের ঠিকানা': 'Contact Address',
      'সকল নোটিশ দেখুন': 'View All Notices',
      'সাম্প্রতিক নোটিশ': 'Recent Notices',
      'গ্যালারি ও ইভেন্ট': 'Gallery & Events',
      'সেমিনার ও কর্মশালা': 'Seminars & Workshops',
      'শ্রেণি কার্যক্রম': 'Class Activities',
      'অনলাইন ও অফলাইন ক্লাস': 'Online & Offline Classes',
      'বিস্তারিত তথ্যের জন্য যোগাযোগ করুন': 'Contact us for more information',
      'প্রতিষ্ঠানের পরিচিতি': 'About the Institute',
      'প্রতিষ্ঠাতার পরিচয়': 'About the Founder',
      'প্রতিষ্ঠাতার পরিচিতি': 'Founder Profile',
      'আমাদের ঠিকানা': 'Our Address',
      'সকল শিক্ষার্থীদের জন্য': 'For All Students',
      'সকল শিক্ষার্থীর জন্য': 'For All Students',
      'ভর্তি ফরম পূরণ করুন': 'Complete the Admission Form',
      'ফলাফল দেখুন': 'View Results',
      'আপনার ফলাফল দেখুন': 'View Your Results',
      'সার্টিফিকেট সংগ্রহ করুন': 'Get Your Certificate',
      'ফি পরিশোধ করুন': 'Pay Fees',
      'প্রয়োজনীয় তথ্য': 'Required Information',
      'প্রয়োজনীয় তথ্য': 'Required Information',
      'আমাদের সাথে যোগাযোগ করুন': 'Contact Us',
      'BS E-Learning & IT Zone — আধুনিক একাডেমিক শিক্ষা ও প্র্যাকটিক্যাল আইটি স্কিল অর্জনের বিশ্বস্ত প্রতিষ্ঠান। অভিজ্ঞ শিক্ষক মণ্ডলী এবং ডিজিটাল ল্যাব সাপোর্ট।': 'BS E-Learning & IT Zone — A trusted institute for academic education and practical IT skills, supported by experienced instructors and digital learning resources.',
      'কোর্সসমূহ': 'Courses',
      'নোটিস বোর্ড': 'Notice Board',
      'নতুন নোটিস': 'New Notices',
      'লাইভ': 'Live',
      'ভিডিও ও ছবি': 'Videos & Photos',
      'চ্যাটবট / হেল্প': 'Chatbot / Help',
      '২৪/৭ এআই': '24/7 AI Support',
      'পরীক্ষা': 'Exams',
      'বাংলা QR': 'QR Payment',
      'ফলাফল ও মার্কশিট': 'Results & Marksheet',
      'অনলাইন রেজাল্ট': 'Online Results',
      'অফিশিয়াল': 'Official',
      'ফ্রি নোট ও সাজেশন': 'Free Notes & Suggestions',
      'পিডিএফ': 'PDF',
      'ফ্রি ভিডিও ক্লাস': 'Free Video Classes',
      'ডেমো লেকচার': 'Demo Lectures',
      'আমাদের শিক্ষক': 'Our Teachers',
      'অভিজ্ঞ মেন্টর': 'Experienced Mentors',
      'পরিচালনা পরিষদ': 'Management',
      'স্টুডেন্ট আইডি': 'Student ID',
      'আইডি কার্ড': 'ID Card',
      'সহীহ কুরআন শিক্ষা': 'Correct Quran Recitation',
      'এসএসসি হিসাববিজ্ঞান': 'SSC Accounting',
      'এইচএসসি হিসাববিজ্ঞান': 'HSC Accounting',
      'অষ্টম থেকে দশম শ্রেণি ইংরেজি': 'English for Grades 8–10',
      'অষ্টম থেকে দশম শ্রেণি গণিত': 'Mathematics for Grades 8–10',
      'কম্বাইন অফার (গণিত + ইংরেজি একসাথে)': 'Combined Offer (Mathematics + English)',
      'প্রথম থেকে সপ্তম শ্রেণির সকল বিষয়': 'All Subjects for Grades 1–7',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস মেয়াদি)': 'Computer Office Applications (6 Months)',
      'Spoken English (৪ মাস মেয়াদি)': 'Spoken English (4 Months)',
      'বাংলা, গণিত, ইংরেজি বেসিক কোর্স (৩ মাস মেয়াদি)': 'Bangla, Mathematics & English Basics (3 Months)',
      'সহজ পদ্ধতিতে তাজবীদ সহ সহীহ কুরআন তিলাওয়াত, মাখরাজ ও প্র্যাকটিক্যাল সূরা মুখস্থকরণ।': 'Learn correct Quran recitation with Tajweed, articulation, and practical Surah memorization.',
      'এসএসসি পরীক্ষার্থীদের হিসাববিজ্ঞানের সমস্ত অধ্যায় বেসিক থেকে সৃজনশীল ও নৈর্ব্যক্তিক সমাধান।': 'Cover all SSC Accounting chapters from fundamentals through creative and multiple-choice problem solving.',
      'এইচএসসি হিসাববিজ্ঞান ১ম ও ২য় পত্রের কাঠিন্য দূর করে জিপিএ-৫ নিশ্চিতকরণ বিশেষ প্রোগ্রাম।': 'A focused program to master HSC Accounting Papers 1 and 2 and prepare for GPA-5 results.',
      'ইংলিশ গ্রামার, রাইটিং এবং টেক্সটবুকের সমন্বয়ে দুর্বলতা দূরীকরণ ও বেসিক স্ট্রং করার কোর্স।': 'Strengthen English fundamentals through grammar, writing, and textbook practice.',
      'গণিতের ভয় দূর করে প্রতিটি সূত্রের ব্যবহার ও জ্যামিতি-বীজগণিত-ত্রিকোণমিতিতে পূর্ণাঙ্গ দক্ষতা।': 'Build confidence in mathematics and develop skills in formulas, geometry, algebra, and trigonometry.',
      'অষ্টম থেকে দশম শ্রেণির গণিত এবং ইংরেজি একসাথে সেরা ছাড়ে পড়ার সুবর্ণ সুযোগ।': 'A special-value package combining mathematics and English for grades 8–10.',
      'ছোট সোনামণিদের জন্য প্রতিটি বিষয়ের হাতেখড়ি, বাড়ির কাজ তদারকি ও নিয়মিত পরীক্ষা।': 'Foundational learning for young students, with homework support and regular assessments.',
      'MS Word, Excel, PowerPoint, Access, Internet ও টাইপিংয়ে শতভাগ প্র্যাকটিক্যাল ট্রেনিং।': 'Hands-on training in MS Word, Excel, PowerPoint, Access, internet use, and typing.',
      'সহজ ভাষায় ফ্লুয়েন্ট স্পোকেন ইংলিশ, ব্রিটিশ প্রোনাউন্সিয়েশন এবং পাবলিক স্পিকিং প্র্যাকটিস।': 'Develop fluent spoken English, British pronunciation, and public-speaking skills.',
      'যেকোনো বয়সের শিক্ষার্থীদের জন্য বাংলা উচ্চারণ-বানান, গণিতের নামতা-হিসাব ও ইংরেজির প্রাথমিক ভিত গড়ার কোর্স।': 'Build foundations in Bangla pronunciation and spelling, mathematics, and basic English at any age.',
      'বোরহানউদ্দিন মহিম': 'Borhan Uddin Mahim',
      'মো: তাহসিন আহমেদ': 'Md. Tahsin Ahmed',
      'ইঞ্জিনিয়ার আরিফুল ইসলাম': 'Engineer Ariful Islam',
      'সাদিয়া আক্তার': 'Sadia Akter',
      'মোহাম্মদ আব্দুল্লাহ': 'Mohammad Abdullah',
      'ফাতেমা তুজ জোহরা': 'Fatema Tuz Zohra',
      'তানভীর হাসান': 'Tanvir Hasan',
      'নুসরাত জাহান': 'Nusrat Jahan',
      '২০২৬ শিক্ষাবর্ষে সকল কোর্সে বিশেষ ছাড়ে ভর্তি চলছে!': 'Special admission discounts are available for all courses in the 2026 academic year!',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন ল্যাব ক্লাস শিডিউল ও পরীক্ষা নোটিস': 'Computer Office Applications Lab Schedule and Exam Notice',
      'কম্পিউটার প্র্যাকটিক্যাল ল্যাব সেশন': 'Computer Practical Lab Session',
      'কুরআন শিক্ষা ব্যাচের সমাপ্তি ও দোয়া মাহফিল': 'Quran Learning Batch Completion and Prayer Gathering',
      'মেধাবী শিক্ষার্থীদের মাঝে সনদ ও পুরস্কার বিতরণী': 'Certificate and Award Ceremony for Meritorious Students',
      'সরাসরি শিক্ষক-শিক্ষার্থী মতবিনিময় সভার ঝলক': 'Highlights from the Teacher–Student Discussion Session',
      'ল্যাব ক্লাস': 'Lab Class',
      'অনুষ্ঠান': 'Event',
      'পুরস্কার বিতরণ': 'Award Ceremony',
      'ভিডিও লেকচার': 'Video Lecture',
      'এসএসসি হিসাববিজ্ঞান: জাবেদা ও রেওয়ামিল শর্টকাট সুপার নোট': 'SSC Accounting: Journal and Trial Balance Quick Notes',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন: শর্টকাট কি & এক্সেলে দরকারি ফর্মুলা শিট': 'Computer Office Applications: Keyboard Shortcuts and Useful Excel Formulas',
      'দৈনন্দিন জীবনে বহুল ব্যবহৃত ১০০টি Spoken English স্ট্রাকচার': '100 Common Spoken English Structures for Everyday Use',
      'সহীহ কুরআন শিক্ষা: মাখরাজের নিয়ম ও সহজ উচ্চারণ পদ্ধতি': 'Correct Quran Recitation: Articulation Rules and Easy Pronunciation',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন: এক্সেল ম্যাজিক ও অটো-ক্যালকুলেশন ট্রিক': 'Computer Office Applications: Excel Tips and Auto-Calculation Tricks',
      'এসএসসি হিসাববিজ্ঞান: রেওয়ামিল প্রস্তুতের সহজ ৫টি নিয়ম': 'SSC Accounting: Five Easy Rules for Preparing a Trial Balance',
      'সহজ নিয়ম ও শর্টকাট কৌশল সম্বলিত পিডিএফ লেকচার নোট। পরীক্ষায় শতভাগ কমন পাওয়ার উপযোগী।': 'PDF lecture notes with simple rules and shortcuts for exam preparation.',
      'সবচেয়ে বেশি ব্যবহৃত ৫০টি কিবোর্ড শর্টকাট ও ভি-লুকআপ, সাম-ইফ ফর্মুলার পূর্ণাঙ্গ হ্যান্ডনোট।': 'A complete handout of 50 common keyboard shortcuts and VLOOKUP/SUMIF formulas.',
      'অনর্গল ইংরেজিতে কথা বলার জন্য প্রয়োজনীয় বাক্য গঠন পদ্ধতি ও ভোকাবুলারি ব্যাংক।': 'Sentence patterns and vocabulary to help you speak English fluently.',
      'আরবি ২৯টি হরফের সঠিক উচ্চারণ ও ক্বারিয়ানা ভঙ্গিতে তিলাওয়াত শেখার ১ম লেকচার।': 'Lesson 1: Correct pronunciation of the 29 Arabic letters and Quranic recitation.',
      'অফিসে কাজ করার জন্য এক্সেল ফর্মুলা ও মার্কশিট তৈরির সহজ টেকনিক শিখুন।': 'Learn practical Excel formulas and easy techniques for creating marksheets.',
      'কোন কোন ভুল রেওয়ামিলে ধরা পড়ে না এবং কীভাবে এক দেখায় রেওয়ামিল মেলাবেন।': 'Learn common trial-balance errors and how to balance accounts efficiently.',
      'ভর্তি ও অনলাইন পেমেন্ট নির্দেশিকা': 'Admission and Online Payment Guide',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স বিবরণী': 'Computer Office Applications Course Details',
      'এডমিট কার্ড ডাউনলোড ও প্রিন্ট সমস্যা সমাধান': 'Admit Card Download and Printing Troubleshooting',
      'সহীহ কুরআন শিক্ষা ও তাজবীদ কোর্স': 'Correct Quran Recitation and Tajweed Course',
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

const AUTO_TRANSLATIONS: Record<string, string> = {
  ...APP_TRANSLATIONS,
  'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি': 'A Digital Academy for Skills and Success',
  'বাগানবাড়ি রোড, উত্তরা / মিরপুর শাখা, ঢাকা-১২৩০, বাংলাদেশ': 'Baganbari Road, Uttara / Mirpur Branch, Dhaka-1230, Bangladesh',
  'প্রতিষ্ঠাতা ও প্রধান শিক্ষক': 'Founder and Head Teacher',
  'BS E-Learning & IT Zone-এ আপনাকে স্বাগতম! দেশসেরা অনলাইন ও অফলাইন শিখন প্ল্যাটফর্ম।': 'Welcome to BS E-Learning & IT Zone! A leading online and offline learning platform.',
  'বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপের মাধ্যমে এই বাংলা কিউআর (Bangla QR) কোড স্ক্যান করে পেমেন্ট করুন': 'Scan this Bangla QR code using bKash, Nagad, or any banking app to make a payment.',
  'BS E-Learning & IT Zone — আধুনিক একাডেমিক শিক্ষা ও প্র্যাকটিক্যাল আইটি স্কিল অর্জনের বিশ্বস্ত প্রতিষ্ঠান। অভিজ্ঞ শিক্ষক মণ্ডলী এবং ডিজিটাল ল্যাব সাপোর্ট।': 'BS E-Learning & IT Zone is a trusted institution for modern academic education and practical IT skills, supported by experienced teachers and digital lab facilities.',
  'ভর্তি ও পরীক্ষার সকল কার্যক্রম সরাসরি প্রধান শিক্ষক কর্তৃক অনুমোদিত।': 'All admission and examination activities are approved directly by the Head Teacher.',
  'BS E-Learning & IT Zone এ স্বাগতম': 'Welcome to BS E-Learning & IT Zone',
  'অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে বেসিক টু অ্যাডভান্সড একাডেমিক ও স্কিল ডেভেলপমেন্ট কোর্স। গড়ে তুলুন আপনার সফল ভবিষ্যৎ।': 'Basic-to-advanced academic and skill development courses guided by experienced teachers. Build a successful future.',
  'কোর্সসমূহ দেখুন': 'Explore Courses',
  'কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স (৬ মাস)': 'Computer Office Applications Course (6 Months)',
  'প্র্যাকটিক্যাল ল্যাব ও অনলাইন সাপোর্টে সরকারি সার্টিফিকেট অর্জনের অনন্য সুযোগ! সীমিত আসনে স্পেশাল অফার মূল্যে ভর্তি চলছে।': 'A unique opportunity to earn a government certificate with practical lab training and online support. Limited seats are available at a special offer price.',
  'এখনই এনরোল করুন': 'Enroll Now',
  'সহীহ কুরআন ও স্পোকেন ইংলিশ স্পেশাল ব্যাচ': 'Authentic Quran and Spoken English Special Batch',
  'সহজ ও প্রাঞ্জল পদ্ধতিতে তাজবীদ সহ কুরআন তিলাওয়াত এবং ফ্লুয়েন্ট স্পোকেন ইংলিশ দক্ষতা অর্জন করুন ঘরে বসেই।': 'Learn Quran recitation with Tajweed and develop fluent spoken English from home through a simple, clear approach.',
  'মাসিক ফি ও রুটিন': 'Monthly Fees & Routine',
  'কোর্সসমূহ': 'Courses', 'নোটিস বোর্ড': 'Notice Board', 'ক্লাস রুটিন': 'Class Routine',
  'গ্যালারি': 'Gallery', 'চ্যাটবট / হেল্প': 'Chatbot / Help', 'এডমিট কার্ড': 'Admit Card',
  'মাসিক ফি / পেমেন্ট': 'Monthly Fee / Payment', 'ফলাফল ও মার্কশিট': 'Results & Marksheet',
  'সার্টিফিকেট ডাউনলোড': 'Download Certificate', 'ফ্রি নোট ও সাজেশন': 'Free Notes & Suggestions',
  'ফ্রি ভিডিও ক্লাস': 'Free Video Classes', 'আমাদের শিক্ষক': 'Our Teachers',
  'প্রতিষ্ঠাতা ও ম্যানেজমেন্ট': 'Founder & Management', 'স্টুডেন্ট আইডি': 'Student ID',
  'সহীহ কুরআন শিক্ষা': 'Authentic Quran Education', 'এসএসসি হিসাববিজ্ঞান': 'SSC Accounting',
  'এইচএসসি হিসাববিজ্ঞান': 'HSC Accounting', 'অষ্টম থেকে দশম শ্রেণি ইংরেজি': 'English for Grades 8–10',
  'অষ্টম থেকে দশম শ্রেণি গণিত': 'Mathematics for Grades 8–10',
  'কম্বাইন অফার (গণিত + ইংরেজি একসাথে)': 'Combined Offer (Mathematics + English)',
  'প্রথম থেকে সপ্তম শ্রেণির সকল বিষয়': 'All Subjects for Grades 1–7',
  'কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস মেয়াদি)': 'Computer Office Applications (6-Month Course)',
  'Spoken English (৪ মাস মেয়াদি)': 'Spoken English (4-Month Course)',
  'বাংলা, গণিত, ইংরেজি বেসিক কোর্স (৩ মাস মেয়াদি)': 'Bangla, Mathematics & English Basics (3-Month Course)',
  'ধারাবাহিক ব্যাচ': 'Ongoing Batch', 'ধর্মীয় ও নৈতিক শিক্ষা': 'Religious and Moral Education',
  'একাডেমিক পূর্ণাঙ্গ সেশন': 'Full Academic Session', 'একাডেমিক কোর্স': 'Academic Course',
  'ফুল একাডেমি সেশন': 'Full Academic Session', 'ফুল একাডেমিক সেশন': 'Full Academic Session',
  'সমন্বিত কম্বো কোর্স': 'Combined Course Package', 'স্পেশাল কম্বো অফার': 'Special Combo Offer',
  'বছরব্যাপী ব্যাচ': 'Year-Round Batch', 'প্রাথমিক ও জুনিয়র': 'Primary and Junior',
  '৬ মাস (সরকারি মান)': '6 Months (Government Standard)', '৪ মাস': '4 Months',
  'ভাষা ও যোগাযোগ': 'Language and Communication', 'ফাউন্ডেশন কোর্স': 'Foundation Course',
  'হরফ ও মাখরাজ': 'Arabic Letters and Makharij', 'তাজবীদ রুলস': 'Tajweed Rules',
  'মাদ্দ ও গুন্নাহ': 'Madd and Ghunnah', 'সূরা হিফজ ও তিলাওয়াত': 'Surah Memorization and Recitation',
  'মাখরাজ মূল্যায়ন': 'Makharij Assessment', 'তাজবীদ টেস্ট': 'Tajweed Test',
  'চূড়ান্ত তিলাওয়াত পরীক্ষা': 'Final Recitation Exam', 'লেনদেন ও হিসাব সমীকরণ': 'Transactions and Accounting Equation',
  'জাবেদা ও খতিয়ান': 'Journal and Ledger', 'রেওয়ামিল': 'Trial Balance',
  'আর্থিক বিবরণী': 'Financial Statements', 'হিসাববিজ্ঞান ১ম পত্র': 'Accounting Paper I',
  'অংশীদারি কারবার': 'Partnership Business', 'কোম্পানির মূলধন': 'Company Capital',
  'উৎপাদন ব্যয় হিসাব': 'Manufacturing Cost Accounting', 'বীজগণিতীয় রাশি': 'Algebraic Expressions',
  'জ্যামিতি ও সম্পাদ্য': 'Geometry and Constructions', 'ত্রিকোণমিতি ও পরিমিতি': 'Trigonometry and Mensuration',
  'পরিসংখ্যান': 'Statistics', 'বাংলা ও বানান': 'Bangla and Spelling',
  'প্রাথমিক গণিত': 'Elementary Mathematics', 'ইংরেজি রিডিং ও রাইটিং': 'English Reading and Writing',
  'সাধারণ বিজ্ঞান': 'General Science', 'শুদ্ধ বাংলা উচ্চারণ ও বর্ণমালা': 'Correct Bangla Pronunciation and Alphabet',
  'সহজ গণিত ও নামতা': 'Basic Mathematics and Multiplication Tables',
  'ইংরেজি বেসিক শব্দ ও বাক্য': 'Basic English Words and Sentences',
  'প্রতিষ্ঠাতা ও প্রধান শিক্ষক': 'Founder and Head Teacher',
  'সিনিয়র ইংলিশ ফ্যাকাল্টি': 'Senior English Faculty',
  'আইসিটি ও কম্পিউটার ট্রেইনার': 'ICT and Computer Trainer',
  'গণিত ও প্রাইমারি বিভাগীয় প্রধান': 'Head of Mathematics and Primary Division',
  'সহজ পদ্ধতিতে তাজবীদ সহ সহীহ কুরআন তিলাওয়াত, মাখরাজ ও প্র্যাকটিক্যাল সূরা মুখস্থকরণ।': 'Learn authentic Quran recitation with Tajweed, correct articulation points, and practical Surah memorization.',
  'এসএসসি পরীক্ষার্থীদের হিসাববিজ্ঞানের সমস্ত অধ্যায় বেসিক থেকে সৃজনশীল ও নৈর্ব্যক্তিক সমাধান।': 'A complete SSC Accounting course covering every chapter from basic concepts to creative and multiple-choice problem solving.',
  'এইচএসসি হিসাববিজ্ঞান ১ম ও ২য় পত্রের কাঠিন্য দূর করে জিপিএ-৫ নিশ্চিতকরণ বিশেষ প্রোগ্রাম।': 'A focused program to master HSC Accounting Papers I and II and prepare for top GPA results.',
  'ইংলিশ গ্রামার, রাইটিং এবং টেক্সটবুকের সমন্বয়ে দুর্বলতা দূরীকরণ ও বেসিক স্ট্রং করার কোর্স।': 'Strengthen English fundamentals and address learning gaps through grammar, writing, and textbook-based practice.',
  'গণিতের ভয় দূর করে প্রতিটি সূত্রের ব্যবহার ও জ্যামিতি-বীজগণিত-ত্রিকোণমিতিতে পূর্ণাঙ্গ দক্ষতা।': 'Build confidence in mathematics and develop strong skills in formulas, geometry, algebra, and trigonometry.',
  'অষ্টম থেকে দশম শ্রেণির গণিত এবং ইংরেজি একসাথে সেরা ছাড়ে পড়ার সুবর্ণ সুযোগ।': 'A special discounted package combining mathematics and English for Grades 8–10.',
  'ছোট সোনামণিদের জন্য প্রতিটি বিষয়ের হাতেখড়ি, বাড়ির কাজ তদারকি ও নিয়মিত পরীক্ষা।': 'A supportive course for young learners covering subject fundamentals, homework guidance, and regular assessments.',
  'MS Word, Excel, PowerPoint, Access, Internet ও টাইপিংয়ে শতভাগ প্র্যাকটিক্যাল ট্রেনিং।': 'Hands-on training in MS Word, Excel, PowerPoint, Access, internet use, and typing.',
  'সহজ ভাষায় ফ্লুয়েন্ট স্পোকেন ইংলিশ, ব্রিটিশ প্রোনাউন্সিয়েশন এবং পাবলিক স্পিকিং প্র্যাকটিস।': 'Develop fluent spoken English, British pronunciation, and public-speaking skills through accessible lessons.',
  'যেকোনো বয়সের শিক্ষার্থীদের জন্য বাংলা উচ্চারণ-বানান, গণিতের নামতা-হিসাব ও ইংরেজির প্রাথমিক ভিত গড়ার কোর্স।': 'A foundation course for learners of any age covering Bangla pronunciation and spelling, basic mathematics, and essential English.',
  'ভর্তি ফি: ৫০০ টাকা (প্রথম মাস সম্পূর্ণ অন্তর্ভুক্ত)': 'Admission fee: BDT 500 (includes the full first month)',
  'দ্বিতীয় মাস থেকে নিয়মিত মাসিক ফি: ৫০০ টাকা': 'Monthly fee from the second month: BDT 500',
  'সার্টিফিকেট সম্পূর্ণ ফ্রি (কোনো অতিরিক্ত চার্জ নেই)': 'Certificate is completely free (no extra charge)',
  'নারী ও পুরুষদের জন্য পৃথক ক্লাসের সুব্যবস্থা': 'Separate class arrangements for women and men',
  'অফারমূল্যে ভর্তি ফি: ৮০০ টাকা (রেগুলার ১,০০০৳)': 'Special admission offer: BDT 800 (regular price BDT 1,000)',
  'মাসিক ফি: ৫০০ টাকা করে নিয়মিত প্রযোজ্য': 'Regular monthly fee: BDT 500',
  'অধ্যায়ভিত্তিক বিশেষ হ্যান্ডনোট ও মডেল টেস্ট': 'Chapter-based handouts and model tests',
  'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার বেসিক কভার': 'Covers foundational topics for university admission tests',
  'বেসিক ইংলিশ গ্রামার রুলস ও ভোকাবুলারি টেস্ট': 'Basic English grammar rules and vocabulary tests',
  'সহজ ও শর্টকাট টেকনিকে অঙ্ক সমাধান': 'Solve mathematics problems using simple and shortcut techniques',
  'ভর্তি ফি: ১,০০০ টাকা মাত্র': 'Admission fee: BDT 1,000 only',
  'পরবর্তী প্রতি মাসে মাসিক ফি: ৮০০ টাকা': 'Monthly fee thereafter: BDT 800',
  'উভয় বিষয়ের স্পেশাল নোট ও প্রশ্নব্যাংক': 'Special notes and question banks for both subjects',
  'প্রতি মাসে মাসিক ফি: ১,০০০ টাকা করে নিয়মিত প্রযোজ্য': 'Regular monthly fee: BDT 1,000',
  'বাংলা, ইংরেজি, গণিত ও বিজ্ঞানে বিশেষ যত্ন': 'Special attention to Bangla, English, mathematics, and science',
  'মোট কোর্স মূল্য: ৪,৫০০ টাকা | স্পেশাল অফার মূল্য: ৩,৫০০ টাকা': 'Total course fee: BDT 4,500 | Special offer price: BDT 3,500',
  'প্রথমে ১,৫০০ টাকা দিয়ে ভর্তি হওয়া যাবে': 'Enroll with an initial payment of BDT 1,500',
  'পরীক্ষা দেওয়ার সময় বাকি ফি পরিশোধ করতে হবে': 'The remaining fee must be paid before the examination',
  'অনলাইন মার্কশিট-সার্টিফিকেটের পাশাপাশি সরকারি সার্টিফিকেট (Government Certificate) পাওয়ার বিশেষ সুবিধা': 'Receive an online marksheet and certificate, with the added benefit of a government certificate',
  'মোট কোর্স মূল্য: ৪,০০০ টাকা': 'Total course fee: BDT 4,000',
  'শিক্ষার্থী চাইলে প্রথমে ২,০০০ টাকা দিয়ে ভর্তি হতে পারবে': 'Students may enroll with an initial payment of BDT 2,000',
  'রিয়েল-টাইম কনভারসেশন ও প্রেজেন্টেশন সেশন': 'Real-time conversation and presentation sessions',
  'মোট কোর্স মূল্য: ৪,৫০০ টাকা (অফার মূল্য সহ)': 'Total course fee: BDT 4,500 (including the offer price)',
  'প্রথমে ২,০০০ টাকা দিয়ে ভর্তি হতে পারবে': 'Enroll with an initial payment of BDT 2,000',
  'বাকি ২,৫০০ টাকা কিস্তিতে পরিশোধের সুবিধা': 'The remaining BDT 2,500 can be paid in installments',
  'ভর্তি ফি ৫০০ টাকা দিয়ে শুরু, দ্বিতীয় মাস থেকে মাসিক ৫০০ টাকা।': 'Start with a BDT 500 admission fee, then pay BDT 500 per month from the second month.',
  'ভর্তি ফি ৮০০ টাকা (অফার), প্রতি মাসে নিয়মিত ৫০০ টাকা।': 'Admission fee: BDT 800 (offer); regular monthly fee: BDT 500.',
  'ভর্তি ফি ১,০০০ টাকা, প্রতি মাসে মাসিক ফি ৮০০ টাকা।': 'Admission fee: BDT 1,000; monthly fee: BDT 800.',
  'ভর্তি ১,৫০০৳, পরীক্ষা পূর্বে বাকি কোর্স ফি, এবং সার্টিফিকেট ফি ৫০০৳।': 'Admission: BDT 1,500; remaining course fee due before the exam; certificate fee: BDT 500.',
  'ভর্তি ২,০০০৳, বাকি ২,০০০৳ কোর্স চলাকালীন বা শেষে পরিশোধ।': 'Admission: BDT 2,000; the remaining BDT 2,000 is payable during or at the end of the course.',
  'ভর্তি ২,০০০৳, ১ম মাসে ১,০০০৳, ২য় মাসে ১,০০০৳, সার্টিফিকেট উত্তোলনে ৫০০৳।': 'Admission: BDT 2,000; BDT 1,000 in the first month, BDT 1,000 in the second month, and BDT 500 to collect the certificate.',
  'প্রাথমিক ও জুনিয়র': 'Primary and Junior',
  'আইটি ও প্রফেশনাল': 'IT and Professional',
  'সহীহ কুরআন শিক্ষা': 'Authentic Quran Education',
  'এসএসসি ও এইচএসসি হিসাববিজ্ঞান': 'SSC and HSC Accounting',
  'কম্পিউটার অফিস অ্যাপ্লিকেশন': 'Computer Office Applications',
  'হরফ ও মাখরাজ': 'Arabic Letters and Makharij',
  'তাজবীদ রুলস': 'Tajweed Rules',
  'মাদ্দ ও গুন্নাহ': 'Madd and Ghunnah',
  'সূরা হিফজ ও তিলাওয়াত': 'Surah Memorization and Recitation',
  'অধ্যায়ভিত্তিক টেস্ট': 'Chapter-Based Test',
  'প্রাক-নির্বাচনী মডেল টেস্ট': 'Pre-Selection Model Test',
  'এসএসসি ফাইনাল প্রস্তুতি পরীক্ষা': 'SSC Final Preparation Exam',
  'জ্যামিতি মূল্যায়ন': 'Geometry Assessment',
  'বীজগণিত টেস্ট': 'Algebra Test',
  'ফাইনাল মডেল টেস্ট': 'Final Model Test',
  'যৌথ মূল্যায়ন পরীক্ষা': 'Combined Assessment Exam',
  'সেমিস্টার ফাইনাল': 'Semester Final',
  'প্রথম প্রান্তিক মূল্যায়ন': 'First Term Assessment',
  'দ্বিতীয় প্রান্তিক মূল্যায়ন': 'Second Term Assessment',
  'বার্ষিক পরীক্ষা': 'Annual Examination',
  'টাইপিং স্পিড টেস্ট': 'Typing Speed Test',
  'এক্সেল প্র্যাকটিক্যাল ল্যাব': 'Excel Practical Lab Test',
  'কারিগরি বোর্ড ফাইনাল পরীক্ষা': 'Technical Board Final Examination'
};

function translateOne(value: string): string {
  if (/^[A-Za-z0-9\s&.,()+:/-]+$/.test(value)) return value;
  let translated = value;
  Object.keys(AUTO_TRANSLATIONS).sort((a, b) => b.length - a.length).forEach(source => {
    if (source && translated.includes(source)) translated = translated.split(source).join(AUTO_TRANSLATIONS[source]);
  });
  // Do not pretend a partial translation is complete. Leave unknown Bengali text for review.
  return /[\u0980-\u09FF]/.test(translated) ? '' : translated.trim();
}

function translateValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const translated = value.map(item => typeof item === 'string' ? translateOne(item) : '');
    return translated.every(Boolean) ? translated : [];
  }
  return typeof value === 'string' ? translateOne(value) : '';
}

function hasBengaliText(value: unknown): boolean {
  return /[\u0980-\u09FF]/.test(toText(value));
}

function hasSuggestedTranslation(value: unknown): boolean {
  const translated = translateValue(value);
  return typeof translated === 'string' ? Boolean(translated) : Array.isArray(translated) && translated.length > 0;
}

export const BilingualContentManager: React.FC<BilingualContentManagerProps> = ({ sections, onSave }) => {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || 'settings');
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0];
  const activeItem = activeSection?.items?.[activeItemIndex] || activeSection?.items?.[0];
  const untranslatedCount = sections.reduce((sectionTotal, section) => sectionTotal + section.items.reduce((itemTotal, item) => itemTotal + Object.entries(item).filter(([field, value]) => {
    if (!isEditableTextField(field, value) || !hasBengaliText(value)) return false;
    const target = item[englishKey(section.id, field)];
    return !toText(target).trim() && !hasSuggestedTranslation(value);
  }).length, 0), 0);

  // Migrate known legacy Bangla defaults to English fields the first time this panel opens.
  useEffect(() => {
    sections.forEach(section => {
      let changed = false;
      const migrated = section.items.map(item => {
        const next = { ...item };
        Object.entries(item).forEach(([field, value]) => {
          if (!isEditableTextField(field, value)) return;
          const targetKey = englishKey(section.id, field);
          if (next[targetKey] !== undefined && next[targetKey] !== '') return;
          const translated = translateValue(value);
          if (Array.isArray(translated) && translated.some(Boolean)) {
            next[targetKey] = translated;
            changed = true;
          } else if (typeof translated === 'string' && translated) {
            next[targetKey] = translated;
            changed = true;
          }
        });
        return next;
      });
      if (changed) section.onChange(migrated);
    });
  }, [sections]);

  const fields = useMemo(() => activeItem
    ? Object.entries(activeItem).filter(([key, value]) => isEditableTextField(key, value))
    : [], [activeItem]);

  if (!activeSection) return <div className="rounded-2xl border p-6">No content sections are available.</div>;

  const updateField = (field: string, value: string, english: boolean) => {
    const key = english ? englishKey(activeSection.id, field) : field;
    const originalValue = activeItem?.[field];
    const normalized: unknown = Array.isArray(originalValue) ? value.split(',').map(v => v.trim()).filter(Boolean) : value;
    const updated = activeSection.items.map((item, index) => index === activeItemIndex
      ? { ...item, [key]: normalized }
      : item);
    activeSection.onChange(updated);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-extrabold text-blue-950">বাংলা + English Content Manager</h3>
        <p className="mt-1 text-sm text-blue-900">সব কনটেন্ট সেকশন এখানে যাচাই করুন। পরিচিত পুরোনো বাংলা লেখার অনুবাদ স্বয়ংক্রিয়ভাবে বসানো হবে; অচেনা বাংলা লেখা ফাঁকা English ঘর হিসেবে থাকবে, যাতে ভুল অনুবাদকে সঠিক বলে দেখানো না হয়। English ঘর পূরণ করে Save All করুন।</p>
        <p className="mt-2 text-xs font-bold text-blue-950">প্রতিটি রেকর্ডে বাংলা ও English পাশাপাশি সম্পাদনা করা যাবে। অজানা/কাস্টম বাংলা লেখার জন্য ইংরেজি অনুবাদ হাতে যাচাই করে লিখতে হবে।</p>
        <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${untranslatedCount ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
          {untranslatedCount ? `ম্যানুয়াল English অনুবাদ বাকি: ${untranslatedCount}টি ফিল্ড` : 'পরিচিত বাংলা কনটেন্টের অনুবাদ সম্পন্ন'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">সেকশন / Section</label>
          <select
            value={activeSection.id}
            onChange={event => { setActiveSectionId(event.target.value); setActiveItemIndex(0); }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            {sections.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}
          </select>
        </div>
        {activeSection.items.length > 1 && (
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">রেকর্ড / Record</label>
            <select
              value={activeItemIndex}
              onChange={event => setActiveItemIndex(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {activeSection.items.map((item, index) => (
                <option key={String(item.id || index)} value={index}>
                  {index + 1}. {String(item.title || item.name || item.studentName || item.botName || item.courseTitle || item.category || item.id || 'Record').slice(0, 72)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeItem ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h4 className="font-bold text-slate-900">{String(activeItem.title || activeItem.name || activeItem.studentName || activeItem.botName || activeItem.courseTitle || activeItem.id || activeSection.label)}</h4>
              <p className="text-xs text-slate-500">বাংলা ও ইংরেজি পাশাপাশি সম্পাদনা করুন</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{fields.length} fields</span>
          </div>

          {fields.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">এই রেকর্ডে অনুবাদযোগ্য টেক্সট ফিল্ড পাওয়া যায়নি।</p>
          ) : fields.map(([field, value]) => {
            const translatedKey = englishKey(activeSection.id, field);
            const englishValue = activeItem[translatedKey] || translateValue(value);
            const label = FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
            const isLong = /speech|description|content|bio|answer|question|prompt|knowledge|bodyText|footerText|notice|comments/i.test(field);
            const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100';
            return (
              <div key={field} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-extrabold text-slate-800">{label}</div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">বাংলা / Bangla</label>
                    {isLong ? (
                      <textarea rows={3} value={toText(value)} onChange={event => updateField(field, event.target.value, false)} className={inputClass} />
                    ) : (
                      <input value={toText(value)} onChange={event => updateField(field, event.target.value, false)} className={inputClass} />
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-blue-800">English translation</label>
                    {isLong ? (
                      <textarea rows={3} value={toText(englishValue)} onChange={event => updateField(field, event.target.value, true)} placeholder="Write the English translation..." className={inputClass} />
                    ) : (
                      <input value={toText(englishValue)} onChange={event => updateField(field, event.target.value, true)} placeholder="English translation..." className={inputClass} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <p className="text-xs text-slate-500">পরিবর্তনগুলো Save All চাপার পর স্থায়ীভাবে সিঙ্ক হবে।</p>
            <button type="button" onClick={() => void onSave()} className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-800">সব পরিবর্তন সংরক্ষণ ও সিঙ্ক করুন</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">এই সেকশনে কোনো রেকর্ড নেই।</p>
      )}
    </div>
  );
};
