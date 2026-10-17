// Every line Pip says lives here, in Pip's own voice.
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const lines = {
  firstHello: "oh! hi!! you found my room. 🌙",
  returning: (n: number) => `you came back! visit #${n}. i saved you a star.`,
  missed: 'i missed you! i made a new lullaby.',
  computerHint: 'psst… click my computer! ✨',
  giggles: [
    'hehe! that tickles.',
    'boop! you booped me.',
    '*giggles* again! again!',
    "my skull is very smooth. it's my best feature.",
    'hi hi hi!',
    "i'm a junior dream engineer, you know.",
  ],
  idle: "*yawn*… still there? it's very quiet… i don't like quiet.",
  wake: 'oh! i was just resting my eye sockets.',
  mute: "…okay. i'll be quiet. *puts on earmuffs*",
  unmute: 'yay, noises!',
  morning: 'good morning! the sun is visiting.',
  night: 'time for dreams…',
  secretHint: [
    'you keep booping me…',
    'hmm, something is waking up…',
    'one more and something happens!',
  ],
  secretFound: 'oh no. you found my secret file. promise not to wake me?',
  desktopHello: 'welcome to my office! double-click anything.',
  desktopHelloTouch: 'welcome to my office! tap anything.',
  whoa: 'whoa, the room is moving!',
  teddy: 'Pip is actually very good at naps.',
};

export const appHello: Record<string, string> = {
  mypip: "that's me! hi!",
  lullaby: "creatures can't sleep without a song. so i make them!",
  nightlights: 'everyone is scared of something. so i make a light for each of them.',
  routes: 'help me deliver tonight’s dreams?',
  toys: 'i invented toys! some of them even work.',
  bedtime: 'i wrote a book! and drew it! (be nice.)',
  growth: 'granny owl measures me every full moon!',
  story: 'this is how i got here…',
  wishes: 'leave me a wish? pleeease?',
  chat: 'you want to talk to me?! yes!!',
  stickers: 'my sticker collection!',
  lantern: 'lights out! use my lantern.',
  gravity: 'uh oh. who turned on gravity?',
  socks: "that's where socks go to dream.",
  devnotes: "hey! those are my private notes! …okay, you can read them.",
  credits: 'these are all my friends who helped!',
  secretfile: 'shhh…',
};
