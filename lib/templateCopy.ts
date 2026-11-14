/* What each design is, in plain sentences, for its own page (/templates/<id>). Rendered on the server, so search
   engines and AI assistants can read what the page offers without running the animated preview: before this, the 17
   template pages shared almost all their text. Keep every claim true to the template's code (fields, scripts, scenes);
   a new template gets an entry here. `for`: who it suits; `has`: what is on the invite; `ask`: questions people type. */

export type TemplateCopy = { for: string; has: string; ask: string[] };

export const TEMPLATE_COPY: Record<string, TemplateCopy> = {
  "royal-mandala": {
    for: "A traditional Hindu wedding invitation in the style of a classic printed card: deep maroon or emerald, gold filigree corners and a mandala that draws itself behind the couple's names.",
    has: "A Devanagari blessing at the top, both families' names, the wedding date and time, the venue with its address, and a closing line. It plays as a short film and ends on a card with Add to calendar and Directions buttons for your guests.",
    ask: ["Hindu wedding invitation video with names", "traditional Indian wedding e-invite for WhatsApp", "shaadi card with mandala design online"],
  },
  "shaadi-utsav": {
    for: "Families who want every function in one invitation: Haldi, Mehendi, Sangeet, the wedding and the reception, each with its own date, time and venue.",
    has: "You add the functions as a list. Each one gets its own scene with an icon chosen from its name, and an overview scene shows the whole programme. Guests can add each function to their calendar separately and open directions to each venue.",
    ask: ["wedding invitation with all functions in one link", "multi event wedding invite haldi mehendi sangeet reception", "wedding itinerary invitation for WhatsApp"],
  },
  "south-kalyanam": {
    for: "A South Indian wedding invitation with a temple border, a brass lamp, bells, kolam and banana leaves, in Tamil, Telugu, Malayalam or Kannada.",
    has: "Choose the language of the header, add Chi. and Sow. before the names, and give the Muhurtham as a time window. The invite shows both families, the venue and a line of compliments at the end.",
    ask: ["Tamil wedding invitation video online", "Telugu wedding e-invite with muhurtham time", "South Indian kalyanam invitation for WhatsApp", "Malayalam and Kannada wedding invitation maker"],
  },
  "tamil-thirumanam": {
    for: "A Tamil wedding invitation written in Tamil: a mango-leaf thoranam across the top, a kolam that draws itself and brass lamps.",
    has: "The title, the honorifics before the names, the muhurtham heading, the venue heading and the invitation line are all in Tamil, and you can reword each one. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Tamil wedding invitation in Tamil language online", "திருமண அழைப்பிதழ் video for WhatsApp", "Tamil kalyanam e-invite with muhurtham"],
  },
  "telugu-pelli": {
    for: "A Telugu wedding invitation written in Telugu: marigold garlands along the top and a kalash on a sunburst.",
    has: "The title, the honorifics, the sumuhurtham heading, the venue heading and the invitation line are in Telugu, and each can be reworded. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Telugu wedding invitation in Telugu online", "పెళ్లి ఆహ్వానం video for WhatsApp", "Telugu pelli e-invite with sumuhurtham"],
  },
  "kerala-vivaham": {
    for: "A Kerala wedding invitation written in Malayalam, in kasavu ivory and gold, with a nilavilakku lamp between banana leaves.",
    has: "The title, the muhurtham heading, the venue heading and the invitation line are in Malayalam, and each can be reworded. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Kerala wedding invitation in Malayalam online", "വിവാഹ ക്ഷണക്കത്ത് video for WhatsApp", "Malayalam wedding e-invite with muhurtham"],
  },
  "kannada-maduve": {
    for: "A Kannada wedding invitation written in Kannada: temple borders, a pair of brass bells and a lit diya.",
    has: "The title, the honorifics, the muhurtha heading, the venue heading and the invitation line are in Kannada, and each can be reworded. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Kannada wedding invitation in Kannada online", "ಮದುವೆ ಆಮಂತ್ರಣ video for WhatsApp", "Kannada maduve e-invite with muhurtha"],
  },
  "hindi-shubh-vivah": {
    for: "A North Indian wedding invitation written in Hindi, in the style of a traditional card: a slowly turning mandala, gold corner filigree and a kalash.",
    has: "It opens with श्री गणेशाय नमः. The title, the honorifics before the names, the shubh muhurat heading, the venue heading and the invitation line are in Hindi, and each can be reworded. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Hindi wedding invitation video in Hindi", "शादी का निमंत्रण कार्ड online WhatsApp", "shubh vivah e-invite with names in Hindi"],
  },
  "punjabi-viah": {
    for: "A Punjabi wedding invitation written in Punjabi (Gurmukhi), with phulkari embroidery bands, a sunburst and a lit diya. It suits any Punjabi family; for the Sikh ceremony itself there is the Anand Karaj design.",
    has: "The title, the date and venue headings and the invitation line are in Punjabi, and each can be reworded. It shows both sets of parents, the date and time, and the venue with its address.",
    ask: ["Punjabi wedding invitation in Punjabi online", "ਵਿਆਹ ਦਾ ਸੱਦਾ ਪੱਤਰ video for WhatsApp", "Punjabi viah e-invite with phulkari design"],
  },
  "nikah-mubarak": {
    for: "A Muslim wedding invitation that opens with Bismillah in Arabic and the wedding dua, with a mehrab arch, a star lattice and hanging lanterns.",
    has: "The couple's photo sits inside the arch. The Nikah date, time and venue come first, and an optional Walima scene carries its own date and venue, so one link covers both.",
    ask: ["Nikah invitation video with Bismillah", "Muslim wedding e-invite with Walima", "Islamic wedding invitation link for WhatsApp"],
  },
  "anand-karaj": {
    for: "A Sikh wedding invitation with a glowing Ik Onkar, Gurmukhi titles and a phulkari embroidery band.",
    has: "A schedule for Milni, Laavan and Langar, the Gurdwara or venue with its address, both families, and a Fateh greeting to close.",
    ask: ["Sikh wedding invitation video Anand Karaj", "Punjabi wedding e-invite with Gurmukhi", "Anand Karaj invitation for WhatsApp with Milni and Laavan timings"],
  },
  "sagai-rings": {
    for: "An engagement, Roka or Sagai invitation: two rings spin in and lock together in rose gold.",
    has: "The couple's names, the date and time, the venue and an RSVP line. It is short, so it works well as a quick announcement on WhatsApp Status.",
    ask: ["engagement invitation video with names", "Roka ceremony e-invite", "Sagai invitation for WhatsApp free"],
  },
  "haldi-marigold": {
    for: "A Haldi ceremony invitation in turmeric yellow with swaying marigold garlands and bold Hindi titles.",
    has: "The bride or groom's name, the date and time, the home or venue address, and a dress-code line if you want one.",
    ask: ["Haldi invitation video for WhatsApp", "Haldi ceremony e-invite with marigold", "haldi function invitation card online"],
  },
  "mehendi-paisley": {
    for: "A Mehendi invitation with henna paisleys that draw themselves and a scalloped henna frame, with handwritten Hindi.",
    has: "Names, date, time and venue, in henna green, rust, mint or fuchsia.",
    ask: ["Mehendi invitation video with names", "Mehndi ceremony e-invite for WhatsApp", "mehendi function card online"],
  },
  "sangeet-night": {
    for: "A Sangeet invitation with a party feel: sweeping spotlights, neon titles, an equaliser and confetti.",
    has: "The couple's names, date, time and venue, and a line-up of who is performing.",
    ask: ["Sangeet invitation video Bollywood style", "sangeet night e-invite with performances list", "sangeet ceremony invitation for WhatsApp"],
  },
  "reception-gala": {
    for: "A wedding reception invitation for an evening event: fairy lights, gold art-deco fans, and navy, black or wine backgrounds.",
    has: "The couple's names, date, time and venue with a short programme of the night.",
    ask: ["wedding reception invitation video", "reception party e-invite for WhatsApp", "elegant reception invitation card online"],
  },
  "holy-matrimony": {
    for: "A Christian wedding invitation for a church ceremony: wedding bells on a bow, a cathedral rose window and your photo in a church-window arch.",
    has: "The ceremony at the church and the reception that follows, each with its time and place, and a verse from 1 Corinthians 13 that you can switch off.",
    ask: ["Christian wedding invitation video", "church wedding e-invite with Bible verse", "Holy Matrimony invitation for WhatsApp"],
  },
  "shubh-mangal": {
    for: "A Marathi wedding invitation in Paithani silk: a zari border, peacock feathers and a kalash, written in Marathi.",
    has: "The Marathi honorifics before the names, the shubh muhurta, a swagat samarambh (reception) scene and the traditional closing lines requesting your guests' presence.",
    ask: ["Marathi wedding invitation video", "Marathi lagna patrika online for WhatsApp", "Shubh Mangal e-invite with muhurta"],
  },
  "shubho-bibaho": {
    for: "A Bengali wedding invitation with a lal-paar border, a prajapati butterfly, alpana patterns and a shankha-pola ring, written in Bengali.",
    has: "Bengali honorifics for the couple, the wedding date and venue, a Bou Bhaat scene with its own date, and a traditional closing in Bengali.",
    ask: ["Bengali wedding invitation video", "Shubho Bibaho e-invite for WhatsApp", "Bengali biye card online with Bou Bhaat"],
  },
  "blush-botanical": {
    for: "A light, floral save-the-date or wedding invitation: hand-drawn sprigs, falling petals and the names in script.",
    has: "Names, date, venue and an RSVP line, with room for two photos. It suits any community.",
    ask: ["floral wedding invitation video free", "save the date video with names", "minimal wedding e-invite for WhatsApp"],
  },
  "cinematic-reel": {
    for: "An invitation that plays like a film trailer, built around your own video clip with letterbox bars, film grain and titles that type on.",
    has: "Your clip with a start point you choose, a montage of photos, the date and venue as title cards, and a small-print line at the end.",
    ask: ["wedding invitation video with our own clip", "cinematic save the date trailer", "wedding teaser invitation for WhatsApp"],
  },
  "polaroid-memories": {
    for: "A playful invitation made of your photos: polaroids taped to a scrapbook page with handwritten captions.",
    has: "A gallery of your pictures, the names, the date and the venue. It suits a save-the-date, an anniversary or a relaxed wedding invitation.",
    ask: ["photo collage wedding invitation video", "save the date with photos online", "polaroid style invitation for WhatsApp"],
  },
  "aurora-modern": {
    for: "A modern, minimal invitation: slow drifting colour and very large moving type, with no traditional motifs.",
    has: "Names, date, city and a short RSVP line. It suits a save-the-date or a contemporary wedding of any community.",
    ask: ["modern minimal wedding invitation video", "save the date animation with names", "contemporary wedding e-invite"],
  },
};
