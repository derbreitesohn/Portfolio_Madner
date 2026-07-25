"use client";

import { motion } from "framer-motion";

interface HeroProps {
  onEnter3D: () => void;
}

export default function Hero({ onEnter3D }: HeroProps) {
  return (
    <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4">
          MADNER<span className="text-gray-500">.</span>
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base font-medium tracking-[0.2em] text-gray-400 mb-12 uppercase">
          <span>UI/UX</span>
          <span className="text-gray-700">/</span>
          <span>Dev</span>
          <span className="text-gray-700">/</span>
          <span>Game Engineer</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <button
            onClick={onEnter3D}
            className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors duration-300 rounded-sm"
          >
            Enter 3D Museum (WIP)
          </button>
        </div>
      </motion.div>

      {/* Decorative Background Element */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-transparent to-transparent pointer-events-none" />
    </section>
  );
}
