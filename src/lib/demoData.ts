import type { DesktopConfig } from './types';

export const DEMO_DESKTOP: DesktopConfig = {
  id: 'demo',
  slug: 'demo',
  recipientName: 'You',
  wallpaper: 'linear-gradient(135deg, #4EBFBF 0%, #3AA0A0 40%, #5BB8D4 70%, #4EBFBF 100%)',
  wallpaperType: 'gradient',
  stickyNote: 'P.S. I made this little computer just for you. Explore everything! 🌸',
  shutdownMessage: 'Thank you for visiting my little world ❤️',
  welcomeMessage: 'Someone made this little desktop just for you 💌',
  apps: {
    mail: {
      enabled: true,
      config: {
        fromName: 'Your Secret Admirer ✨',
        subject: 'You have one unread message...',
        body: `Hi there! 🌸

I've been wanting to tell you something for a while now.

You make every ordinary day feel a little more magical. The way you laugh at the smallest things, how you always notice when someone needs a kind word — it's rare, and it's beautiful.

I made this little desktop just for you, filled with tiny surprises. I hope exploring it makes you smile.

Look around! There are secrets hidden in every corner. 🎈

With all the warmth in the world,
Your Secret Admirer ✨

P.S. — Don't forget to visit the Gacha machine. It has something special waiting for you! 🎰`,
        signature: '✨ Made with love, just for you ✨',
        photoUrl: '',
      },
    },
    gacha: {
      enabled: true,
      config: {
        capsules: [
          { message: 'You deserve flowers today 🌸', emoji: '🌸', rarity: 'normal', color: '#FFB7C5' },
          { message: 'Redeem for one hug (valid anytime) 🤗', emoji: '🤗', rarity: 'rare', color: '#B4E3D1' },
          { message: 'Coffee date coupon — on me! ☕', emoji: '☕', rarity: 'normal', color: '#FFD6B8' },
          { message: 'You are someone\'s favorite person 💛', emoji: '💛', rarity: 'legendary', color: '#FFE680' },
          { message: 'I hope today is kind to you 🌈', emoji: '🌈', rarity: 'normal', color: '#C8B4E3' },
          { message: 'Secret: You make the world brighter ⭐', emoji: '⭐', rarity: 'rare', color: '#FFFAAA' },
        ],
      },
    },
    mixtape: {
      enabled: true,
      config: {
        title: 'Songs That Remind Me Of You',
        personalNote: `Every time I hear these songs, I think of you. 

This playlist is my way of saying — you're in all my favorite moments, even the quiet ones.

Play this on a lazy afternoon and know that somewhere, someone is thinking of you. 🎵`,
        spotifyUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M',
        songs: [
          { title: 'Golden Hour', artist: 'JVKE' },
          { title: 'Enchanted', artist: 'Taylor Swift' },
          { title: 'Strawberry Fields Forever', artist: 'The Beatles' },
          { title: 'Bloom', artist: 'The Paper Kites' },
          { title: 'August', artist: 'Taylor Swift' },
        ],
      },
    },
    ticket: {
      enabled: true,
      config: {
        title: 'YOU ARE INVITED',
        subtitle: 'to something very special',
        date: '2025-12-31',
        time: '7:00 PM',
        location: 'Somewhere Magical ✨',
        dresscode: 'Dress as you are — perfect',
        notes: 'This invitation expires never. Bring yourself.',
        countdownEnabled: true,
      },
    },
    game: {
      enabled: true,
      config: {
        rewardMessage: 'You caught all the stars! Just like how you light up every room you walk into. ⭐',
      },
    },
    photos: {
      enabled: true,
      config: {
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=300&q=80',
            caption: 'Sunflower days 🌻',
            rotation: -3,
            x: 20,
            y: 40,
          },
          {
            url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=300&q=80',
            caption: 'Golden hour magic ✨',
            rotation: 4,
            x: 200,
            y: 20,
          },
          {
            url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=300&q=80',
            caption: 'Cozy mornings ☕',
            rotation: -2,
            x: 380,
            y: 60,
          },
          {
            url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&q=80',
            caption: 'Little joys 🌸',
            rotation: 5,
            x: 100,
            y: 200,
          },
        ],
      },
    },
    calendar: {
      enabled: true,
      config: {
        year: 2025,
        month: 7,
        highlightedDay: 13,
        memoryTitle: 'The Day This Was Made For You 💌',
        memoryText: 'On this day, someone thought of you and decided to make something just for you. Remember this feeling — you are worth all this love and more.',
        memoryPhotoUrl: '',
      },
    },
    secret: {
      enabled: true,
      config: {
        passwordHint: 'Complete the Roblox Obby game to find it! 🔑',
        password: '8042',
        contentType: 'message',
        title: 'A Hidden Message For You 💌',
        content: `You found it! 🎉

I knew you'd be curious enough to look.

Here's the secret I've been keeping:

You are more special than you know. The quiet ways you care for others, the way you make everyday moments feel meaningful — I see it all, and it's beautiful.

This desktop was just a tiny way to show you that someone thinks about you, misses you, and hopes you have the absolute best day.

You deserve every good thing that comes your way. 🌟

With so much love,
Your Secret Admirer ✨`,
      },
    },
  },
};

export const APP_ICONS: Record<string, string> = {
  mail: '📧',
  gacha: '🎰',
  mixtape: '🎵',
  ticket: '🎟',
  game: '🎮',
  photos: '📸',
  calendar: '📅',
  secret: '🔒',
};

export const APP_TITLES: Record<string, string> = {
  mail: 'Inbox',
  gacha: 'Gacha',
  mixtape: 'Mixtape',
  ticket: 'Invitation',
  game: 'Roblox Obby',
  photos: 'My Photos',
  calendar: 'Calendar',
  secret: 'Secret',
};
