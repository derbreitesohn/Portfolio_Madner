// components/ui/Navbar.tsx
"use client";

import { motion } from "framer-motion";

const NAV_LINKS = [
  { name: "HOME", href: "#hero" },
  { name: "ABOUT", href: "#about" },
  { name: "PROJECTS", href: "#projects" },
  { name: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center glass-morphism"
    >
      <div className="text-xl font-bold tracking-tighter text-neon-cyan">
        MADNER<span className="text-neon-magenta">_</span>OS
      </div>
      <div className="flex gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-xs tracking-widest hover:text-neon-cyan transition-colors duration-300"
          >
            {link.name}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
