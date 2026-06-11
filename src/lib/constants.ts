// Birthday unlock date: July 5th, 2026 at midnight IST (UTC+5:30)
export const BIRTHDAY_DATE = new Date('2026-07-05T00:00:00+05:30');

// Next year for future letters
export const NEXT_BIRTHDAY_DATE = new Date('2027-07-05T00:00:00+05:30');

// Timeline chapters
export const TIMELINE_CHAPTERS = [
  {
    id: 'chapter-1',
    year: '2003',
    title: 'The Little Sunshine',
    image: 'baby.jpg',
    caption: 'A tiny bundle of curiosity who had no idea how many lives she would one day brighten.',
    subtitle: 'Everything starts somewhere. This one started with big eyes and absolutely no idea what was coming next.',
    style: 'polaroid' as const,
  },
  {
    id: 'chapter-2',
    year: 'Early Years',
    title: 'Growing Up',
    image: 'baby2.jpg',
    caption: 'Every smile became a memory, every year became a new adventure.',
    subtitle: 'Family albums are funny. You look at an old photo and somehow the same person is still there. Just smaller.',
    style: 'scrapbook' as const,
  },
  {
    id: 'chapter-3',
    year: 'Growing Up',
    title: 'The Mischievous Years',
    image: 'don.jpg',
    caption: 'Big eyes. Big dreams. Bigger personality.',
    subtitle: 'The expressions changed. The hairstyles changed. The attitude? Not so much.',
    style: 'film' as const,
  },
  {
    id: 'chapter-4',
    year: 'Today',
    title: 'The Woman She Became',
    image: 'present.jpg',
    caption: 'Graceful, strong, caring and endlessly beautiful.',
    subtitle: 'A few years. A thousand memories. And still somehow the same person. Just a little wiser. Maybe.',
    style: 'cinematic' as const,
  },
];

// Photo filters
export const PHOTO_FILTERS = [
  { id: 'none', name: 'Original', css: 'none' },
  { id: 'polaroid', name: 'Polaroid', css: 'contrast(1.1) saturate(1.1) sepia(0.1) brightness(1.05)' },
  { id: 'kodak', name: 'Kodak Gold', css: 'saturate(1.4) contrast(1.05) sepia(0.15) brightness(1.08) hue-rotate(-5deg)' },
  { id: 'vintage', name: 'Vintage Film', css: 'sepia(0.35) contrast(1.1) saturate(0.8) brightness(0.95)' },
  { id: 'vhs', name: 'VHS', css: 'contrast(1.2) saturate(1.3) brightness(0.9) hue-rotate(5deg)' },
  { id: 'bw', name: 'Black & White', css: 'grayscale(1) contrast(1.2) brightness(1.05)' },
  { id: 'disposable', name: 'Disposable', css: 'contrast(1.15) saturate(1.1) brightness(1.1) hue-rotate(10deg) sepia(0.05)' },
  { id: 'retro', name: 'Warm Retro', css: 'sepia(0.2) saturate(1.2) contrast(0.95) brightness(1.05) hue-rotate(-10deg)' },
];

// Relationship options
export const RELATIONSHIPS = [
  'Best Friend',
  'College Friend',
  'School Friend',
  'Cousin',
  'Family',
  'Partner in Crime',
  'Childhood Friend',
  'Colleague',
  'Neighbour',
  'Other',
];

// Quiz questions (answers are configurable)
export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's her favourite food?",
    options: ['Biryani', 'Pizza', 'Pasta', 'Momos'],
    answer: 0,
  },
  {
    id: 2,
    question: "What's her favourite colour?",
    options: ['Lavender', 'Pink', 'Blue', 'Red'],
    answer: 0,
  },
  {
    id: 3,
    question: "What's her dream destination?",
    options: ['Paris', 'Switzerland', 'Bali', 'Japan'],
    answer: 0,
  },
  {
    id: 4,
    question: "What's her favourite movie?",
    options: ['The Notebook', 'Yeh Jawaani Hai Deewani', 'Tangled', 'La La Land'],
    answer: 0,
  },
  {
    id: 5,
    question: "What's her biggest fear?",
    options: ['Lizards', 'Heights', 'Darkness', 'Being alone'],
    answer: 0,
  },
  {
    id: 6,
    question: "What's her most used phrase?",
    options: ['\"Accha sunnn\"', '\"Haan toh\"', '\"Basically...\"', '\"Matlab...\"'],
    answer: 0,
  },
  {
    id: 7,
    question: 'What does she do when she\'s nervous?',
    options: ['Plays with hair', 'Bites nails', 'Talks too fast', 'Goes silent'],
    answer: 0,
  },
  {
    id: 8,
    question: "What's her go-to comfort show?",
    options: ['Friends', 'The Office', 'Brooklyn Nine-Nine', 'Modern Family'],
    answer: 0,
  },
  {
    id: 9,
    question: 'What would she choose?',
    options: ['Mountains', 'Beach', 'City', 'Countryside'],
    answer: 0,
  },
  {
    id: 10,
    question: 'How does she express love?',
    options: ['Words of affirmation', 'Acts of service', 'Quality time', 'Gifts'],
    answer: 0,
  },
];

// Dumb charades prompts
export const CHARADES_PROMPTS: Record<string, string[]> = {
  Bollywood: [
    'Dilwale Dulhania Le Jayenge', 'Kabhi Khushi Kabhie Gham', '3 Idiots',
    'Zindagi Na Milegi Dobara', 'Dil Chahta Hai', 'Yeh Jawaani Hai Deewani',
    'Gangs of Wasseypur', 'Andhadhun', 'Queen', 'Dangal',
    'Jab We Met', 'Barfi!', 'Gully Boy', 'Lagaan', 'Rang De Basanti',
  ],
  Hollywood: [
    'Titanic', 'The Avengers', 'Harry Potter', 'Inception',
    'The Dark Knight', 'Interstellar', 'Forrest Gump', 'The Lion King',
    'Frozen', 'Spider-Man', 'Iron Man', 'Mean Girls', 'The Notebook',
  ],
  'TV Shows': [
    'Friends', 'Breaking Bad', 'Game of Thrones', 'Stranger Things',
    'The Office', 'Money Heist', 'Sacred Games', 'Mirzapur',
    'Brooklyn Nine-Nine', 'Modern Family', 'Panchayat', 'Ted Lasso',
  ],
  Anime: [
    'Naruto', 'Dragon Ball Z', 'Attack on Titan', 'Death Note',
    'One Piece', 'Demon Slayer', 'My Hero Academia', 'Spy x Family',
    'Jujutsu Kaisen', 'Fullmetal Alchemist',
  ],
  Memes: [
    'Coffin Dance', 'Surprised Pikachu', 'Drake Hotline Bling',
    'Woman Yelling at Cat', 'Distracted Boyfriend', 'This is Fine',
    'Stonks', 'Bernie Sanders Mittens', 'Nyan Cat', 'Rickroll',
  ],
};

// Never Have I Ever prompts
export const NEVER_HAVE_I_EVER = [
  "Never have I ever forgotten her birthday.",
  "Never have I ever stolen her food.",
  "Never have I ever seen her cry during a movie.",
  "Never have I ever made fun of her laugh.",
  "Never have I ever taken an embarrassing photo of her.",
  "Never have I ever been scared of her when she's angry.",
  "Never have I ever copied her homework.",
  "Never have I ever lied to her about looking good in an outfit.",
  "Never have I ever gossiped about someone with her.",
  "Never have I ever pulled an all-nighter with her.",
  "Never have I ever received a 3 AM text from her.",
  "Never have I ever been dragged into her drama.",
  "Never have I ever seen her trip or fall in public.",
  "Never have I ever heard her sing (and wished I hadn't).",
  "Never have I ever had a fight with her that lasted more than a day.",
  "Never have I ever shared a secret with her that nobody else knows.",
  "Never have I ever laughed so hard with her that I cried.",
  "Never have I ever been the victim of her sarcasm.",
  "Never have I ever seen her dance like nobody's watching.",
  "Never have I ever felt instantly better just by talking to her.",
];

// Meet Someone New conversation prompts
export const MEET_PROMPTS = [
  "Tell each other your funniest story involving her.",
  "What's your first memory of her?",
  "Describe her in three words.",
  "What's something she taught you?",
  "What's the most chaotic thing you've done together?",
  "If she were a movie character, who would she be?",
  "What's the best advice she's ever given you?",
  "What would she say if she saw you two talking right now?",
];
