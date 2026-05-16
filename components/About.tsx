"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="w-full flex flex-col items-center text-center pt-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl space-y-10"
      >
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase">
          Crafting worlds, <br />line by line.
        </h2>
        
        <div className="w-16 h-[2px] bg-white mx-auto my-8" />
        
        <p className="text-gray-400 text-lg md:text-2xl leading-relaxed font-light">
          I bridge the gap between aesthetics and engineering. Whether it's a high-performance web application or an immersive 3D game world, I focus on creating polished, user-centric experiences.
        </p>
        
        <div className="pt-10 flex flex-col items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gray-600">Established // MMXXVI</span>
        </div>
      </motion.div>

      {/* Hero-style visual centered below text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full max-w-5xl aspect-[16/9] bg-gray-900/30 mt-24 rounded-sm border border-white/5 flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        <span className="text-gray-800 font-black text-4xl md:text-8xl tracking-tighter select-none opacity-20">SYSTEM_PREVIEW</span>
      </motion.div>
    </section>
  );
}
