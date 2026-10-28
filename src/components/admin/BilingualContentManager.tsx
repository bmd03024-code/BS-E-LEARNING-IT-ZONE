import React, { useMemo, useState } from 'react';

type ContentRecord = Record<string, unknown>;

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

const ENGLISH_KEY_OVERRIDES: Record<string, Record<string, string>> = {
  courses: { title: 'titleEnglish', description: 'descriptionEnglish', category: 'categoryEnglish', subjects: 'subjectsEnglish', exams: 'examsEnglish' },
  students: { name: 'englishName', fatherName: 'fatherNameEnglish', motherName: 'motherNameEnglish' },
  applications: { studentName: 'studentNameEnglish' },
  certificates: { studentName: 'studentNameEnglish' },
};

const EXCLUDED_KEYS = /(^id$|Id$|^(phone|email|date|time|year|amount|fee|gpa|totalMarks|obtained|total|active|enabled|status|type|url|.*Url|.*Image|.*Photo|.*Token|password|pin|marks|roll|trxId|transactionId|is[A-Z].*)$)/i;

const FIELD_LABELS: Record<string, string> = {
  name: 'Name', title: 'Title', subName: 'Subtitle', description: 'Description',
  subText: 'Subtitle text', ctaText: 'Button text', badge: 'Badge',
  founderName: 'Founder name', founderTitle: 'Founder designation',
  founderSpeech: 'Founder message', welcomeText: 'Welcome message',
  footerText: 'Footer text', footerCopyright: 'Copyright text',
  footerNotice: 'Footer notice', address: 'Address', designation: 'Designation',
  qualifications: 'Qualifications', experience: 'Experience', specialist: 'Specialization',
  bio: 'Biography', comments: 'Comments', category: 'Category', content: 'Content',
  subject: 'Subject', subjects: 'Subjects', exams: 'Exams', examType: 'Exam type',
  examCenter: 'Exam center', teacherName: 'Teacher name', instructor: 'Instructor',
  room: 'Room', day: 'Day', duration: 'Duration', features: 'Features',
  paymentDetails: 'Payment details', certificateTitle: 'Certificate title',
  bodyText: 'Certificate body', institutionName: 'Institution name',
  institutionSubName: 'Institution subtitle', courseTitle: 'Course title',
  studentName: 'Student name', fatherName: 'Father name', motherName: 'Mother name',
  rejectionReason: 'Rejection reason', question: 'Question', answer: 'Answer',
  botName: 'Chatbot name', welcomeMessage: 'Welcome message',
  basePrompt: 'Base prompt', knowledgeBaseText: 'Knowledge base',
};

function englishKey(sectionId: string, field: string): string {
  return ENGLISH_KEY_OVERRIDES[sectionId]?.[field] || `${field}English`;
}

function textValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  return typeof value === 'string' ? value : '';
}

function editableFields(record: ContentRecord): string[] {
  return Object.keys(record).filter((key) => {
    if (key.endsWith('English') || EXCLUDED_KEYS.test(key)) return false;
    const value = record[key];
    return typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
  });
}

const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export const BilingualContentManager: React.FC<BilingualContentManagerProps> = ({ sections, onSave }) => {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || '');
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
  const activeItem = activeSection?.items[activeItemIndex];
  const fields = useMemo(() => activeItem ? editableFields(activeItem) : [], [activeItem]);

  const updateField = (field: string, value: string, isEnglish: boolean) => {
    if (!activeSection || !activeItem) return;
    const key = isEnglish ? englishKey(activeSection.id, field) : field;
    const nextItems = activeSection.items.map((item, index) => index === activeItemIndex
      ? { ...item, [key]: value }
      : item);
    activeSection.onChange(nextItems);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <h2 className="text-lg font-extrabold text-slate-900">বাংলা ও English কনটেন্ট</h2>
        <p className="mt-1 text-sm text-slate-600">প্রতিটি বাংলা লেখার পাশে ইংরেজি লেখাটি আলাদাভাবে লিখুন। দুই ঘরই একসঙ্গে দেখা যাবে।</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-700">সেকশন নির্বাচন করুন</span>
          <select className={inputClass} value={activeSection?.id || ''} onChange={(event) => { setActiveSectionId(event.target.value); setActiveItemIndex(0); }}>
            {sections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-bold text-slate-700">রেকর্ড নির্বাচন করুন</span>
          <select className={inputClass} value={String(activeItemIndex)} onChange={(event) => setActiveItemIndex(Number(event.target.value))}>
            {(activeSection?.items || []).map((item, index) => <option key={String(item.id ?? index)} value={index}>{String(item.name || item.title || item.studentName || item.courseTitle || `Record ${index + 1}`)}</option>)}
          </select>
        </label>
      </div>

      {activeItem && fields.length > 0 ? (
        <div className="space-y-4">
          {fields.map((field) => {
            const englishField = englishKey(activeSection.id, field);
            const banglaValue = textValue(activeItem[field]);
            const englishValue = textValue(activeItem[englishField]);
            const isLong = Math.max(banglaValue.length, englishValue.length) > 100 || /description|content|speech|message|bio|prompt|address|notice|text|answer|question/i.test(field);
            const label = FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
            const Field = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => isLong
              ? <textarea rows={3} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
              : <input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />;
            return (
              <div key={field} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-extrabold text-slate-800">{label}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-emerald-700">বাংলা</span>
                    <Field value={banglaValue} onChange={(value) => updateField(field, value, false)} placeholder={`বাংলা ${label} লিখুন`} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-blue-700">English</span>
                    <Field value={englishValue} onChange={(value) => updateField(field, value, true)} placeholder={`Enter English ${label.toLowerCase()}`} />
                  </label>
                </div>
              </div>
            );
          })}
          <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg">
            <p className="text-xs text-slate-500">পরিবর্তনগুলো স্থায়ী করতে Save All চাপুন।</p>
            <button type="button" onClick={() => void onSave()} className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-800">সব পরিবর্তন সংরক্ষণ ও সিঙ্ক করুন</button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">এই সেকশনে কোনো রেকর্ড বা সম্পাদনাযোগ্য টেক্সট ফিল্ড নেই।</p>
      )}
    </div>
  );
};
