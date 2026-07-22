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
  music: {
    enabled: true,
    url: '/music/MysteryofLove.mp3',
    fileName: 'Mystery of Love.mp3',
    startOffset: 0,
    endOffset: 300,
    loop: true,
    volume: 0.5,
  },
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
        albumTitle: 'Our Memory Scrapbook 📖✨',
        palette: 'sage',
        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        pages: [
          {
            id: 'page-1',
            title: 'Chapter I: Where It All Began',
            layout: 'journal',
            journalText: `Some memories feel like warm sunlight on a crisp morning.

Looking back at these photographs reminds me of how every small moment built something so beautiful.

Flip the polaroid to see what I wrote on the back for you 💌`,
            photos: [
              {
                id: 'p1',
                url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
                caption: 'Golden hour magic ✨',
                date: 'Oct 14, 2024',
                location: 'Sunset Point Park',
                secretNote: 'We stayed until the very last light. You smiled and said the sky looked like painted cotton candy. I will never forget that moment.',
                tapeStyle: 'floral',
                filter: 'glow',
                sticker: 'heart',
              },
            ],
          },
          {
            id: 'page-2',
            title: 'Chapter II: Favorite Days',
            layout: 'grid2x2',
            photos: [
              {
                id: 'p2',
                url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=500&q=80',
                caption: 'Sunflower field 🌻',
                date: 'Aug 22, 2024',
                location: 'Sunny Valley Farms',
                secretNote: 'You ran ahead into the flowers and turned around just in time for me to snap this picture!',
                tapeStyle: 'grid',
                filter: 'vintage',
                sticker: 'stamp',
              },
              {
                id: 'p3',
                url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=500&q=80',
                caption: 'Cozy mornings ☕',
                date: 'Nov 03, 2024',
                location: 'Little Corner Cafe',
                secretNote: 'Hot cocoa with extra marshmallows, just the way you love it.',
                tapeStyle: 'pastel',
                filter: 'grain',
                sticker: 'star',
              },
              {
                id: 'p4',
                url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500&q=80',
                caption: 'Stargazing night 🌟',
                date: 'Sep 18, 2024',
                location: 'Highland Hilltop',
                secretNote: 'We counted five shooting stars together. I wished for forever.',
                tapeStyle: 'clear',
                filter: 'bw',
                sticker: 'ribbon',
              },
              {
                id: 'p5',
                url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
                caption: 'Ocean breeze 🌊',
                date: 'Jul 12, 2024',
                location: 'Sandy Cove Beach',
                secretNote: 'Salty hair, barefoot in the sand, and completely free.',
                tapeStyle: 'floral',
                filter: 'normal',
                sticker: 'heart',
              },
            ],
          },
          {
            id: 'page-3',
            title: 'Chapter III: The Hero Snapshot',
            layout: 'single',
            journalText: `If I had to pick just one frame to capture the essence of our adventures, it would be this one right here.`,
            photos: [
              {
                id: 'p6',
                url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
                caption: 'Laughter under the trees 🌿',
                date: 'Oct 28, 2024',
                location: 'Botanical Gardens',
                secretNote: 'You started laughing randomly and couldn’t stop. It was the most contagious sound in the world.',
                tapeStyle: 'grid',
                filter: 'glow',
                sticker: 'star',
              },
            ],
          },
          {
            id: 'page-4',
            title: 'Chapter IV: Scrapbook Snippets',
            layout: 'scrapbook',
            photos: [
              {
                id: 'p7',
                url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&q=80',
                caption: 'Mountain trail 🏔️',
                date: 'May 15, 2024',
                location: 'Pine Ridge Trail',
                secretNote: 'We reached the peak right at noon. Worth every step of the climb!',
                tapeStyle: 'pastel',
                filter: 'vintage',
                sticker: 'stamp',
                rotation: -3,
              },
              {
                id: 'p8',
                url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80',
                caption: 'Celebration 🥂',
                date: 'Dec 31, 2024',
                location: 'Rooftop Terrace',
                secretNote: 'Cheering into the new year surrounded by sparkles.',
                tapeStyle: 'floral',
                filter: 'glow',
                sticker: 'ribbon',
                rotation: 4,
              },
            ],
          },
        ],
        // Legacy fallback array
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=300&q=80',
            caption: 'Sunflower days 🌻',
            rotation: -3,
            x: 20,
            y: 40,
          },
        ],
      },
    },
    calendar: {
      enabled: true,
      config: {
        year: 2025,
        month: 7,
        palette: 'rose',
        title: 'Our Special Memory Dates 📅✨',
        highlightedDay: 13,
        memoryTitle: 'The Day This Was Made For You 💌',
        memoryText: 'On this day, someone thought of you and decided to make something just for you. Remember this feeling — you are worth all this love and more.',
        memoryPhotoUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
        memories: [
          {
            id: 'mem-1',
            day: 7,
            month: 7,
            year: 2025,
            icon: '☕',
            title: 'First Coffee Date ☕',
            text: 'We talked for three hours straight until the cafe closed! You ordered a vanilla latte.',
            location: 'Little Corner Cafe',
            photoUrl: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=600&q=80',
          },
          {
            id: 'mem-2',
            day: 13,
            month: 7,
            year: 2025,
            icon: '💌',
            title: 'The Day Desktop Dear Created 💌',
            text: 'On this day, someone thought of you and decided to make something just for you. Remember this feeling — you are worth all this love and more.',
            location: 'Secret Admirer Studio',
            photoUrl: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80',
          },
          {
            id: 'mem-3',
            day: 22,
            month: 7,
            year: 2025,
            icon: '🌻',
            title: 'Sunflower Field Trip 🌻',
            text: 'Running through the fields under the warm summer sun. One of the best days ever!',
            location: 'Sunny Valley Farms',
            photoUrl: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=600&q=80',
          },
          {
            id: 'mem-4',
            day: 28,
            month: 7,
            year: 2025,
            icon: '🌟',
            title: 'Stargazing Night 🌟',
            text: 'Blankets, hot tea, and counting shooting stars together under the open sky.',
            location: 'Highland Hilltop',
            photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80',
          },
        ],
      },
    },
    secret: {
      enabled: true,
      config: {
        passwordHint: 'Complete the Heart Maze game to find it! 🔑',
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
    purr: {
      enabled: true,
      config: {
        catName: 'Lemon',
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
  purr: '🐱',
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
  purr: 'Cat Purr',
};
