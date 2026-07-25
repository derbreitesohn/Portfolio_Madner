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
      period: "06/2026 – Present",
      description: "Optimization and automation of internal and external processes.",
    },
    {
      role: "Student Assistant",
      company: "USTP – University of Applied Sciences St. Pölten",
      period: "02/2026 – 05/2026",
      description: "Part-time employment.",
    },
  ],
  education: [
    {
      degree: "Computer Science - Creative Computing",
      school: "University of Applied Sciences St. Pölten",
      period: "09/2024 – Present",
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

export const projectsData = [
  {
    slug: "pat-pat",
    title: "Pat Pat",
    period: "02/2025 – Present",
    description:
      "Development of several full-stack web applications, e.g., Pat Pat: A platform for pet owners to connect and organize meetups.",
    technologies: ["React", "Node.js", "Express", "SQL", "TypeScript"],
    link: "https://patpat-three.vercel.app",
    image: "/projects/patpat.png",
  },
  {
    slug: "meniscus",
    title: "Meniscus",
    period: "06/2026 – 07/2026",
    description:
      "Unity Game with Wwise integration and custom Blender models/animations. Project created during the 4th Creative Code Lab.",
    technologies: ["Unity", "C#", "Blender", "Wwise"],
    link: "https://meniscus.vercel.app",
    image: "/projects/meniscus.png",
  },
  {
    slug: "liji",
    title: "Liji: Virtual Closet Tracker",
    period: "01/2026 – 02/2026",
    description:
      "Native Kotlin App to optimize wardrobe usage through real-time 'Cost Per Wear' calculation and sustainability scores. Implemented a local SQLite database for offline-first functionality and management of complex relationships between items and outfits.",
    technologies: ["Kotlin", "Android Studio", "SQLite", "Figma", "Jetpack Compose"],
    link: "https://github.com/derbreitesohn/Liji",
    image: "/projects/liji.png",
  },
  {
    slug: "ccl1-pawsup",
    title: "CCL1-PawsUp",
    period: "01/2025 – 04/2026",
    description: "Creative Code Lab 1 Project.",
    technologies: ["JavaScript"],
    link: "https://derbreitesohn.github.io/CCL1-PawsUp/",
    image: "/projects/pawsup.png",
  },

  {
    slug: "portfolio",
    title: "Portfolio_Madner",
    period: "05/2026 - Present",
    description: "My interactive 3D portfolio.",
    technologies: ["TypeScript", "Next.js", "React", "Three.js"],
    link: "https://github.com/derbreitesohn/Portfolio_Madner",
  },
  {
    slug: "steelfang",
    title: "SteelFang",
    period: "05/2026",
    description: "My first Unity 2d Platformer.",
    technologies: ["C#", "Unity"],
    link: "https://github.com/derbreitesohn/SteelFang",
    image: "/projects/steelfang.png",
  },

];
