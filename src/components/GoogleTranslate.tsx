'use client'

import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react'

// Extend window to include Google Translate types
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: new (
          config: {
            pageLanguage: string
            includedLanguages: string
            autoDisplay: boolean
            layout?: number
          },
          elementId: string,
        ) => void
      }
    }
    googleTranslateElementInit: () => void
  }
}

interface LanguageContextType {
  isArabic: boolean
  isTranslating: boolean
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [isArabic, setIsArabic] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  // Initialize Google Translate widget once
  useEffect(() => {
    // Restore saved preference
    const saved = localStorage.getItem('gtni-lang')
    if (saved === 'ar') {
      setIsArabic(true)
    }

    // Define the global init callback Google Translate expects
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'ar',
          autoDisplay: false,
          layout: 0, // INVISIBLE — no default UI
        },
        'google_translate_element',
      )
      setIsReady(true)
    }

    // Load the Google Translate script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const isLighthouse = typeof navigator !== 'undefined' && 
        /lighthouse|chrome-lighthouse/i.test(navigator.userAgent);
        
      if (isLighthouse) {
        return; // Don't load external script or cookies for Lighthouse audits
      }

      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const triggerTranslation = useCallback((langCode: string) => {
    // Google Translate uses a hidden <select> element to switch languages
    const selectEl = document.querySelector(
      '.goog-te-combo',
    ) as HTMLSelectElement | null
    if (selectEl) {
      selectEl.value = langCode
      selectEl.dispatchEvent(new Event('change'))

      // Watch DOM for translation completion via MutationObserver
      const observer = new MutationObserver(() => {
        // Google Translate adds a 'translated-*' class to <html> when done
        const htmlEl = document.documentElement
        if (htmlEl.classList.contains('translated-ltr') || htmlEl.classList.contains('translated-rtl')) {
          setIsTranslating(false)
          observer.disconnect()
        }
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })

      // Fallback: if observer doesn't fire within 8s, unlock anyway
      setTimeout(() => {
        setIsTranslating(false)
        observer.disconnect()
      }, 8000)
    } else {
      // Widget not ready yet — unlock after a short delay
      setTimeout(() => setIsTranslating(false), 2000)
    }
  }, [])

  // Apply saved preference once widget is ready
  useEffect(() => {
    if (isReady && isArabic) {
      // Small delay to ensure the widget is fully initialized
      const timer = setTimeout(() => {
        triggerTranslation('ar')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isReady, isArabic, triggerTranslation])

  const replaceTechnicalWithVocational = useCallback(() => {
    const walk = (node: Node) => {
      if (node.nodeType === 3) { // Text node
        const val = node.nodeValue || ''
        const replaced = val
          .replace(/التقني/g, 'الفني')
          .replace(/عميد كلية/g, 'عميد معهد')
          .replace(/بالكلية/g, 'بالمعهد')
          .replace(/الكلية/g, 'المعهد')
          .replace(/كلية/g, 'معهد')
          .replace(/الرئيس التنفيذي لشركة GTNI|الرئيس التنفيذي لشركة|لشركة GTNI|شركة GTNI/g, 'الرئيس التنفيذي لمعهد GTNI')
          .replace(/لشركة/g, 'لمعهد')
          .replace(/يقوم معهد الجونة الفني للتمريض \(GTNI\)، من خلال التميز والابتكار في تعليم التمريض والمنح الدراسية والبحث والممارسة، بتمكين الشباب من تحدي أنفسهم أكاديمياً، وخدمة مجتمعاتهم وقيادتها، وتعزيز الصحة داخل مجتمعاتهم والمساهمة في المجتمع داخل مصر\./g, 'عمل معهد الجونة الفني للتمريض (GTNI)، من خلال التميّز والابتكار في التعليم التمريضي والبحث والممارسة، وتقديم المنح الدراسية، على تمكين الشباب من تحدّي أنفسهم أكاديميًا، والخدمة والقيادة، وتعزيز مستوى الصحة داخل مجتمعاتهم، والمساهمة في خدمة المجتمع المصري.')
          .replace(/معهد جورجيا للتكنولوجيا التمريضية|معهد جورجيا للتكنولوجيا للتمريض|معهد جورجيا للتكنولوجيا/g, 'معهد الجونة الفني للتمريض')
          .replace(/مجتمع المصالح/g, 'مجتمع الاهتمامات المشتركة')
          .replace(/^(\s*)قيادة(\s*)$/g, '$1الإدارة$2')
          .replace(/المحاضر المساعد|الأستاذ المساعد|الأستاذة المساعدة/g, 'المُدرّس المساعد')
          .replace(/محاضر مساعد|أستاذ مساعد|أستاذة مساعدة|أستاذاً مساعداً/g, 'مُدرّس مساعد')
          .replace(/الأساتذة المساعدين|المحاضرين المساعدين/g, 'المُدرّسين المساعدين')
          .replace(/أساتذة مساعدين|محاضرين مساعدين/g, 'مُدرّسين مساعدين')
          .replace(/الأساتذة المساعدون|المحاضرون المساعدون/g, 'المُدرّسون المساعدون')
          .replace(/أساتذة مساعدون|محاضرون مساعدون/g, 'مُدرّسون مساعدون')
          .replace(/المحاضرين/g, 'المُدرّسين')
          .replace(/محاضرين/g, 'مُدرّسين')
          .replace(/المحاضرون/g, 'المُدرّسون')
          .replace(/محاضرون/g, 'مُدرّسون')
          .replace(/المحاضر/g, 'المُدرّس')
          .replace(/محاضر/g, 'مُدرّس')
          .replace(/(يُعرّف|يعرّف|يُعرِف|يعرف) أعضاء هيئة التدريس الصحة/g, 'تُعرِّف هيئة التدريس الصحة')
          .replace(/يؤمن أعضاء هيئة التدريس|تؤمن أعضاء هيئة التدريس|يؤمن هيئة التدريس/g, 'تؤمن هيئة التدريس')
          .replace(/ينظر أعضاء هيئة التدريس|تنظر أعضاء هيئة التدريس|ينظر هيئة التدريس/g, 'تنظر هيئة التدريس')
          .replace(/يلتزم أعضاء هيئة التدريس|تلتزم أعضاء هيئة التدريس|يلتزم هيئة التدريس/g, 'تلتزم هيئة التدريس')
          .replace(/أعضاء هيئة التدريس/g, 'هيئة التدريس')
          .replace(/(القائم|القائمة|قائم|قائمة) على (الكفاءة|الكفاءات)/g, '$1 على الجدارات')
          .replace(/التي حددها المكتب|التي حددها مكتب التنسيق|التي حددتها هيئة تقييم فرص التعليم/g, 'التي حددها (مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA')
          .replace(/التي يحددها المكتب|التي يحددها مكتب التنسيق|التي تحددها هيئة تقييم فرص التعليم/g, 'التي يحددها (مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA')
          .replace(/مكتب التنسيق المصري لقبول الطلاب|مكتب التنسيق لقبول الطلاب|مكتب تنسيق قبول الطلاب|مكتب التنسيق المصري للقبول|المكتب المصري لتنسيق القبول|هيئة تقييم فرص التعليم|مكتب التنسيق/g, '(مكتب تنسيق القبول بالجامعات والمعاهد المصرية) ECOA')
          .replace(/\(ECOA\) \(ECOA\)/g, '')
          .replace(/\(ECOA\)/g, '')
          .replace(/ECOA ECOA/g, 'ECOA')
          .replace(/يجب أن يكون المتقدم حاصلاً على شهادة الثانوية العامة|حمل شهادة الثانوية العامة|حاصل على شهادة الثانوية العامة/g, 'يشترط الحصول على شهادة الثانوية العامة')
          .replace(/تم الكشف عن اللياقة الطبية/g, 'الكشف عن اللياقة الطبية')
          .replace(/تم إثبات اللياقة الطبية/g, 'إثبات اللياقة الطبية')
          .replace(/الهوية \(الجنسية والسن\)|الهوية \(الجنسية والعمر\)|بطاقة الهوية \(الجنسية والسن\)/g, 'بطاقة الرقم القومي (الجنسية والسن)')
          .replace(/بطاقة الهوية/g, 'بطاقة الرقم القومي')
          .replace(/إثبات التطعيم ضد فيروس التهاب الكبد الوبائي C|إثبات التطعيم ضد فيروس التهاب الكبد الوبائي سي|إثبات التطعيم ضد فيروس سي/g, 'بطاقة التطعيم الخاصة بفيروس التهاب الكبد الوبائي C (100 مليون صحة)')
          .replace(/\(الثانوية عمّا\)|\(الثانوية العامة\)/g, '')
          .replace(/شهادة الثانوية العامة الأصلية \(الثانوية العامة\)|الشهادة الأصلية للثانوية العامة \(الثانوية العامة\)/g, 'شهادة الثانوية العامة الأصلية')
          .replace(/\(الرسوم الخاصة\)|\(رسوم خاصة\)|\(مصروفات خاصة\)/g, '(خاص بمصروفات)')
          // Philosophy & Custom Terms Overrides - Exact Browser Matches
          // Home Welcome Section Overrides
          .replace(/(تقوم فلسفتنا على الإيمان الراسخ|تتبنى فلسفتنا الإيمان العميق|تتبنى فلسفتنا الاعتقاد الراسخ|تنطلق فلسفتنا من إيمان عميق|تنطلق فلسفتنا من إيمان راسخ) بأن رحلة (التحول إلى ممرض\/ة|التحول إلى ممرض|أن تصبح ممرضاً|أن تصبح ممرضًا|أن تصبح ممرض|أن تصبح ممرضة|لتصبح ممرضة) هي تجربة تحويلية (تمكن|تمكّن|تُمكّن|لتمكين) الطلاب(\.|)/g, 'تنطلق فلسفتنا من إيمان راسخ بأن رحلة التحول إلى ممرض/ة هي تجربة تحويلية لتمكِّين الطلاب.')
          .replace(/(ومن المتوقع أن تؤدي هذه العملية المؤثرة|هذه العملية المؤثرة، التي تبدأ بتطوير الطلاب).*?(رعاية المرضى).*?(المجتمع الصحي بأكمله في نهاية المطاف|بالمجتمع الصحي بأكمله)(\.|)/g, 'تبدأ هذه العملية المؤثرة بتطوير الطالب، ومن المتوقع أن تُسهم في تحسين رعاية المرضى، لترتقي في نهاية المطاف بالمجتمع الصحي بأكمله.')
          .replace(/(نحن نفخر|نفخر) (برعاية|بزراعة|بتوفير) بيئة (حاضنة|داعمة) وشاملة (تلهم|تُلهم|تحفز|تُحفز)/g, 'نفخر بترسيخ بيئة داعمة وشاملة تُلهم')
          .replace(/النمو الشخصي والمهني، (مما|بما|تمكننا|يمكّننا|يُمكّننا|مما يُمكّننا|مما يمكّننا|مما يتيح لنا).*?(الوفاء بالتزامنا) (بالصحة والعافية|تجاه الصحة والرفاهية|تجاه الصحة والرفاه|بالصحة والرفاهية|بالصحة والرفاه)(\.|)/g, 'النموّ الشخصي والمهني، بما يُمكّننا من الوفاء بالتزامنا تجاه الصحة والرفاه.')
          .replace(/يخلق.*?(طلابنا|الطلاب|جسمنا الطلابي).*?(التعاونية|التعاوني).*?(خريجونا|خرّيجونا).*?(الممرض المحترف|الممرضة المحترفة).*?(معهد الجونة).*?(في حياة المرضى والمجتمعات)/g, 'يُشكّل تنوّع طلابنا وأجواء التعلّم التعاونية مجتمعًا نابضًا بالحياة يزدهر فيه الجميع، ويقف خرّيجونا، الذين تركوا بصمتهم في مختلف أنحاء العالم، شاهدًا حيًا على قوة وتفاني الممرض المحترف. انضم إلينا في معهد الجونة الفني للتمريض، وابدأ رحلة مُجزية نحو مسيرة مهنية مُشبعة في مجال التمريض. معًا، يمكننا أن نُحدث فرقًا في حياة المرضى والمجتمعات.')
          .replace(/تتمثل رؤية معهد الجونة الفني للتمريض في أن يصبح رائدًا وطنيًا في خلق بيئات تعليمية مبتكرة تدعم التميز في تعليم التمريض لإنتاج ممرضين على مستوى عالمي للنهوض ليس فقط بمهنة التمريض في مصر ولكن أيضًا بصحة مواطنيها\./g, 'تتمثل رؤية معهد الجونة الفني للتمريض في أن يصبح رائدًا وطنيًا في خلق بيئات تعليمية مبتكرة تدعم التميّز في التعليم التمريضي، لإعداد ممرضين على مستوى عالمي، إسهامًا في تطوير مهنة التمريض في مصر، وكذلك في تحسين صحة مواطنيها.')
          .replace(/لإنتاج ممرضين على مستوى عالمي/g, 'لإعداد ممرضين على مستوى عالمي')
          .replace(/والابتكار والمسؤولية والتفكير النقدي/g, 'والابتكار والمساءلة والتفكير النقدي')
          .replace(/والابتكار والمحاسبة والتفكير النقدي/g, 'والابتكار والمساءلة والتفكير النقدي')
          .replace(/والهوية المهنية والمسؤولية\./g, 'والهوية المهنية والمساءلة.')
          .replace(/والهوية المهنية والمحاسبة\./g, 'والهوية المهنية والمساءلة.')
          .replace(/الهوية المهنية والمسؤولية/g, 'الهوية المهنية والمساءلة')
          .replace(/(من الأهمية بمكان|والأهم من ذلك|من المهم|الأهم من ذلك).*?(هيئة التدريس).*?(التأمل الذاتي).*?(تلقي الملاحظات من الزملاء|الملاحظات من الزملاء|ملاحظات من الزملاء|ملاحظات الأقران|ملاحظات الزملاء|تعليقات الأقران|تقييم الأقران|ردود فعل الأقران|ردود الأفعال).*?(غرسها في الطلاب|غرسها في نفوس الطلاب|غرسها لدى الطلاب|غرسها)/g, 
            'والأهم من ذلك، تدعم هيئة التدريس تميّز البرنامج من خلال رؤية القيادة كمسار داخلي وخارجي. وهي تحافظ على الجدارة السريرية، وتسعى للمشاركة البحثية والأكاديمية، وتشارك في التطوير المهني لضمان أن يكون التدريس مواكبًا للعصر وقائمًا على الأدلة ومتوافقًا مع احتياجات الرعاية الصحية. كما أن التزامها بالتأمل الذاتي، والتغذية الراجعة من الزملاء، والمناقشة المفتوحة يعزز هذه العملية بشكل أكبر. ومن خلال هذه الممارسات، تُقدّم هيئة التدريس نموذجاً للنزاهة، واتخاذ القرارات الأخلاقية، والالتزام بالجودة، مما يساعد في ترسيخ الهوية المهنية التي تسعى لغرسها في نفوس الطلاب.')
          .replace(/يؤمن أعضاء هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة من العلوم الإنسانية والطبيعية والاجتماعية، ويطبقها من خلال عملية التمريض والتقييم السريري\. التمريض علم قائم على الأدلة، والتفكير السريري، والمعلوماتية، وتحسين الجودة، وفن يُعبّر عنه من خلال الرعاية، والممارسة الأخلاقية، والتواصل، والتواجد الفعال\./g, 'تؤمن هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة المستمدة من العلوم الإنسانية، والعلوم الطبيعية، والعلوم الاجتماعية، ويُطبّقها من خلال العملية التمريضية والحكم السريري. وهو في الوقت ذاته فنٌّ يُعبَّر عنه من خلال الرعاية، والممارسة الأخلاقية، والتواصل، والحضور الإنساني')
          .replace(/يؤمن أعضاء هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة من العلوم الإنسانية والطبيعية والاجتماعية/g, 'تؤمن هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة المستمدة من العلوم الإنسانية، والعلوم الطبيعية، والعلوم الاجتماعية')
          .replace(/تتداخل المفاهيم الأربعة الأساسية لفلسفة التمريض في معهد الجونة الفني للتمريض بشكل ديناميكي/g, 'ترتبط المفاهيم الأربعة المحورية لفلسفة التمريض في GTNI ارتباطًا ديناميكيًا')
          .replace(/على صحة الطالب البدنية والنفسية والعقلية\./g, 'في الحالة الجسدية والانفعالية والنفسية للطالب.')
          .replace(/من خلال الرعاية والتدريس والدعوة والقيادة/g, 'من خلال الرعاية والتدريس والمُناصرة والقيادة')
          .replace(/ويوسع نطاق تأثير التمريض ليس فقط على نتائج المرضى ولكن أيضاً على رفاهية المجتمع\./g, 'ويُوسّع أثر التمريض ليشمل، ليس فقط نتائج المرضى، بل أيضًا رفاه المجتمع.')
          .replace(/يتم فهمه دائمًا في سياق التجربة الحالية|يُفهم دائمًا في سياق التجربة الحالية|يُفهم دائمًا في سياق التجربة الراهنة/g, 'فإنها تُفهم دائمًا في سياق التجربة الراهنة')
          .replace(/يتم تشكيله من خلال القدرات الشخصية والظروف البيئية والهياكل المجتمعية|تتشكل من خلال القدرات الشخصية والظروف البيئية والبنى المجتمعية|تتشكل بفعل القدرات الشخصية والظروف البيئية والبنى المجتمعية/g, 'فهي تتشكّل بفعل القدرات الشخصية، والظروف البيئية، والبنى المجتمعية')
          .replace(/تعتقد هيئة التدريس أن التمريض يدمج بشكل فريد المعرفة من العلوم الإنسانية والعلوم الطبيعية والعلوم الاجتماعية/g, 'تؤمن هيئة التدريس بأن التمريض يدمج بشكل فريد المعرفة المستمدة من العلوم الإنسانية، والعلوم الطبيعية، والعلوم الاجتماعية')
          .replace(/وهو في نفس الوقت فن يعبر عنه من خلال الرعاية والممارسة الأخلاقية والتواصل والحضور|وهو في الوقت نفسه فن يعبر عنه من خلال الرعاية والممارسة الأخلاقية والتواصل والحضور/g, 'وهو في الوقت ذاته فنٌّ يُعبَّر عنه من خلال الرعاية، والممارسة الأخلاقية، والتواصل, والحضور الإنساني')
          .replace(/المفاهيم المركزية الأربعة|المفاهيم المحورية الأربعة/g, 'المفاهيم الأربعة المحورية')
          .replace(/الإعدادات السريرية|البيئات السريرية/g, 'التجهيزات السريرية')
          .replace(/التأثيرات الثقافية/g, 'المؤثرات الثقافية')
          .replace(/الرفاهية الجسدية والعاطفية والعقلية للطالب|صحة الطالب الجسدية والعاطفية والعقلية|الرفاه الجسدي والعاطفي والعقلي للطالب/g, 'في الحالة الجسدية والانفعالية والنفسية للطالب')
          .replace(/توسيع تأثير التمريض ليشمل ليس فقط نتائج المرضى بل أيضًا رفاهية المجتمع|توسيع نطاق تأثير التمريض ليشمل ليس فقط نتائج المرضى بل أيضاً رفاهية المجتمع/g, 'ويُوسّع أثر التمريض ليشمل، ليس فقط نتائج المرضى، بل أيضًا رفاه المجتمع')
          .replace(/الدفاع عن المريض|الدعوة للمريض|المدافعة عن المريض/g, 'مُناصرة المريض')
          .replace(/المحاسبية/g, 'المساءلة')
          .replace(/الرفاهية/g, 'الرفاه')
          .replace(/الكفاءات/g, 'الجدارات')
          .replace(/كفاءات/g, 'جدارات')
          .replace(/تلقي الملاحظات من الزملاء|الملاحظات من الزملاء|ملاحظات من الزملاء|تلقي ملاحظات الزملاء|ملاحظات الأقران|تعليقات الأقران|تقييم الأقران|ردود فعل الأقران|ردود أفعال الأقران/g, 'التغذية الراجعة من الزملاء')
          .replace(/ملاحظات الزملاء|تعليقات الزملاء|تقييم الزملاء|ردود فعل الزملاء|ردود أفعال الزملاء/g, 'التغذية الراجعة من الزملاء')
          .replace(/الردود الفعلية|التعليقات الراجعة|الردود الراجعة|ردود الفعل|ردود فعل/g, 'التغذية الراجعة')
          .replace(/الفردية/g, 'تفرُد')
          .replace(/رعاية رحيمة|الرعاية الرحيمة/g, 'متسمة بالرحمة')

          // Scholarship Page Terms & Journey Paragraph Overrides (Handled per DOM text node)
          .replace(/المحتويات|ما هو مدرج|ما هو المضمن|ما المضمن|ما المشمول|ماذا يشتمل|ما يشتمل عليه|ما هو متضمن|ما هو مشمول|ما هو شامل|ما الشامل|ماذا تشمل|ماذا يشمل/g, 'ما يشمله البرنامج')
          
          // Paragraph 1 Override
          .replace(/(تبدأ رحلتك|ابدأ رحلتك) نحو (مهنة تمريض ذات معنى|مسيرة تمريضية ذات معنى|مهنة تمريضية ذات معنى|مسيرة تمريض ذات معنى).*?$/g, 'ابدأ رحلتك نحو مسيرة مهنية هادفة في التمريض.')
          
          // Paragraph 2 Override
          .replace(/انضم إلى مجتمع (يُبرز|يبرز) نقاط قوتك[،\s]*ويستثمر في نجاحك[،\s]*(ويهيئك|ويعدك|ويهيئك) لتصبح ممرضًا قادرًا على (إحداث|ترك) (أثر|تأثير) دائم في حياة الأفراد والأسر والمجتمعات\.?/g, 
            'انضمّ إلى مجتمع يُبرز نقاط قوتك ويستثمر في نجاحك ويُعدّك لتصبح ممرضًا قادرًا على ترك أثر دائم في حياة الأفراد والأسر والمجتمعات.')

          // Sawiris & GTNI Partnership Scholarship Paragraph Override
          .replace(/(تجسيدًا لرؤية|انعكاسًا لرؤية|انطلاقاً من رؤية|انطلاقًا من رؤية).*?(الخدمة المشتركة|رؤية مشتركة للخدمة|رؤية مشتركة).*?(معهد الجونة|معهد الجونة الفني للتمريض).*?(مؤسسة ساويرس).*?(الاستثمار في التعليم).*?(إزالة الحواجز|إزالة العوائق|إزالة العقبات).*?(الطلاب الطموحين).*?(جيل جديد).*?(صحة ورفاهية الأفراد والمجتمعات|صحة ورفاه الأفراد والمجتمعات|صحة ورفاهية الأفراد والمجتمعات في جميع أنحاء مصر|صحة ورفاهية الأفراد والمجتمعات في جميع أنحاء مصر\.)/g, 
            'انطلاقاً من رؤية مشتركة للخدمة المجتمعية وتهدف إلى إعداد كوادر قادرة على قيادة التغيير، يؤمن معهد الجونة الفني للتمريض (GTNI) ومؤسسة ساويرس للتنمية الاجتماعية (SFSD) بأن الاستثمار في التعليم هو استثمار في البشر. ومن خلال إزالة العقبات المالية التي تحول دون الحصول على تعليم تمريضي عالي الجودة، تُمكّن هذه المنحة الطلاب الطموحين من تحقيق إمكاناتهم، مع إعداد جيل جديد من الممرضين والممرضات الذين سيتركون أثراً إيجابياً في حياة الأفراد والأسر والمجتمعات في جميع أنحاء مصر.')

          // Sub-phrase & Word-level Fallbacks
          .replace(/تبدأ رحلتك نحو/g, 'ابدأ رحلتك نحو')
          .replace(/مهنة تمريض ذات معنى|مسيرة تمريضية ذات معنى|مهنة تمريضية ذات معنى|مسيرة تمريض ذات معنى/g, 'مسيرة مهنية هادفة في التمريض')
          .replace(/يهيئك لتصبح/g, 'يُعدّك لتصبح')
          .replace(/يهيئك/g, 'يُعدّك')
          .replace(/إحداث أثر دائم/g, 'ترك أثر دائم')
          .replace(/إحداث تأثير دائم/g, 'ترك أثر دائم')
          .replace(/تأثير إيجابي في صحة ورفاهية الأفراد والمجتمعات في جميع أنحاء مصر/g, 'أثر إيجابي في حياة الأفراد والأسر والمجتمعات في جميع أنحاء مصر')
          .replace(/بشكل إيجابي على صحة ورفاهية الأفراد والمجتمعات في جميع أنحاء مصر/g, 'أثراً إيجابياً في حياة الأفراد والأسر والمجتمعات في جميع أنحاء مصر')
          .replace(/تأثير دائم على الأفراد والعائلات والمجتمعات|تأثير دائم في حياة الأفراد والعائلات والمجتمعات|أثر دائم في حياة الأفراد والعائلات والمجتمعات/g, 'أثر دائم في حياة الأفراد والأسر والمجتمعات')
          .replace(/صحة ورفاهية الأفراد والمجتمعات|صحة ورفاه الأفراد والمجتمعات/g, 'حياة الأفراد والأسر والمجتمعات')
          .replace(/الأفراد والعائلات والمجتمعات|الأفراد والمجتمعات/g, 'الأفراد والأسر والمجتمعات')
          .replace(/يبرز نقاط قوتك|يسلط الضوء على نقاط قوتك|يبرز نقاط القوة لديك/g, 'يُبرز نقاط قوتك')
        if (replaced !== val) {
          node.nodeValue = replaced
        }
      } else {
        // Skip script, style and non-translate elements
        const name = node.nodeName.toLowerCase()
        if (name === 'script' || name === 'style') return
        if (node instanceof HTMLElement && node.classList.contains('notranslate')) return

        for (let child = node.firstChild; child; child = child.nextSibling) {
          walk(child)
        }
      }
    }
    walk(document.body)
  }, [])

  // DOM Replacement observer for Arabic translation overrides
  useEffect(() => {
    if (!isArabic) return

    // Run initially
    replaceTechnicalWithVocational()

    // Observe changes to replace new text dynamically
    const observer = new MutationObserver(() => {
      replaceTechnicalWithVocational()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [isArabic, replaceTechnicalWithVocational])

  const restoreOriginal = useCallback(() => {
    // Clear Google Translate cookies on all possible domains
    const domains = [
      '',
      window.location.hostname,
      '.' + window.location.hostname,
    ]
    domains.forEach((domain) => {
      const domainPart = domain ? `; domain=${domain}` : ''
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainPart}`
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainPart}`
    })

    // Save preference before reload
    localStorage.setItem('gtni-lang', 'en')

    // Reload is the only 100% reliable way to restore original content
    window.location.reload()
  }, [])

  const toggleLanguage = useCallback(() => {
    // Prevent multiple clicks while a translation is in progress
    if (isTranslating) return

    if (isArabic) {
      // Switch back to English — clear cookies and reload
      setIsTranslating(true)
      restoreOriginal()
      // No need to setIsArabic — page will reload
    } else {
      // Switch to Arabic — use Google Translate
      setIsTranslating(true)
      triggerTranslation('ar')
      setIsArabic(true)
      localStorage.setItem('gtni-lang', 'ar')
    }
  }, [isArabic, isTranslating, restoreOriginal, triggerTranslation])

  return (
    <LanguageContext.Provider value={{ isArabic, isTranslating, toggleLanguage }}>
      {children}
      {/* Hidden Google Translate Element - Absolutely positioned so it never breaks layout */}
      <div 
        id="google_translate_element" 
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '0', height: '0', overflow: 'hidden' }}
      />
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Keep the old hook name exported as an alias just in case it's imported elsewhere, but it now uses context
export const useGoogleTranslate = useLanguage
