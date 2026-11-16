import type { TemplateDef } from "../types";
import type { TemplateCopy } from "../templateCopy";
import { LANGUAGES, type Language, type LocalizedId } from "../variants";
import { haldiMarigold } from "./haldi-marigold";
import { localize, type Kit, type Look, type Version } from "./localize";
import { mehendiPaisley } from "./mehendi-paisley";
import { receptionGala } from "./reception-gala";
import { sagaiRings } from "./sagai-rings";
import { sangeetNight } from "./sangeet-night";

/* The words of every language version (lib/variants.ts): five designs that suit every state, in the eight state
   languages, each named for that state's own ritual where it has one: Gaye Holud and Bou Bhat (Bengal), Maiyan, Mehndi
   with boliyan and Jaago (Punjab), Halad, Sakharpuda and Swagat Samarambh (Maharashtra), Nalangu, Nichayathartham and
   Varaverppu (Tamil Nadu), Pasupu, Gorintaku, Nischitartham and Vindu (Telugu), Arishina Shastra, Madarangi,
   Nishchitartha and Aratakshate (Karnataka), Mylanchi, Vivaha Nischayam and Salkkaram (Kerala).

   Each language is one block below, so a native speaker can review one at a time. NOT YET REVIEWED by native speakers
   (like the native weddings): every line is an editable field, but fix wording here when someone corrects it.
   Sample couples and places are made up; no phone numbers (a mobile in any field becomes a WhatsApp button). */

const BASES: Record<LocalizedId, { def: TemplateDef; look: Look }> = {
  "haldi-marigold": { def: haldiMarigold, look: { noun: "Marigold", ritual: "Haldi", event: "Haldi", what: "a Haldi invitation in turmeric yellow with swaying marigold garlands", words: "The opening line, the title and the closing line" } },
  "mehendi-paisley": { def: mehendiPaisley, look: { noun: "Paisley", ritual: "Mehendi", event: "Mehendi", what: "a Mehendi invitation with henna paisleys that draw themselves and a scalloped henna frame", words: "The opening line, the title and the closing line" } },
  "sangeet-night": { def: sangeetNight, look: { noun: "Night", ritual: "Sangeet", event: "Sangeet", what: "a party night invitation with sweeping spotlights, neon titles, an equaliser and confetti", words: "The title and the closing line" } },
  "reception-gala": { def: receptionGala, look: { noun: "Gala", ritual: "Reception", event: "Reception", what: "an evening reception invitation with fairy lights, gold art-deco fans and a programme of the night", words: "The opening line and the title" } },
  "sagai-rings": { def: sagaiRings, look: { noun: "Rings", ritual: "Sagai", event: "Engagement", what: "an engagement invitation where two rings spin in and lock together in rose gold", words: "The opening line, the title and the closing line" } },
};

/** Who appears in each design's preview, by its own field names. */
function sampleFor(base: LocalizedId, k: Kit): Record<string, string> {
  const [homeName, homeAddress] = k.home;
  const [hallName, hallAddress] = k.hall;
  switch (base) {
    case "haldi-marigold":
    case "mehendi-paisley":
      return { brideName: k.bride, groomName: k.groom, venueName: homeName, venueAddress: homeAddress };
    case "sangeet-night":
      return { brideName: k.bride, groomName: k.groom, venueName: hallName, venueAddress: hallAddress };
    case "reception-gala":
      return { nameA: k.groom, nameB: k.bride, venueName: hallName, venueAddress: hallAddress };
    case "sagai-rings":
      return { nameA: k.bride, nameB: k.groom, venueName: hallName, venueAddress: hallAddress };
  }
}

type Language5 = { kit: Kit } & Record<LocalizedId, Version>;

const WORDS: Record<Language, Language5> = {
  hindi: {
    kit: { language: "hindi", label: "Hindi", code: "hi", font: "var(--f-devanagari)", communities: ["hindu"], bride: "Ananya", groom: "Aarav", home: ["Gokul Niwas", "Gomti Nagar\nLucknow"], hall: ["Shubh Vatika", "Kanpur Road\nLucknow"] },
    "haldi-marigold": { ritual: "Haldi", thumb: "हल्दी", words: { kicker: "आप सादर आमंत्रित हैं", title: "हल्दी", localTitle: "Haldi Ceremony", closingLine: "हल्दी, हँसी और ढेर सारा प्यार" } },
    "mehendi-paisley": { ritual: "Mehendi", thumb: "मेहंदी", words: { kicker: "आप सादर आमंत्रित हैं", title: "मेहंदी", localTitle: "Mehendi Ceremony", closingLine: "मेहंदी, गीत और ढेर सारी खुशियाँ" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "संगीत", words: { hook: "चलो नाचें!", title: "संगीत संध्या", localTitle: "Sangeet Night", closingLine: "नाचने के लिए तैयार रहिए!" } },
    "reception-gala": { ritual: "Pritibhoj", thumb: "प्रीतिभोज", words: { kicker: "आप सादर आमंत्रित हैं", title: "प्रीतिभोज" } },
    "sagai-rings": { ritual: "Sagai", thumb: "सगाई", words: { kicker: "दो दिल, एक वादा", title: "सगाई", localTitle: "Engagement Ceremony", closingLine: "अंगूठी की रस्म में ज़रूर पधारें" } },
  },
  punjabi: {
    kit: { language: "punjabi", label: "Punjabi", code: "pa", font: "var(--f-gurmukhi)", communities: ["sikh", "hindu"], bride: "Simran", groom: "Harpreet", home: ["Preet Villa", "Model Town\nLudhiana"], hall: ["Royal Palms Banquet", "Ferozepur Road\nLudhiana"] },
    "haldi-marigold": { ritual: "Maiyan", thumb: "ਮਾਈਆਂ", words: { kicker: "ਆਪ ਜੀ ਨੂੰ ਨਿੱਘਾ ਸੱਦਾ", title: "ਮਾਈਆਂ", localTitle: "Maiyan · Vatna", closingLine: "ਵਟਣਾ, ਹਾਸੇ ਤੇ ਢੇਰ ਸਾਰਾ ਪਿਆਰ" } },
    "mehendi-paisley": { ritual: "Mehndi", thumb: "ਮਹਿੰਦੀ", words: { kicker: "ਆਪ ਜੀ ਨੂੰ ਨਿੱਘਾ ਸੱਦਾ", title: "ਮਹਿੰਦੀ", localTitle: "Mehndi Night", closingLine: "ਮਹਿੰਦੀ, ਬੋਲੀਆਂ ਤੇ ਖੁਸ਼ੀਆਂ" } },
    // The Jaago: the night procession with the lit, decorated pot, boliyan and giddha.
    "sangeet-night": { ritual: "Jaago", thumb: "ਜਾਗੋ", words: { hook: "ਬੱਲੇ ਬੱਲੇ!", title: "ਜਾਗੋ", localTitle: "Jaago Night", closingLine: "ਨੱਚਣ ਲਈ ਤਿਆਰ ਰਹਿਣਾ!", highlights: "Jaago procession\nBoliyan & giddha\nLive dhol\nDinner & drinks" } },
    "reception-gala": { ritual: "Reception", thumb: "ਰਿਸੈਪਸ਼ਨ", words: { kicker: "ਆਪ ਜੀ ਨੂੰ ਨਿੱਘਾ ਸੱਦਾ", title: "ਰਿਸੈਪਸ਼ਨ" } },
    "sagai-rings": { ritual: "Mangni", thumb: "ਮੰਗਣੀ", words: { kicker: "ਦੋ ਦਿਲ, ਇੱਕ ਵਾਅਦਾ", title: "ਮੰਗਣੀ", localTitle: "Engagement Ceremony", closingLine: "ਮੁੰਦਰੀ ਦੀ ਰਸਮ ਵਿੱਚ ਜ਼ਰੂਰ ਪਹੁੰਚਣਾ" } },
  },
  marathi: {
    kit: { language: "marathi", label: "Marathi", code: "mr", font: "var(--f-devanagari)", communities: ["hindu"], bride: "Sayali", groom: "Aditya", home: ["Gokul Bungalow", "Kothrud\nPune"], hall: ["Shubhamangal Karyalay", "Sadashiv Peth\nPune"] },
    "haldi-marigold": { ritual: "Halad", thumb: "हळद", words: { kicker: "आपणास सस्नेह निमंत्रण", title: "हळदी", localTitle: "Haldi Ceremony", closingLine: "हळद, हसू आणि खूप सारं प्रेम" } },
    "mehendi-paisley": { ritual: "Mehendi", thumb: "मेहंदी", words: { kicker: "आपणास सस्नेह निमंत्रण", title: "मेहंदी", localTitle: "Mehendi Ceremony", closingLine: "मेहंदी, गाणी आणि आनंद" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "संगीत", words: { hook: "चला नाचूया!", title: "संगीत संध्या", localTitle: "Sangeet Night", closingLine: "नाचायला तयार राहा!" } },
    "reception-gala": { ritual: "Swagat", thumb: "स्वागत", words: { kicker: "आपणास सस्नेह निमंत्रण", title: "स्वागत समारंभ" } },
    "sagai-rings": { ritual: "Sakharpuda", thumb: "साखरपुडा", words: { kicker: "दोन मनं, एक वचन", title: "साखरपुडा", localTitle: "Engagement Ceremony", closingLine: "साखरपुड्यास अवश्य उपस्थित राहावे" } },
  },
  bengali: {
    kit: { language: "bengali", label: "Bengali", code: "bn", font: "var(--f-bengali)", communities: ["hindu"], bride: "Ishita", groom: "Arnab", home: ["Shanti Kunj", "Salt Lake\nKolkata"], hall: ["Utsav Banquet", "Ballygunge\nKolkata"] },
    "haldi-marigold": { ritual: "Gaye Holud", thumb: "গায়ে হলুদ", words: { kicker: "সাদর আমন্ত্রণ", title: "গায়ে হলুদ", localTitle: "Haldi Ceremony", closingLine: "হলুদ, হাসি আর অনেক ভালোবাসা" } },
    "mehendi-paisley": { ritual: "Mehendi", thumb: "মেহেন্দি", words: { kicker: "সাদর আমন্ত্রণ", title: "মেহেন্দি", localTitle: "Mehendi Ceremony", closingLine: "মেহেন্দি, গান আর আনন্দ" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "সঙ্গীত", words: { hook: "চলো নাচি!", title: "সঙ্গীত সন্ধ্যা", localTitle: "Sangeet Night", closingLine: "নাচের জন্য তৈরি থাকুন!" } },
    "reception-gala": { ritual: "Bou Bhat", thumb: "বৌভাত", words: { kicker: "সাদর আমন্ত্রণ", title: "বৌভাত" } },
    "sagai-rings": { ritual: "Ashirbad", thumb: "আশীর্বাদ", words: { kicker: "দুটি মন, একটি অঙ্গীকার", title: "আশীর্বাদ", localTitle: "Engagement Ceremony", closingLine: "আংটি বদলের অনুষ্ঠানে অবশ্যই আসবেন" } },
  },
  tamil: {
    kit: { language: "tamil", label: "Tamil", code: "ta", font: "var(--f-tamil)", communities: ["south-indian", "hindu"], bride: "Lakshmi", groom: "Karthik", home: ["Lakshmi Illam", "Mylapore\nChennai"], hall: ["Sri Murugan Kalyana Mandapam", "T. Nagar\nChennai"] },
    "haldi-marigold": { ritual: "Nalangu", thumb: "நலங்கு", words: { kicker: "அன்புடன் அழைக்கிறோம்", title: "நலங்கு", localTitle: "Nalangu & Haldi", closingLine: "மஞ்சள், சிரிப்பு, நிறைய அன்பு" } },
    "mehendi-paisley": { ritual: "Mehendi", thumb: "மெஹந்தி", words: { kicker: "அன்புடன் அழைக்கிறோம்", title: "மெஹந்தி", localTitle: "Mehendi Ceremony", closingLine: "மருதாணி, பாட்டு, மகிழ்ச்சி" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "சங்கீத்", words: { title: "சங்கீத்", localTitle: "Sangeet Night", closingLine: "ஆடிப் பாடிக் கொண்டாடுவோம்!" } },
    "reception-gala": { ritual: "Varaverppu", thumb: "வரவேற்பு", words: { kicker: "அன்புடன் அழைக்கிறோம்", title: "திருமண வரவேற்பு" } },
    "sagai-rings": { ritual: "Nichayathartham", thumb: "நிச்சயதார்த்தம்", words: { kicker: "இரு மனங்கள், ஒரு வாக்குறுதி", title: "நிச்சயதார்த்தம்", localTitle: "Engagement Ceremony", closingLine: "மோதிரம் மாற்றும் விழாவிற்கு அன்புடன் வருக" } },
  },
  telugu: {
    kit: { language: "telugu", label: "Telugu", code: "te", font: "var(--f-telugu)", communities: ["south-indian", "hindu"], bride: "Sravya", groom: "Arjun", home: ["Sai Nilayam", "Jubilee Hills\nHyderabad"], hall: ["Sri Sai Function Hall", "Kukatpally\nHyderabad"] },
    "haldi-marigold": { ritual: "Pasupu", thumb: "పసుపు", words: { kicker: "సాదర ఆహ్వానం", title: "పసుపు వేడుక", localTitle: "Haldi Ceremony", closingLine: "పసుపు, నవ్వులు, బోలెడంత ప్రేమ" } },
    "mehendi-paisley": { ritual: "Gorintaku", thumb: "గోరింటాకు", words: { kicker: "సాదర ఆహ్వానం", title: "గోరింటాకు", localTitle: "Mehendi Ceremony", closingLine: "చేతుల నిండా గోరింట, మనసు నిండా సంతోషం" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "సంగీత్", words: { title: "సంగీత్", localTitle: "Sangeet Night", closingLine: "ఆడి పాడి సందడి చేద్దాం!" } },
    "reception-gala": { ritual: "Vindu", thumb: "విందు", words: { kicker: "సాదర ఆహ్వానం", title: "వివాహ విందు" } },
    "sagai-rings": { ritual: "Nischitartham", thumb: "నిశ్చితార్థం", words: { kicker: "రెండు మనసులు, ఒకే మాట", title: "నిశ్చితార్థం", localTitle: "Engagement Ceremony", closingLine: "ఉంగరాల మార్పిడి వేడుకకు తప్పక రండి" } },
  },
  kannada: {
    kit: { language: "kannada", label: "Kannada", code: "kn", font: "var(--f-kannada)", communities: ["south-indian", "hindu"], bride: "Pooja", groom: "Abhishek", home: ["Gokula Nilaya", "Jayanagar\nBengaluru"], hall: ["Sri Krishna Kalyana Mantapa", "Basavanagudi\nBengaluru"] },
    "haldi-marigold": { ritual: "Arishina Shastra", thumb: "ಅರಿಶಿನ", words: { kicker: "ಆತ್ಮೀಯ ಆಹ್ವಾನ", title: "ಅರಿಶಿನ ಶಾಸ್ತ್ರ", localTitle: "Haldi Ceremony", closingLine: "ಅರಿಶಿನ, ನಗು ಮತ್ತು ತುಂಬಾ ಪ್ರೀತಿ" } },
    "mehendi-paisley": { ritual: "Madarangi", thumb: "ಮದರಂಗಿ", words: { kicker: "ಆತ್ಮೀಯ ಆಹ್ವಾನ", title: "ಮದರಂಗಿ", localTitle: "Mehendi Ceremony", closingLine: "ಕೈ ತುಂಬ ಮದರಂಗಿ, ಮನ ತುಂಬ ಸಂಭ್ರಮ" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "ಸಂಗೀತ್", words: { title: "ಸಂಗೀತ್", localTitle: "Sangeet Night", closingLine: "ಹಾಡಿ ಕುಣಿದು ಸಂಭ್ರಮಿಸೋಣ!" } },
    "reception-gala": { ritual: "Aratakshate", thumb: "ಆರತಕ್ಷತೆ", words: { kicker: "ಆತ್ಮೀಯ ಆಹ್ವಾನ", title: "ಆರತಕ್ಷತೆ" } },
    "sagai-rings": { ritual: "Nishchitartha", thumb: "ನಿಶ್ಚಿತಾರ್ಥ", words: { kicker: "ಎರಡು ಮನಸ್ಸು, ಒಂದು ಮಾತು", title: "ನಿಶ್ಚಿತಾರ್ಥ", localTitle: "Engagement Ceremony", closingLine: "ಉಂಗುರ ಬದಲಾಯಿಸುವ ಶುಭ ಸಮಾರಂಭಕ್ಕೆ ಬನ್ನಿ" } },
  },
  malayalam: {
    kit: { language: "malayalam", label: "Malayalam", code: "ml", font: "var(--f-malayalam)", communities: ["south-indian", "hindu"], bride: "Anjali", groom: "Arjun", home: ["Sreepadam", "Kowdiar\nThiruvananthapuram"], hall: ["Sree Krishna Auditorium", "Guruvayur\nThrissur"] },
    "haldi-marigold": { ritual: "Haldi", thumb: "ഹൽദി", words: { kicker: "സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു", title: "ഹൽദി", localTitle: "Haldi Ceremony", closingLine: "മഞ്ഞളും ചിരിയും ഒരുപാട് സ്നേഹവും" } },
    "mehendi-paisley": { ritual: "Mylanchi", thumb: "മൈലാഞ്ചി", words: { kicker: "സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു", title: "മൈലാഞ്ചി", localTitle: "Mehendi Night", closingLine: "കൈ നിറയെ മൈലാഞ്ചി, മനം നിറയെ സന്തോഷം" } },
    "sangeet-night": { ritual: "Sangeet", thumb: "സംഗീത്", words: { title: "സംഗീത്", localTitle: "Sangeet Night", closingLine: "ആടിപ്പാടി ആഘോഷിക്കാം!" } },
    "reception-gala": { ritual: "Salkkaram", thumb: "സൽക്കാരം", words: { kicker: "സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു", title: "വിവാഹ സൽക്കാരം" } },
    "sagai-rings": { ritual: "Vivaha Nischayam", thumb: "നിശ്ചയം", words: { kicker: "രണ്ടു മനസ്സുകൾ, ഒരു വാക്ക്", title: "വിവാഹ നിശ്ചയം", localTitle: "Engagement Ceremony", closingLine: "മോതിരം മാറൽ ചടങ്ങിലേക്ക് സ്വാഗതം" } },
  },
};

const built = LANGUAGES.flatMap((lang) =>
  (Object.keys(BASES) as LocalizedId[]).map((id) => localize(BASES[id].def, BASES[id].look, WORDS[lang].kit, WORDS[lang][id], sampleFor(id, WORDS[lang].kit))),
);

/** Every language version, registered after the designs in lib/templates/index.ts. */
export const LANGUAGE_VERSIONS: TemplateDef[] = built.map((b) => b.def);
/** Their page copy for /templates/<id> (the designs' own is in lib/templateCopy.ts). */
export const VERSION_COPY: Record<string, TemplateCopy> = Object.fromEntries(built.map((b) => [b.def.id, b.copy]));
