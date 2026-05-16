"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Crafting worlds, <br />line by line.
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
          I bridge the gap between aesthetics and engineering. Whether it's a high-performance web application or an immersive 3D game world, I focus on creating polished, user-centric experiences.
        </p>
        <div className="flex gap-4 pt-4">
          <div className="h-[1px] w-12 bg-white self-center hidden md:block" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-500">Biography</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="aspect-square bg-gray-900 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 relative group border border-white/5"
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-black text-9xl select-none">
          IMG
        </div>
        <div className="absolute inset-0 border-[20px] border-black/50 pointer-events-none" />
      </motion.div>
    </section>
  );
}
