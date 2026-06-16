// Central config — import everywhere, never hardcode inline
export const CAPSULE_UNLOCK = new Date(Date.UTC(2026, 6, 4, 18, 30, 0)); // July 5 00:00 IST = July 4 18:30 UTC
export const FUTURE_LETTERS_UNLOCK = new Date(Date.UTC(2027, 6, 4, 18, 30, 0)); // July 5 00:00 IST (next year) = July 4 18:30 UTC

export const isCapsuleUnlocked = () => new Date().getTime() >= CAPSULE_UNLOCK.getTime();
export const isFutureLettersUnlocked = () => new Date().getTime() >= FUTURE_LETTERS_UNLOCK.getTime();

// Compatibility wrappers
export const BIRTHDAY_DATE = CAPSULE_UNLOCK;
export const NEXT_BIRTHDAY_DATE = FUTURE_LETTERS_UNLOCK;

// Timeline chapters
export const TIMELINE_CHAPTERS = [
  {
    id: 'chapter-1',
    year: '2003',
    title: 'The Little Sunshine',
    image: 'baby.png',
    caption: 'A tiny bundle of curiosity who had no idea how many lives she would one day brighten.',
    subtitle: 'Everything starts somewhere. This one started with big eyes and absolutely no idea what was coming next.',
    style: 'polaroid' as const,
  },
  {
    id: 'chapter-2',
    year: 'Early Years',
    title: 'Growing Up',
    image: 'baby2.png',
    caption: 'Every smile became a memory, every year became a new adventure.',
    subtitle: 'Family albums are funny. You look at an old photo and somehow the same person is still there. Just smaller.',
    style: 'scrapbook' as const,
  },
  {
    id: 'chapter-3',
    year: 'Growing Up',
    title: 'The Mischievous Years',
    image: 'don.png',
    caption: 'Big eyes. Big dreams. Bigger personality.',
    subtitle: 'The expressions changed. The hairstyles changed. The attitude? Not so much.',
    style: 'film' as const,
  },
  {
    id: 'chapter-4',
    year: 'Today',
    title: 'The Woman She Became',
    image: 'present.png',
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

// Quiz removed — feature deleted entirely

// Dumb charades prompts
export const CHARADES_PROMPTS: Record<string, string[]> = {
  Bollywood: [
    'Dilwale Dulhania Le Jayenge', 'Kabhi Khushi Kabhie Gham', '3 Idiots',
    'Zindagi Na Milegi Dobara', 'Dil Chahta Hai', 'Yeh Jawaani Hai Deewani',
    'Gangs of Wasseypur', 'Andhadhun', 'Queen', 'Dangal',
    'Jab We Met', 'Barfi!', 'Gully Boy', 'Lagaan', 'Rang De Basanti',
  ],
  'Easy Level': [
    'Dilwale Dulhania Le Jayenge',
    'Kabhi Khushi Kabhie Gham',
    '3 Idiots',
    'Golmaal',
    'Munna Bhai M.B.B.S.',
    'Chennai Express',
    'Om Shanti Om',
    'Sholay',
    'Student of the Year',
    'Pathaan',
  ],
  'Medium Level': [
    'Zindagi Na Milegi Dobara',
    'Wake Up Sid',
    'Hum Tum',
    'Ek Tha Tiger',
    'Queen',
    'Tumhari Sulu',
    'Jaane Tu Ya Jaane Na',
    'Bhool Bhulaiyaa',
    'Band Baaja Baaraat',
    'Yeh Jawaani Hai Deewani',
  ],
  'Difficult Level': [
    'Matru Ki Bijlee Ka Mandola',
    'Gangs of Wasseypur',
    'No Smoking',
    'Jalebi',
    'Detective Byomkesh Bakshy!',
    'Titli',
    'Rocket Singh: Salesman of the Year',
    'A Wednesday!',
    'Kaalakaandi',
    'Love, Sex Aur Dhokha',
  ],
  'Funny & Meme-Worthy Films': [
    'Andaaz Apna Apna',
    'Welcome',
    'Hera Pheri',
    'Bhagam Bhag',
    'Housefull',
    'Fukrey',
    'Coolie No. 1',
    'Dhol',
    'Tees Maar Khan',
    'Pagalpanti',
  ],
  'Wild Cards': [
    'Black',
    'Barfi!',
    'Haider',
    'Tamasha',
    'The Lunchbox',
    'Udaan',
    'Piku',
    'Badhaai Ho',
    'Bhootnath',
    'Taare Zameen Par',
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

/* ─── Guests List & Info Helper ─── */
export interface Guest {
  id: string;
  name: string;
  avatar?: string;
}

export const GUESTS: Guest[] = [
  { id: 'prathamesh', name: 'Prathamesh', avatar: '/avatars/prathamesh.jpeg' },
  { id: 'kashish', name: 'Kashish', avatar: '/avatars/kashish.jpeg' },
  { id: 'karan', name: 'Karan', avatar: '/avatars/karan.jpeg' },
  { id: 'kanaka', name: 'Kanaka', avatar: '/avatars/kanaka.jpeg' },
  { id: 'vivek', name: 'Vivek', avatar: '/avatars/vivek.jpeg' },
  { id: 'rugved', name: 'Rugved', avatar: '/avatars/rugved.png' },
  { id: 'harsh', name: 'Harsh', avatar: '/avatars/harsh.png' },
  { id: 'nikhil', name: 'Nikhil', avatar: '/avatars/nikhil.png' },
  { id: 'nidhi', name: 'Nidhi', avatar: '/avatars/nidhi.png' },
  { id: 'shreya', name: 'Shreya', avatar: '/avatars/shreya.png' },
  { id: 'kevali', name: 'Kevali', avatar: '/avatars/kevali.png' },
  { id: 'satyarth', name: 'Satyarth', avatar: '/avatars/satyarth.png' },
];

export function getGuestInfo(nameOrId: string | null): { id: string; name: string; avatar: string } {
  if (!nameOrId) {
    return {
      id: 'anonymous',
      name: 'Anonymous',
      avatar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%239C8A7C"/><text x="50" y="58" font-family="sans-serif" font-size="40" fill="%23FBF6EF" text-anchor="middle">?</text></svg>`,
    };
  }

  const normalized = nameOrId.trim().toLowerCase();
  const guest = GUESTS.find(g => g.id === normalized || g.name.toLowerCase() === normalized);

  if (guest) {
    if (guest.avatar) {
      return { id: guest.id, name: guest.name, avatar: guest.avatar };
    }
    // Generate dynamic premium silhouette/initial SVG
    const initial = guest.name.charAt(0).toUpperCase();
    const colors = ['#8C4A3A', '#C9A45C', '#C3232B', '#9C8A7C', '#1C1410'];
    let hash = 0;
    for (let i = 0; i < guest.name.length; i++) {
      hash = guest.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color.replace('#', '%23')}"/><text x="50" y="58" font-family="'Cormorant Garamond', serif" font-weight="300" font-size="40" font-style="italic" fill="%23FBF6EF" text-anchor="middle">${initial}</text></svg>`;
    
    return {
      id: guest.id,
      name: guest.name,
      avatar: `data:image/svg+xml;utf8,${svg}`,
    };
  }

  // Fallback for custom entries
  const initial = nameOrId.trim().charAt(0).toUpperCase() || '?';
  const colors = ['#8C4A3A', '#C9A45C', '#C3232B', '#9C8A7C', '#1C1410'];
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${color.replace('#', '%23')}"/><text x="50" y="58" font-family="'Cormorant Garamond', serif" font-weight="300" font-size="40" font-style="italic" fill="%23FBF6EF" text-anchor="middle">${initial}</text></svg>`;
  
  return {
    id: normalized,
    name: nameOrId.trim(),
    avatar: `data:image/svg+xml;utf8,${svg}`,
  };
}

