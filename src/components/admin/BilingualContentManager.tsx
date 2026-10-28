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

const AUTO_TRANSLATIONS: Record<string, string> = {
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
  'গণিত ও প্রাইমারি বিভাগীয় প্রধান': 'Head of Mathematics and Primary Division'
};

function translateValue(value: unknown): unknown {
  if (Array.isArray(value)) { const translated = value.map(item => typeof item === 'string' ? (AUTO_TRANSLATIONS[item] || '') : ''); return translated.every(Boolean) ? translated : []; }
  return typeof value === 'string' ? (AUTO_TRANSLATIONS[value] || '') : '';
}

export const BilingualContentManager: React.FC<BilingualContentManagerProps> = ({ sections, onSave }) => {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || 'settings');
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0];
  const activeItem = activeSection?.items?.[activeItemIndex] || activeSection?.items?.[0];

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
        <p className="mt-1 text-sm text-blue-900">প্রতিটি সেকশনের বর্তমান বাংলা কনটেন্টের পাশে ইংরেজি অনুবাদ লিখুন। এখানে পরিবর্তনগুলো মূল সেকশনের ডেটাতেই সংরক্ষিত হবে। পুরোনো পরিচিত বাংলা কনটেন্টের ইংরেজি অনুবাদ স্বয়ংক্রিয়ভাবে বসানো হবে; নতুন বা অচেনা লেখা থাকলে ইংরেজি ঘরটি যাচাই করে পূরণ করুন।</p>
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
            const englishValue = activeItem[translatedKey] ?? translateValue(value);
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
