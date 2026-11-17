const img = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

type Seed = {
  title: string;
  slug: string;
  type: "blog" | "article";
  status: "published";
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  publishedAt: Date;
};

const day = 24 * 3600 * 1000;
const ago = (n: number) => new Date(Date.now() - n * day);

export const SEED_POSTS: Seed[] = [
  {
    title: "Welcome to the New Blog: What to Expect",
    slug: "welcome-to-the-new-blog",
    type: "blog",
    status: "published",
    category: "Updates",
    excerpt: "A quick tour of what we will publish here, and how Blogs and Articles differ.",
    coverImage: img(1181449),
    metaTitle: "Welcome to the New Blog",
    metaDescription: "A quick tour of what we will publish here, and how Blogs and Articles differ.",
    featured: true,
    publishedAt: ago(1),
    content: `<h2>Hello, world</h2><p>We are thrilled to finally open the doors. This site is home to two kinds of writing: casual, personal <strong>Blogs</strong> and deeper, research-driven <strong>Articles</strong>.</p><p>Blogs are where we share updates, behind-the-scenes notes and personal stories. They are quick to read and written in a relaxed voice.</p><h3>What comes next</h3><p>Expect a steady stream of new posts, with every article carefully researched and every blog written from the heart.</p><p>Thanks for stopping by – feel free to explore, search and send us a message through the contact page.</p>`,
  },
  {
    title: "The Complete Guide to Building a Focused Home Workspace",
    slug: "guide-to-building-a-focused-home-workspace",
    type: "article",
    status: "published",
    category: "Productivity",
    excerpt: "Research-backed ideas for designing a desk, lighting and routine that keep you in flow.",
    coverImage: img(1466609),
    metaTitle: "Guide to Building a Focused Home Workspace",
    metaDescription: "Research-backed ideas for designing a desk, lighting and routine that keep you in flow.",
    featured: true,
    publishedAt: ago(2),
    content: `<h2>Why your environment matters</h2><p>Studies on environmental psychology consistently show that our surroundings shape our attention. A cluttered, poorly lit desk increases cognitive load, while a deliberate workspace makes deep work easier to start and easier to sustain.</p><p>In this guide we break down the main factors: lighting, ergonomics, noise, and visual clutter.</p><h2>Lighting</h2><p>Natural light is ideal. Position your desk perpendicular to a window to reduce glare, and add a warm, dimmable lamp for evenings.</p><blockquote>Good lighting is the cheapest productivity upgrade you can make.</blockquote><h2>Ergonomics</h2><p>Keep your screen at eye level, your elbows at roughly 90 degrees, and your feet flat on the floor. Take short movement breaks every 45 to 60 minutes.</p><p>Small adjustments compound over months and can prevent long-term strain.</p><h2>Reducing clutter</h2><p>Keep only the tools you use daily within arm's reach. Everything else belongs in a drawer or shelf.</p><ul><li>One notebook, one pen</li><li>One plant for a calmer feel</li><li>One clear surface for the task at hand</li></ul>`,
  },
  {
    title: "Three Small Habits That Changed My Mornings",
    slug: "three-small-habits-that-changed-my-mornings",
    type: "blog",
    status: "published",
    category: "Lifestyle",
    excerpt: "No 5 a.m. miracle routine here – just three tiny changes that actually stuck.",
    coverImage: img(34140),
    metaTitle: "Three Small Habits That Changed My Mornings",
    metaDescription: "No 5 a.m. miracle routine here – just three tiny changes that actually stuck.",
    featured: false,
    publishedAt: ago(3),
    content: `<p>I have tried every morning routine on the internet. Most lasted a week. These three have lasted a year.</p><h2>1. Water before coffee</h2><p>It sounds trivial, but a glass of water first thing makes me feel more awake than the coffee does.</p><h2>2. Ten minutes of quiet</h2><p>No phone, no podcast. Just ten minutes with a notebook. Some days I write, some days I just stare out the window.</p><h2>3. Plan one thing</h2><p>Instead of a long to-do list, I choose the one task that would make the day a success.</p><p>That is it. Small, boring, and surprisingly effective.</p>`,
  },
  {
    title: "How Modern Web Performance Really Works",
    slug: "how-modern-web-performance-really-works",
    type: "article",
    status: "published",
    category: "Technology",
    excerpt: "From Core Web Vitals to edge caching: an explanation of what makes sites feel fast.",
    coverImage: img(11129922),
    metaTitle: "How Modern Web Performance Really Works",
    metaDescription: "From Core Web Vitals to edge caching: an explanation of what makes sites feel fast.",
    featured: true,
    publishedAt: ago(4),
    content: `<h2>Speed is a feature</h2><p>Users form an opinion about your site within a fraction of a second. Performance is not just a technical metric; it directly affects engagement, conversion and search ranking.</p><p>Google's Core Web Vitals measure three things: how quickly the main content loads (LCP), how responsive the page is to input (INP), and how stable the layout is while loading (CLS).</p><h2>The biggest wins</h2><ul><li>Serve properly sized, compressed images</li><li>Ship less JavaScript</li><li>Cache aggressively at the edge</li><li>Reserve space for images and ads to avoid layout shift</li></ul><p>Most sites can improve dramatically by tackling just these four areas.</p><h2>Measure, then optimize</h2><p>Use field data from real users alongside lab tools. What feels fast on your laptop may not on a mid-range phone with a slow connection.</p>`,
  },
  {
    title: "Notes from a Weekend Without Screens",
    slug: "notes-from-a-weekend-without-screens",
    type: "blog",
    status: "published",
    category: "Lifestyle",
    excerpt: "I turned everything off for 48 hours. Here is what I noticed.",
    coverImage: img(358103),
    metaTitle: "Notes from a Weekend Without Screens",
    metaDescription: "I turned everything off for 48 hours. Here is what I noticed.",
    featured: false,
    publishedAt: ago(5),
    content: `<p>Last weekend I turned off my phone and laptop from Friday evening until Sunday night. I expected to be bored. I was – for about three hours.</p><p>After that, time stretched out. I read an entire book, cooked properly, and went for a long walk without a podcast.</p><h2>What I noticed</h2><p>My attention felt wider, and my thoughts less jumpy. I also noticed how often I reach for my phone out of pure habit.</p><p>I will not quit screens forever, but I will definitely do this again.</p>`,
  },
  {
    title: "Understanding Sleep: The Science Behind a Good Night's Rest",
    slug: "understanding-sleep-the-science-behind-a-good-nights-rest",
    type: "article",
    status: "published",
    category: "Health",
    excerpt: "Sleep cycles, circadian rhythms and the evidence-based habits that improve sleep quality.",
    coverImage: img(1128207),
    metaTitle: "Understanding Sleep: The Science of a Good Night's Rest",
    metaDescription: "Sleep cycles, circadian rhythms and the evidence-based habits that improve sleep quality.",
    featured: false,
    publishedAt: ago(6),
    content: `<h2>The architecture of sleep</h2><p>A typical night consists of four to six cycles of roughly 90 minutes, each moving through light sleep, deep sleep and REM sleep. Deep sleep supports physical restoration, while REM is linked to memory and emotional processing.</p><p>Interrupting these cycles, whether through noise, light or irregular schedules, reduces the restorative value of sleep.</p><h2>Evidence-based habits</h2><ul><li>Keep a consistent sleep and wake time</li><li>Get bright light in the morning</li><li>Avoid caffeine in the late afternoon</li><li>Keep the bedroom cool, dark and quiet</li></ul><p>None of these is dramatic on its own, but together they have strong support in sleep research.</p><p><em>This content is informational and not medical advice.</em></p>`,
  },
];
