/**
 * ============================================================================
 * Comprehensive In-Built Offline Dictionary Database
 * ============================================================================
 * 
 * 100% Offline, Zero Third-Party API Dependency, High-Speed Instant Lookup
 * Includes English Word, Part of Speech, Phonetics, Bengali Meaning, English Definition,
 * Example Sentences with Bengali Translation, Synonyms, Antonyms, and Categories.
 */

export interface OfflineDictionaryEntry {
  word: string;
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition' | 'Conjunction' | 'Pronoun' | 'Interjection' | string;
  pronunciation?: string;
  bengaliMeaning: string;
  englishDefinition: string;
  example: string;
  exampleBengali?: string;
  synonyms?: string[];
  antonyms?: string[];
  category: 'Academic' | 'IT & Computer' | 'Business & Accounting' | 'Daily Conversation' | 'English Grammar' | 'Science' | 'Ethics & Motivation';
}

export const OFFLINE_DICTIONARY: OfflineDictionaryEntry[] = [
  // --- A ---
  {
    word: "abandon",
    partOfSpeech: "Verb",
    pronunciation: "/əˈbæn.dən/",
    bengaliMeaning: "পরিত্যাগ করা, ছেড়ে দেওয়া, বর্জন করা",
    englishDefinition: "To leave a place, thing, or person, usually for ever; to give up completely.",
    example: "The sailors had to abandon the sinking ship.",
    exampleBengali: "নাবিকদের ডুবন্ত জাহাজটি পরিত্যাগ করতে হয়েছিল।",
    synonyms: ["desert", "discard", "forsake", "relinquish"],
    antonyms: ["retain", "keep", "claim", "maintain"],
    category: "Daily Conversation"
  },
  {
    word: "ability",
    partOfSpeech: "Noun",
    pronunciation: "/əˈbɪl.ə.ti/",
    bengaliMeaning: "সক্ষমতা, সামর্থ্য, দক্ষতা",
    englishDefinition: "The physical or mental power or skill needed to do something.",
    example: "She has the ability to solve complex mathematical problems.",
    exampleBengali: "জটিল গাণিতিক সমস্যা সমাধান করার সামর্থ্য তার রয়েছে।",
    synonyms: ["capability", "competence", "talent", "skill"],
    antonyms: ["inability", "incompetence", "weakness"],
    category: "Academic"
  },
  {
    word: "abundant",
    partOfSpeech: "Adjective",
    pronunciation: "/əˈbʌn.dənt/",
    bengaliMeaning: "প্রচুর, অপর্যাপ্ত, প্রাচুর্যময়",
    englishDefinition: "Existing or available in large quantities; plentiful.",
    example: "The fertile river valley provided an abundant harvest of crops.",
    exampleBengali: "উর্বর নদী অববাহিকায় প্রচুর ফসলের ফলন হয়েছিল।",
    synonyms: ["plentiful", "copious", "ample", "bountiful"],
    antonyms: ["scarce", "meager", "deficient", "lacking"],
    category: "Academic"
  },
  {
    word: "academic",
    partOfSpeech: "Adjective",
    pronunciation: "/ˌæk.əˈdem.ɪk/",
    bengaliMeaning: "শিক্ষাবিষয়ক, প্রাতিষ্ঠানিক, তত্ত্বীয়",
    englishDefinition: "Relating to schools, colleges, and universities, or connected with studying and thinking.",
    example: "The student showed outstanding academic excellence this year.",
    exampleBengali: "শিক্ষার্থীটি এ বছর অসাধারণ শিক্ষাগত উৎকর্ষ প্রদর্শন করেছে।",
    synonyms: ["scholarly", "educational", "intellectual", "collegiate"],
    antonyms: ["practical", "vocational", "non-academic"],
    category: "Academic"
  },
  {
    word: "accelerate",
    partOfSpeech: "Verb",
    pronunciation: "/əkˈsel.ə.reɪt/",
    bengaliMeaning: "ত্বরান্বিত করা, গতি বৃদ্ধি করা",
    englishDefinition: "To increase speed or cause something to happen sooner than expected.",
    example: "Digital technology has accelerated the pace of global communication.",
    exampleBengali: "ডিজিটাল প্রযুক্তি বিশ্বব্যাপী যোগাযোগের গতিকে ত্বরান্বিত করেছে।",
    synonyms: ["speed up", "quicken", "hasten", "expedite"],
    antonyms: ["decelerate", "slow down", "delay", "hinder"],
    category: "Science"
  },
  {
    word: "accounting",
    partOfSpeech: "Noun",
    pronunciation: "/əˈkaʊn.tɪŋ/",
    bengaliMeaning: "হিসাববিজ্ঞান; লেনদেন লিপিবদ্ধকরণ ও আর্থিক বিবরণী প্রস্তুতের পদ্ধতি",
    englishDefinition: "The skill or practice of maintaining, auditing, and processing financial accounts.",
    example: "Accounting is known as the universal language of business.",
    exampleBengali: "হিসাববিজ্ঞানকে ব্যবসায়ের সার্বজনীন ভাষা বলা হয়।",
    synonyms: ["bookkeeping", "auditing", "financial recording", "accountancy"],
    antonyms: [],
    category: "Business & Accounting"
  },
  {
    word: "accuracy",
    partOfSpeech: "Noun",
    pronunciation: "/ˈæk.jɚ.ə.si/",
    bengaliMeaning: "নির্ভুলতা, যথার্থতা, সঠিকতা",
    englishDefinition: "The state of being exact, correct, or without any mistakes.",
    example: "The accountant checked the ledger with great accuracy.",
    exampleBengali: "হিসাবরক্ষক অত্যন্ত নির্ভুলতার সাথে খতিয়ান পরীক্ষা করলেন।",
    synonyms: ["precision", "exactness", "correctness", "veracity"],
    antonyms: ["inaccuracy", "error", "fault", "imprecision"],
    category: "Academic"
  },
  {
    word: "acquire",
    partOfSpeech: "Verb",
    pronunciation: "/əˈkwaɪɚ/",
    bengaliMeaning: "অর্জন করা, আয়ত্ত করা, লাভ করা",
    englishDefinition: "To get or obtain something through one's own efforts, ability, or behavior.",
    example: "Students acquire practical computer skills through daily lab work.",
    exampleBengali: "শিক্ষার্থীরা প্রতিদিনের ল্যাব অনুশীলনের মাধ্যমে ব্যবহারিক কম্পিউটার দক্ষতা অর্জন করে।",
    synonyms: ["gain", "obtain", "attain", "procure"],
    antonyms: ["lose", "forfeit", "relinquish", "surrender"],
    category: "Academic"
  },
  {
    word: "adaptation",
    partOfSpeech: "Noun",
    pronunciation: "/ˌæd.əpˈteɪ.ʃən/",
    bengaliMeaning: "অভিযোজন, খাপ খাওয়ানো, রূপান্তর",
    englishDefinition: "The process of changing to suit different conditions or a new environment.",
    example: "Successful learning requires quick adaptation to modern digital tools.",
    exampleBengali: "সফল শিক্ষার জন্য আধুনিক ডিজিটাল প্রযুক্তির সাথে দ্রুত অভিযোজন প্রয়োজন।",
    synonyms: ["adjustment", "acclimatization", "modification", "accommodation"],
    antonyms: ["resistance", "inflexibility", "nonconformity"],
    category: "Science"
  },
  {
    word: "adjective",
    partOfSpeech: "Noun",
    pronunciation: "/ˈædʒ.ek.tɪv/",
    bengaliMeaning: "বিশেষণ; যে শব্দ Noun বা Pronoun-এর দোষ, গুণ, অবস্থা বা সংখ্যা প্রকাশ করে",
    englishDefinition: "A word that describes or clarifies a noun or a pronoun.",
    example: "In the sentence 'She is a brilliant student', 'brilliant' is an adjective.",
    exampleBengali: "'She is a brilliant student' বাক্যে 'brilliant' হলো একটি Adjective।",
    synonyms: ["descriptor", "modifier", "qualifier"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "adverb",
    partOfSpeech: "Noun",
    pronunciation: "/ˈæd.vɝːb/",
    bengaliMeaning: "ভাববিশেষণ বা ক্রিয়াবিশেষণ; যে শব্দ Verb, Adjective বা অন্য Adverb-কে বিশেষিত করে",
    englishDefinition: "A word that describes or gives more information about a verb, adjective, or other adverb.",
    example: "He answered the questions very quickly and accurately.",
    exampleBengali: "সে অত্যন্ত দ্রুত ও নির্ভুলভাবে প্রশ্নগুলোর উত্তর দিয়েছিল।",
    synonyms: ["modifier", "qualifying word"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "algorithm",
    partOfSpeech: "Noun",
    pronunciation: "/ˈæl.ɡə.rɪð.əm/",
    bengaliMeaning: "অ্যালগরিদম; সমস্যা সমাধানের ধাপে ধাপে সুনির্দিষ্ট নিয়মতান্ত্রিক কার্যপদ্ধতি",
    englishDefinition: "A set of mathematical or computational rules that will help calculate an answer to a problem.",
    example: "Search engines use an advanced algorithm to display relevant results.",
    exampleBengali: "সার্চ ইঞ্জিনগুলো প্রাসঙ্গিক ফলাফল প্রদর্শনের জন্য একটি উন্নত অ্যালগরিদম ব্যবহার করে।",
    synonyms: ["procedure", "formula", "process", "system", "method"],
    antonyms: ["randomness", "chaos"],
    category: "IT & Computer"
  },
  {
    word: "allocate",
    partOfSpeech: "Verb",
    pronunciation: "/ˈæl.ə.keɪt/",
    bengaliMeaning: "বরাদ্দ করা, বণ্টন করা, নির্দিষ্ট করা",
    englishDefinition: "To give something to someone as their share of a total amount, to use in a particular way.",
    example: "The government allocated extra funds for computer lab development.",
    exampleBengali: "সরকার কম্পিউটার ল্যাব উন্নয়নের জন্য অতিরিক্ত তহবিল বরাদ্দ করেছে।",
    synonyms: ["assign", "allot", "designate", "distribute"],
    antonyms: ["withhold", "confiscate", "keep"],
    category: "Business & Accounting"
  },
  {
    word: "ambition",
    partOfSpeech: "Noun",
    pronunciation: "/æmˈbɪʃ.ən/",
    bengaliMeaning: "উচ্চাকাঙ্ক্ষা, বড় লক্ষ্য, তীব্র বাসনা",
    englishDefinition: "A strong wish or determination to achieve something, such as success, honor, or power.",
    example: "His ambition is to become a top software engineer in Bangladesh.",
    exampleBengali: "তার উচ্চাকাঙ্ক্ষা হলো বাংলাদেশের একজন শীর্ষ সফটওয়্যার ইঞ্জিনিয়ার হওয়া।",
    synonyms: ["aspiration", "goal", "objective", "drive"],
    antonyms: ["apathy", "indifference", "laziness"],
    category: "Ethics & Motivation"
  },
  {
    word: "analyze",
    partOfSpeech: "Verb",
    pronunciation: "/ˈæn.əl.aɪz/",
    bengaliMeaning: "বিশ্লেষণ করা, খুঁটিনাটি পরীক্ষা করা",
    englishDefinition: "To study or examine something in detail, in order to discover or understand more about it.",
    example: "The mentor helped the student analyze the financial statement.",
    exampleBengali: "মেন্টর শিক্ষার্থীকে আর্থিক বিবরণীটি বিশ্লেষণ করতে সাহায্য করলেন।",
    synonyms: ["examine", "investigate", "evaluate", "scrutinize"],
    antonyms: ["ignore", "synthesize", "overlook"],
    category: "Academic"
  },
  {
    word: "anticipate",
    partOfSpeech: "Verb",
    pronunciation: "/ænˈtɪs.ə.peɪt/",
    bengaliMeaning: "প্রত্যাশা করা, আগে থেকেই অনুমান করা",
    englishDefinition: "To imagine or expect that something will happen.",
    example: "We anticipate high student enrollment for the upcoming semester.",
    exampleBengali: "আমরা আসন্ন সেমিস্টারের জন্য শিক্ষার্থীদের উচ্চ ভর্তির হার প্রত্যাশা করছি।",
    synonyms: ["expect", "foresee", "predict", "await"],
    antonyms: ["doubt", "neglect", "disregard"],
    category: "Daily Conversation"
  },
  {
    word: "application",
    partOfSpeech: "Noun",
    pronunciation: "/ˌæp.ləˈkeɪ.ʃən/",
    bengaliMeaning: "আবেদন; ব্যবহারিক প্রয়োগ; কম্পিউটার অ্যাপ্লিকেশন সফটওয়্যার",
    englishDefinition: "A computer program with a specific purpose; an official request for something.",
    example: "Students completed their admission form through the online application.",
    exampleBengali: "শিক্ষার্থীরা অনলাইন অ্যাপ্লিকেশনের মাধ্যমে তাদের ভর্তি ফরম পূরণ করেছে।",
    synonyms: ["program", "software", "app", "petition", "request"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "appraise",
    partOfSpeech: "Verb",
    pronunciation: "/əˈpreɪz/",
    bengaliMeaning: "মূল্যায়ন করা, মূল্য নিরূপণ করা",
    englishDefinition: "To examine someone or something in order to judge their qualities, success, or needs.",
    example: "The teacher will appraise each student's progress at the end of the month.",
    exampleBengali: "শিক্ষক মাস শেষে প্রতিটি শিক্ষার্থীর অগ্রগতির মূল্যায়ন করবেন।",
    synonyms: ["assess", "evaluate", "judge", "rate"],
    antonyms: ["disregard", "misjudge"],
    category: "Academic"
  },
  {
    word: "artificial",
    partOfSpeech: "Adjective",
    pronunciation: "/ˌɑːr.t̬əˈfɪʃ.əl/",
    bengaliMeaning: "কৃত্রিম, মানবনির্মিত, অপ্রাকৃতিক",
    englishDefinition: "Made by people, often as a copy of something natural.",
    example: "Artificial Intelligence is transforming how we learn and work.",
    exampleBengali: "কৃত্রিম বুদ্ধিমত্তা আমাদের শেখা ও কাজের পদ্ধতিকে বদলে দিচ্ছে।",
    synonyms: ["synthetic", "man-made", "simulated", "fabricated"],
    antonyms: ["natural", "genuine", "authentic", "real"],
    category: "IT & Computer"
  },
  {
    word: "asset",
    partOfSpeech: "Noun",
    pronunciation: "/ˈæs.et/",
    bengaliMeaning: "সম্পদ, পরিসম্পদ; মূল্যবান গুণ বা বস্তু",
    englishDefinition: "A useful or valuable quality, skill, or person; something valuable belonging to an individual or business.",
    example: "A good education is the greatest asset in a person's life.",
    exampleBengali: "একটি ভালো শিক্ষা মানুষের জীবনের সবচেয়ে বড় সম্পদ।",
    synonyms: ["resource", "property", "holding", "advantage"],
    antonyms: ["liability", "debt", "handicap"],
    category: "Business & Accounting"
  },
  {
    word: "authentic",
    partOfSpeech: "Adjective",
    pronunciation: "/ɑːˈθen.tɪk/",
    bengaliMeaning: "খাঁটি, প্রামাণ্য, নির্ভরযোগ্য, আসল",
    englishDefinition: "Being what it is said to be; genuine and true.",
    example: "Our institute provides authentic government-approved certificates.",
    exampleBengali: "আমাদের প্রতিষ্ঠান প্রামাণ্য সরকারি অনুমোদিত সনদপত্র প্রদান করে।",
    synonyms: ["genuine", "original", "legitimate", "valid"],
    antonyms: ["fake", "counterfeit", "spurious", "bogus"],
    category: "Ethics & Motivation"
  },
  {
    word: "autonomous",
    partOfSpeech: "Adjective",
    pronunciation: "/ɑːˈtɑː.nə.məs/",
    bengaliMeaning: "স্বায়ত্তশাসিত, স্বয়ংক্রিয়, স্বাধীন",
    englishDefinition: "Independent and having the power to make your own decisions; self-governing.",
    example: "Students should become autonomous learners through independent study.",
    exampleBengali: "স্বাধীন অনুশীলনের মাধ্যমে শিক্ষার্থীদের স্বায়ত্তশাসিত শিক্ষার্থী হওয়া উচিত।",
    synonyms: ["independent", "self-reliant", "free", "sovereign"],
    antonyms: ["dependent", "subordinate", "controlled"],
    category: "Academic"
  },

  // --- B ---
  {
    word: "balance",
    partOfSpeech: "Noun",
    pronunciation: "/ˈbæl.əns/",
    bengaliMeaning: "ভারসাম্য; হিসাবের উদ্বৃত্ত বা জের",
    englishDefinition: "A state where things are of equal weight or force; the difference between credits and debits in an account.",
    example: "Maintain a healthy balance between studies and sports.",
    exampleBengali: "পড়াশোনা ও খেলাধুলার মধ্যে একটি স্বাস্থ্যকর ভারসাম্য বজায় রাখুন।",
    synonyms: ["equilibrium", "stability", "remainder", "residual"],
    antonyms: ["imbalance", "instability", "excess"],
    category: "Business & Accounting"
  },
  {
    word: "bandwidth",
    partOfSpeech: "Noun",
    pronunciation: "/ˈbænd.wɪtθ/",
    bengaliMeaning: "ব্যান্ডউইথ; ডেটা স্থানান্তরের সর্বোচ্চ গতি বা ধারণক্ষমতা",
    englishDefinition: "The amount of data that can be sent over an internet connection in a certain amount of time.",
    example: "High-speed broadband offers plenty of bandwidth for live video lectures.",
    exampleBengali: "উচ্চগতির ব্রডব্যান্ড লাইভ ভিডিও লেকচারের জন্য প্রচুর ব্যান্ডউইথ প্রদান করে।",
    synonyms: ["capacity", "throughput", "data rate"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "beneficial",
    partOfSpeech: "Adjective",
    pronunciation: "/ˌben.əˈfɪʃ.əl/",
    bengaliMeaning: "উপকারী, হিতকর, কল্যাণকর",
    englishDefinition: "Helpful, useful, or producing good results.",
    example: "Learning touch typing is extremely beneficial for office work.",
    exampleBengali: "টাচ টাইপিং শেখা অফিসের কাজের জন্য অত্যন্ত উপকারী।",
    synonyms: ["advantageous", "favorable", "helpful", "valuable"],
    antonyms: ["harmful", "detrimental", "disadvantageous"],
    category: "Daily Conversation"
  },
  {
    word: "binary",
    partOfSpeech: "Adjective",
    pronunciation: "/ˈbaɪ.nə.ri/",
    bengaliMeaning: "দ্বিমিক বা বাইনারি (০ এবং ১ ভিত্তিক)",
    englishDefinition: "Relating to, composed of, or involving two things, especially the number system using 0 and 1.",
    example: "Computers store and process all information in binary format.",
    exampleBengali: "কম্পিউটার সমস্ত তথ্য বাইনারি ফরম্যাটে সংরক্ষণ ও প্রক্রিয়াকরণ করে।",
    synonyms: ["dual", "double", "twofold"],
    antonyms: ["singular", "unary"],
    category: "IT & Computer"
  },
  {
    word: "biography",
    partOfSpeech: "Noun",
    pronunciation: "/baɪˈɑː.ɡrə.fi/",
    bengaliMeaning: "জীবনী; কোনো ব্যক্তির জীবনের লিখিত ইতিবৃত্ত",
    englishDefinition: "The life story of a person written by someone else.",
    example: "The students read the biography of Prophet Muhammad (PBUH).",
    exampleBengali: "শিক্ষার্থীরা মহানবী হযরত মুহাম্মদ (সা.)-এর জীবনী পাঠ করেছিল।",
    synonyms: ["life history", "memoir", "chronicle"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "brilliant",
    partOfSpeech: "Adjective",
    pronunciation: "/ˈbrɪl.jənt/",
    bengaliMeaning: "মেধাবী, উজ্জ্বল, অসাধারণ কৃতিত্বপূর্ণ",
    englishDefinition: "Extremely intelligent, skilled, or impressive.",
    example: "The mentor praised the student for her brilliant performance in exams.",
    exampleBengali: "মেন্টর পরীক্ষায় অসাধারণ কৃতিত্বের জন্য শিক্ষার্থীটির প্রশংসা করলেন।",
    synonyms: ["bright", "clever", "exceptional", "talented", "radiant"],
    antonyms: ["dull", "stupid", "mediocre"],
    category: "Ethics & Motivation"
  },
  {
    word: "browser",
    partOfSpeech: "Noun",
    pronunciation: "/ˈbraʊ.zɚ/",
    bengaliMeaning: "ব্রাউজার; ইন্টারনেট ওয়েবসাইট প্রদর্শনের সফটওয়্যার",
    englishDefinition: "A computer program that allows users to view and interact with content on the World Wide Web.",
    example: "Google Chrome is currently the most widely used web browser.",
    exampleBengali: "গুগল ক্রোম বর্তমানে সর্বাধিক ব্যবহৃত ওয়েব ব্রাউজার।",
    synonyms: ["web browser", "navigator"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "budget",
    partOfSpeech: "Noun",
    pronunciation: "/ˈbʌdʒ.ɪt/",
    bengaliMeaning: "বাজেট, আয়-ব্যয়ের পূর্বপরিকল্পিত হিসাব",
    englishDefinition: "A plan to show how much money a person or organization will earn and how much they will spend.",
    example: "The institute prepared its annual financial budget carefully.",
    exampleBengali: "প্রতিষ্ঠানটি সাবধানে তাদের বার্ষিক আর্থিক বাজেট প্রস্তুত করেছে।",
    synonyms: ["financial plan", "allocation", "estimate"],
    antonyms: [],
    category: "Business & Accounting"
  },

  // --- C ---
  {
    word: "calculate",
    partOfSpeech: "Verb",
    pronunciation: "/ˈkæl.kjə.leɪt/",
    bengaliMeaning: "গণনা করা, হিসাব করা",
    englishDefinition: "To judge the number or amount of something by using the information that you already have, and adding, taking away, multiplying, or dividing numbers.",
    example: "Use MS Excel formulas to calculate the total marks instantly.",
    exampleBengali: "মোট নম্বর তাৎক্ষণিকভাবে গণনা করতে MS Excel ফর্মুলা ব্যবহার করুন।",
    synonyms: ["compute", "reckon", "estimate", "determine"],
    antonyms: ["guess", "estimate blindly"],
    category: "Academic"
  },
  {
    word: "capability",
    partOfSpeech: "Noun",
    pronunciation: "/ˌkeɪ.pəˈbɪl.ə.ti/",
    bengaliMeaning: "সক্ষমতা, কার্যক্ষমতা, যোগ্যতা",
    englishDefinition: "The ability or qualities necessary to do something.",
    example: "The new server has the capability to handle thousands of concurrent users.",
    exampleBengali: "নতুন সার্ভারটির একসাথে হাজার হাজার ব্যবহারকারী সামলানোর সক্ষমতা রয়েছে।",
    synonyms: ["capacity", "ability", "potential", "competence"],
    antonyms: ["inability", "limitation", "incompetence"],
    category: "IT & Computer"
  },
  {
    word: "capital",
    partOfSpeech: "Noun",
    pronunciation: "/ˈkæp.ə.t̬əl/",
    bengaliMeaning: "মূলধন, পুঁজি; রাজধানী; বড় হাতের অক্ষর",
    englishDefinition: "Money and possessions, especially a large amount of money used for producing more wealth or for starting a new business.",
    example: "Every business requires initial capital to begin operations.",
    exampleBengali: "প্রতিটি ব্যবসা কার্যক্রম শুরু করার জন্য প্রাথমিক মূলধনের প্রয়োজন হয়।",
    synonyms: ["principal", "funds", "investment", "wealth"],
    antonyms: ["debt", "loss"],
    category: "Business & Accounting"
  },
  {
    word: "certificate",
    partOfSpeech: "Noun",
    pronunciation: "/sɚˈtɪf.ə.kət/",
    bengaliMeaning: "সনদপত্র, প্রত্যয়নপত্র, প্রামাণ্য প্রশংসাপত্র",
    englishDefinition: "An official document that gives information or proves that something is true, especially successful course completion.",
    example: "Upon passing the exam, each student receives a verified certificate.",
    exampleBengali: "পরীক্ষায় উত্তীর্ণ হওয়ার পর প্রতিটি শিক্ষার্থী একটি যাচাইকৃত সনদপত্র লাভ করে।",
    synonyms: ["credential", "diploma", "testimonial", "license"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "clarify",
    partOfSpeech: "Verb",
    pronunciation: "/ˈklær.ə.faɪ/",
    bengaliMeaning: "স্পষ্ট করা, বিশদভাবে ব্যাখ্যা করা",
    englishDefinition: "To make something clear or easier to understand by giving more details.",
    example: "The teacher clarified the rules of Subject-Verb Agreement.",
    exampleBengali: "শিক্ষক Subject-Verb Agreement-এর নিয়মগুলো স্পষ্ট করে বুঝিয়ে দিলেন।",
    synonyms: ["explain", "elucidate", "illuminate", "simplify"],
    antonyms: ["confuse", "obscure", "complicate"],
    category: "Academic"
  },
  {
    word: "collaborate",
    partOfSpeech: "Verb",
    pronunciation: "/kəˈlæb.ə.reɪt/",
    bengaliMeaning: "একসাথে কাজ করা, সহযোগিতা করা",
    englishDefinition: "To work with someone else for a special purpose, combining knowledge and effort.",
    example: "Students collaborate on group IT projects during lab sessions.",
    exampleBengali: "শিক্ষার্থীরা ল্যাব সেশনের সময় গ্রুপ আইটি প্রজেক্টে একসাথে কাজ করে।",
    synonyms: ["cooperate", "partner", "team up", "assist"],
    antonyms: ["compete", "oppose", "resist"],
    category: "Daily Conversation"
  },
  {
    word: "computer",
    partOfSpeech: "Noun",
    pronunciation: "/kəmˈpjuː.t̬ɚ/",
    bengaliMeaning: "কম্পিউটার; ইলেকট্রনিক গণনাকারী ও ডেটা প্রসেসিং যন্ত্র",
    englishDefinition: "An electronic machine that can store, organize, and find information, do processes with numbers and other data, and control other machines.",
    example: "Learning how to use a computer is an essential modern life skill.",
    exampleBengali: "কম্পিউটার ব্যবহার শেখা একটি অপরিহার্য আধুনিক জীবন দক্ষতা।",
    synonyms: ["PC", "workstation", "processor", "laptop"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "confidence",
    partOfSpeech: "Noun",
    pronunciation: "/ˈkɑːn.fə.dəns/",
    bengaliMeaning: "আত্মবিশ্বাস, ভরসা, দৃঢ় প্রত্যয়",
    englishDefinition: "The quality of being certain of your abilities or of having trust in people, plans, or the future.",
    example: "Regular speaking practice builds fluency and confidence in English.",
    exampleBengali: "নিয়মিত কথা বলার অনুশীলন ইংরেজিতে সাবলীলতা ও আত্মবিশ্বাস গড়ে তোলে।",
    synonyms: ["assurance", "self-reliance", "belief", "trust"],
    antonyms: ["doubt", "insecurity", "timidity", "fear"],
    category: "Ethics & Motivation"
  },
  {
    word: "conjunction",
    partOfSpeech: "Noun",
    pronunciation: "/kənˈdʒʌŋk.ʃən/",
    bengaliMeaning: "সংযোজক অব্যয়; যে শব্দ দুই বা ততোধিক শব্দ বা বাক্যকে যুক্ত করে (যেমন: and, but, or)",
    englishDefinition: "A word such as 'and', 'but', 'while', or 'although' that connects words, phrases, or clauses in a sentence.",
    example: "In the sentence 'He worked hard but failed', 'but' is a conjunction.",
    exampleBengali: "'He worked hard but failed' বাক্যে 'but' হলো একটি Conjunction।",
    synonyms: ["connector", "joining word", "link"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "consistent",
    partOfSpeech: "Adjective",
    pronunciation: "/kənˈsɪs.tənt/",
    bengaliMeaning: "ধারাবাহিক, সংগতিপূর্ণ, নিয়মিত",
    englishDefinition: "Always behaving or happening in a similar, especially positive, way.",
    example: "Consistent daily revision is the secret to scoring GPA-5.",
    exampleBengali: "নিয়মিত প্রতিদিনের পুনরাবৃত্তি হলো জিপিএ-৫ পাওয়ার গোপন রহস্য।",
    synonyms: ["steady", "constant", "persistent", "uniform"],
    antonyms: ["inconsistent", "erratic", "variable", "irregular"],
    category: "Ethics & Motivation"
  },
  {
    word: "credential",
    partOfSpeech: "Noun",
    pronunciation: "/krɪˈden.ʃəl/",
    bengaliMeaning: "যোগ্যতার সনদ বা প্রমাণপত্র; পরিচয়জ্ঞাপক তথ্য",
    englishDefinition: "A document, certificate, or ability that provides evidence of someone's qualifications or identity.",
    example: "Keep your login credentials secure and never share your PIN.",
    exampleBengali: "আপনার লগইন তথ্য সুরক্ষিত রাখুন এবং কখনোই আপনার পিন শেয়ার করবেন না।",
    synonyms: ["qualification", "certificate", "license", "authentication"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "credit",
    partOfSpeech: "Noun",
    pronunciation: "/ˈkred.ɪt/",
    bengaliMeaning: "ক্রেডিট; হিসাবের জমার দিক; সুনাম বা কৃতিত্বর স্বীকৃতি",
    englishDefinition: "An entry recording a sum received; praise, approval, or honor given for some action.",
    example: "In modern accounting, revenues and liabilities increase by credit.",
    exampleBengali: "আধুনিক হিসাববিজ্ঞানে আয় ও দায় ক্রেডিট দ্বারা বৃদ্ধি পায়।",
    synonyms: ["deposit", "acknowledgment", "honor", "trust"],
    antonyms: ["debit", "blame", "disrepute"],
    category: "Business & Accounting"
  },
  {
    word: "curriculum",
    partOfSpeech: "Noun",
    pronunciation: "/kəˈrɪk.jə.ləm/",
    bengaliMeaning: "পাঠ্যক্রম, শিক্ষাক্রম, কারিকুলাম",
    englishDefinition: "The subjects comprising a course of study in a school or college.",
    example: "Our IT curriculum is updated regularly to match global industry standards.",
    exampleBengali: "আমাদের আইটি কারিকুলাম বৈশ্বিক শিল্পের সাথে মিলিয়ে নিয়মিত আপডেট করা হয়।",
    synonyms: ["syllabus", "course of study", "program"],
    antonyms: [],
    category: "Academic"
  },

  // --- D ---
  {
    word: "database",
    partOfSpeech: "Noun",
    pronunciation: "/ˈdeɪ.t̬ə.beɪs/",
    bengaliMeaning: "ডাটাবেজ; সুশৃঙ্খলভাবে সাজানো ডিজিটাল তথ্যভাণ্ডার",
    englishDefinition: "A large amount of information stored in a computer system in such a way that it can be easily looked at or changed.",
    example: "Student records and results are securely stored in the cloud database.",
    exampleBengali: "শিক্ষার্থীদের রেকর্ড ও ফলাফল ক্লাউড ডাটাবেজে নিরাপদে সংরক্ষিত থাকে।",
    synonyms: ["repository", "datastore", "archive", "registry"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "debit",
    partOfSpeech: "Noun",
    pronunciation: "/ˈdeb.ɪt/",
    bengaliMeaning: "ডেবিট; হিসাবের খরচের বা বাম দিক",
    englishDefinition: "An accounting entry recording an expense or an asset increase.",
    example: "According to accounting rules, assets and expenses increase by debit.",
    exampleBengali: "হিসাববিজ্ঞানের নিয়ম অনুযায়ী সম্পদ ও ব্যয় ডেবিট দ্বারা বৃদ্ধি পায়।",
    synonyms: ["charge", "withdrawal", "cost"],
    antonyms: ["credit"],
    category: "Business & Accounting"
  },
  {
    word: "dedication",
    partOfSpeech: "Noun",
    pronunciation: "/ˌded.əˈkeɪ.ʃən/",
    bengaliMeaning: "উৎসর্গ, একনিষ্ঠতা, পরম একাগ্রতা",
    englishDefinition: "The willingness to give a lot of time and energy to something because it is important.",
    example: "Teacher Borhanuddin Mohim is known for his immense dedication to students.",
    exampleBengali: "শিক্ষক বোরহানউদ্দিন মহিম শিক্ষার্থীদের প্রতি তাঁর অপরিসীম একনিষ্ঠতার জন্য সুপরিচিত।",
    synonyms: ["devotion", "commitment", "loyalty", "perseverance"],
    antonyms: ["apathy", "indifference", "disloyalty"],
    category: "Ethics & Motivation"
  },
  {
    word: "definition",
    partOfSpeech: "Noun",
    pronunciation: "/ˌdef.əˈnɪʃ.ən/",
    bengaliMeaning: "সংজ্ঞা, সুস্পষ্ট অর্থ বা বিবরণ",
    englishDefinition: "A statement that explains the meaning of a word, phrase, or concept.",
    example: "Please memorize the scientific definition of photosynthesis.",
    exampleBengali: "সালোকসংশ্লেষণের বৈজ্ঞানিক সংজ্ঞাটি অনুগ্রহ করে মুখস্থ করুন।",
    synonyms: ["meaning", "explanation", "description", "elucidation"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "depreciation",
    partOfSpeech: "Noun",
    pronunciation: "/dɪˌpriː.ʃiˈeɪ.ʃən/",
    bengaliMeaning: "অবচয়; ব্যবহার বা সময় অতিবাহিত হওয়ার কারণে স্থায়ী সম্পত্তির মূল্যহ্রাস",
    englishDefinition: "The loss of value of an asset such as machinery or vehicle over time.",
    example: "Computer equipment undergoes annual depreciation in accounting.",
    exampleBengali: "হিসাববিজ্ঞানে কম্পিউটার যন্ত্রপাতির বার্ষিক অবচয় ধার্য করা হয়।",
    synonyms: ["devaluation", "wear and tear", "decrease in value"],
    antonyms: ["appreciation", "increase", "gain"],
    category: "Business & Accounting"
  },
  {
    word: "determination",
    partOfSpeech: "Noun",
    pronunciation: "/dɪˌtɝː.məˈneɪ.ʃən/",
    bengaliMeaning: "দৃঢ় সংকল্প, অটল প্রতিজ্ঞা",
    englishDefinition: "The ability to continue trying to do something, even if it is difficult.",
    example: "With strong determination, you can overcome any exam fear.",
    exampleBengali: "দৃঢ় সংকল্পের সাথে আপনি যেকোনো পরীক্ষার ভয় জয় করতে পারেন।",
    synonyms: ["resolve", "willpower", "tenacity", "fortitude"],
    antonyms: ["hesitation", "vacillation", "weakness"],
    category: "Ethics & Motivation"
  },
  {
    word: "development",
    partOfSpeech: "Noun",
    pronunciation: "/dɪˈvel.əp.mənt/",
    bengaliMeaning: "উন্নয়ন, বিকাশ, ক্রমোন্নতি",
    englishDefinition: "The process in which someone or something grows or changes and becomes more advanced.",
    example: "Skill development is the key to creating youth employment.",
    exampleBengali: "দক্ষতা উন্নয়নই হলো যুব কর্মসংস্থান সৃষ্টির মূল চাবিকাঠি।",
    synonyms: ["progress", "advancement", "growth", "evolution"],
    antonyms: ["decline", "regression", "stagnation"],
    category: "Academic"
  },
  {
    word: "diligent",
    partOfSpeech: "Adjective",
    pronunciation: "/ˈdɪl.ə.dʒənt/",
    bengaliMeaning: "পরিশ্রমী, অধ্যবসায়ী, যত্নবান",
    englishDefinition: "Done in a careful and detailed way; working hard with careful effort.",
    example: "A diligent student never leaves homework for the last moment.",
    exampleBengali: "একজন পরিশ্রমী শিক্ষার্থী কখনোই বাড়ির কাজ শেষ মুহূর্তের জন্য ফেলে রাখে না।",
    synonyms: ["industrious", "hardworking", "assiduous", "conscientious"],
    antonyms: ["lazy", "negligent", "careless", "slothful"],
    category: "Ethics & Motivation"
  },
  {
    word: "discipline",
    partOfSpeech: "Noun",
    pronunciation: "/ˈdɪs.ə.plɪn/",
    bengaliMeaning: "শৃঙ্খলা, নিয়মানুবর্তিতা, আত্মনিয়ন্ত্রণ",
    englishDefinition: "The practice of training people to obey rules or a code of behavior.",
    example: "Discipline and punctuality are the foundation of student life.",
    exampleBengali: "শৃঙ্খলা ও সময়ানুবর্তিতা হলো ছাত্রজীবনের মূল ভিত্তি।",
    synonyms: ["order", "self-control", "regulation", "strictness"],
    antonyms: ["chaos", "disorder", "anarchy", "indiscipline"],
    category: "Ethics & Motivation"
  },
  {
    word: "download",
    partOfSpeech: "Verb",
    pronunciation: "/ˌdaʊnˈloʊd/",
    bengaliMeaning: "ডাউনলোড করা; ইন্টারনেট থেকে নিজের ডিভাইসে ফাইল নেওয়া",
    englishDefinition: "To copy or move programs or information into a computer's memory, especially from the internet.",
    example: "Students can download free handnotes and model questions from the website.",
    exampleBengali: "শিক্ষার্থীরা ওয়েবসাইট থেকে ফ্রি হ্যান্ডনোট ও মডেল প্রশ্ন ডাউনলোড করতে পারে।",
    synonyms: ["fetch", "retrieve", "transfer"],
    antonyms: ["upload"],
    category: "IT & Computer"
  },

  // --- E ---
  {
    word: "education",
    partOfSpeech: "Noun",
    pronunciation: "/ˌedʒ.ʊˈkeɪ.ʃən/",
    bengaliMeaning: "শিক্ষা; জ্ঞানার্জন বা পাঠদান প্রক্রিয়া ও অন্তর্জাগরণ",
    englishDefinition: "The process of teaching or learning, especially in a school, college, or university.",
    example: "Education is the most powerful weapon which you can use to change the world.",
    exampleBengali: "শিক্ষা হলো সবচেয়ে শক্তিশালী হাতিয়ার যা আপনি পৃথিবীকে পরিবর্তন করতে ব্যবহার করতে পারেন।",
    synonyms: ["learning", "schooling", "instruction", "knowledge"],
    antonyms: ["ignorance", "illiteracy"],
    category: "Academic"
  },
  {
    word: "efficiency",
    partOfSpeech: "Noun",
    pronunciation: "/ɪˈfɪʃ.ən.si/",
    bengaliMeaning: "দক্ষতা, কার্যকারিতা, কর্মক্ষমতা",
    englishDefinition: "The condition or fact of producing the results that are wanted without wasting materials, time, or energy.",
    example: "Using keyboard shortcuts increases your typing efficiency significantly.",
    exampleBengali: "কিবোর্ড শর্টকাট ব্যবহার আপনার টাইপিংয়ের দক্ষতাকে বহুলাংশে বৃদ্ধি করে।",
    synonyms: ["effectiveness", "productivity", "competence", "proficiency"],
    antonyms: ["inefficiency", "wastefulness", "incompetence"],
    category: "IT & Computer"
  },
  {
    word: "eliminate",
    partOfSpeech: "Verb",
    pronunciation: "/iˈlɪm.ə.neɪt/",
    bengaliMeaning: "দূর করা, বর্জন করা, অপসারণ করা",
    englishDefinition: "To remove or take away someone or something completely.",
    example: "Computer software eliminates manual calculation mistakes.",
    exampleBengali: "কম্পিউটার সফটওয়্যার হাতে গণনার ভুলত্রুটি পুরোপুরি দূর করে।",
    synonyms: ["remove", "eradicate", "abolish", "discard"],
    antonyms: ["include", "add", "retain"],
    category: "Academic"
  },
  {
    word: "encourage",
    partOfSpeech: "Verb",
    pronunciation: "/ɪnˈkɝː.ɪdʒ/",
    bengaliMeaning: "উৎসাহ দেওয়া, অনুপ্রাণিত করা, সাহস জোগানো",
    englishDefinition: "To make someone more likely to do something, or to make them feel confident.",
    example: "Teachers should always encourage students to ask questions freely.",
    exampleBengali: "শিক্ষকদের সবসময় শিক্ষার্থীদের দ্বিধাহীনভাবে প্রশ্ন করতে উৎসাহিত করা উচিত।",
    synonyms: ["inspire", "motivate", "cheer", "hearten"],
    antonyms: ["discourage", "deter", "dissuade"],
    category: "Daily Conversation"
  },
  {
    word: "encryption",
    partOfSpeech: "Noun",
    pronunciation: "/ɪnˈkrɪp.ʃən/",
    bengaliMeaning: "এনক্রিপশন; তথ্যকে সাংকেতিক ভাষায় রূপান্তর করে সুরক্ষিত করার প্রযুক্তি",
    englishDefinition: "The process of converting information or data into a secure code to prevent unauthorized access.",
    example: "Online payment systems use 256-bit SSL encryption for safety.",
    exampleBengali: "অনলাইন পেমেন্ট সিস্টেম নিরাপত্তার জন্য ২৫৬-বিট এসএসএল এনক্রিপশন ব্যবহার করে।",
    synonyms: ["cipher", "coding", "cryptography", "protection"],
    antonyms: ["decryption", "decoding"],
    category: "IT & Computer"
  },
  {
    word: "enroll",
    partOfSpeech: "Verb",
    pronunciation: "/ɪnˈroʊl/",
    bengaliMeaning: "ভর্তি হওয়া, নাম নিবন্ধন করা",
    englishDefinition: "To put yourself or someone else onto the official list of members of a course, college, or group.",
    example: "You can easily enroll in the 6-month Computer Office Application course.",
    exampleBengali: "আপনি খুব সহজেই ৬ মাস মেয়াদী কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সে ভর্তি হতে পারেন।",
    synonyms: ["register", "sign up", "join", "matriculate"],
    antonyms: ["withdraw", "drop out", "leave"],
    category: "Academic"
  },
  {
    word: "enthusiasm",
    partOfSpeech: "Noun",
    pronunciation: "/ɪnˈθuː.zi.æz.əm/",
    bengaliMeaning: "উৎসাহ, উদ্দীপনা, প্রবল আগ্রহ",
    englishDefinition: "A feeling of energetic interest in a particular subject or an eagerness to be involved.",
    example: "The children showed great enthusiasm for learning computer graphics.",
    exampleBengali: "শিশুরা কম্পিউটার গ্রাফিক্স শেখার জন্য প্রবল উৎসাহ দেখিয়েছিল।",
    synonyms: ["eagerness", "passion", "zeal", "fervor"],
    antonyms: ["apathy", "indifference", "lethargy"],
    category: "Ethics & Motivation"
  },
  {
    word: "environment",
    partOfSpeech: "Noun",
    pronunciation: "/ɪnˈvaɪ.rən.mənt/",
    bengaliMeaning: "পরিবেশ; পারিপার্শ্বিক অবস্থা",
    englishDefinition: "The air, water, and land in or on which people, animals, and plants live.",
    example: "Our classrooms offer a peaceful and friendly learning environment.",
    exampleBengali: "আমাদের ক্লাসরুমগুলো একটি শান্তিপূর্ণ ও বন্ধুত্বপূর্ণ শিক্ষার পরিবেশ প্রদান করে।",
    synonyms: ["surroundings", "atmosphere", "milieu", "setting"],
    antonyms: [],
    category: "Science"
  },
  {
    word: "equity",
    partOfSpeech: "Noun",
    pronunciation: "/ˈek.wə.ti/",
    bengaliMeaning: "মালিকানা স্বত্ব; সমতা ও ন্যায়পরায়ণতা",
    englishDefinition: "The value of a company divided into many equal parts; in accounting, assets minus liabilities.",
    example: "In accounting balance sheets, Assets equal Liabilities plus Owner's Equity.",
    exampleBengali: "হিসাববিজ্ঞানের উদ্বৃত্তপত্রে, সম্পদ সমান দায় যোগ মালিকানা স্বত্ব।",
    synonyms: ["net worth", "ownership", "fairness", "justice"],
    antonyms: ["debt", "injustice", "bias"],
    category: "Business & Accounting"
  },
  {
    word: "evaluate",
    partOfSpeech: "Verb",
    pronunciation: "/ɪˈvæl.ju.eɪt/",
    bengaliMeaning: "মূল্যায়ন করা, মান যাচাই করা",
    englishDefinition: "To judge or calculate the quality, importance, amount, or value of something.",
    example: "The principal evaluated each student's exam sheet carefully.",
    exampleBengali: "প্রধান শিক্ষক প্রতিটি শিক্ষার্থীর পরীক্ষার খাতা সতর্কতার সাথে মূল্যায়ন করলেন।",
    synonyms: ["assess", "judge", "rate", "appraise"],
    antonyms: ["neglect", "ignore"],
    category: "Academic"
  },
  {
    word: "excellence",
    partOfSpeech: "Noun",
    pronunciation: "/ˈek.səl.əns/",
    bengaliMeaning: "উৎকর্ষ, শ্রেষ্ঠত্ব, চরম নৈপুণ্য",
    englishDefinition: "The quality of being outstanding, superior, or extremely good.",
    example: "We strive for excellence in education and ethical values.",
    exampleBengali: "আমরা শিক্ষা এবং নৈতিক মূল্যে উৎকর্ষ অর্জনের জন্য সচেষ্ট থাকি।",
    synonyms: ["superiority", "distinction", "perfection", "brilliance"],
    antonyms: ["mediocrity", "inferiority", "failure"],
    category: "Ethics & Motivation"
  },

  // --- F ---
  {
    word: "faculty",
    partOfSpeech: "Noun",
    pronunciation: "/ˈfæk.əl.ti/",
    bengaliMeaning: "শিক্ষকমণ্ডলী; অনুষদ; মানসিক শক্তি",
    englishDefinition: "The teachers in a school, college, or university.",
    example: "Our experienced faculty is dedicated to every student's success.",
    exampleBengali: "আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী প্রতিটি শিক্ষার্থীর সাফল্যের জন্য নিবেদিত।",
    synonyms: ["teaching staff", "instructors", "professors", "mentors"],
    antonyms: ["students", "pupils"],
    category: "Academic"
  },
  {
    word: "financial",
    partOfSpeech: "Adjective",
    pronunciation: "/faɪˈnæn.ʃəl/",
    bengaliMeaning: "আর্থিক, অর্থসংক্রান্ত",
    englishDefinition: "Relating to money or how money is managed.",
    example: "The institute provides financial scholarships to meritorious students.",
    exampleBengali: "প্রতিষ্ঠানটি মেধাবী শিক্ষার্থীদের আর্থিক বৃত্তি প্রদান করে।",
    synonyms: ["monetary", "fiscal", "pecuniary", "economic"],
    antonyms: [],
    category: "Business & Accounting"
  },
  {
    word: "firewall",
    partOfSpeech: "Noun",
    pronunciation: "/ˈfaɪr.wɑːl/",
    bengaliMeaning: "ফায়ারওয়াল; কম্পিউটার নেটওয়ার্কের নিরাপত্তা সুরক্ষাব্যবস্থা",
    englishDefinition: "A device or software program that stops unauthorized access to a network.",
    example: "A firewall protects institutional computers from hackers and viruses.",
    exampleBengali: "ফায়ারওয়াল প্রাতিষ্ঠানিক কম্পিউটারগুলোকে হ্যাকার ও ভাইরাস থেকে রক্ষা করে।",
    synonyms: ["security barrier", "cyber protection"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "fluency",
    partOfSpeech: "Noun",
    pronunciation: "/ˈfluː.ən.si/",
    bengaliMeaning: "সাবলীলতা, অনর্গল কথা বলার দক্ষতা",
    englishDefinition: "The ability to speak or write a language easily, well, and quickly.",
    example: "Practicing spoken English daily gives you native-like fluency.",
    exampleBengali: "প্রতিদিন স্পোকেন ইংলিশ অনুশীলন করলে আপনার মধ্যে সহজাত সাবলীলতা আসবে।",
    synonyms: ["articulacy", "smoothness", "eloquence", "command"],
    antonyms: ["hesitation", "stuttering", "awkwardness"],
    category: "English Grammar"
  },
  {
    word: "fundamental",
    partOfSpeech: "Adjective",
    pronunciation: "/ˌfʌn.dəˈmen.t̬əl/",
    bengaliMeaning: "মৌলিক, প্রাথমিক, অত্যাবশ্যকীয়",
    englishDefinition: "Forming the base, from which everything else develops; more important than anything else.",
    example: "Mastering the alphabet and Makhraj is fundamental to Quran recitation.",
    exampleBengali: "হরফ ও মাখরাজ আয়ত্ত করা কুরআন তিলাওয়াতের জন্য মৌলিক একটি বিষয়।",
    synonyms: ["basic", "essential", "primary", "vital"],
    antonyms: ["secondary", "minor", "trivial", "unimportant"],
    category: "Academic"
  },

  // --- G ---
  {
    word: "gigabyte",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɡɪɡ.ə.baɪt/",
    bengaliMeaning: "গিগাবাইট (GB); ডিজিটাল স্টোরেজের পরিমাপ (১০২৪ মেগাবাইট)",
    englishDefinition: "A unit of computer memory equal to 1,024 megabytes.",
    example: "The software requires at least 4 gigabytes of RAM to run smoothly.",
    exampleBengali: "সফটওয়্যারটি মসৃণভাবে চলার জন্য অন্তত ৪ গিগাবাইট র‍্যাম প্রয়োজন।",
    synonyms: ["GB"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "grammar",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɡræm.ɚ/",
    bengaliMeaning: "ব্যাকরণ; ভাষা শুদ্ধরূপে বলা ও লেখার নিয়মাবলী",
    englishDefinition: "The rules about how words change their form and combine with other words to make sentences.",
    example: "Good English grammar helps you write error-free exam papers.",
    exampleBengali: "ভালো ইংরেজি ব্যাকরণ আপনাকে ভুলমুক্ত পরীক্ষার খাতা লিখতে সাহায্য করে।",
    synonyms: ["syntax", "linguistic rules", "accidence"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "gratitude",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɡræt̬.ə.tuːd/",
    bengaliMeaning: "কৃতজ্ঞতা, কৃতজ্ঞতাবোধ, আন্তরিক ধন্যবাদ",
    englishDefinition: "The feeling or quality of being grateful and wanting to express thanks.",
    example: "Students expressed their heartfelt gratitude to their teachers.",
    exampleBengali: "শিক্ষার্থীরা তাদের শিক্ষকদের প্রতি আন্তরিক কৃতজ্ঞতা প্রকাশ করেছিল।",
    synonyms: ["thankfulness", "appreciation", "gratefulness"],
    antonyms: ["ingratitude", "unthankfulness"],
    category: "Ethics & Motivation"
  },
  {
    word: "guidance",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɡaɪ.dəns/",
    bengaliMeaning: "দিকনির্দেশনা, পরামর্শ, সঠিক পথ প্রদর্শন",
    englishDefinition: "Help and advice about how to do something or about how to deal with problems.",
    example: "Under the teacher's guidance, students learned proper accounting rules.",
    exampleBengali: "শিক্ষকের দিকনির্দেশনায় শিক্ষার্থীরা সঠিক হিসাববিজ্ঞানের নিয়ম শিখেছে।",
    synonyms: ["direction", "counsel", "advice", "mentorship"],
    antonyms: ["misguidance", "neglect"],
    category: "Academic"
  },

  // --- H ---
  {
    word: "hardware",
    partOfSpeech: "Noun",
    pronunciation: "/ˈhɑːrd.wer/",
    bengaliMeaning: "হার্ডওয়্যার; কম্পিউটারের স্পর্শযোগ্য ভৌত যন্ত্রাংশসমূহ",
    englishDefinition: "The physical and electronic components of a computer, such as the monitor, processor, and keyboard.",
    example: "Mice, monitors, and keyboards are familiar examples of hardware.",
    exampleBengali: "মাউস, মনিটর ও কিবোর্ড হলো হার্ডওয়্যারের সুপরিচিত উদাহরণ।",
    synonyms: ["physical equipment", "components", "machinery"],
    antonyms: ["software"],
    category: "IT & Computer"
  },
  {
    word: "hierarchy",
    partOfSpeech: "Noun",
    pronunciation: "/ˈhaɪ.rɑːr.ki/",
    bengaliMeaning: "মর্যাদাক্রম, স্তরবিন্যাস, ক্রমানুক্রম",
    englishDefinition: "A system in which people or things are arranged according to their importance or rank.",
    example: "The file system organizes documents in a directory hierarchy.",
    exampleBengali: "ফাইল সিস্টেম ফোল্ডারের স্তরবিন্যাসের মাধ্যমে ডকুমেন্টগুলোকে সাজায়।",
    synonyms: ["ranking", "ladder", "order", "chain of command"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "honesty",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɑː.nə.sti/",
    bengaliMeaning: "সততা, সাধুতা, অকপটতা",
    englishDefinition: "The quality of being truthful, sincere, and free of deceit.",
    example: "Honesty is the best policy in both academics and life.",
    exampleBengali: "সততা হলো পড়ালেখা এবং জীবন উভয়ের জন্যই সর্বোত্তম পন্থা।",
    synonyms: ["integrity", "truthfulness", "sincerity", "uprightness"],
    antonyms: ["dishonesty", "deceit", "fraud", "corruption"],
    category: "Ethics & Motivation"
  },
  {
    word: "hypothesize",
    partOfSpeech: "Verb",
    pronunciation: "/haɪˈpɑː.θə.saɪz/",
    bengaliMeaning: "অনুমান করা, প্রকল্প প্রণয়ন করা",
    englishDefinition: "To give a possible but not yet proved explanation for something.",
    example: "Scientists hypothesize that renewable energy will replace fossil fuels.",
    exampleBengali: "বিজ্ঞানীরা অনুমান করেন যে নবায়নযোগ্য শক্তি জীবাশ্ম জ্বালানির স্থান দখল করবে।",
    synonyms: ["theorize", "speculate", "postulate", "suppose"],
    antonyms: ["prove", "demonstrate"],
    category: "Science"
  },

  // --- I ---
  {
    word: "illustration",
    partOfSpeech: "Noun",
    pronunciation: "/ˌɪl.əˈstreɪ.ʃən/",
    bengaliMeaning: "চিত্রাঙ্কন, দৃষ্টান্ত, সচিত্র ব্যাখ্যা",
    englishDefinition: "A picture in a book or magazine; an example that explains or proves something.",
    example: "The book contains clear illustrations to explain biology topics.",
    exampleBengali: "জীববিজ্ঞান বিষয়গুলো বোঝানোর জন্য বইটিতে সুস্পষ্ট চিত্র রয়েছে।",
    synonyms: ["diagram", "picture", "example", "demonstration"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "implement",
    partOfSpeech: "Verb",
    pronunciation: "/ˈɪm.plə.ment/",
    bengaliMeaning: "বাস্তবায়ন করা, কার্যকর করা",
    englishDefinition: "To start using a plan, system, or decision in practice.",
    example: "The institute implemented an online admission and fee payment system.",
    exampleBengali: "প্রতিষ্ঠানটি একটি অনলাইন ভর্তি ও ফি পেমেন্ট ব্যবস্থা বাস্তবায়ন করেছে।",
    synonyms: ["execute", "enact", "apply", "carry out"],
    antonyms: ["cancel", "delay", "abandon"],
    category: "IT & Computer"
  },
  {
    word: "income",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɪn.kʌm/",
    bengaliMeaning: "আয়, উপার্জন, লাভ",
    englishDefinition: "Money that is earned from work, investments, or business.",
    example: "Net income is calculated by subtracting total expenses from total revenues.",
    exampleBengali: "মোট খরচ থেকে মোট রাজস্ব বাদ দিয়ে নিট আয় গণনা করা হয়।",
    synonyms: ["revenue", "earnings", "profit", "salary"],
    antonyms: ["expense", "expenditure", "loss"],
    category: "Business & Accounting"
  },
  {
    word: "innovation",
    partOfSpeech: "Noun",
    pronunciation: "/ˌɪn.əˈveɪ.ʃən/",
    bengaliMeaning: "উদ্ভাবন, নতুনত্ব, নতুন পদ্ধতির প্রবর্তন",
    englishDefinition: "A new idea or method, or the use of new ideas and methods.",
    example: "Technological innovation has made remote learning accessible to all.",
    exampleBengali: "প্রযুক্তিগত উদ্ভাবন দূরবর্তী শিক্ষাকে সবার জন্য সহজলভ্য করেছে।",
    synonyms: ["novelty", "invention", "modernization", "breakthrough"],
    antonyms: ["tradition", "stagnation", "imitation"],
    category: "IT & Computer"
  },
  {
    word: "integrity",
    partOfSpeech: "Noun",
    pronunciation: "/ɪnˈteɡ.rə.ti/",
    bengaliMeaning: "সততা, চারিত্রিক দৃঢ়তা, নীতিপরায়ণতা",
    englishDefinition: "The quality of being honest and having strong moral principles.",
    example: "A leader must always act with transparency and integrity.",
    exampleBengali: "একজন নেতাকে সর্বদা স্বচ্ছতা ও নীতিপরায়ণতার সাথে কাজ করতে হবে।",
    synonyms: ["probity", "uprightness", "honesty", "morality"],
    antonyms: ["corruption", "dishonesty", "deceit"],
    category: "Ethics & Motivation"
  },
  {
    word: "internet",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɪn.t̬ɚ.net/",
    bengaliMeaning: "ইন্টারনেট; বিশ্বব্যাপী আন্তঃসংযুক্ত কম্পিউটার নেটওয়ার্ক",
    englishDefinition: "The large system of connected computers around the world allowing people to share information.",
    example: "The internet connects teachers and learners globally in real time.",
    exampleBengali: "ইন্টারনেট বিশ্বজুড়ে শিক্ষক ও শিক্ষার্থীদের তাৎক্ষণিকভাবে সংযুক্ত করে।",
    synonyms: ["the web", "cyberspace", "global network"],
    antonyms: [],
    category: "IT & Computer"
  },

  // --- J ---
  {
    word: "journal",
    partOfSpeech: "Noun",
    pronunciation: "/ˈdʒɝː.nəl/",
    bengaliMeaning: "জাবেদা; হিসাবের প্রাথমিক বই; গবেষণা পত্রিকা",
    englishDefinition: "An accounting book of original entry where financial transactions are first recorded; a regular publication.",
    example: "Every financial transaction is first entered into the journal in date order.",
    exampleBengali: "প্রতিটি আর্থিক লেনদেন প্রথমে তারিখ অনুসারে জাবেদায় অন্তর্ভুক্ত করা হয়।",
    synonyms: ["daybook", "log", "diary", "record"],
    antonyms: [],
    category: "Business & Accounting"
  },
  {
    word: "judicious",
    partOfSpeech: "Adjective",
    pronunciation: "/dʒuːˈdɪʃ.əs/",
    bengaliMeaning: "বিচক্ষণ, সুবিবেচক, ন্যায়সংগত",
    englishDefinition: "Having or showing reason and good judgment in making decisions.",
    example: "Judicious time management helps students excel in all subjects.",
    exampleBengali: "বিচক্ষণ সময় ব্যবস্থাপনা শিক্ষার্থীদের সব বিষয়ে ভালো করতে সাহায্য করে।",
    synonyms: ["sensible", "prudent", "wise", "discreet"],
    antonyms: ["foolish", "imprudent", "reckless"],
    category: "Ethics & Motivation"
  },

  // --- K ---
  {
    word: "keyboard",
    partOfSpeech: "Noun",
    pronunciation: "/ˈkiː.bɔːrd/",
    bengaliMeaning: "কিবোর্ড; কম্পিউটারে টাইপ করার বোতামযুক্ত ইনপুট ডিভাইস",
    englishDefinition: "A set of keys on a computer or musical instrument that you press to make it work.",
    example: "Learning the QWERTY keyboard layout is the first step in touch typing.",
    exampleBengali: "QWERTY কিবোর্ড বিন্যাস শেখা হলো টাচ টাইপিংয়ের প্রথম ধাপ।",
    synonyms: ["keypad", "input device"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "knowledge",
    partOfSpeech: "Noun",
    pronunciation: "/ˈnɑː.lɪdʒ/",
    bengaliMeaning: "জ্ঞান, পাণ্ডিত্য, প্রজ্ঞা, অভিজ্ঞতা",
    englishDefinition: "Understanding of or information about a subject that you get by experience or study.",
    example: "Knowledge is power, but sharing it empowers the entire nation.",
    exampleBengali: "জ্ঞানই শক্তি, কিন্তু তা ছড়িয়ে দিলে পুরো জাতি শক্তিশালী হয়।",
    synonyms: ["wisdom", "understanding", "learning", "expertise"],
    antonyms: ["ignorance", "unawareness", "illiteracy"],
    category: "Academic"
  },

  // --- L ---
  {
    word: "ledger",
    partOfSpeech: "Noun",
    pronunciation: "/ˈledʒ.ɚ/",
    bengaliMeaning: "খতিয়ান; হিসাবের পাকা বা চূড়ান্ত বই (King of all books)",
    englishDefinition: "A book or computer document in which a company's accounts are recorded permanently.",
    example: "All journal entries are posted into the general ledger accounts.",
    exampleBengali: "সকল জাবেদা দাখিলা সাধারণ খতিয়ান হিসাবে স্থানান্তর করা হয়।",
    synonyms: ["account book", "record book", "register"],
    antonyms: [],
    category: "Business & Accounting"
  },
  {
    word: "liability",
    partOfSpeech: "Noun",
    pronunciation: "/ˌlaɪ.əˈbɪl.ə.ti/",
    bengaliMeaning: "দায়, দেনা, বাধ্যবাধকতা",
    englishDefinition: "A debt or financial obligation; something that is a disadvantage.",
    example: "Bank loans and accounts payable are classified as liabilities.",
    exampleBengali: "ব্যাংক ঋণ ও প্রদেয় হিসাবসমূহ দায় হিসেবে শ্রেণিবদ্ধ হয়।",
    synonyms: ["debt", "obligation", "dues", "arrears"],
    antonyms: ["asset", "resource", "advantage"],
    category: "Business & Accounting"
  },
  {
    word: "logic",
    partOfSpeech: "Noun",
    pronunciation: "/ˈlɑː.dʒɪk/",
    bengaliMeaning: "যুক্তিবিদ্যা, যুক্তিসঙ্গত চিন্তা",
    englishDefinition: "A particular method of reasoning or thinking; formal scientific reasoning.",
    example: "Programming requires clear mathematical logic and problem-solving skills.",
    exampleBengali: "প্রোগ্রামিংয়ের জন্য স্পষ্ট গাণিতিক যুক্তি ও সমস্যা সমাধানের দক্ষতা প্রয়োজন।",
    synonyms: ["reasoning", "rationale", "deduction", "sense"],
    antonyms: ["irrationality", "nonsense", "fallacy"],
    category: "IT & Computer"
  },

  // --- M ---
  {
    word: "magnitude",
    partOfSpeech: "Noun",
    pronunciation: "/ˈmæɡ.nə.tuːd/",
    bengaliMeaning: "মাত্রা, ব্যাপকতা, বিশালতা, পরম মান",
    englishDefinition: "The great size or importance of something; numerical value in mathematics.",
    example: "Scientists measured the magnitude of the earthquake on the Richter scale.",
    exampleBengali: "বিজ্ঞানীরা রিখটার স্কেলে ভূমিকম্পের মাত্রা পরিমাপ করেছিলেন।",
    synonyms: ["scale", "extent", "size", "dimension"],
    antonyms: ["smallness", "insignificance"],
    category: "Science"
  },
  {
    word: "management",
    partOfSpeech: "Noun",
    pronunciation: "/ˈmæn.ədʒ.mənt/",
    bengaliMeaning: "ব্যবস্থাপনা, পরিচালনা, নিয়ন্ত্রণ",
    englishDefinition: "The control and organization of something, especially a business or institute.",
    example: "Good classroom management creates an orderly atmosphere for learning.",
    exampleBengali: "উত্তম শ্রেণিকক্ষ ব্যবস্থাপনা শিক্ষার জন্য সুশৃঙ্খল পরিবেশ তৈরি করে।",
    synonyms: ["administration", "governance", "direction", "supervision"],
    antonyms: ["mismanagement", "chaos"],
    category: "Business & Accounting"
  },
  {
    word: "memory",
    partOfSpeech: "Noun",
    pronunciation: "/ˈmem.ər.i/",
    bengaliMeaning: "স্মৃতিশক্তি; কম্পিউটারের তথ্য সংরক্ষণের মেমোরি (RAM/ROM)",
    englishDefinition: "The ability to remember information; the electronic space in a computer where data is kept.",
    example: "RAM serves as the primary volatile memory of a desktop computer.",
    exampleBengali: "র‍্যাম একটি ডেস্কটপ কম্পিউটারের প্রাথমিক অস্থায়ী মেমোরি হিসেবে কাজ করে।",
    synonyms: ["storage", "retention", "recollection", "remembrance"],
    antonyms: ["forgetfulness", "amnesia"],
    category: "IT & Computer"
  },
  {
    word: "mentor",
    partOfSpeech: "Noun",
    pronunciation: "/ˈmen.tɔːr/",
    bengaliMeaning: "অভিজ্ঞ উপদেষ্টা, পথপ্রদর্শক শিক্ষক, মেন্টর",
    englishDefinition: "A person who gives another person help and advice over a period of time and often also teaches them how to do their job.",
    example: "Borhan Sir has been a dedicated mentor to countless successful students.",
    exampleBengali: "বোরহান স্যার অগণিত সফল শিক্ষার্থীর জন্য একজন নিবেদিতপ্রাণ মেন্টর।",
    synonyms: ["guide", "tutor", "counselor", "advisor", "teacher"],
    antonyms: ["student", "pupil", "protege"],
    category: "Academic"
  },
  {
    word: "methodology",
    partOfSpeech: "Noun",
    pronunciation: "/ˌmeθ.əˈdɑː.lə.dʒi/",
    bengaliMeaning: "পদ্ধতি, কার্যপ্রণালী, গবেষণার নিয়মপদ্ধতি",
    englishDefinition: "A system of methods used in a particular area of study or activity.",
    example: "Our interactive teaching methodology makes Quran recitation simple.",
    exampleBengali: "আমাদের ইন্টারঅ্যাক্টিভ পাঠদান পদ্ধতি কুরআন তিলাওয়াতকে সহজ করে তোলে।",
    synonyms: ["system", "procedure", "approach", "technique"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "motivation",
    partOfSpeech: "Noun",
    pronunciation: "/ˌmoʊ.t̬əˈveɪ.ʃən/",
    bengaliMeaning: "প্রেরণা, উৎসাহ, উদ্দীপনা, অনুপ্রেরণা",
    englishDefinition: "Enthusiasm for doing something; the reason why someone wants to act in a certain way.",
    example: "Praise from teachers provides strong motivation for younger learners.",
    exampleBengali: "শিক্ষকদের প্রশংসা ছোট শিক্ষার্থীদের মনে প্রবল প্রেরণা যোগায়।",
    synonyms: ["inspiration", "drive", "incentive", "encouragement"],
    antonyms: ["demotivation", "discouragement", "apathy"],
    category: "Ethics & Motivation"
  },

  // --- N ---
  {
    word: "network",
    partOfSpeech: "Noun",
    pronunciation: "/ˈnet.wɝːk/",
    bengaliMeaning: "নেটওয়ার্ক; পরস্পর সংযুক্ত কম্পিউটারের যোগাযোগ ব্যবস্থা",
    englishDefinition: "A system of interconnected computers, people, or things.",
    example: "All computers in the lab are linked together in a local area network (LAN).",
    exampleBengali: "ল্যাবের সমস্ত কম্পিউটার একটি লোকাল এরিয়া নেটওয়ার্কে (LAN) পরস্পরের সাথে সংযুক্ত।",
    synonyms: ["grid", "system", "web", "circuit"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "noun",
    partOfSpeech: "Noun",
    pronunciation: "/naʊn/",
    bengaliMeaning: "বিশেষ্য; কোনো ব্যক্তি, স্থান, বস্তু, গুণ বা কাজের নাম",
    englishDefinition: "A word that refers to a person, place, thing, event, substance, or quality.",
    example: "In the sentence 'Dhaka is a large city', 'Dhaka' and 'city' are nouns.",
    exampleBengali: "'Dhaka is a large city' বাক্যে 'Dhaka' এবং 'city' হলো Noun।",
    synonyms: ["name", "substantive"],
    antonyms: [],
    category: "English Grammar"
  },

  // --- O ---
  {
    word: "objective",
    partOfSpeech: "Noun",
    pronunciation: "/əbˈdʒek.tɪv/",
    bengaliMeaning: "উদ্দেশ্য, লক্ষ্য; নিরপেক্ষ (Adjective)",
    englishDefinition: "Something that you plan to do or achieve; based on facts rather than thoughts or feelings.",
    example: "Our primary objective is to produce skilled and morally upright students.",
    exampleBengali: "আমাদের প্রাথমিক উদ্দেশ্য হলো দক্ষ ও নৈতিকভাবে সৎ শিক্ষার্থী তৈরি করা।",
    synonyms: ["aim", "goal", "target", "purpose"],
    antonyms: ["subjective", "aimlessness"],
    category: "Academic"
  },
  {
    word: "offline",
    partOfSpeech: "Adjective",
    pronunciation: "/ˌɑːfˈlaɪn/",
    bengaliMeaning: "অফলাইন; ইন্টারনেটের সাথে সংযোগহীন অবস্থা",
    englishDefinition: "Not connected to or directly controlled by a central system or the internet.",
    example: "This dictionary works completely offline without any internet connection.",
    exampleBengali: "এই ডিকশনারিটি কোনো ইন্টারনেট সংযোগ ছাড়াই সম্পূর্ণ অফলাইনে কাজ করে।",
    synonyms: ["disconnected", "standalone", "unplugged"],
    antonyms: ["online", "connected"],
    category: "IT & Computer"
  },
  {
    word: "optimization",
    partOfSpeech: "Noun",
    pronunciation: "/ˌɑːp.tə.məˈzeɪ.ʃən/",
    bengaliMeaning: "অনুকূলকরণ, সর্বোচ্চ দক্ষতায় রূপান্তর",
    englishDefinition: "The act, process, or methodology of making something as fully perfect, functional, or effective as possible.",
    example: "Code optimization improves the loading speed of web applications.",
    exampleBengali: "কোড অপটিমাইজেশন ওয়েব অ্যাপ্লিকেশনের লোডিং স্পিড বাড়ায়।",
    synonyms: ["enhancement", "refinement", "fine-tuning", "streamlining"],
    antonyms: ["degradation", "inefficiency"],
    category: "IT & Computer"
  },

  // --- P ---
  {
    word: "patience",
    partOfSpeech: "Noun",
    pronunciation: "/ˈpeɪ.ʃəns/",
    bengaliMeaning: "ধৈর্য, সহনশীলতা, শান্তভাবে অপেক্ষা করার ক্ষমতা",
    englishDefinition: "The ability to wait, or to continue doing something despite difficulties, without getting annoyed.",
    example: "Learning Quran pronunciation and Makhraj requires great patience.",
    exampleBengali: "কুরআনের উচ্চারণ ও মাখরাজ শেখার জন্য প্রচুর ধৈর্যের প্রয়োজন।",
    synonyms: ["tolerance", "endurance", "forbearance", "perseverance"],
    antonyms: ["impatience", "irritability", "intolerance"],
    category: "Ethics & Motivation"
  },
  {
    word: "perseverance",
    partOfSpeech: "Noun",
    pronunciation: "/ˌpɝː.səˈvɪr.əns/",
    bengaliMeaning: "অধ্যবসায়, অবিচল চেষ্টা, নাছোড়বান্দা প্রচেষ্টা",
    englishDefinition: "Continued effort to do or achieve something despite difficulties, failure, or opposition.",
    example: "Success in life comes through continuous perseverance and faith.",
    exampleBengali: "জীবনে সাফল্য আসে ক্রমাগত অধ্যবসায় ও বিশ্বাসের মাধ্যমে।",
    synonyms: ["persistence", "tenacity", "dedication", "determination"],
    antonyms: ["giving up", "laziness", "hesitation"],
    category: "Ethics & Motivation"
  },
  {
    word: "preposition",
    partOfSpeech: "Noun",
    pronunciation: "/ˌprep.əˈzɪʃ.ən/",
    bengaliMeaning: "পদান্বয়ী অব্যয়; যে শব্দ Noun বা Pronoun-এর পূর্বে বসে বাক্যের অন্যান্য শব্দের সাথে সম্পর্ক স্থাপন করে (in, on, at)",
    englishDefinition: "A word that connects a noun or pronoun to other words in a sentence.",
    example: "In 'He sat on the chair', the word 'on' is a preposition.",
    exampleBengali: "'He sat on the chair' বাক্যে 'on' হলো একটি Preposition।",
    synonyms: ["relational word"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "processor",
    partOfSpeech: "Noun",
    pronunciation: "/ˈprɑː.ses.ɚ/",
    bengaliMeaning: "প্রসেসর; কম্পিউটারের কেন্দ্রীয় প্রক্রিয়াকরণ যন্ত্র (CPU)",
    englishDefinition: "The central part of a computer that controls its other parts and processes data.",
    example: "A faster processor allows you to run modern software without lagging.",
    exampleBengali: "একটি দ্রুতগতির প্রসেসর আপনাকে কোনো ল্যাগ ছাড়াই আধুনিক সফটওয়্যার চালাতে দেয়।",
    synonyms: ["CPU", "microprocessor", "chip"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "pronoun",
    partOfSpeech: "Noun",
    pronunciation: "/ˈproʊ.naʊn/",
    bengaliMeaning: "সর্বনাম; Noun-এর পরিবর্তে ব্যবহৃত শব্দ (He, She, It, They)",
    englishDefinition: "A word that is used instead of a noun or a noun phrase.",
    example: "In the sentence 'Rahim is honest, he works hard', 'he' is a pronoun.",
    exampleBengali: "'Rahim is honest, he works hard' বাক্যে 'he' হলো একটি Pronoun।",
    synonyms: ["substitute noun"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "punctuality",
    partOfSpeech: "Noun",
    pronunciation: "/ˌpʌŋk.tʃuˈæl.ə.t̬i/",
    bengaliMeaning: "সময়ানুবর্তিতা, যথা সময়ে উপস্থিত থাকার গুণ",
    englishDefinition: "The quality of being on time for things.",
    example: "Punctuality in class attendance is rewarded with full bonus marks.",
    exampleBengali: "ক্লাসে সময়ানুবর্তিতা বজায় রাখার জন্য পুরো বোনাস মার্ক প্রদান করা হয়।",
    synonyms: ["promptness", "timeliness", "readiness"],
    antonyms: ["tardiness", "lateness", "delay"],
    category: "Ethics & Motivation"
  },

  // --- Q ---
  {
    word: "qualification",
    partOfSpeech: "Noun",
    pronunciation: "/ˌkwɑː.lə.fəˈkeɪ.ʃən/",
    bengaliMeaning: "যোগ্যতা, শিক্ষাগত মান, সনদ বা শর্তপূরণ",
    englishDefinition: "An official record showing that you have finished a training course or have the necessary skills.",
    example: "Our computer certificate is a recognized qualification for job applications.",
    exampleBengali: "আমাদের কম্পিউটার সনদটি চাকরির আবেদনের জন্য একটি স্বীকৃত যোগ্যতা।",
    synonyms: ["credential", "competence", "eligibility", "skill"],
    antonyms: ["incompetence", "disqualification"],
    category: "Academic"
  },
  {
    word: "quotient",
    partOfSpeech: "Noun",
    pronunciation: "/ˈkwoʊ.ʃənt/",
    bengaliMeaning: "ভাগফল; একটি সংখ্যাকে অন্য সংখ্যা দিয়ে ভাগ করার ফলাফল",
    englishDefinition: "The result of dividing one number by another in mathematics.",
    example: "In the calculation 20 divided by 4, the quotient is 5.",
    exampleBengali: "২০ কে ৪ দিয়ে ভাগ করলে ভাগফল হয় ৫।",
    synonyms: ["result", "fractional result"],
    antonyms: [],
    category: "Science"
  },

  // --- R ---
  {
    word: "reconciliation",
    partOfSpeech: "Noun",
    pronunciation: "/ˌrek.ənˌsɪl.iˈeɪ.ʃən/",
    bengaliMeaning: "মিলকরণ, সমন্বয় সাধন; ব্যাংক সমন্বয় বিবরণী",
    englishDefinition: "The process of comparing and adjusting two sets of records to ensure agreement.",
    example: "The bank reconciliation statement matches the cash book with the bank statement.",
    exampleBengali: "ব্যাংক সমন্বয় বিবরণী নগদান বই ও ব্যাংক বিবরণের মধ্যকার অমিল দূর করে।",
    synonyms: ["adjustment", "settlement", "harmonization"],
    antonyms: ["disagreement", "discrepancy"],
    category: "Business & Accounting"
  },
  {
    word: "resilience",
    partOfSpeech: "Noun",
    pronunciation: "/rɪˈzɪl.jəns/",
    bengaliMeaning: "স্থিতিস্থাপকতা, ঘুরে দাঁড়ানোর মানসিক শক্তি ও দৃঢ়তা",
    englishDefinition: "The ability to be happy, successful, etc. again after something difficult or bad has happened.",
    example: "Mental resilience allows students to bounce back after exam setbacks.",
    exampleBengali: "মানসিক স্থিতিস্থাপকতা শিক্ষার্থীদের পরীক্ষার সাময়িক ব্যর্থতা কাটিয়ে ঘুরে দাঁড়াতে সাহায্য করে।",
    synonyms: ["toughness", "endurance", "flexibility", "grit"],
    antonyms: ["fragility", "weakness", "vulnerability"],
    category: "Ethics & Motivation"
  },
  {
    word: "resolution",
    partOfSpeech: "Noun",
    pronunciation: "/ˌrez.əˈluː.ʃən/",
    bengaliMeaning: "সংকল্প; স্ক্রিনের রেজুলেশন বা ছবির স্বচ্ছতা",
    englishDefinition: "A firm decision to do something; the clarity or detail of an image or screen.",
    example: "Full HD screens have a display resolution of 1920 by 1080 pixels.",
    exampleBengali: "ফুল এইচডি স্ক্রিনের ডিসপ্লে রেজুলেশন ১৯২০ বাই ১০৮০ পিক্সেল।",
    synonyms: ["determination", "decision", "clarity", "definition"],
    antonyms: ["indecision", "vagueness"],
    category: "IT & Computer"
  },
  {
    word: "routine",
    partOfSpeech: "Noun",
    pronunciation: "/ruːˈtiːn/",
    bengaliMeaning: "রুটিন, নিত্যনৈমিত্তিক কাজের তালিকা বা সময়সূচি",
    englishDefinition: "A usual or fixed way of doing things, especially a timetable of classes.",
    example: "Students should check the weekly class routine posted on the website.",
    exampleBengali: "শিক্ষার্থীদের ওয়েবসাইটে দেওয়া সাপ্তাহিক ক্লাসের রুটিন দেখে নেওয়া উচিত।",
    synonyms: ["schedule", "timetable", "regimen", "program"],
    antonyms: ["irregularity", "disorder"],
    category: "Academic"
  },

  // --- S ---
  {
    word: "scholarship",
    partOfSpeech: "Noun",
    pronunciation: "/ˈskɑː.lɚ.ʃɪp/",
    bengaliMeaning: "বৃত্তি, মেধা বৃত্তি; অগাধ পাণ্ডিত্য",
    englishDefinition: "An amount of money given by a school, college, or other organization to pay for the studies of a person with great ability but little money.",
    example: "The institute offered a full scholarship to the top scoring student.",
    exampleBengali: "প্রতিষ্ঠানটি সর্বোচ্চ নম্বরপ্রাপ্ত শিক্ষার্থীকে পূর্ণ মেধা বৃত্তি প্রদান করেছে।",
    synonyms: ["grant", "fellowship", "financial aid", "bursary"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "software",
    partOfSpeech: "Noun",
    pronunciation: "/ˈsɑːft.wer/",
    bengaliMeaning: "সফটওয়্যার; কম্পিউটার পরিচালনার নির্দেশিকা ও প্রোগ্রামসমূহ",
    englishDefinition: "The programs and other operating information used by a computer.",
    example: "Operating systems and MS Office are essential computer software.",
    exampleBengali: "অপারেটিং সিস্টেম এবং এমএস অফিস হলো অপরিহার্য কম্পিউটার সফটওয়্যার।",
    synonyms: ["programs", "applications", "apps"],
    antonyms: ["hardware"],
    category: "IT & Computer"
  },
  {
    word: "strategy",
    partOfSpeech: "Noun",
    pronunciation: "/ˈstræt̬.ə.dʒi/",
    bengaliMeaning: "কৌশল, সুপরিকল্পিত কর্মপন্থা",
    englishDefinition: "A detailed plan for achieving success in situations such as war, politics, business, or education.",
    example: "A smart exam strategy includes attempting the easiest questions first.",
    exampleBengali: "একটি চতুর পরীক্ষার কৌশলের মধ্যে রয়েছে প্রথমে সহজ প্রশ্নগুলোর উত্তর দেওয়া।",
    synonyms: ["plan", "tactic", "scheme", "policy"],
    antonyms: ["randomness", "improvisation"],
    category: "Academic"
  },
  {
    word: "syntax",
    partOfSpeech: "Noun",
    pronunciation: "/ˈsɪn.tæks/",
    bengaliMeaning: "বাক্যতত্ত্ব, গঠনরীতি, সিনট্যাক্স (কোডিং বা গ্রামারের নিয়ম)",
    englishDefinition: "The grammatical arrangement of words in a sentence, or the rules of a programming language.",
    example: "A missing semicolon causes a syntax error in JavaScript.",
    exampleBengali: "একটি সেমিকোলন বাদ পড়লে জাভাস্ক্রিপ্টে সিনট্যাক্স এরর দেখা দেয়।",
    synonyms: ["grammar", "structure", "rules", "format"],
    antonyms: [],
    category: "IT & Computer"
  },

  // --- T ---
  {
    word: "tajweed",
    partOfSpeech: "Noun",
    pronunciation: "/tædʒˈwiːd/",
    bengaliMeaning: "তাজবীদ; মাখরাজ ও সিফাত বজায় রেখে কুরআন সহীহ-শুদ্ধভাবে পড়ার নিয়ম",
    englishDefinition: "The rules governing pronunciation during recitation of the Holy Quran.",
    example: "Reciting the Holy Quran with proper Tajweed is a noble duty for every Muslim.",
    exampleBengali: "সঠিক তাজবীদ অনুযায়ী পবিত্র কুরআন তিলাওয়াত করা প্রতিটি মুসলিমের জন্য একটি মহৎ দায়িত্ব।",
    synonyms: ["correct Quranic recitation", "phonetics"],
    antonyms: [],
    category: "Academic"
  },
  {
    word: "technology",
    partOfSpeech: "Noun",
    pronunciation: "/tekˈnɑː.lə.dʒi/",
    bengaliMeaning: "প্রযুক্তি, কারিগরি বিদ্যা",
    englishDefinition: "The practical, especially industrial, use of scientific discoveries.",
    example: "Information technology has created millions of freelancing jobs worldwide.",
    exampleBengali: "তথ্যপ্রযুক্তি বিশ্বজুড়ে লক্ষ লক্ষ ফ্রিল্যান্সিং কর্মসংস্থান সৃষ্টি করেছে।",
    synonyms: ["IT", "machinery", "engineering", "technics"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "tense",
    partOfSpeech: "Noun",
    pronunciation: "/tens/",
    bengaliMeaning: "ক্রিয়ার কাল (বর্তমান, অতীত, ভবিষ্যৎ)",
    englishDefinition: "Any of the forms of a verb which show the time at which an action happened (Past, Present, Future).",
    example: "There are three primary tenses in English grammar: Present, Past, and Future.",
    exampleBengali: "ইংরেজি ব্যাকরণে প্রধানত তিনটি Tense রয়েছে: Present, Past এবং Future।",
    synonyms: ["time form", "verbal aspect"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "transaction",
    partOfSpeech: "Noun",
    pronunciation: "/trænˈzæk.ʃən/",
    bengaliMeaning: "লেনদেন; আর্থিক আদান-প্রদান",
    englishDefinition: "An occasion when a business deal is made, or an amount of money is paid or received.",
    example: "Submit your payment transaction ID (TrxID) to confirm your admission.",
    exampleBengali: "ভর্তি নিশ্চিত করতে আপনার পেমেন্ট ট্রানজেকশন আইডি (TrxID) সাবমিট করুন।",
    synonyms: ["deal", "exchange", "transfer", "business"],
    antonyms: [],
    category: "Business & Accounting"
  },
  {
    word: "trial balance",
    partOfSpeech: "Noun",
    pronunciation: "/ˈtraɪəl ˈbæl.əns/",
    bengaliMeaning: "রেওয়ামিল; খতিয়ানের গাণিতিক নির্ভুলতা যাচাইয়ের বিবরণী",
    englishDefinition: "A statement of all debits and credits in a double-entry account book, with any disagreement showing an error.",
    example: "When both sides of the trial balance match, the ledger accounts are mathematically sound.",
    exampleBengali: "রেওয়ামিলের উভয় দিক সমান হলে খতিয়ান হিসাব গাণিতিকভাবে নির্ভুল প্রমাণিত হয়।",
    synonyms: ["accounting reconciliation", "balance sheet draft"],
    antonyms: [],
    category: "Business & Accounting"
  },

  // --- U ---
  {
    word: "unauthorized",
    partOfSpeech: "Adjective",
    pronunciation: "/ʌnˈɑː.θɚ.aɪzd/",
    bengaliMeaning: "অননুমোদিত, বিধিবহির্ভূত",
    englishDefinition: "Having no official permission to be somewhere or to do something.",
    example: "Unauthorized persons are strictly forbidden from entering the server room.",
    exampleBengali: "সার্ভার রুমে অননুমোদিত ব্যক্তিদের প্রবেশ কঠোরভাবে নিষিদ্ধ।",
    synonyms: ["unofficial", "illegal", "unpermitted", "illicit"],
    antonyms: ["authorized", "official", "permitted", "legitimate"],
    category: "IT & Computer"
  },
  {
    word: "upload",
    partOfSpeech: "Verb",
    pronunciation: "/ˈʌp.loʊd/",
    bengaliMeaning: "আপলোড করা; নিজের ডিভাইস থেকে সার্ভার বা ইন্টারনেটে ফাইল পাঠানো",
    englishDefinition: "To copy or move programs or information to a larger computer system or to the internet.",
    example: "Students can upload their passport-sized photo for the student ID card.",
    exampleBengali: "শিক্ষার্থীরা স্টুডেন্ট আইডি কার্ডের জন্য তাদের পাসপোর্ট সাইজের ছবি আপলোড করতে পারে।",
    synonyms: ["transmit", "transfer", "send"],
    antonyms: ["download"],
    category: "IT & Computer"
  },

  // --- V ---
  {
    word: "valid",
    partOfSpeech: "Adjective",
    pronunciation: "/ˈvæl.ɪd/",
    bengaliMeaning: "বৈধ, কার্যকর, গ্রহণযোগ্য, যুক্তিযুক্ত",
    englishDefinition: "Based on truth or reason; officially acceptable.",
    example: "A valid admit card is required to enter the examination hall.",
    exampleBengali: "পরীক্ষার হলে প্রবেশের জন্য একটি বৈধ প্রবেশপত্র প্রয়োজন।",
    synonyms: ["legitimate", "lawful", "authentic", "acceptable"],
    antonyms: ["invalid", "void", "unacceptable", "null"],
    category: "Academic"
  },
  {
    word: "variable",
    partOfSpeech: "Noun",
    pronunciation: "/ˈver.i.ə.bəl/",
    bengaliMeaning: "চলক; যার মান পরিবর্তনশীল",
    englishDefinition: "A number, amount, or situation that can change and that affects something else.",
    example: "In algebra, x and y are commonly used as variables.",
    exampleBengali: "বীজগণিতে x এবং y সাধারণত চলক হিসেবে ব্যবহৃত হয়।",
    synonyms: ["factor", "quantity", "parameter"],
    antonyms: ["constant"],
    category: "Science"
  },
  {
    word: "verb",
    partOfSpeech: "Noun",
    pronunciation: "/vɝːb/",
    bengaliMeaning: "ক্রিয়া; যে পদ দ্বারা কোনো কিছু করা, হওয়া, যাওয়া বা থাকা বোঝায়",
    englishDefinition: "A word or phrase that describes an action, condition, or experience.",
    example: "Every complete English sentence must contain a subject and a verb.",
    exampleBengali: "প্রতিটি সম্পূর্ণ ইংরেজি বাক্যে অবশ্যই একটি Subject এবং একটি Verb থাকতে হবে।",
    synonyms: ["action word", "predicate"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "versatile",
    partOfSpeech: "Adjective",
    pronunciation: "/ˈvɝː.sə.t̬əl/",
    bengaliMeaning: "বহুমুখী প্রতিভাধর, বহুমুখী ব্যবহারে সক্ষম",
    englishDefinition: "Able to change easily from one activity to another or having many different uses.",
    example: "Python is a versatile programming language used for web, AI, and data science.",
    exampleBengali: "পাইথন একটি বহুমুখী প্রোগ্রামিং ভাষা যা ওয়েব, এআই এবং ডেটা সায়েন্সে ব্যবহৃত হয়।",
    synonyms: ["adaptable", "flexible", "multitalented", "all-round"],
    antonyms: ["inflexible", "limited", "narrow"],
    category: "IT & Computer"
  },
  {
    word: "vocabulary",
    partOfSpeech: "Noun",
    pronunciation: "/voʊˈkæb.jə.ler.i/",
    bengaliMeaning: "শব্দভাণ্ডার, শব্দসম্ভার",
    englishDefinition: "All the words used by a particular person, or all the words with a particular meaning in a language.",
    example: "Reading English newspapers daily expands your active vocabulary.",
    exampleBengali: "প্রতিদিন ইংরেজি পত্রিকা পাঠ আপনার সক্রিয় শব্দভাণ্ডার বৃদ্ধি করে।",
    synonyms: ["lexicon", "wordbook", "glossary"],
    antonyms: [],
    category: "English Grammar"
  },

  // --- W ---
  {
    word: "wisdom",
    partOfSpeech: "Noun",
    pronunciation: "/ˈwɪz.dəm/",
    bengaliMeaning: "প্রজ্ঞা, বিজ্ঞতা, গভীর প্রাজ্ঞ দৃষ্টি",
    englishDefinition: "The ability to use your knowledge and experience to make good decisions and judgments.",
    example: "A wise mentor shares not just facts, but life wisdom with students.",
    exampleBengali: "একজন বিজ্ঞ মেন্টর কেবল তথ্য নয়, জীবনের প্রজ্ঞাও শিক্ষার্থীদের সাথে ভাগ করে নেন।",
    synonyms: ["insight", "sagacity", "prudence", "discernment"],
    antonyms: ["folly", "foolishness", "stupidity"],
    category: "Ethics & Motivation"
  },
  {
    word: "workstation",
    partOfSpeech: "Noun",
    pronunciation: "/ˈwɝːkˌsteɪ.ʃən/",
    bengaliMeaning: "কর্মক্ষেত্র; শক্তিশালী ডেস্কটপ কম্পিউটার সেটআপ",
    englishDefinition: "A desktop computer that is more powerful than a normal PC, or an area with a computer where one person works.",
    example: "Each student in our lab gets an individual workstation with high-speed internet.",
    exampleBengali: "আমাদের ল্যাবে প্রতিটি শিক্ষার্থী দ্রুতগতির ইন্টারনেটযুক্ত একটি পৃথক ওয়ার্কস্টেশন পায়।",
    synonyms: ["terminal", "desk", "PC unit"],
    antonyms: [],
    category: "IT & Computer"
  },

  // --- Z ---
  {
    word: "zeal",
    partOfSpeech: "Noun",
    pronunciation: "/ziːl/",
    bengaliMeaning: "উদ্যম, পরম উৎসাহ, তীব্র অনুরাগ",
    englishDefinition: "Great enthusiasm or energy in pursuit of a cause or an objective.",
    example: "He pursued his computer programming studies with boundless zeal.",
    exampleBengali: "সে অসীম উদ্যমের সাথে তার কম্পিউটার প্রোগ্রামিং শিক্ষা চালিয়ে গিয়েছিল।",
    synonyms: ["passion", "fervor", "ardor", "enthusiasm"],
    antonyms: ["apathy", "indifference", "disinterest"],
    category: "Ethics & Motivation"
  },
  {
    word: "zenith",
    partOfSpeech: "Noun",
    pronunciation: "/ˈzen.ɪθ/",
    bengaliMeaning: "শীর্ষবিন্দু, চরম উৎকর্ষের পর্যায়, সর্বোচ্চ শিখর",
    englishDefinition: "The time at which something is most powerful or successful.",
    example: "His career reached its zenith when he received the national educational award.",
    exampleBengali: "জাতীয় শিক্ষা পুরস্কার অর্জনের মাধ্যমে তাঁর ক্যারিয়ার সর্বোচ্চ শিখরে পৌঁছেছিল।",
    synonyms: ["peak", "pinnacle", "summit", "apex", "climax"],
    antonyms: ["nadir", "bottom", "lowest point"],
    category: "Ethics & Motivation"
  },

  // --- Grammar, Idioms & Linguistics ---
  {
    word: "clause",
    partOfSpeech: "Noun",
    pronunciation: "/klɑːz/",
    bengaliMeaning: "বাক্যাংশ; যাতে একটি Subject এবং একটি Finite Verb থাকে",
    englishDefinition: "A group of words, consisting of a subject and a finite form of a verb, forming part of a sentence.",
    example: "A complex sentence consists of a principal clause and one or more subordinate clauses.",
    exampleBengali: "একটি জটিল বাক্য প্রধান বাক্যাংশ ও এক বা একাধিক অধীনস্থ বাক্যাংশের সমন্বয়ে গঠিত হয়।",
    synonyms: ["phrase", "sentence part", "passage"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "gerund",
    partOfSpeech: "Noun",
    pronunciation: "/ˈdʒer.ənd/",
    bengaliMeaning: "জিরান্ড; Verb + ing যা বাক্যে একই সাথে Verb এবং Noun-এর কাজ করে",
    englishDefinition: "A word ending in '-ing' that is made from a verb and used like a noun.",
    example: "In the sentence 'Swimming is a good exercise', 'Swimming' is a gerund.",
    exampleBengali: "'Swimming is a good exercise' বাক্যে 'Swimming' হলো একটি Gerund।",
    synonyms: ["verbal noun"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "infinitive",
    partOfSpeech: "Noun",
    pronunciation: "/ɪnˈfɪn.ə.t̬ɪv/",
    bengaliMeaning: "ইনফিনিটিভ; 'to' এর সাথে verb-এর base form (যেমন: to read, to learn)",
    englishDefinition: "The basic form of a verb that usually follows 'to'.",
    example: "She wants to learn computer programming.",
    exampleBengali: "সে কম্পিউটার প্রোগ্রামিং শিখতে চায় ('to learn' হলো ইনফিনিটিভ)।",
    synonyms: ["base verb form"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "participle",
    partOfSpeech: "Noun",
    pronunciation: "/ˈpɑːr.tə.sɪ.pəl/",
    bengaliMeaning: "পার্টিসিপল; Verb-এর যে রূপ Verb এবং Adjective-এর মতো কাজ করে",
    englishDefinition: "The form of a verb that usually ends in 'ed' or 'ing' and is used as an adjective.",
    example: "In 'A barking dog seldom bites', 'barking' is a present participle.",
    exampleBengali: "'A barking dog seldom bites' বাক্যে 'barking' হলো একটি Present Participle।",
    synonyms: ["verbal adjective"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "idiom",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɪd.i.əm/",
    bengaliMeaning: "বাগধারা; শব্দসমষ্টি যার আক্ষরিক অর্থের চেয়ে বিশেষ অন্তর্নিহিত অর্থ প্রকাশ পায়",
    englishDefinition: "A group of words in a fixed order that have a particular meaning that is different from the meanings of each word on its own.",
    example: "'Piece of cake' is a common English idiom meaning something very easy.",
    exampleBengali: "'Piece of cake' হলো একটি প্রচলিত বাগধারা যার অর্থ অতি সহজ কোনো কাজ।",
    synonyms: ["phrase", "expression", "locution"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "proverb",
    partOfSpeech: "Noun",
    pronunciation: "/ˈprɑː.vɝːb/",
    bengaliMeaning: "প্রবাদ-প্রবচন; লোকমুখে প্রচলিত গভীর নীতিবাক্য",
    englishDefinition: "A short, well-known statement that gives advice or tells something that is generally true.",
    example: "'Time and tide wait for none' is a famous proverb.",
    exampleBengali: "'সময় ও স্রোত কারও জন্য অপেক্ষা করে না' হলো একটি বিখ্যাত প্রবাদ বাক্য।",
    synonyms: ["adage", "maxim", "saying", "aphorism"],
    antonyms: [],
    category: "English Grammar"
  },
  {
    word: "synonym",
    partOfSpeech: "Noun",
    pronunciation: "/ˈsɪn.ə.nɪm/",
    bengaliMeaning: "সমার্থক শব্দ; একই বা প্রায় সমান অর্থবোধক শব্দ",
    englishDefinition: "A word or phrase that has the same or nearly the same meaning as another word in the same language.",
    example: "'Smart' is a common synonym for 'intelligent'.",
    exampleBengali: "'Smart' শব্দটি 'intelligent'-এর একটি প্রচলিত সমার্থক শব্দ।",
    synonyms: ["equivalent", "metonym", "substitute"],
    antonyms: ["antonym"],
    category: "English Grammar"
  },
  {
    word: "antonym",
    partOfSpeech: "Noun",
    pronunciation: "/ˈæn.t̬ə.nɪm/",
    bengaliMeaning: "বিপরীতার্থক শব্দ; বিপরীত অর্থবোধক শব্দ",
    englishDefinition: "A word that means the opposite of another word.",
    example: "'Cold' is the antonym of 'hot'.",
    exampleBengali: "'Cold' হলো 'hot' শব্দের বিপরীতার্থক শব্দ।",
    synonyms: ["opposite", "counter-term"],
    antonyms: ["synonym"],
    category: "English Grammar"
  },

  // --- Computer Science & Modern IT ---
  {
    word: "compiler",
    partOfSpeech: "Noun",
    pronunciation: "/kəmˈpaɪ.lɚ/",
    bengaliMeaning: "কম্পাইলার; সম্পূর্ণ প্রোগ্রামিং সোর্স কোডকে মেশিন ভাষায় রূপান্তরকারী সফটওয়্যার",
    englishDefinition: "A computer program that translates source code into machine code or bytecode that can be executed directly by a computer.",
    example: "The TypeScript compiler checks code for syntax and type errors before running.",
    exampleBengali: "টাইপস্ক্রিপ্ট কম্পাইলার কোড রান করার পূর্বে সিনট্যাক্স ও টাইপ সংক্রান্ত ভুল যাচাই করে।",
    synonyms: ["translator", "code generator"],
    antonyms: ["interpreter"],
    category: "IT & Computer"
  },
  {
    word: "debugging",
    partOfSpeech: "Noun",
    pronunciation: "/diːˈbʌɡ.ɪŋ/",
    bengaliMeaning: "ডিবাগিং; কম্পিউটার সফটওয়্যারের ভুল বা ত্রুটি (Bug) খুঁজে বের করে সংশোধন করার প্রক্রিয়া",
    englishDefinition: "The process of identifying and removing errors from computer software or hardware.",
    example: "Effective debugging skills make you a high-demand professional programmer.",
    exampleBengali: "কার্যকর ডিবাগিং দক্ষতা আপনাকে একজন উচ্চ চাহিদাসম্পন্ন পেশাদার প্রোগ্রামার বানায়।",
    synonyms: ["troubleshooting", "error correction", "fixing"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "interface",
    partOfSpeech: "Noun",
    pronunciation: "/ˈɪn.t̬ɚ.feɪs/",
    bengaliMeaning: "ইন্টারফেস; ব্যবহারকারী ও কম্পিউটারের মধ্যবর্তী সংযোগস্থল (UI)",
    englishDefinition: "A point where two systems, subjects, or organizations meet and interact, especially a user interface.",
    example: "The website features a clean and modern user interface in Bengali.",
    exampleBengali: "ওয়েবসাইটটিতে রয়েছে একটি পরিচ্ছন্ন ও আধুনিক বাংলা ইউজার ইন্টারফেস।",
    synonyms: ["UI", "front-end", "dashboard", "portal"],
    antonyms: [],
    category: "IT & Computer"
  },
  {
    word: "scalability",
    partOfSpeech: "Noun",
    pronunciation: "/ˌskeɪ.ləˈbɪl.ə.ti/",
    bengaliMeaning: "স্কেলেবিলিটি; ব্যবহারকারী বা ডেটা বাড়লেও নির্বিঘ্নে সেবা দেওয়ার ক্ষমতা",
    englishDefinition: "The capability of a system or network to handle a growing amount of work or potential to be enlarged.",
    example: "Cloud databases offer infinite scalability for institutional records.",
    exampleBengali: "ক্লাউড ডাটাবেজ প্রাতিষ্ঠানিক রেকর্ডের জন্য অসীম স্কেলেবিলিটি প্রদান করে।",
    synonyms: ["extensibility", "flexibility", "expandability"],
    antonyms: ["rigidity", "limitation"],
    category: "IT & Computer"
  },
  {
    word: "throughput",
    partOfSpeech: "Noun",
    pronunciation: "/ˈθruː.pʊt/",
    bengaliMeaning: "থ্রুপুট; নির্দিষ্ট সময়ে ডেটা স্থানান্তর বা প্রক্রিয়াকরণের প্রকৃত হার",
    englishDefinition: "The amount of data or number of items passing through a system or process per unit of time.",
    example: "High throughput ensures smooth streaming of live classes.",
    exampleBengali: "উচ্চ থ্রুপুট লাইভ ক্লাসের মসৃণ স্ট্রিমিং নিশ্চিত করে।",
    synonyms: ["bandwidth", "productivity", "processing rate"],
    antonyms: ["latency", "lag"],
    category: "IT & Computer"
  }
];

/**
 * High-speed offline dictionary search service
 */
class OfflineDictionaryService {
  private wordsMap: Map<string, OfflineDictionaryEntry> = new Map();
  private allEntries: OfflineDictionaryEntry[] = OFFLINE_DICTIONARY;

  constructor() {
    this.reindex();
  }

  private reindex() {
    this.wordsMap.clear();
    for (const entry of this.allEntries) {
      this.wordsMap.set(entry.word.toLowerCase().trim(), entry);
    }
  }

  /**
   * Instant search by exact word or prefix
   */
  lookup(query: string): OfflineDictionaryEntry | null {
    if (!query || !query.trim()) return null;
    const clean = query.toLowerCase().trim();
    return this.wordsMap.get(clean) || null;
  }

  /**
   * Search suggestions / autocomplete matching query prefix or substring
   */
  search(query: string, limit = 8): OfflineDictionaryEntry[] {
    if (!query || !query.trim()) return [];
    const clean = query.toLowerCase().trim();
    
    const results: OfflineDictionaryEntry[] = [];
    
    // 1. Exact match first
    const exact = this.wordsMap.get(clean);
    if (exact) {
      results.push(exact);
    }

    // 2. Prefix matches
    for (const entry of this.allEntries) {
      if (entry.word.toLowerCase() === clean) continue;
      if (entry.word.toLowerCase().startsWith(clean)) {
        results.push(entry);
        if (results.length >= limit) return results;
      }
    }

    // 3. Substring or Bengali meaning match if results still small
    if (results.length < limit) {
      for (const entry of this.allEntries) {
        if (results.includes(entry)) continue;
        if (
          entry.word.toLowerCase().includes(clean) ||
          entry.bengaliMeaning.toLowerCase().includes(clean) ||
          entry.englishDefinition.toLowerCase().includes(clean)
        ) {
          results.push(entry);
          if (results.length >= limit) break;
        }
      }
    }

    return results;
  }

  /**
   * Get all entries count
   */
  getCount(): number {
    return this.allEntries.length;
  }

  /**
   * Get all entries by category
   */
  getByCategory(category: string): OfflineDictionaryEntry[] {
    if (!category || category === 'All') return this.allEntries;
    return this.allEntries.filter(e => e.category === category);
  }

  /**
   * Get random word for Word of the Day
   */
  getRandomWord(): OfflineDictionaryEntry {
    const idx = Math.floor(Math.random() * this.allEntries.length);
    return this.allEntries[idx] || this.allEntries[0];
  }
}

export const offlineDictionaryService = new OfflineDictionaryService();
