/* Wedding guides (/guides, /guides/<slug>): practical, original articles for families planning an Indian wedding's
   invitations. Added 2026-11-23 for the AdSense review ("low value content": the site had almost no reading material),
   and because they genuinely answer what couples ask us. Dependency-free (the sitemap reads it).

   Rules for this file: our own words only, no invented statistics, quotes, reviews or "studies"; customs described as
   what many families do, never as the one right way; nothing medical, legal or astrological. Keep the sales part out of
   the text: the page adds one small box at the end. Change `updated` when a guide changes.

   Inline links: [text](/path). Blocks: a string is a paragraph; { list } bullets; { steps } numbered; { sample } a
   wording example in a box; { tip } a highlighted note. */

export type GuideBlock = string | { list: string[] } | { steps: string[] } | { sample: string; label?: string } | { tip: string };
export type Guide = {
  slug: string;
  title: string;
  /** Meta description and the card text on /guides. */
  description: string;
  updated: string;
  minutes: number;
  intro: string[];
  sections: { h: string; blocks: GuideBlock[] }[];
  related: string[];
};

export const GUIDES: Guide[] = [
  {
    slug: "when-to-send-wedding-invitations",
    title: "When to send wedding invitations in India: a simple timeline",
    description:
      "A month-by-month timeline for save-the-dates, the main invitation, function invites and reminders, with extra time for outstation guests and elders.",
    updated: "23 November 2026",
    minutes: 6,
    intro: [
      "Send an invitation too early and people forget; send it too late and the relatives who need train tickets or leave from work cannot plan. Indian weddings make timing harder, because there is rarely one event: there may be a roka or engagement, haldi, mehendi, sangeet, the wedding itself and a reception, each with a slightly different guest list.",
      "This guide gives a practical timeline that works for most families. Treat it as a starting point and adjust it for your own customs, the distance your guests travel and how formal your family is.",
    ],
    sections: [
      {
        h: "Six to three months before: the save-the-date",
        blocks: [
          "A save-the-date is a short message that only fixes the date in people's calendars. It does not need the venue, the timings or the full list of functions. It matters most for guests who have to travel: relatives in another city, friends abroad, anyone who needs to book flights or ask for leave.",
          { list: [
            "Destination wedding or many guests flying in: send it four to six months ahead.",
            "Wedding in your own city, mostly local guests: three months is enough, and many families skip it altogether.",
            "Wedding during a festival or holiday season, when trains and flights fill early: send it as early as the date is final.",
          ] },
          { tip: "Only send a save-the-date once the date is truly fixed. Changing a date after people have booked travel causes far more trouble than a late invitation." },
        ],
      },
      {
        h: "Six to four weeks before: the main invitation",
        blocks: [
          "The main invitation carries everything: the names, the families, the date and muhurat, the venue with its full address, the functions and whom to contact. For most weddings, four to six weeks before the first function is a comfortable window. Guests have enough time to plan, but the date is still close enough to stay on their minds.",
          "If you are printing cards, start the design and printing two to three weeks before you plan to distribute them, because proofs and corrections take time. A digital invitation can be ready the same day, which gives you room to send it a little later or to fix a detail after it has gone out.",
          "Many Hindu families set aside the first invitation for Lord Ganesha or the family deity, keeping it at the home shrine or offering it at a temple before any other card goes out. Other families begin by personally inviting grandparents or the eldest relatives. If your family has such a custom, plan a day for it before the general distribution starts.",
        ],
      },
      {
        h: "Function invitations: haldi, mehendi, sangeet and reception",
        blocks: [
          "Pre-wedding functions are usually smaller and more informal, so their invitations can go out a little later, often two to four weeks before. Many families mention them in the main invitation and then send a separate, more playful invite to the people who are actually invited to each one.",
          { list: [
            "Haldi and mehendi are often for close family and friends; a short personal message two to three weeks ahead works well.",
            "A sangeet with performances needs more notice, because people rehearse. Tell the performers six to eight weeks ahead even if the formal invite comes later.",
            "A reception often has the widest guest list, including colleagues and neighbours who do not attend the wedding rituals. Invite them with the main invitation or soon after.",
          ] },
          "For more on what each function is and what its invitation should say, see our guide to [haldi, mehendi, sangeet and reception invitations](/guides/haldi-mehendi-sangeet-invitations).",
        ],
      },
      {
        h: "Two weeks before: the RSVP check",
        blocks: [
          "Caterers usually want a final headcount one to two weeks before the event, and hotels want room numbers even earlier. Two weeks before the wedding, go through your list and contact everyone who has not replied. A short, friendly message is enough; for elders, a phone call is better.",
          "Our guide on [collecting RSVPs](/guides/how-to-collect-rsvps) covers how to ask, what to ask and how to handle the people who answer \"maybe\".",
        ],
      },
      {
        h: "Two to three days before: the reminder",
        blocks: [
          "A reminder a few days before each function is not rude; most guests are grateful for it. Keep it short: the function, the day, the time and the location link. On the morning of a function, a one-line message with the map link helps guests who are travelling to an unfamiliar venue.",
          { sample: "Looking forward to seeing you at the sangeet tomorrow, Saturday, from 7 pm at Green Park Banquets. Location: (map link). Dinner will be served.", label: "A reminder message" },
        ],
      },
      {
        h: "A timeline at a glance",
        blocks: [
          { steps: [
            "Date fixed: inform the closest family personally.",
            "Three to six months before: save-the-date to outstation guests.",
            "Six to four weeks before: main invitation (first card to the family deity or elders, if that is your custom).",
            "Four to two weeks before: invitations for each function.",
            "Two weeks before: follow up on RSVPs and give caterers a number.",
            "Two days before each function: a short reminder with the location.",
          ] },
        ],
      },
    ],
    related: ["how-to-invite-guests-on-whatsapp", "how-to-collect-rsvps", "what-to-write-on-a-wedding-invitation"],
  },

  {
    slug: "what-to-write-on-a-wedding-invitation",
    title: "What to write on an Indian wedding invitation: every part, in order",
    description:
      "The parts of a traditional Indian wedding invitation, from the invocation at the top to the RSVP line, what each one is for and what is safe to leave out.",
    updated: "23 November 2026",
    minutes: 7,
    intro: [
      "Indian wedding invitations follow a structure that has been handed down for generations. Even a modern, minimal invitation is easier to read when its parts come in the order guests expect. This guide walks through each part, explains why it is there and notes where families differ.",
      "You do not need every part. A digital invitation for friends can be much shorter than the card that goes to the eldest relatives. But knowing the full structure helps you decide what to keep.",
    ],
    sections: [
      {
        h: "1. The invocation",
        blocks: [
          "Many invitations begin with a blessing at the very top. It sets the tone and tells guests something about the family's faith before they read a single name.",
          { list: [
            "Many Hindu families begin with a line to Lord Ganesha, such as \"Shri Ganeshaya Namah\", or with a short Sanskrit shloka.",
            "Muslim families often begin with Bismillah, and many add a verse or a dua for the couple.",
            "Sikh invitations commonly open with Ik Onkar or a line from Gurbani.",
            "Christian invitations sometimes carry a short Bible verse, for example from 1 Corinthians 13.",
          ] },
          "If you are unsure of the exact words, ask the family elder or priest who usually advises your family. It is better to keep a short, correct line than a long one with a mistake in it.",
        ],
      },
      {
        h: "2. The hosts",
        blocks: [
          "Traditionally, the invitation is sent by the parents, and sometimes in the name of the grandparents, rather than by the couple. That is why many cards begin with a line such as \"Mr and Mrs Sharma request the pleasure of your company\". When both families host together, both names appear. When the couple are hosting themselves, which is increasingly common, they can invite in their own names.",
          { sample: "Smt. Kavita and Shri Rajesh Sharma\nrequest the honour of your presence at the wedding of their daughter", label: "Parents as hosts" },
        ],
      },
      {
        h: "3. The couple's names",
        blocks: [
          "The names are the heart of the invitation and should be the easiest thing to read. Honorifics vary by region and community: Chi. (Chiranjeevi) before the groom's name and Chi. Sou. (Chiranjeevi Soubhagyavati) before the bride's in Maharashtra and parts of the South, Shriman and Kalyani in Bengali invitations, and many families now simply use first names.",
          "Under each name, many invitations add a line such as \"daughter of\" or \"son of\" with the parents' names, and sometimes the grandparents' names or the family's town. This helps relatives who know the family by an elder's name rather than the couple's.",
        ],
      },
      {
        h: "4. The date, day and time",
        blocks: [
          "Write the day of the week together with the date; people check both. If the wedding has a muhurat, the auspicious time chosen by the family priest, give it clearly, and consider giving the time guests should arrive as well, since the two can be hours apart.",
          { tip: "Always write AM or PM, or use words such as \"morning\" and \"evening\". A 7 o'clock muhurat can mean either, and wedding rituals happen at both times." },
        ],
      },
      {
        h: "5. The venue",
        blocks: [
          "Give the venue's name, its full address and a landmark that local drivers know. On a digital invitation, add a map link: it saves your family dozens of phone calls on the day. If the ceremony and the dinner are in different places, say so.",
        ],
      },
      {
        h: "6. The functions",
        blocks: [
          "When several functions are covered by one invitation, list them in order with the day, time and place of each. Keep each line short. If not everyone is invited to every function, many families send the full list only to close family and a shorter invitation to everyone else.",
          { sample: "Haldi · Friday 4 December · 10 am · at home\nSangeet · Friday 4 December · 7 pm · Green Park Banquets\nWedding · Saturday 5 December · muhurat 8:15 pm · Green Park Banquets", label: "A function list" },
        ],
      },
      {
        h: "7. RSVP, compliments and the closing line",
        blocks: [
          "Name one or two people guests can contact, with their phone numbers. Many invitations also carry a line \"With best compliments from\" followed by relatives' or siblings' names, and a closing such as \"Your presence is our blessing\". Some families add a polite line about gifts, for example that blessings are the only gift they wish for.",
          "For ready-to-use sentences, see our [English wedding invitation wording samples](/guides/wedding-invitation-wording-samples). For lines in Hindi, Tamil, Telugu and other languages, see our [invitation wording pages](/wording).",
        ],
      },
      {
        h: "What you can safely leave out",
        blocks: [
          "If an invitation is getting crowded, the parts guests miss least are long lists of compliments, decorative verses and repeated family names. The parts they miss most are the time, the full address and a number to call. When in doubt, keep the practical details and shorten the rest.",
          "Our [checklist of details guests need](/guides/wedding-invitation-details-checklist) is a useful final check before you send anything.",
        ],
      },
    ],
    related: ["wedding-invitation-wording-samples", "wedding-invitation-details-checklist", "when-to-send-wedding-invitations"],
  },

  {
    slug: "wedding-invitation-wording-samples",
    title: "Wedding invitation wording samples in English (formal, modern and short)",
    description:
      "Copy-ready English wording for Indian wedding invitations: hosted by parents, by both families or by the couple, plus function invites and a short WhatsApp message.",
    updated: "23 November 2026",
    minutes: 6,
    intro: [
      "Finding the right words is often the slowest part of making an invitation. Below are sample lines for the most common situations. Change the names, add your family's invocation at the top, and adjust the tone until it sounds like your family.",
      "All the samples use placeholder names. Replace them with your own and read the result aloud once: if a sentence feels stiff when spoken, it will feel stiff to your guests too.",
    ],
    sections: [
      {
        h: "Formal: hosted by the bride's parents",
        blocks: [
          { sample: "Smt. Meena and Shri Anil Verma\nrequest the pleasure of your company\nat the wedding of their daughter\n\nAnanya\nwith\nAarav\nson of Smt. Rekha and Shri Sunil Kapoor\n\non Saturday, 5 December 2026\nat 8 pm\nThe Grand Courtyard, Jaipur\n\nDinner to follow" },
          "This is the classic form. When the groom's parents are the hosts, swap the families and write \"their son\" instead.",
        ],
      },
      {
        h: "Formal: hosted by both families",
        blocks: [
          { sample: "With the blessings of our elders,\nthe Verma and Kapoor families\njoyfully invite you to celebrate the wedding of\n\nAnanya & Aarav\n\nSaturday, 5 December 2026 · 8 pm\nThe Grand Courtyard, Jaipur" },
        ],
      },
      {
        h: "Modern: hosted by the couple",
        blocks: [
          { sample: "Together with our families,\nwe are getting married!\n\nAnanya & Aarav\n\nWe would love you to be there\nSaturday, 5 December 2026, from 7 pm\nThe Grand Courtyard, Jaipur" },
          { sample: "We found each other, and now we're making it official.\nJoin us for two days of rituals, music, food and a lot of dancing.\n\nAnanya & Aarav · 4–5 December 2026 · Jaipur" },
        ],
      },
      {
        h: "Function invitations",
        blocks: [
          { sample: "Come dressed in yellow and ready to get messy!\nJoin us for Ananya's haldi\nFriday 4 December · 10 am · at home", label: "Haldi" },
          { sample: "Henna, music and good company.\nYou're invited to the mehendi\nThursday 3 December · from 4 pm\nVerma residence, Malviya Nagar", label: "Mehendi" },
          { sample: "Practise your steps!\nAn evening of songs and dance for Ananya & Aarav\nFriday 4 December · 7 pm onwards\nGreen Park Banquets", label: "Sangeet" },
          { sample: "Mr and Mrs Sunil Kapoor\ninvite you to a reception in honour of\nAarav & Ananya\nSunday 6 December · 7:30 pm\nHotel Clarks, Jaipur", label: "Reception" },
        ],
      },
      {
        h: "RSVP and closing lines",
        blocks: [
          { list: [
            "Kindly confirm your presence by 20 November: Rohit (98xxx xxxxx).",
            "Your presence and blessings are all we wish for.",
            "With best compliments from: Riya, Kabir and the entire Verma family.",
            "Your blessings are the only gift we ask for.",
            "Awaiting your gracious presence.",
          ] },
        ],
      },
      {
        h: "The message that goes with a digital invitation",
        blocks: [
          "When you send an invitation link or image on WhatsApp, the message around it matters as much as the invitation itself. A personal line with the guest's name feels like an invitation; a bare forward feels like a circular.",
          { sample: "Namaste Sharma uncle and aunty, Ananya's wedding is on 5 December in Jaipur and it would mean a lot to have you with us. Here is the invitation: (link). Papa will also call you this week.", label: "To elders" },
          { sample: "Hi Neha! Aarav and I are getting married on 5 December 🎉 Here's the invite with all the functions: (link). Please tell me by the 20th if you can make it!", label: "To friends" },
          "More on this in our guide to [inviting guests on WhatsApp](/guides/how-to-invite-guests-on-whatsapp).",
        ],
      },
    ],
    related: ["what-to-write-on-a-wedding-invitation", "how-to-invite-guests-on-whatsapp", "haldi-mehendi-sangeet-invitations"],
  },

  {
    slug: "how-to-invite-guests-on-whatsapp",
    title: "How to invite wedding guests on WhatsApp without seeming rude",
    description:
      "Personal messages, broadcast lists or groups? How to send wedding invitations on WhatsApp so they feel personal, reach everyone and keep guests' numbers private.",
    updated: "23 November 2026",
    minutes: 6,
    intro: [
      "For many families, WhatsApp has become the main way wedding invitations travel. It is fast, free and reaches relatives in other cities instantly. It also makes it very easy to send an invitation that feels careless. The difference is rarely the invitation itself; it is how it is sent.",
      "Here is how to use WhatsApp for invitations in a way that still feels like you are inviting someone, not forwarding a notice.",
    ],
    sections: [
      {
        h: "Call first where it matters",
        blocks: [
          "For grandparents, elders, close relatives and anyone who would expect a visit with a card, a phone call before or along with the WhatsApp message makes all the difference. The message then carries the details; the call carries the respect. Many families divide the list among parents, siblings and cousins so that each call comes from the person the guest knows best.",
        ],
      },
      {
        h: "Personal messages, broadcast lists and groups",
        blocks: [
          { list: [
            "Personal messages are best for elders and close family. Start with their name and one personal line.",
            "Broadcast lists send the same message to many people individually: each person receives it as a private chat, and nobody sees who else got it. One catch: a broadcast only reaches people who have saved your number in their own contacts, so some guests may silently never receive it.",
            "Groups are useful for coordinating a sangeet performance or travel plans, but a large invitation group shares every member's phone number with everyone else. Avoid adding people to a group without asking, especially elders and colleagues.",
          ] },
          { tip: "If you use a broadcast list, check a few days later who has not replied and send those people a personal message. Some of them never received the broadcast." },
        ],
      },
      {
        h: "What a good invitation message contains",
        blocks: [
          { steps: [
            "A greeting with the guest's name.",
            "Whose wedding it is, the date and the city in one sentence.",
            "The invitation itself: an image, a PDF, a video or a link.",
            "What you need from them: a reply by a date, or nothing at all.",
            "Who to call with questions.",
          ] },
          "Some invitation pages can greet each guest by name. With FutureProof, for example, the couple can make a personal link that opens with \"Dear Sharma ji\" on the cover. Whatever you use, a guest's own name at the start of the message is the simplest way to make it feel personal.",
        ],
      },
      {
        h: "Images, PDFs, videos or a link?",
        blocks: [
          "An image is quick to open but hard to read on a small screen if it is full of text. A PDF looks like a printed card but many people never open attachments. A video is lively but large videos are slow to download on weak connections and fill up phone storage. A link to an invitation page opens in the browser, can carry a map, a calendar button and an RSVP option, and can be corrected after sending; it does need a working internet connection to open.",
          "Whichever format you choose, check it on an older, smaller phone before sending it to everyone.",
        ],
      },
      {
        h: "Timing and etiquette",
        blocks: [
          { list: [
            "Send during the day. A message at midnight can seem careless, and some elders keep their phones on loud.",
            "Do not send the same invitation twice in a day if the first one has not been read; wait a day or two.",
            "Reply to every response, even a simple \"thank you, see you there\".",
            "If you made a mistake in the invitation, send one clear correction instead of several messages.",
            "Respect people who prefer a printed card: send one, even if most guests get a digital invitation.",
          ] },
        ],
      },
      {
        h: "Following up",
        blocks: [
          "A week or two before the wedding, follow up with anyone who has not replied, and a day or two before each function send a short reminder with the location link. Our [RSVP guide](/guides/how-to-collect-rsvps) and [invitation timeline](/guides/when-to-send-wedding-invitations) cover both in more detail.",
        ],
      },
    ],
    related: ["wedding-invitation-wording-samples", "how-to-collect-rsvps", "digital-vs-printed-wedding-invitations"],
  },

  {
    slug: "digital-vs-printed-wedding-invitations",
    title: "Digital or printed wedding invitations? An honest comparison",
    description:
      "Cost, time, elders' expectations, keepsakes and changes: how digital and printed wedding invitations compare, and why many families now use both.",
    updated: "23 November 2026",
    minutes: 5,
    intro: [
      "Printed cards are part of how many Indian families have always invited guests: the card is delivered by hand, often with sweets, and kept for years. Digital invitations arrived because they are fast and reach people anywhere. Neither is simply better. The right choice depends on your guests, your budget and your family's expectations.",
      "We make digital invitations, so we have an interest here. We have tried to be fair below, including about what a printed card does better.",
    ],
    sections: [
      {
        h: "Where printed cards are better",
        blocks: [
          { list: [
            "Respect and tradition: for many elders, a card delivered in person is the invitation; a message is only information.",
            "A keepsake: families keep wedding cards for decades. A link or a message is easily lost in a busy chat.",
            "No internet needed: a card works for guests who do not use smartphones.",
            "Ritual use: many families need at least a few printed cards for the first invitation to the family deity, for temple use or for close elders.",
          ] },
        ],
      },
      {
        h: "Where digital invitations are better",
        blocks: [
          { list: [
            "Speed: a digital invitation can be ready and sent in a day, which helps when dates are fixed late.",
            "Reach: relatives abroad or in other cities get it instantly, with no courier.",
            "Cost: printing, boxes and couriers for hundreds of guests add up; digital invitations cost far less, often nothing.",
            "Corrections: a mistake on a printed card means reprinting. Many digital invitations can be corrected after sending, and a link can show the corrected version to everyone.",
            "Practical extras: a map link, calendar buttons and an RSVP option are easy to add to a digital invitation.",
            "Less paper: hundreds of cards often end up thrown away.",
          ] },
        ],
      },
      {
        h: "The approach many families take: both",
        blocks: [
          "A common middle path is to print a small number of cards, for the family deity, for grandparents and elders and for a few close relatives, and to send a digital invitation to everyone else. The printed cards carry the tradition; the digital invitation carries the practical details and reaches people quickly.",
          { tip: "If you do both, make sure the details match exactly. Guests notice when the card and the message give different times." },
        ],
      },
      {
        h: "Questions to help you decide",
        blocks: [
          { steps: [
            "How many of your guests are elders who would expect a card in person?",
            "How many guests live in other cities or abroad?",
            "How much time is left before the first function?",
            "Is your budget better spent on cards or on the wedding itself?",
            "Do you need RSVPs, and how will you collect them?",
          ] },
          "If you choose digital, our guides on [inviting guests on WhatsApp](/guides/how-to-invite-guests-on-whatsapp) and [what guests need on an invitation](/guides/wedding-invitation-details-checklist) will help you make it feel as thoughtful as a card.",
        ],
      },
    ],
    related: ["how-to-invite-guests-on-whatsapp", "when-to-send-wedding-invitations", "wedding-invitation-details-checklist"],
  },

  {
    slug: "haldi-mehendi-sangeet-invitations",
    title: "Haldi, mehendi, sangeet and reception: what each function is and how to invite for it",
    description:
      "A short explanation of the main pre-wedding and post-wedding functions, their regional names, who is usually invited and what each invitation should say.",
    updated: "23 November 2026",
    minutes: 7,
    intro: [
      "An Indian wedding is often a series of functions over several days. Each has its own mood, its own guest list and its own customs, which differ from region to region and family to family. This guide gives a short description of the most common ones and practical advice for inviting guests to each.",
      "Customs vary widely, so take these descriptions as general and follow your own family's traditions where they differ.",
    ],
    sections: [
      {
        h: "Haldi",
        blocks: [
          "At the haldi ceremony, a paste of turmeric, usually mixed with ingredients such as gram flour, oil or rose water, is applied to the bride and the groom by family members, typically in their own homes a day or two before the wedding. It is usually joyful and messy, and mostly for close family and friends. Many regions have their own name and form for it, such as Gaye Holud in Bengali weddings, Halad in Maharashtrian weddings and Maiyan in Punjabi weddings.",
          { list: [
            "Who to invite: close family and friends, often separately for the bride's and groom's sides.",
            "What to say: the time (usually morning), the place (often the home), and a hint about clothes: many guests wear yellow, and turmeric stains, so old or inexpensive clothes are sensible.",
          ] },
        ],
      },
      {
        h: "Mehendi",
        blocks: [
          "At the mehendi, henna designs are applied to the bride's hands and feet, often by a professional artist, while family and friends sing, dance and get henna themselves. It usually takes place a day or two before the wedding and can last several hours, because the bride's designs are detailed.",
          { list: [
            "Who to invite: traditionally the women of the family and close friends; many families now invite everyone.",
            "What to say: a start time and roughly how long it lasts, whether henna artists will be available for guests, and the dress code if there is one (green is a popular choice).",
          ] },
        ],
      },
      {
        h: "Sangeet",
        blocks: [
          "The sangeet is an evening of music and dance. It began as a North Indian tradition of women singing folk songs before the wedding and has grown, in many families, into a full evening with choreographed performances by both families, a DJ and dinner.",
          { list: [
            "Who to invite: usually a wider circle than haldi or mehendi, including friends.",
            "What to say: the start time, the venue, whether dinner is served, and a dress code if you have one. Tell the people performing well in advance; rehearsals take weeks.",
          ] },
        ],
      },
      {
        h: "Engagement",
        blocks: [
          "The engagement formalises the match, often with an exchange of rings and blessings from both families. It has many regional forms and names, such as Sagai or Mangni in the North, Sakharpuda in Maharashtra and Nichayathartham in Tamil Nadu. It may happen months before the wedding or as one of the pre-wedding functions.",
          { list: [ "Who to invite: both families' close relatives, sometimes friends.", "What to say: the date, time and place, and the names of both families." ] },
        ],
      },
      {
        h: "Reception",
        blocks: [
          "The reception is usually held after the wedding, often hosted by the groom's family, to introduce the newly married couple to a wider circle: colleagues, neighbours, family friends. In Bengali weddings the Bou Bhat, held at the groom's home, plays a similar role. Receptions often have the largest guest list of all the functions.",
          { list: [
            "Who to invite: the widest circle, including people who do not attend the wedding rituals.",
            "What to say: who is hosting, the time and venue, and that dinner will be served. Give the time guests should arrive, since receptions often run late into the evening.",
          ] },
        ],
      },
      {
        h: "One invitation or several?",
        blocks: [
          "Some families send one invitation that lists every function; others send a separate invitation for each. A single invitation is simpler but tells every guest about functions they may not be invited to. Separate invitations take more effort but let you match each guest list exactly, and each invite can have its own mood: bright and playful for haldi, elegant for the reception.",
          "For sample lines for each function, see our [wording samples](/guides/wedding-invitation-wording-samples). For when to send each one, see the [invitation timeline](/guides/when-to-send-wedding-invitations).",
        ],
      },
    ],
    related: ["wedding-invitation-wording-samples", "when-to-send-wedding-invitations", "what-to-write-on-a-wedding-invitation"],
  },

  {
    slug: "how-to-collect-rsvps",
    title: "How to collect RSVPs for an Indian wedding (and get people to reply)",
    description:
      "Why RSVPs matter for catering and rooms, what to ask, how to ask without sounding demanding, and how to handle late replies and \"maybe\".",
    updated: "23 November 2026",
    minutes: 6,
    intro: [
      "In many Indian families, replying to a wedding invitation is not a habit. Guests assume they are welcome and simply turn up, sometimes with family members who were not on the list. That generosity is part of the charm of an Indian wedding, but it makes planning hard when caterers charge per plate and hotels need room numbers weeks in advance.",
      "You will probably never get a reply from every guest. With a clear question and a little follow-up, you can get close enough to plan well.",
    ],
    sections: [
      {
        h: "Why it is worth the effort",
        blocks: [
          { list: [
            "Catering is usually priced per plate, with a minimum guarantee. A better estimate means less waste and fewer surprises on the bill.",
            "Outstation guests may need rooms, pick-ups and directions.",
            "Seating, return gifts and the number of hands needed on the day all depend on the count.",
            "For pre-wedding functions held at home, space can be the real limit.",
          ] },
        ],
      },
      {
        h: "What to ask",
        blocks: [
          "Keep the question as short as possible. Every extra question means fewer replies.",
          { steps: [
            "Will you attend? Yes, maybe or no.",
            "How many people, including yourself?",
            "Which functions? Only if guests are invited to more than one.",
            "Food preference, only if your menu needs it (for example Jain food or no onion and garlic).",
            "Arrival date and travel details, only for outstation guests you are arranging rooms for.",
          ] },
          "Give a reply-by date. \"Please let us know by 20 November\" works better than an open request, because it gives people a reason to answer now.",
        ],
      },
      {
        h: "How to ask",
        blocks: [
          "Make replying as easy as possible: one phone number, one WhatsApp contact, or a short form that takes seconds to fill in. Name a specific person, such as a cousin or a sibling, rather than \"the family\"; guests are more likely to reply to someone they know.",
          "Online invitation pages often include an RSVP button. On FutureProof invitations, for example, the couple can choose a WhatsApp reply button or a short form whose answers go straight to the family's WhatsApp, with the invitation showing the couple how many have said yes. Whatever tool you use, check whether it stores your guests' names and answers, and where.",
        ],
      },
      {
        h: "Following up",
        blocks: [
          "About two weeks before the event, list everyone who has not replied and divide the follow-up among family members. A personal message works best:",
          { sample: "Hi Priya, just checking if you and Rahul will be able to come for the wedding on the 5th? We're giving the caterers numbers this week. No pressure at all, just let me know!", label: "A friendly follow-up" },
          "For elders, a phone call is more appropriate than a message, and also a chance to repeat the invitation personally.",
        ],
      },
      {
        h: "Handling \"maybe\" and no reply",
        blocks: [
          { list: [
            "Count \"maybe\" as half when you estimate numbers, then ask again a week before.",
            "Experience varies by family, but some guests who never reply will still come. Many families add a margin of ten to fifteen per cent to the confirmed count; ask your caterer what they recommend.",
            "If a guest replies with more people than invited, decide as a family how you will handle it before it happens, so nobody has to improvise an awkward answer.",
          ] },
          { tip: "Keep one shared list (a simple spreadsheet is enough) that everyone in the family updates, so you do not count the same guest twice." },
        ],
      },
    ],
    related: ["how-to-invite-guests-on-whatsapp", "when-to-send-wedding-invitations", "wedding-invitation-details-checklist"],
  },

  {
    slug: "wedding-invitation-details-checklist",
    title: "Wedding invitation checklist: the details guests need (and often go missing)",
    description:
      "A final checklist before you send your wedding invitation: date and day, AM or PM, the full address and map, timings for each function, contacts, dress code and more.",
    updated: "23 November 2026",
    minutes: 5,
    intro: [
      "Most invitation mistakes are not about design. They are missing details that lead to dozens of phone calls: which hall, what time, is dinner served, where do we park. Before you send your invitation to anyone, go through this list once.",
    ],
    sections: [
      {
        h: "The basics",
        blocks: [
          { list: [
            "Names spelt correctly, including the parents' names and honorifics. Ask each family to check its own side.",
            "The date and the day of the week, and check that they match the calendar.",
            "The time with AM or PM, or morning and evening. For a muhurat, consider also giving the time guests should arrive.",
            "The year, if guests might confuse it, for example when invitations go out in late December for a January wedding.",
          ] },
        ],
      },
      {
        h: "The venue",
        blocks: [
          { list: [
            "The full name of the venue, and of the hall or lawn if the venue has several.",
            "The full address with a landmark a local driver would recognise.",
            "A map link for digital invitations. Open it yourself to make sure it points to the entrance, not the back gate.",
            "Parking information, if parking is difficult.",
            "If functions are in different places, the place for each one.",
          ] },
        ],
      },
      {
        h: "The programme",
        blocks: [
          { list: [
            "Each function with its day, time and place.",
            "Whether a meal is served, especially for evening functions.",
            "A dress code or colour theme, if you have one.",
            "Anything unusual guests should know, such as an early-morning ceremony or a baraat they can join.",
          ] },
        ],
      },
      {
        h: "Contacts and replies",
        blocks: [
          { list: [
            "One or two contact names with phone numbers, people who will actually answer during the wedding week.",
            "How and by when to reply, if you need RSVPs.",
            "For outstation guests: who to contact about rooms, pick-ups or travel.",
          ] },
          { tip: "Do not put a phone number on an invitation without asking that person first. It will be shared widely." },
        ],
      },
      {
        h: "Before you press send",
        blocks: [
          { steps: [
            "Ask two people who are not involved in planning to read it and tell you the date, time and place without looking again.",
            "Open the invitation on a small, older phone and check that every line is readable.",
            "Click every link: the map, the RSVP number, any calendar button.",
            "Send it to yourself and a family member first.",
          ] },
          "For the structure of the whole invitation, see [what to write on an Indian wedding invitation](/guides/what-to-write-on-a-wedding-invitation).",
        ],
      },
    ],
    related: ["what-to-write-on-a-wedding-invitation", "how-to-collect-rsvps", "digital-vs-printed-wedding-invitations"],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
