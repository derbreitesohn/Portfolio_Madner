"use client";

import { motion } from "framer-motion";

interface ThreePlaceholderProps {
  onBack: () => void;
}

export default function ThreePlaceholder({ onBack }: ThreePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]"
    >
      <div className="space-y-8 text-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white font-mono tracking-[0.5em] text-sm uppercase"
        >
          3D Canvas Loading...
        </motion.div>
        
        <button
          onClick={onBack}
          className="px-6 py-3 border border-white/20 text-white/50 hover:text-white hover:border-white transition-all text-xs uppercase tracking-widest font-bold"
        >
          Back to Standard View
        </button>
      </div>

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#ffffff11 1px, transparent 1px), linear-gradient(90deg, #ffffff11 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </motion.div>
  );
}
