// ─── Demo profile data for the Profile Overview modal ─────────────────────
// Shown when nobody is signed in (or the community backend is off), so the
// modal is always demonstrable. When a real member is signed in the modal
// loads their live Supabase data instead and this file is ignored.
//
// Reversible by design: delete src/components/profile/* and this file, then
// revert the two small edits in App.jsx and Navbar.jsx.

export const DEMO_PROFILE = {
  displayName: 'Ella Rose',
  username: 'ellaroutine',
  avatarUrl: '',
  bio: 'Sharing soft glow routines, cozy wellness habits, and skincare plans that actually feel doable.',
  visibility: 'public',
  memberSince: 'March 2025',
  tags: ['Skincare', 'Wellness', 'Soft Glam', 'Morning Routine'],
  isDemo: true,
}

export const DEMO_STATS = {
  glow: 4280,
  likes: 1640,
  sharedPlans: 18,
  savedPlans: 42,
  friends: 128,
  badges: 5,
}

// Glow card copy. With real data these are computed from the next medal tier.
export const DEMO_GLOW = {
  score: 4280,
  toNext: 720,
  nextLabel: 'next milestone',
  helper: 'Glow grows when your plans inspire others.',
}

export const DEMO_PLANS = [
  {
    id: 'demo-p1',
    title: '7-Day Soft Glow Skincare Routine',
    category: 'skincare',
    visibility: 'public',
    likesCount: 842,
    savesCount: 210,
    commentsCount: 34,
    createdAt: '2025-05-02',
    status: 'Trending',
    description: 'A gentle week-long reset for dewy, calm skin — barrier-first, fragrance-free.',
    media: [],
  },
  {
    id: 'demo-p2',
    title: 'Cozy Sunday Reset Plan',
    category: 'wellness',
    visibility: 'friends',
    likesCount: 318,
    savesCount: 96,
    commentsCount: 12,
    createdAt: '2025-04-18',
    status: 'Saved by many',
    description: 'Slow morning, warm bath, journaling and a screen-light evening to start the week soft.',
    media: [],
  },
  {
    id: 'demo-p3',
    title: 'Quick Morning Beauty Routine',
    category: 'skincare',
    visibility: 'public',
    likesCount: 96,
    savesCount: 27,
    commentsCount: 5,
    createdAt: '2025-06-01',
    status: 'New',
    description: 'Five minutes, five steps — for the days you press snooze one too many times.',
    media: [],
  },
]

export const DEMO_SAVED = [
  {
    id: 'demo-s1',
    title: 'Glass Skin Night Routine',
    author: { username: 'mia.glow', displayName: 'Mia' },
    category: 'skincare',
    savedAt: '2025-06-05',
    description: 'Layered hydration and a sleeping mask for a luminous morning.',
  },
  {
    id: 'demo-s2',
    title: 'Calm Evening Wind-Down',
    author: { username: 'softhabits', displayName: 'Noor' },
    category: 'wellness',
    savedAt: '2025-05-29',
    description: 'A gentle ritual to lower the lights and settle the mind before bed.',
  },
]

export const DEMO_ACTIVITY = [
  { id: 'a1', kind: 'likes',    text: 'Your plan received 25 new likes',            at: '2h ago' },
  { id: 'a2', kind: 'badge',    text: 'You unlocked Spotlight progress',            at: '1d ago' },
  { id: 'a3', kind: 'save',     text: 'Mia saved your Soft Glow routine',           at: '2d ago' },
  { id: 'a4', kind: 'comment',  text: 'You commented on a Wellness Plan',           at: '3d ago' },
  { id: 'a5', kind: 'trending', text: 'Your plan reached Trending in Skincare',     at: '5d ago' },
  { id: 'a6', kind: 'friend',   text: 'You added a new friend',                     at: '1w ago' },
]
