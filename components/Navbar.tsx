"use client";

import { motion } from "framer-motion";

const LINKS = [
  { name: "About", href: "#about" },
  { name: "Work", href: "#projects" },
  { name: "Experience", href: "#experience" },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 backdrop-blur-md bg-black/10 border-b border-white/5"
    >
      <div className="text-xl font-black tracking-tighter">
        MADNER<span className="text-gray-500">.</span>
      </div>
      
      <div className="flex gap-8">
        {LINKS.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
