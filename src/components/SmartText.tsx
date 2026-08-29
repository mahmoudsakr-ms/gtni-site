'use client'

import React from 'react'
import { useLanguage } from './GoogleTranslate'

// Dictionary for words we want to force-translate
const dictionary: Record<string, string> = {
  // Navigation & General
  home: 'الرئيسية',
  'about gtni': 'عن المعهد',
  'contact us': 'تواصل معنا',
  'news & events': 'الأخبار والفعاليات',
  vacancies: 'الوظائف الشاغرة',
  gtni: 'معهد الجونة الفني للتمريض',
  'gouna technical nursing institute': 'معهد الجونة الفني للتمريض',
  'el gouna technical nursing institute': 'معهد الجونة الفني للتمريض',
  'community of interest': 'مجتمع الاهتمامات المشتركة',
  ecoa: '(مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA',
  'the ecoa': '(مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA',
  'egyptian coordination office for the admission of students (ecoa)':
    '(مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA',

  // Admissions Section
  admission: 'التقديم',
  admissions: 'التقديم',
  'admission requirements': 'شروط التقديم',
  'admission process': 'إجراءات القبول',
  'tuition & fees': 'الرسوم الدراسية',
  'financial aid': 'المساعدات المالية',

  // Academic & Programs
  'nursing programs': 'برامج التمريض',
  'academic calendar': 'التقويم الدراسي',
  'program overview': 'نظرة عامة على البرنامج',
  scholarships: 'المنح الدراسية',

  // Student Life & Support
  'student life': 'الحياة الطلابية',
  'student services': 'خدمات الطلاب',
  'alumni & students testimonials': 'آراء الخريجين والطلاب',
  'housing & accommodation': 'السكن الجامعي',
  'student organizations': 'المنظمات الطلابية',
  'student support': 'الدعم الطلابي',

  'student testimonials': 'آراء طلابنا',
  testimonials: 'قالوا عنا',

  // Slogans
  'be a part of an exciting future': 'كن جزءًا من مستقبل مثير',
  educating: 'نُعلم',
  inspiring: 'نُلهم',
  enableing: 'نُمكن',
  enabling: 'نُمكن',

  // Philosophy Section
  'our philosophy embraces the profound belief that the journey of becoming a nurse is a transformative experience that empowers students.':
    'تنطلق فلسفتنا من إيمان راسخ بأن رحلة التحول إلى ممرض/ة هي تجربة تحويلية لتمكِّين الطلاب.',
  'this impactful process, beginning with student development, is expected to enhance patient care and ultimately uplift the entire health community.':
    'تبدأ هذه العملية المؤثرة بتطوير الطالب، ومن المتوقع أن تُسهم في تحسين رعاية المرضى، لترتقي في نهاية المطاف بالمجتمع الصحي بأكمله.',
  'we take pride in cultivating a nurturing and inclusive environment that inspires personal and professional growth, enabling us to fulfill our commitment to health and well-being.':
    'نفخر بترسيخ بيئة داعمة وشاملة تُلهم النموّ الشخصي والمهني، بما يُمكّننا من الوفاء بالتزامنا تجاه الصحة والرفاه.',
  'our diverse student body and collaborative learning atmosphere create a vibrant community where everyone can thrive, and our alumni, making their mark across the globe, stand as a living testament to the power and dedication of a professional nurse. join us at the gouna technical nursing institute and embark on a rewarding journey towards a fulfilling career in nursing. together, we can make a difference in the lives of patients and communities.':
    'يُشكّل تنوّع طلابنا وأجواء التعلّم التعاونية مجتمعًا نابضًا بالحياة يزدهر فيه الجميع، ويقف خرّيجونا، الذين تركوا بصمتهم في مختلف أنحاء العالم، شاهدًا حيًا على قوة وتفاني الممرض المحترف. انضم إلينا في معهد الجونة الفني للتمريض، وابدأ رحلة مُجزية نحو مسيرة مهنية مُشبعة في مجال التمريض. معًا، يمكننا أن نُحدث فرقًا في حياة المرضى والمجتمعات.',

  // Footer Description & About Us
  'empowering students to achieve their dreams through world-class education and a supportive community.':
    'نُمكّن الطلاب من تحقيق أحلامهم من خلال تعليم عالمي المستوى ومجتمع داعم.',
  'about us': 'من نحن',
  'our mission': 'رسالتنا',
  leadership: 'الإدارة',
  college: 'معهد',
  'gtni ceo': 'الرئيس التنفيذي لمعهد GTNI',
  'ceo of gtni': 'الرئيس التنفيذي لمعهد GTNI',
  'gouna technical nursing institute (gtni), through excellence and innovation in nursing education, scholarship, research, and practice, empowers youth to challenge themselves academically, to serve and to lead, and promote improved health within their communities and to contribute to society within Egypt.':
    'عمل معهد الجونة الفني للتمريض (GTNI)، من خلال التميّز والابتكار في التعليم التمريضي والبحث والممارسة، وتقديم المنح الدراسية، على تمكين الشباب  من تحدّي أنفسهم أكاديميًا، والخدمة والقيادة، وتعزيز مستوى الصحة داخل مجتمعاتهم، والمساهمة في خدمة المجتمع المصري.',

  // Our Vision
  'our vision': 'رؤيتنا',
  "gouna technical nursing institute's vision is to become a national leader in creating innovative learning environments that support excellence in nursing education to produce world class nurses for the advancement of not only the nursing profession in Egypt but also the health of its citizens.":
    'تتمثل رؤية معهد الجونة الفني للتمريض في أن يصبح رائدًا وطنيًا في خلق بيئات تعليمية مبتكرة تدعم التميّز في التعليم التمريضي، لإعداد ممرضين على مستوى عالمي، إسهامًا في تطوير مهنة التمريض في مصر، وكذلك في تحسين صحة مواطنيها.',

  // Photo Caption
  'nursing is not only learned—it is lived, shaped, and carried with purpose.':
    'التمريض ليس مجرد علم يُدرَّس، بل هو خبرة تُعاش، وشخصية تُصقل، ورسالة تُحمل بإخلاص.',

  // Academic Philosophy Paragraphs & Terms
  'faculty view transformation as more than acquiring knowledge or skills;':
    'تنظر هيئة التدريس إلى التحوّل باعتباره أكثر من مجرد اكتساب المعرفة أو المهارات؛',
  'it involves intentionally shaping character, competence, professional identity, and social responsibility. they acknowledge the various levels of nursing practice.':
    'بل يتضمّن العمل بشكل مقصود على تشكيل الشخصية، والجدارة، والهوية المهنية، والمسؤولية الاجتماعية. كما تُقرّ هيئة التدريس بمختلف مستويات ممارسة التمريض.',
  'faculty view transformation as more than acquiring knowledge or skills; it involves intentionally shaping character, competence, professional identity, and social responsibility. they acknowledge the various levels of nursing practice. although the program awards a technical diploma in nursing, it offers a strong theoretical and clinical foundation that supports lifelong learning and professional growth. at gtni, future nurses are prepared to practice safely and competently, and to pursue further academic and professional advancement.':
    'تنظر هيئة التدريس إلى التحوّل باعتباره أكثر من مجرد اكتساب المعرفة أو المهارات؛ بل يتضمّن العمل بشكل مقصود على تشكيل الشخصية، والجدارة، والهوية المهنية، والمسؤولية الاجتماعية. كما تُقرّ هيئة التدريس بمختلف مستويات ممارسة التمريض. وعلى الرغم من أن البرنامج يمنح دبلومًا فنيًا في التمريض، إلا أنه يقدم أساسًا نظريًا وسريريًا قويًا يدعم التعلم مدى الحياة والنمو المهني. ففي معهد الجونة الفني للتمريض (GTNI)، يُعَدّ ممرضو المستقبل لممارسة المهنة بأمان وجدارة، ومواصلة تطورهم الأكاديمي والمهني.',
  'at gtni, future nurses are prepared to practice safely and competently, and to pursue further academic and professional advancement.':
    'ففي معهد الجونة الفني للتمريض (GTNI)، يُعَدّ ممرضو المستقبل لممارسة المهنة بأمان وجدارة، ومواصلة تطورهم الأكاديمي والمهني.',
  "the gtni philosophy centers on the belief that nursing is both an art and a science, rooted in the interconnected concepts of person, environment, health, and nursing. these concepts define nursing practice and form the basis for the program's educational values, outcomes, and expectations.":
    'تتمحور فلسفة معهد الجونة الفني للتمريض (GTNI) حول الإيمان بأن التمريض هو فنّ وعلمٌ في آنٍ واحد، متجذّرٌ في مفاهيم مترابطة تشمل الإنسان، والبيئة، والصحة، والتمريض. وتُشكّل هذه المفاهيم أساس ممارسة التمريض، كما تُمثّل الركيزة التي تقوم عليها القيم التعليمية للبرنامج، ومخرجاته، وتوقّعاته.',
  'faculty believe nursing uniquely integrates knowledge from the humanities, natural sciences, and social sciences, applying it through the nursing process and clinical judgment.':
    'تؤمن هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة المستمدة من العلوم الإنسانية، والعلوم الطبيعية، والعلوم الاجتماعية، ويُطبّقها من خلال العملية التمريضية والحكم السريري.',
  'and it is at the same time an art expressed through caring, ethical practice, communication, and presence':
    'وهو في الوقت ذاته فنٌّ يُعبَّر عنه من خلال الرعاية، والممارسة الأخلاقية، والتواصل، والحضور الإنساني',

  // Single Words & Short Phrases
  faculty: 'هيئة التدريس',
  individuality: 'تفرُد',
  'compassionate care': 'متسمة بالرحمة',
  adaptation: 'القدرة على التكيف',
  although: 'و على الرغم',
  'it is always understood in the context of the present experience':
    'فإنها تُفهم دائمًا في سياق التجربة الراهنة',
  'it is shaped by personal abilities, environmental conditions, and societal structures':
    'فهي تتشكّل بفعل القدرات الشخصية، والظروف البيئية، والبنى المجتمعية',
  'the four central concepts of the gtni nursing philosophy are dynamically interconnected':
    'ترتبط المفاهيم الأربعة المحورية لفلسفة التمريض في GTNI ارتباطًا ديناميكيًا',
  'clinical settings': 'التجهيزات السريرية',
  'cultural influences': 'المؤثرات الثقافية',
  "the student's physical, emotional, and mental well-being":
    'في الحالة الجسدية والانفعالية والنفسية للطالب',
  'well-being': 'الرفاه',
  competency: 'جدارة',
  competencies: 'جدارات',
  advocacy: 'المُناصرة',
  'patient advocacy': 'مُناصرة المريض',
  "extending nursing's impact to include not only patient outcomes but also community well-being":
    'ويُوسّع أثر التمريض ليشمل، ليس فقط نتائج المرضى، بل أيضًا رفاه المجتمع',
  accountability: 'المساءلة',
  lecturer: 'مُدرّس',
  'assistant lecturer': 'مُدرّس مساعد',
  'assistant professor': 'مُدرّس مساعد',
  feedback: 'التغذية الراجعة',
  'peer feedback': 'التغذية الراجعة من الزملاء',

  // Scholarship Page Terms & Paragraphs
  "what's included": 'ما يشمله البرنامج',
  "what' included": 'ما يشمله البرنامج',
  'what is included': 'ما يشمله البرنامج',
  'start your journey': 'ابدأ رحلتك',
  'begin your journey': 'ابدأ رحلتك',
  'your journey toward a meaningful nursing career starts':
    'ابدأ رحلتك نحو مسيرة مهنية هادفة في التمريض',
}

export const SmartText = ({ text }: { text: string }) => {
  const { isArabic } = useLanguage()

  // Clean the text for matching
  const cleanText = (text || '')
    .replace(/[\u200B-\u200D\uFEFF\u202F\u00A0]/g, '') // Remove zero-width and narrow/non-breaking spaces
    .replace(/[\u2018\u2019]/g, "'") // Normalize smart single quotes / apostrophes
    .replace(/[\u201C\u201D]/g, '"') // Normalize smart double quotes
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
  const matchKey = cleanText.toLowerCase()
  const forcedTranslation = dictionary[matchKey]

  if (forcedTranslation) {
    return (
      <span className="notranslate inline-block" translate="no" suppressHydrationWarning>
        {isArabic ? forcedTranslation : cleanText}
      </span>
    )
  }

  // If no translation found, just return the text normally
  return <span suppressHydrationWarning>{text}</span>
}
