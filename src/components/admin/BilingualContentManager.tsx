import React, { useMemo, useState } from 'react';

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

export const BilingualContentManager: React.FC<BilingualContentManagerProps> = ({ sections, onSave }) => {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || 'settings');
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0];
  const activeItem = activeSection?.items?.[activeItemIndex] || activeSection?.items?.[0];

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
        <p className="mt-1 text-sm text-blue-900">প্রতিটি সেকশনের বর্তমান বাংলা কনটেন্টের পাশে ইংরেজি অনুবাদ লিখুন। এখানে পরিবর্তনগুলো মূল সেকশনের ডেটাতেই সংরক্ষিত হবে। পুরোনো বাংলা লেখা স্বয়ংক্রিয়ভাবে অনুবাদ করা হয়নি—অর্থ ঠিক রাখতে ইংরেজি অনুবাদ যাচাই করে পূরণ করুন।</p>
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
            const englishValue = activeItem[translatedKey];
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
