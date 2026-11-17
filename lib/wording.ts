/* Wording guides (/wording/<language>): sample invitation lines people search for ("wedding invitation wording in
   Tamil"), each with its meaning in English and a link to a design in that language.

   NOT YET REVIEWED by native speakers (owner's go-ahead to publish, 2026-11-17), like the language designs: when
   someone corrects a line, fix it here. Sample names are made up. Never put a phone number in a sample. */

export type WordingLine = { label: string; text: string; meaning: string };
export type WordingGuide = {
  id: string; // in the address
  language: string; // "Tamil"
  native: string; // the language's name in its own script
  lang: string; // html lang attribute
  regionId: string | null; // the state page (lib/regions.ts) for this language
  font: string | null; // CSS font variable for the script; null = the site's own font
  design: string; // a wedding design in this language, for "use this in a design"
  lines: WordingLine[];
};

export const WORDING: WordingGuide[] = [
  {
    id: "english",
    language: "English",
    native: "English",
    lang: "en",
    regionId: null,
    font: null,
    design: "royal-mandala",
    lines: [
      { label: "Wedding, formal", text: "With the blessings of our elders, we invite you and your family to the wedding of our son Aarav with Ananya.", meaning: "The classic opening, from the groom's family." },
      { label: "Wedding, from the couple", text: "Together with their families, Aarav and Ananya request the pleasure of your company at their wedding.", meaning: "When the couple invites in their own names." },
      { label: "Haldi", text: "Come dressed in yellow and bring your brightest smile: join us for Ananya's haldi.", meaning: "A light line for the haldi, with the dress code in it." },
      { label: "Reception", text: "Please join us for dinner and celebrations at the wedding reception of Aarav and Ananya.", meaning: "For the reception or dinner after the wedding." },
      { label: "Closing", text: "Your presence will make our celebration complete.", meaning: "A warm last line." },
    ],
  },
  {
    id: "hindi",
    language: "Hindi",
    native: "हिन्दी",
    lang: "hi",
    regionId: "north-india",
    font: "var(--f-devanagari)",
    design: "hindi-shubh-vivah",
    lines: [
      { label: "Wedding", text: "हमारे सुपुत्र चि. आरव के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं।", meaning: "You and your family are cordially invited on the auspicious occasion of the wedding of our son Aarav." },
      { label: "Your presence", text: "आपकी गरिमामयी उपस्थिति हमारा सौभाग्य होगी।", meaning: "Your gracious presence will be our good fortune." },
      { label: "Haldi", text: "हल्दी की रस्म में आप सादर आमंत्रित हैं।", meaning: "You are cordially invited to the haldi ceremony." },
      { label: "Reception", text: "विवाह उपरांत प्रीतिभोज में आपकी उपस्थिति प्रार्थनीय है।", meaning: "Your presence is requested at the reception dinner after the wedding." },
      { label: "Closing", text: "दर्शनाभिलाषी: समस्त शर्मा परिवार", meaning: "Looking forward to seeing you: the whole Sharma family." },
    ],
  },
  {
    id: "tamil",
    language: "Tamil",
    native: "தமிழ்",
    lang: "ta",
    regionId: "tamil-nadu",
    font: "var(--f-tamil)",
    design: "tamil-thirumanam",
    lines: [
      { label: "Wedding", text: "எங்கள் அன்பு மகன் செல்வன் கார்த்திக்கிற்கும் செல்வி லட்சுமிக்கும் நடைபெறும் திருமணத்திற்குத் தாங்கள் குடும்பத்துடன் வருகை தந்து மணமக்களை வாழ்த்த அன்புடன் அழைக்கிறோம்.", meaning: "We lovingly invite you and your family to the wedding of our dear son Karthik and Lakshmi, and to bless the couple." },
      { label: "Your presence", text: "தங்கள் வருகையை அன்புடன் எதிர்பார்க்கிறோம்.", meaning: "We lovingly await your arrival." },
      { label: "Nalangu", text: "நலங்கு விழாவிற்குத் தங்களை அன்புடன் அழைக்கிறோம்.", meaning: "We lovingly invite you to the Nalangu ceremony." },
      { label: "Reception", text: "திருமண வரவேற்பு நிகழ்ச்சியில் கலந்துகொண்டு சிறப்பிக்க வேண்டுகிறோம்.", meaning: "We request you to attend and grace the wedding reception." },
      { label: "Closing", text: "தங்கள் நல்வரவை நாடும் உற்றார் உறவினர்கள்", meaning: "Relatives and friends who look forward to your arrival." },
    ],
  },
  {
    id: "telugu",
    language: "Telugu",
    native: "తెలుగు",
    lang: "te",
    regionId: "andhra-telangana",
    font: "var(--f-telugu)",
    design: "telugu-pelli",
    lines: [
      { label: "Wedding", text: "మా కుమారుడు చి. అర్జున్ వివాహ మహోత్సవానికి మీరు సకుటుంబ సపరివార సమేతంగా విచ్చేసి వధూవరులను ఆశీర్వదించవలసిందిగా ప్రార్థన.", meaning: "We request you to come with your whole family to the wedding of our son Arjun and bless the couple." },
      { label: "Your presence", text: "మీ రాక మాకు ఎంతో ఆనందదాయకం.", meaning: "Your coming will give us great joy." },
      { label: "Pasupu", text: "పసుపు వేడుకకు మిమ్మల్ని సాదరంగా ఆహ్వానిస్తున్నాము.", meaning: "We cordially invite you to the Pasupu (haldi) ceremony." },
      { label: "Reception", text: "వివాహ విందుకు తప్పక విచ్చేయగలరు.", meaning: "Please do come to the wedding feast." },
      { label: "Closing", text: "ఇట్లు, మీ ఆత్మీయులు", meaning: "Yours, your dear ones." },
    ],
  },
  {
    id: "malayalam",
    language: "Malayalam",
    native: "മലയാളം",
    lang: "ml",
    regionId: "kerala",
    font: "var(--f-malayalam)",
    design: "kerala-vivaham",
    lines: [
      { label: "Wedding", text: "ഞങ്ങളുടെ മകൻ അർജുന്റെ വിവാഹത്തിന് താങ്കളെയും കുടുംബത്തെയും സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.", meaning: "We lovingly invite you and your family to the wedding of our son Arjun." },
      { label: "Your presence", text: "താങ്കളുടെ സാന്നിധ്യം സാദരം പ്രതീക്ഷിക്കുന്നു.", meaning: "We respectfully look forward to your presence." },
      { label: "Mylanchi", text: "മൈലാഞ്ചി ചടങ്ങിലേക്ക് സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.", meaning: "We lovingly invite you to the Mylanchi (mehendi) ceremony." },
      { label: "Reception", text: "വിവാഹ സൽക്കാരത്തിൽ പങ്കെടുക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.", meaning: "We request you to join the wedding reception." },
      { label: "Closing", text: "സ്നേഹാദരങ്ങളോടെ", meaning: "With love and respect." },
    ],
  },
  {
    id: "kannada",
    language: "Kannada",
    native: "ಕನ್ನಡ",
    lang: "kn",
    regionId: "karnataka",
    font: "var(--f-kannada)",
    design: "kannada-maduve",
    lines: [
      { label: "Wedding", text: "ನಮ್ಮ ಮಗ ಚಿ. ಅಭಿಷೇಕ್ ಅವರ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಾವು ಸಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ ವಧೂವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ವಿನಂತಿ.", meaning: "We request you to come with your family to the wedding of our son Abhishek and bless the couple." },
      { label: "Your presence", text: "ತಮ್ಮ ಆಗಮನವನ್ನು ಆದರದಿಂದ ಬಯಸುತ್ತೇವೆ.", meaning: "We warmly look forward to your arrival." },
      { label: "Arishina Shastra", text: "ಅರಿಶಿನ ಶಾಸ್ತ್ರಕ್ಕೆ ತಮಗೆ ಆತ್ಮೀಯ ಆಹ್ವಾನ.", meaning: "A warm invitation to the Arishina Shastra (haldi)." },
      { label: "Reception", text: "ಆರತಕ್ಷತೆ ಸಮಾರಂಭಕ್ಕೆ ತಪ್ಪದೆ ಬನ್ನಿ.", meaning: "Please do come to the reception." },
      { label: "Closing", text: "ತಮ್ಮ ಆತ್ಮೀಯರು", meaning: "Your dear ones." },
    ],
  },
  {
    id: "marathi",
    language: "Marathi",
    native: "मराठी",
    lang: "mr",
    regionId: "maharashtra",
    font: "var(--f-devanagari)",
    design: "shubh-mangal",
    lines: [
      { label: "Wedding", text: "आमचे सुपुत्र चि. आरव यांच्या शुभविवाहास आपण सहकुटुंब सहपरिवार उपस्थित राहून वधूवरांस शुभाशीर्वाद द्यावेत, ही नम्र विनंती.", meaning: "We humbly request you to attend the wedding of our son Aarav with your whole family and bless the couple." },
      { label: "Your presence", text: "आपली उपस्थिती प्रार्थनीय.", meaning: "Your presence is requested." },
      { label: "Halad", text: "हळदी समारंभास आपणास सस्नेह निमंत्रण.", meaning: "A warm invitation to the haldi ceremony." },
      { label: "Reception", text: "स्वागत समारंभास अवश्य यावे.", meaning: "Please do come to the reception." },
      { label: "Closing", text: "आग्रहाचे निमंत्रण", meaning: "A warm and pressing invitation." },
    ],
  },
  {
    id: "bengali",
    language: "Bengali",
    native: "বাংলা",
    lang: "bn",
    regionId: "bengal",
    font: "var(--f-bengali)",
    design: "shubho-bibaho",
    lines: [
      { label: "Wedding", text: "আমাদের পুত্র শ্রীমান অর্জুনের শুভ বিবাহ উপলক্ষে আপনি সপরিবারে উপস্থিত থেকে নবদম্পতিকে আশীর্বাদ করবেন, এই কামনা করি।", meaning: "We hope you will come with your family on the occasion of our son Arjun's wedding and bless the newly-weds." },
      { label: "Your presence", text: "আপনার উপস্থিতি একান্ত কাম্য।", meaning: "Your presence is earnestly desired." },
      { label: "Gaye Holud", text: "গায়ে হলুদের অনুষ্ঠানে আপনাকে সাদর আমন্ত্রণ।", meaning: "A cordial invitation to the Gaye Holud ceremony." },
      { label: "Bou Bhat", text: "বৌভাতের প্রীতিভোজে আপনার উপস্থিতি প্রার্থনীয়।", meaning: "Your presence is requested at the Bou Bhat feast." },
      { label: "Closing", text: "বিনীত", meaning: "Humbly yours." },
    ],
  },
  {
    id: "punjabi",
    language: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    lang: "pa",
    regionId: "punjab",
    font: "var(--f-gurmukhi)",
    design: "punjabi-viah",
    lines: [
      { label: "Wedding", text: "ਸਾਡੇ ਸਪੁੱਤਰ ਹਰਪ੍ਰੀਤ ਦੇ ਸ਼ੁਭ ਵਿਆਹ ਦੇ ਮੌਕੇ ਤੇ ਆਪ ਜੀ ਨੂੰ ਪਰਿਵਾਰ ਸਮੇਤ ਹਾਰਦਿਕ ਸੱਦਾ ਹੈ।", meaning: "A heartfelt invitation to you and your family on the occasion of our son Harpreet's wedding." },
      { label: "Your presence", text: "ਆਪ ਜੀ ਦੀ ਹਾਜ਼ਰੀ ਸਾਡੇ ਲਈ ਮਾਣ ਵਾਲੀ ਗੱਲ ਹੋਵੇਗੀ।", meaning: "Your presence will be an honour for us." },
      { label: "Maiyan", text: "ਮਾਈਆਂ ਦੀ ਰਸਮ ਤੇ ਆਪ ਜੀ ਨੂੰ ਨਿੱਘਾ ਸੱਦਾ।", meaning: "A warm invitation to the Maiyan (haldi) ritual." },
      { label: "Jaago", text: "ਜਾਗੋ ਦੀ ਰਾਤ ਨੱਚਣ ਲਈ ਤਿਆਰ ਰਹਿਣਾ!", meaning: "Be ready to dance on the Jaago night!" },
      { label: "Closing", text: "ਜੀ ਆਇਆਂ ਨੂੰ", meaning: "Welcome." },
    ],
  },
];

export const wordingById = (id: string) => WORDING.find((w) => w.id === id) ?? null;
export const wordingForRegion = (regionId: string) => WORDING.find((w) => w.regionId === regionId) ?? null;
