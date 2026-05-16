"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="flex flex-col items-center justify-center text-center w-full py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl space-y-8"
      >
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight uppercase">
          Crafting worlds, <br />line by line.
        </h2>
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mx-auto max-w-2xl">
          I bridge the gap between aesthetics and engineering. Whether it's a high-performance web application or an immersive 3D game world, I focus on creating polished, user-centric experiences.
        </p>
        <div className="flex flex-col items-center gap-6 pt-4">
          <div className="h-[1px] w-24 bg-white/20" />
          <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-600">Biography // Intel</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-4xl aspect-video bg-gray-900/50 mt-20 rounded-sm overflow-hidden border border-white/5 relative group"
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-black text-4xl md:text-7xl select-none opacity-20">
          VISUAL_PROTOTYPE
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </motion.div>
    </section>
  );
}
