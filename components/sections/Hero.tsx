// components/sections/Hero.tsx
"use client";

import { motion } from "framer-motion";
import GlitchText from "../ui/GlitchText";

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-sm tracking-[0.4em] text-neon-magenta mb-4">SYSTEM INITIALIZED // v2.0.77</h2>
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          <GlitchText text="FLORIAN MADNER" />
        </h1>
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto tracking-wide font-light">
          Full Stack Engineer & Creative Developer specializing in <span className="text-neon-cyan">Immersive Digital Experiences</span>.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/40">SCROLL TO EXPLORE</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-neon-cyan to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
