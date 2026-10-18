// PipChat's brain. Rules, not a model: a list of intents, each with a test and
// a pool of replies in Pip's voice. First match wins, so the order matters —
// specific things (a name, a secret) sit above the general ones.

export interface Ctx {
  /** What the visitor told us their name is, if they have. */
  name?: string;
  /** Which eggs they haven't found yet, for the "secrets" intent. */
  unfound: { id: string; hint: string }[];
  /** Apps Pip can offer to open. */
  apps: { id: string; label: string }[];
  /** Night or sunrise, so Pip can mention it. */
  theme: 'night' | 'sunrise';
}

export interface Reply {
  /** Lines Pip says, one bubble each. */
  lines: string[];
  /** Optional side effect: play a tune, open an app, remember a name. */
  act?: { kind: 'sing' } | { kind: 'open'; app: string } | { kind: 'remember'; name: string } | { kind: 'away' };
  /** Suggested follow-ups the visitor can tap. */
  chips?: string[];
}

export interface Intent {
  id: string;
  test: (text: string) => RegExpMatchArray | boolean | null;
  reply: (m: RegExpMatchArray | boolean | null, ctx: Ctx, text: string) => Reply;
}

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export const QUICK_CHIPS = ['hi pip!', 'what do you do?', 'sing something', 'tell me a story', 'any secrets?', "what's here?"];

export const INTENTS: Intent[] = [
  {
    id: 'name',
    test: (t) => t.match(/\b(?:my name is|i'?m|i am|call me)\s+([a-z][a-z' -]{0,22})/i),
    reply: (m) => {
      const name = (m as RegExpMatchArray)[1].trim().replace(/\s+/g, ' ').slice(0, 22);
      return {
        lines: [`${name}! okay. i wrote it on my hand so i don't forget.`, 'hi hi hi!'],
        act: { kind: 'remember', name },
        chips: ['what do you do?', 'any secrets?'],
      };
    },
  },
  {
    id: 'greeting',
    test: (t) => /\b(hi|hey|hello|yo|hiya|good evening|goodnight pip|howdy)\b/i.test(t),
    reply: (_m, ctx) => ({
      lines: [ctx.name ? `${ctx.name}!! you came back to my chat window.` : pick(['oh! hi!! someone is typing to me.', 'hi hi hi! nobody ever messages me.', 'hello!! i was just sitting here.'])],
      chips: ['what do you do?', 'sing something'],
    }),
  },
  {
    id: 'who',
    test: (t) => /\b(who are you|what are you|your name|about you|are you a (ghost|skeleton|skull|baby))\b/i.test(t),
    reply: () => ({
      lines: ["i'm pip! i'm a baby. i have a skull face — it's very smooth, that's my best feature.", 'i live at the midnight nursery. i am NOT scary, i checked.'],
      chips: ["what's your job?", 'favourite thing?'],
    }),
  },
  {
    id: 'job',
    test: (t) => /\b(job|work|do you do|what do you make|career|employed|title)\b/i.test(t),
    reply: () => ({
      lines: ['junior dream engineer!! granny owl gave me the badge herself.', 'i make lullabies, nightlights, dream maps, toys, and one book. the night shift is mine.'],
      chips: ["what's here?", 'tell me a story'],
    }),
  },
  {
    id: 'food',
    test: (t) => /(eat|eating|ate|food|hungry|snack|dinner|breakfast|lunch|supper|milk|cake|biscuit|cookie|sweets|drink|taste)/i.test(t),
    reply: () => ({
      lines: [
        pick([
          "i don't really eat. i am mostly bones and enthusiasm.",
          'granny owl says i run on warm milk and not sleeping. she is a bit right.',
          'i tried a biscuit once. it went straight through. we do not talk about it.',
          'i eat the little hum a music box makes just before the song starts. it is very filling.',
        ]),
      ],
      chips: ['what do you do?', 'any secrets?'],
    }),
  },
  {
    id: 'favourite',
    test: (t) => /\b(favourite|favorite|like best|best thing|love most)\b/i.test(t),
    reply: () => ({
      lines: [pick(['noises. any noises. i do not like quiet at all.', 'the little clink the music box makes before the song starts.', 'the moment a creature finally falls asleep. i hold my breath for it.'])],
      chips: ['what scares you?'],
    }),
  },
  {
    id: 'scared',
    test: (t) => /\b(scare|scared|afraid|frightened|spooky|creepy|nightmare)\b/i.test(t),
    reply: () => ({
      lines: ['silence. a room with no sound in it. that is the scary one.', "the dark is fine! the dark is cosy. i made boo a little moon so he'd know."],
      chips: ['who is boo?'],
    }),
  },
  {
    id: 'boo',
    test: (t) => /\b(boo|ghost|nibbles|mouse|fern|frog|granny|owl|friends|cast)\b/i.test(t),
    reply: () => ({
      lines: ['boo is a ghost who was scared of the dark. nibbles is a mouse who missed the stars. fern is a frog who thinks too much at bedtime.', 'and granny owl is my boss. she is very old and very fair.'],
      chips: ['tell me a story'],
    }),
  },
  {
    id: 'sing',
    test: (t) => /\b(sing|song|lullaby|music|hum|tune|play something)\b/i.test(t),
    reply: () => ({
      lines: ['okay okay listen — ♪', '…that one is called "the cloud that hummed". i wrote it.'],
      act: { kind: 'sing' },
      chips: ['again!', 'what do you do?'],
    }),
  },
  {
    id: 'story',
    test: (t) => /\b(story|tale|read|book|bedtime)\b/i.test(t),
    reply: () => ({
      lines: ['once there was a ghost called boo, who was afraid of the dark.', 'so he borrowed the moon. the whole sky went dark and the owls bumped into chimneys.', 'so i made him a little one. just boo-sized. the end! (the long version is in my book.)'],
      act: { kind: 'open', app: 'bedtime' },
      chips: ['any secrets?'],
    }),
  },
  {
    id: 'joke',
    test: (t) => /\b(joke|funny|laugh|pun|make me laugh)\b/i.test(t),
    reply: () => ({
      lines: [
        pick([
          "why did the ghost go to bed early? he was all boo-ed out. …i'll practise.",
          'what do you call a skeleton who sleeps in? bone idle. granny owl did NOT laugh.',
          'knock knock. …who\'s there. …it\'s me, pip. i live here. that\'s the joke.',
        ]),
      ],
      chips: ['another one', 'sing something'],
    }),
  },
  {
    id: 'compliment',
    test: (t) => /\b(cute|adorable|love you|lovely|amazing|great|awesome|good job|well done|proud|nice|sweet|best)\b/i.test(t),
    reply: (_m, ctx) => ({
      lines: [pick(['*giggles* stop it. …no, keep going.', 'oh!! i am going to think about that all night.', ctx.name ? `thank you ${ctx.name}. i will write that in my notes.` : 'thank you!! i work very hard.'])],
      chips: ["what's here?"],
    }),
  },
  {
    id: 'whatshere',
    test: (t) => /\b(what('?s| is) here|what can i do|show me|where (do i|should i)|explore|help|apps|menu)\b/i.test(t),
    reply: (_m, ctx) => ({
      lines: ['oh! lots. my lullaby lab, my nightlights, my dream map, my toys, my book, and my growth chart.', 'want me to open one? just say the name.'],
      chips: ctx.apps.slice(0, 4).map((a) => `open ${a.label}`),
    }),
  },
  {
    id: 'open',
    test: (t) => /\b(open|launch|start|show|go to|take me to)\b/i.test(t),
    reply: (_m, ctx, text) => {
      const found = ctx.apps.find((a) => {
        // match on the app's first real word: "Dream_Routes.map" -> "Dream"
        const word = a.label.split(/[\s_&.]+/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return word.length > 2 && new RegExp(word, 'i').test(text);
      });
      if (!found) return { lines: ["which one? i have lullabies, nightlights, routes, toys, my book and my chart."], chips: ctx.apps.slice(0, 4).map((a) => `open ${a.label}`) };
      return { lines: [`opening ${found.label}! mind the glitter.`], act: { kind: 'open', app: found.id } };
    },
  },
  {
    id: 'secrets',
    test: (t) => /\b(secret|hidden|easter ?egg|egg|cheat|unlock|surprise)\b/i.test(t),
    reply: (_m, ctx) => {
      if (!ctx.unfound.length) return { lines: ['you found every single one. i have nothing left to hide. …that is a bit scary actually.'] };
      const e = pick(ctx.unfound);
      return { lines: ['hmm. okay. one clue. only one.', `“${e.hint}”`, "that's all you're getting."], chips: ['another clue'] };
    },
  },
  {
    id: 'goodnight',
    test: (t) => /\b(goodnight|good night|bye|night night|see you|gtg|sleep (well|now)|later)\b/i.test(t),
    reply: (_m, ctx) => ({
      lines: [ctx.name ? `goodnight ${ctx.name}. i'll keep a star on for you.` : "goodnight! i'll keep a star on for you.", 'zzz…'],
      act: { kind: 'away' },
    }),
  },
  {
    id: 'thanks',
    test: (t) => /\b(thanks|thank you|ty|cheers)\b/i.test(t),
    reply: () => ({ lines: ['you are welcome!! that is my job.'], chips: ["what's here?"] }),
  },
  {
    id: 'howareyou',
    test: (t) => /\b(how are you|how'?s it going|you ok|you okay|what'?s up)\b/i.test(t),
    reply: (_m, ctx) => ({
      lines: [
        ctx.theme === 'night'
          ? pick([
              'sleepy but busy! the night shift is the good shift.',
              'good!! i have delivered four dreams and dropped one. it landed on a cat. the cat is fine.',
              'a bit tired. in a nice way. like a blanket that has been warmed up.',
            ])
          : pick([
              'the sun is visiting! i do not know what to do with myself.',
              'awake! at the WRONG time! this is very exciting and slightly wrong.',
              'daytime me is a completely different baby. louder.',
            ]),
      ],
      chips: ['what do you do?'],
    }),
  },
];

export const FALLBACK: Reply = {
  lines: ["hmm, i don't know that one. i'm only a baby.", 'ask me about dreams? or secrets. i like secrets.'],
  chips: ['any secrets?', 'what do you do?', 'sing something'],
};

export function respond(text: string, ctx: Ctx): Reply {
  for (const intent of INTENTS) {
    const m = intent.test(text);
    if (m) return intent.reply(m, ctx, text);
  }
  return { ...FALLBACK, lines: [...FALLBACK.lines] };
}
