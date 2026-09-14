export const personalInfo = {
  name: "Flo Madner",
  address: "3071 Böheimkirchen, Austria",
  birthday: "April 15, 2005",
  citizenship: "Austria",
  phone: "+43 68110716937",
  email: "flomadner@gmail.com",
  socials: {
    github: "https://github.com/derbreitesohn",
    linkedin: "https://www.linkedin.com/in/flo-madner/",
  },
};

export const cvData = {
  personalInfo,
  experience: [
    {
      role: "AI Automation Specialist",
      company: "GVS Austria e.U.",
      period: "Jun – Aug 2026",
      description: "Worked on optimizing and automating internal and external processes in a full-time role.",
    },
    {
      role: "Student Assistant",
      company: "USTP – University of Applied Sciences St. Pölten",
      period: "Feb – May 2026",
      description: "Part-time student assistant alongside my Creative Computing studies.",
    },
  ],
  education: [
    {
      degree: "Computer Science · Creative Computing",
      school: "University of Applied Sciences St. Pölten",
      period: "Sep 2024 – Present",
    },
  ],
  skills: {
    advanced: [
      "Blender",
      "C#",
      "Database Systems",
      "Frontend",
      "JavaScript",
      "Node.js",
      "Python",
      "RAG",
      "React",
      "SQL",
      "UI/UX",
    ],
    basic: ["Angular", "Docker", "N8N", "VBA", "Vue.js"],
  },
  languages: [
    { language: "German", level: "Native" },
    { language: "English", level: "Fluent" },
    { language: "French", level: "Basic" },
    { language: "Turkish", level: "Basic" },
  ],
  softSkills: [
    "Creativity",
    "Accuracy",
    "Independence",
    "Self-motivation",
    "Fast Learner",
    "Time Management",
    "Empathy",
    "Spontaneity",
    "Diligence",
    "Planning",
    "Goal-oriented",
    "Discipline",
    "Honesty",
  ],
  interests: ["Programming", "UI/UX", "Producing Music", "Sports", "Crocheting"],
};

export const cvDocument = {
  href: "/cv/flo-madner-cv-de.pdf",
  filename: "Flo-Madner-CV-DE.pdf",
  details: "German · PDF · 3 pages",
  updated: "18 August 2026",
};

export const skillGroups = [
  { title: "Web & interfaces", tools: "React, TypeScript, JavaScript, Node.js, SQL, UI/UX" },
  { title: "Games & 3D", tools: "Unity, C#, Blender, Three.js, Wwise" },
  { title: "Automation & data", tools: "Python, RAG, API integrations" },
];


export type ProjectLink = { href: string; label: string };

export type Project = {
  slug: string;
  title: string;
  displayTitle: string;
  category: string;
  period: string;
  description: string;
  technologies: string[];
  image: string;
  /** The GitHub repository. Every project has one. */
  source: ProjectLink;
  /** A hosted build you can actually open. null when there is nothing live to visit. */
  demo: ProjectLink | null;
};

// Live builds checked 14 September 2026. Re-check before publishing: a `demo`
// that 404s is worse than no demo at all.
//   liji-delta.vercel.app  404 — the repo has a Pages workflow but Pages is off.
//   steel-fang.vercel.app  404 — Unity project, no web build committed.
//   meniscus.vercel.app    200 but it is somebody else's component library,
//                          not the Unity game. Do not link it, whatever the
//                          repo's `homepage` field says.
export const projectsData: Project[] = [
  {
    slug: "pat-pat",
    title: "Pat Pat",
    displayTitle: "Pat Pat",
    category: "Full-stack web application",
    period: "02/2025 – Present",
    description:
      "A platform for pet owners to connect and arrange meetups. Built with a React frontend, a Node.js backend and a SQL database.",
    technologies: ["React", "Node.js", "Express", "SQL", "TypeScript"],
    source: { href: "https://github.com/derbreitesohn/ss2025_ccl_", label: "View source" },
    demo: { href: "https://patpat-three.vercel.app", label: "Visit website" },
    image: "/projects/patpat.png",
  },
  {
    slug: "meniscus",
    title: "Meniscus",
    displayTitle: "Meniscus",
    category: "Game development",
    period: "06/2026 – 07/2026",
    description:
      "A Unity game created during the fourth Creative Code Lab, bringing together custom Blender models and animations with Wwise audio integration.",
    technologies: ["Unity", "C#", "Blender", "Wwise"],
    source: { href: "https://github.com/derbreitesohn/Meniscus", label: "View source" },
    demo: null,
    image: "/projects/meniscus.png",
  },
  {
    slug: "liji",
    title: "Liji: Virtual Closet Tracker",
    displayTitle: "Liji",
    category: "Android application",
    period: "01/2026 – 02/2026",
    description:
      "A native Android wardrobe tracker with cost-per-wear calculations and sustainability scores. A local SQLite database keeps items and outfits available offline.",
    technologies: ["Kotlin", "Android Studio", "SQLite", "Figma", "Jetpack Compose"],
    source: { href: "https://github.com/derbreitesohn/Liji", label: "View source" },
    demo: null,
    image: "/projects/liji.png",
  },
  {
    slug: "ccl1-pawsup",
    title: "CCL1-PawsUp",
    displayTitle: "PawsUp",
    category: "Browser game",
    period: "01/2025 – 04/2026",
    description: "A JavaScript browser game created for my first Creative Code Lab. One of my earliest projects exploring interactive game development for the web.",
    technologies: ["JavaScript"],
    source: { href: "https://github.com/derbreitesohn/CCL1-PawsUp", label: "View source" },
    demo: { href: "https://derbreitesohn.github.io/CCL1-PawsUp/", label: "Play in browser" },
    image: "/projects/pawsup.png",
  },
  {
    slug: "portfolio",
    title: "Portfolio_Madner",
    displayTitle: "The Flooded Museum",
    category: "Interactive 3D portfolio",
    period: "04/2026 – Present",
    description: "My portfolio as a place to explore. Modelled and textured in Blender, then brought into the browser with Three.js: walk through the overgrown museum and open the projects inside its frames.",
    technologies: ["Blender", "Three.js", "Next.js", "TypeScript"],
    source: { href: "https://github.com/derbreitesohn/Portfolio_Madner", label: "View source" },
    demo: { href: "https://portfolio-madner.vercel.app", label: "Open live site" },
    image: "/museum/preview.webp",
  },
  {
    slug: "steelfang",
    title: "SteelFang",
    displayTitle: "SteelFang",
    category: "Game development",
    period: "05/2026",
    description: "My first 2D platformer in Unity. A starting point for learning game development with C# before moving into larger game and 3D projects.",
    technologies: ["C#", "Unity"],
    source: { href: "https://github.com/derbreitesohn/SteelFang", label: "View source" },
    demo: null,
    image: "/projects/steelfang.png",
  },
];

/** What a cover image or a single call-to-action should open: the live build when there is one. */
export const primaryLink = (project: Project): ProjectLink => project.demo ?? project.source;
