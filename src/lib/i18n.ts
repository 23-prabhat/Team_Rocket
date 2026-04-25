export type Lang = "en" | "hi" | "mr";

export const translations = {
  en: {
    nav: {
      howItWorks: "How It Works",
      features: "Features",
      channels: "Channels",
    },
    hero: {
      badge: "Misinformation defense",
      headline1: "Verify before",
      headline2: "you",
      headline3: "share",
      subtitle:
        "Check claims, links, and screenshots in regional Indian languages and get a clear verdict with explainable red flags.",
      trust: "Your submissions are analyzed securely and never stored.",
    },
    upload: {
      drag: "Drag & drop your content file",
      dragActive: "Drop your file here",
      browse: "browse files",
      hint: "URL, PDF or TXT",
      analyze: "Analyze Content",
      analyzing: "Analyzing...",
      errorType: "Only PDF and TXT files are supported for upload.",
      errorSize: "File must be under 10MB.",
    },
    howItWorks: {
      label: "How it works",
      headline: "Three steps to misinformation checks",
      steps: [
        {
          num: "01",
          title: "Send a link or screenshot",
          desc: "Submit a claim source from web, browser extension, or WhatsApp for instant analysis.",
        },
        {
          num: "02",
          title: "AI investigates the claim",
          desc: "Veritron extracts signals, checks language context, and identifies manipulation patterns.",
        },
        {
          num: "03",
          title: "Get verdict + explanation",
          desc: "See a credibility score, decision rationale, and evidence indicators in simple language.",
        },
      ],
    },
    features: {
      label: "Features",
      headline: "Everything needed to spot misleading content",
      items: [
        {
          title: "Credibility Meter",
          desc: "A visual 0–100 score that shows how trustworthy the content appears at a glance.",
        },
        {
          title: "Simple Explanation",
          desc: "Technical checks are translated into plain language so any user can understand why content was flagged.",
        },
        {
          title: "Red-Flag Breakdown",
          desc: "Signals like sensational framing, missing context, and unverifiable claims are highlighted clearly.",
        },
        {
          title: "Regional Language Support",
          desc: "Designed for Indian-language content where misinformation tools are still limited.",
        },
        {
          title: "Channel Coverage",
          desc: "Use the web app, browser extension, or WhatsApp based on where the content appears.",
        },
        {
          title: "Actionable Output",
          desc: "See verdict status, confidence bands, and key parameters that support the final decision.",
        },
      ],
    },
    channels: {
      label: "Available everywhere",
      headline: "Meet users where they are",
      subtitle:
        "One detection engine across web, extension, and WhatsApp so users can verify content in-place.",
      items: [
        {
          title: "Web App",
          desc: "Submit links or files and get a full misinformation analysis dashboard.",
          tag: "You're here",
        },
        {
          title: "Browser Extension",
          desc: "Analyze suspicious pages while browsing, without leaving the current tab.",
          tag: "Chrome",
        },
        {
          title: "WhatsApp Support",
          desc: "Send a link or image in chat and receive a verdict with concise reasoning.",
          tag: "WhatsApp",
        },
      ],
    },
    cta: {
      headline: "Don't forward blind",
      subtitle:
        "Run a quick check before sharing any viral claim, post, screenshot, or link.",
      button: "Get started",
    },
    footer: {
      tagline: "Verify the claim. Protect your community.",
      built: "Built for MIT Hack for Impact 2026",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "WhatsApp",
      },
    },
    analyze: {
      title: "Analysis complete",
      analyzedAt: "Analyzed",
      language: "Language",
      riskAssessment: "Credibility Assessment",
      quickSummary: "Quick summary",
      flaggedClauses: "Flagged signals",
      keyObligations: "Supporting indicators",
      plainSummary: "Plain-Language Explanation",
      agreementList: "Key indicators",
      clausesTitle: "Flagged Signals",
      originalClause: "Original text",
      noClauses: "No major misinformation signals found in this content.",
      quizTitle: "Quick Verification Check",
      quizPrompt: "Answer at least 2 of 3 questions correctly to confirm understanding.",
      noQuiz: "No verification questions generated.",
      submitAnswers: "Submit responses",
      tryAgain: "Try again",
      quizPass: "correct — verdict details unlocked.",
      quizFail: "correct — review the explanation and try again.",
      consentTitle: "Mark As Understood",
      consentReady:
        "You've reviewed the verdict and key indicators. You may now confirm understanding.",
      consentLocked: "Complete the verification check above to unlock this button.",
      consentRecorded: "Understanding recorded",
      consentButton: "I Understand The Verdict",
      sessionActivity: "Session Activity",
      auditInfo: "Audit info",
      auditId: "ID",
      auditRisk: "Score",
      auditAnalyzed: "Analyzed",
      analyzeAnother: "Analyze another claim",
      events: {
        uploaded: "Content uploaded",
        completed: "AI analysis complete",
        quizPassed: "Verification check passed",
        consented: "Understanding confirmed",
      },
      riskLevels: {
        low: "Likely Legit",
        medium: "Needs Review",
        high: "Likely Misleading",
        critical: "High Risk Misinformation",
      },
    },
  },

  hi: {
    nav: {
      howItWorks: "यह कैसे काम करता है",
      features: "विशेषताएं",
      channels: "चैनल",
    },
    hero: {
      badge: "वित्तीय दस्तावेज़ सुरक्षा",
      headline1: "सहमति से पहले",
      headline2: "समझें",
      headline3: "ज़रूर",
      subtitle:
        "कोई भी वित्तीय दस्तावेज़ अपलोड करें — ऋण, अनुबंध, नियम और शर्तें — और हस्ताक्षर करने से पहले सरल भाषा में जोखिम मूल्यांकन प्राप्त करें।",
      trust: "आपके दस्तावेज़ सुरक्षित रूप से विश्लेषित होते हैं और कभी संग्रहीत नहीं किए जाते।",
    },
    upload: {
      drag: "अपना दस्तावेज़ यहाँ छोड़ें",
      dragActive: "फ़ाइल यहाँ छोड़ें",
      browse: "फ़ाइलें ब्राउज़ करें",
      hint: "PDF या TXT, 10MB तक",
      analyze: "दस्तावेज़ विश्लेषण करें",
      analyzing: "विश्लेषण हो रहा है...",
      errorType: "केवल PDF और TXT फ़ाइलें समर्थित हैं।",
      errorSize: "फ़ाइल 10MB से कम होनी चाहिए।",
    },
    howItWorks: {
      label: "कैसे काम करता है",
      headline: "सूचित सहमति के तीन चरण",
      steps: [
        {
          num: "01",
          title: "अपना दस्तावेज़ अपलोड करें",
          desc: "PDF या टेक्स्ट फ़ाइल डालें — ऋण समझौते, बीमा शर्तें, सहमति फ़ॉर्म, या कोई भी वित्तीय दस्तावेज़।",
        },
        {
          num: "02",
          title: "AI बारीक प्रिंट पढ़ता है",
          desc: "हमारा AI हर खंड पढ़ता है, छिपे जोखिमों को चिह्नित करता है, और दस्तावेज़ को सरल भाषा में फिर से लिखता है।",
        },
        {
          num: "03",
          title: "जोखिम स्कोर जानें",
          desc: "स्पष्ट जोखिम मूल्यांकन, आप जिससे सहमत हो रहे हैं उसकी सूची, और एक छोटी प्रश्नोत्तरी प्राप्त करें।",
        },
      ],
    },
    features: {
      label: "विशेषताएं",
      headline: "सुरक्षित सहमति के लिए सब कुछ",
      items: [
        {
          title: "जोखिम मीटर",
          desc: "एक दृश्य 0–100 जोखिम गेज जो तुरंत दिखाता है कि दस्तावेज़ कितना जोखिम भरा है।",
        },
        {
          title: "सरल भाषा सारांश",
          desc: "जटिल भाषा को आसान शब्दों में समझाया जाता है ताकि हर कोई जल्दी समझ सके।",
        },
        {
          title: "चिह्नित खंड",
          desc: "छिपे ऑटो-नवीनीकरण, डेटा साझाकरण शर्तें, और मध्यस्थता खंड स्पष्ट स्पष्टीकरण के साथ।",
        },
        {
          title: "समझ परीक्षण",
          desc: "तीन त्वरित प्रश्न यह सुनिश्चित करने के लिए कि आप सहमति देने से पहले वास्तव में समझते हैं।",
        },
        {
          title: "बहुभाषी",
          desc: "अपनी पसंदीदा भाषा में विश्लेषण प्राप्त करें — हिंदी, मराठी, अंग्रेजी और अधिक।",
        },
        {
          title: "मुख्य दायित्व",
          desc: "आप जो वचन दे रहे हैं उसकी स्पष्ट बुलेट-पॉइंट सूची — अब अनुमान नहीं।",
        },
      ],
    },
    channels: {
      label: "हर जगह उपलब्ध",
      headline: "उपयोगकर्ताओं से जहाँ वे हैं मिलें",
      subtitle:
        "एक ही AI विश्लेषण इंजन, तीन अलग-अलग तरीके — जो भी आपके लिए सबसे आरामदायक हो।",
      items: [
        {
          title: "वेब ऐप",
          desc: "इंटरैक्टिव परिणामों के साथ पूर्ण जोखिम मूल्यांकन के लिए अपने ब्राउज़र में सीधे दस्तावेज़ अपलोड करें।",
          tag: "आप यहाँ हैं",
        },
        {
          title: "ब्राउज़र एक्सटेंशन",
          desc: "किसी भी वेबसाइट पर नियम और शर्तों का वास्तविक समय में विश्लेषण करें।",
          tag: "Chrome",
        },
        {
          title: "चैट बॉट",
          desc: "Telegram या WhatsApp के माध्यम से PDF भेजें और बातचीत में ही जोखिम विश्लेषण प्राप्त करें।",
          tag: "Telegram & WhatsApp",
        },
      ],
    },
    cta: {
      headline: "अंधे होकर हस्ताक्षर मत करें",
      subtitle:
        "अभी अपना दस्तावेज़ अपलोड करें और हर खंड, हर जोखिम, हर दायित्व को सरल भाषा में समझें।",
      button: "शुरू करें",
    },
    footer: {
      tagline: "बारीक प्रिंट पढ़ें। अपने अधिकार सुरक्षित रखें।",
      built: "MIT Hack for Impact 2026 के लिए बनाया गया",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "Telegram",
      },
    },
    analyze: {
      title: "विश्लेषण पूरा हुआ",
      analyzedAt: "विश्लेषित",
      language: "भाषा",
      riskAssessment: "जोखिम मूल्यांकन",
      quickSummary: "त्वरित सार",
      flaggedClauses: "चिह्नित खंड",
      keyObligations: "मुख्य दायित्व",
      plainSummary: "सरल भाषा सारांश",
      agreementList: "आप किस बात से सहमत हो रहे हैं",
      clausesTitle: "चिह्नित खंड",
      originalClause: "मूल खंड",
      noClauses: "इस दस्तावेज़ में कोई चिह्नित खंड नहीं मिला।",
      quizTitle: "समझ परीक्षण",
      quizPrompt: "सहमति अनलॉक करने के लिए 3 में से कम से कम 2 प्रश्न सही उत्तर दें।",
      noQuiz: "कोई प्रश्नोत्तरी प्रश्न नहीं बने।",
      submitAnswers: "उत्तर जमा करें",
      tryAgain: "फिर से प्रयास करें",
      quizPass: "सही — आप सहमति देने के लिए तैयार हैं।",
      quizFail: "सही — कृपया दस्तावेज़ फिर से देखें और दोबारा प्रयास करें।",
      consentTitle: "सहमति दें",
      consentReady:
        "आपने इस दस्तावेज़ की समझ प्रदर्शित की है। अब आप सहमति की पुष्टि कर सकते हैं।",
      consentLocked: "इस बटन को अनलॉक करने के लिए ऊपर दिया गया समझ परीक्षण पूरा करें।",
      consentRecorded: "सहमति दर्ज की गई",
      consentButton: "मैं समझता/समझती हूँ और सहमति देता/देती हूँ",
      sessionActivity: "सत्र गतिविधि",
      auditInfo: "ऑडिट जानकारी",
      auditId: "आईडी",
      auditRisk: "जोखिम",
      auditAnalyzed: "विश्लेषित",
      analyzeAnother: "किसी अन्य दस्तावेज़ का विश्लेषण करें",
      events: {
        uploaded: "दस्तावेज़ अपलोड किया गया",
        completed: "AI विश्लेषण पूरा हुआ",
        quizPassed: "प्रश्नोत्तरी पास हुई",
        consented: "सहमति की पुष्टि हुई",
      },
      riskLevels: {
        low: "कम जोखिम",
        medium: "मध्यम जोखिम",
        high: "उच्च जोखिम",
        critical: "गंभीर जोखिम",
      },
    },
  },

  mr: {
    nav: {
      howItWorks: "हे कसे काम करते",
      features: "वैशिष्ट्ये",
      channels: "चॅनेल",
    },
    hero: {
      badge: "आर्थिक दस्तऐवज संरक्षण",
      headline1: "संमती देण्यापूर्वी",
      headline2: "समजून",
      headline3: "घ्या",
      subtitle:
        "कोणताही आर्थिक दस्तऐवज अपलोड करा — कर्ज, करार, अटी व शर्ती — आणि स्वाक्षरी करण्यापूर्वी सोप्या भाषेत धोका मूल्यांकन मिळवा।",
      trust: "तुमचे दस्तऐवज सुरक्षितपणे विश्लेषित केले जातात आणि कधीही संग्रहित केले जात नाहीत।",
    },
    upload: {
      drag: "तुमचा दस्तऐवज इथे टाका",
      dragActive: "फाइल इथे सोडा",
      browse: "फाइल्स ब्राउझ करा",
      hint: "PDF किंवा TXT, 10MB पर्यंत",
      analyze: "दस्तऐवज विश्लेषण करा",
      analyzing: "विश्लेषण होत आहे...",
      errorType: "फक्त PDF आणि TXT फाइल्स समर्थित आहेत।",
      errorSize: "फाइल 10MB पेक्षा कमी असणे आवश्यक आहे।",
    },
    howItWorks: {
      label: "हे कसे काम करते",
      headline: "माहितीपूर्ण संमतीचे तीन टप्पे",
      steps: [
        {
          num: "01",
          title: "तुमचा दस्तऐवज अपलोड करा",
          desc: "PDF किंवा टेक्स्ट फाइल टाका — कर्ज करार, विमा अटी, संमती फॉर्म, किंवा कोणताही आर्थिक दस्तऐवज।",
        },
        {
          num: "02",
          title: "AI बारीक मजकूर वाचतो",
          desc: "आमचा AI प्रत्येक कलम वाचतो, छुपे धोके चिन्हांकित करतो, आणि दस्तऐवज सोप्या भाषेत पुन्हा लिहितो।",
        },
        {
          num: "03",
          title: "धोका स्कोअर जाणून घ्या",
          desc: "स्पष्ट धोका मूल्यांकन, तुम्ही खरोखर काय मान्य करत आहात याची यादी, आणि एक छोटी चाचणी मिळवा।",
        },
      ],
    },
    features: {
      label: "वैशिष्ट्ये",
      headline: "सुरक्षित संमतीसाठी सर्व काही",
      items: [
        {
          title: "धोका मीटर",
          desc: "एक दृश्य 0–100 धोका गेज जो लगेच दाखवतो की दस्तऐवज किती धोकादायक आहे।",
        },
        {
          title: "सोप्या भाषेचा सारांश",
          desc: "गुंतागुंतीचा मजकूर सोप्या शब्दांत समजावून दिला जातो, त्यामुळे पटकन अर्थ कळतो।",
        },
        {
          title: "चिन्हांकित कलम",
          desc: "छुपे ऑटो-नूतनीकरण, डेटा शेअरिंग अटी, आणि लवाद कलम स्पष्ट स्पष्टीकरणासह.",
        },
        {
          title: "आकलन चाचणी",
          desc: "तीन जलद प्रश्न हे सुनिश्चित करण्यासाठी की संमती देण्यापूर्वी तुम्हाला खरोखर समजले आहे।",
        },
        {
          title: "बहुभाषिक",
          desc: "तुमच्या पसंतीच्या भाषेत विश्लेषण मिळवा — मराठी, हिंदी, इंग्रजी आणि अधिक।",
        },
        {
          title: "मुख्य जबाबदाऱ्या",
          desc: "तुम्ही नक्की काय वचन देत आहात याची स्पष्ट यादी — आता अंदाज नाही.",
        },
      ],
    },
    channels: {
      label: "सर्वत्र उपलब्ध",
      headline: "वापरकर्त्यांना जिथे आहेत तिथे भेटा",
      subtitle:
        "तोच AI विश्लेषण इंजिन, तीन वेगळ्या प्रकारे — तुम्हाला जे सर्वात सोयीचे असेल ते.",
      items: [
        {
          title: "वेब ॲप",
          desc: "संवादात्मक निकालांसह पूर्ण धोका मूल्यांकनासाठी थेट तुमच्या ब्राउझरमध्ये दस्तऐवज अपलोड करा।",
          tag: "तुम्ही इथे आहात",
        },
        {
          title: "ब्राउझर एक्स्टेंशन",
          desc: "कोणत्याही वेबसाइटवर अटी व शर्तींचे रिअल टाइममध्ये विश्लेषण करा.",
          tag: "Chrome",
        },
        {
          title: "चॅट बॉट",
          desc: "Telegram किंवा WhatsApp द्वारे PDF पाठवा आणि संभाषणातच धोका विश्लेषण मिळवा.",
          tag: "Telegram & WhatsApp",
        },
      ],
    },
    cta: {
      headline: "आंधळेपणाने स्वाक्षरी करू नका",
      subtitle:
        "आत्ता तुमचा दस्तऐवज अपलोड करा आणि प्रत्येक कलम, प्रत्येक धोका, प्रत्येक जबाबदारी सोप्या भाषेत समजून घ्या.",
      button: "सुरू करा",
    },
    footer: {
      tagline: "बारीक मजकूर वाचा. तुमचे हक्क सुरक्षित ठेवा.",
      built: "MIT Hack for Impact 2026 साठी बनवले",
      links: {
        github: "GitHub",
        twitter: "Twitter",
        telegram: "Telegram",
      },
    },
    analyze: {
      title: "विश्लेषण पूर्ण झाले",
      analyzedAt: "विश्लेषित",
      language: "भाषा",
      riskAssessment: "धोका मूल्यांकन",
      quickSummary: "जलद सारांश",
      flaggedClauses: "चिन्हांकित कलम",
      keyObligations: "मुख्य जबाबदाऱ्या",
      plainSummary: "सोप्या भाषेतील सारांश",
      agreementList: "तुम्ही कशाला मान्यता देत आहात",
      clausesTitle: "चिन्हांकित कलम",
      originalClause: "मूळ कलम",
      noClauses: "या दस्तऐवजात कोणतेही चिन्हांकित कलम आढळले नाही.",
      quizTitle: "आकलन चाचणी",
      quizPrompt: "संमती अनलॉक करण्यासाठी 3 पैकी किमान 2 प्रश्न बरोबर उत्तर द्या.",
      noQuiz: "कोणतेही क्विझ प्रश्न तयार झाले नाहीत.",
      submitAnswers: "उत्तरे सादर करा",
      tryAgain: "पुन्हा प्रयत्न करा",
      quizPass: "बरोबर — तुम्ही संमती देण्यासाठी तयार आहात.",
      quizFail: "बरोबर — कृपया दस्तऐवज पुन्हा वाचा आणि पुन्हा प्रयत्न करा.",
      consentTitle: "संमती द्या",
      consentReady:
        "तुम्ही या दस्तऐवजाची समज दाखवली आहे. आता तुम्ही संमतीची पुष्टी करू शकता.",
      consentLocked: "हे बटण अनलॉक करण्यासाठी वरील आकलन चाचणी पूर्ण करा.",
      consentRecorded: "संमती नोंदवली",
      consentButton: "मी समजतो/समजते आणि संमती देतो/देते",
      sessionActivity: "सत्र क्रियाकलाप",
      auditInfo: "ऑडिट माहिती",
      auditId: "आयडी",
      auditRisk: "धोका",
      auditAnalyzed: "विश्लेषित",
      analyzeAnother: "दुसऱ्या दस्तऐवजाचे विश्लेषण करा",
      events: {
        uploaded: "दस्तऐवज अपलोड झाला",
        completed: "AI विश्लेषण पूर्ण झाले",
        quizPassed: "क्विझ पास झाली",
        consented: "संमतीची पुष्टी झाली",
      },
      riskLevels: {
        low: "कमी धोका",
        medium: "मध्यम धोका",
        high: "उच्च धोका",
        critical: "गंभीर धोका",
      },
    },
  },
};

export type Translations = (typeof translations)["en"];
