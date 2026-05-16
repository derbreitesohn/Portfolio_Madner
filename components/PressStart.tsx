// components/PressStart.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react"; // Removed the unused useEffect import
import GlitchText from "./ui/GlitchText";

interface PressStartProps {
  onStart: () => void;
}

export default function PressStart({ onStart }: PressStartProps) {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    setVisible(false);
    setTimeout(onStart, 600);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          onClick={handleClick}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top status bar */}
          <div className="absolute top-6 left-6 text-xs tracking-widest font-mono text-[#1a3a1a]">
            SYS://PORTFOLIO_OS_v2.0.77
          </div>
          <div className="absolute top-6 right-6 text-xs tracking-widest font-mono text-[#1a3a1a]">
            セクター_32 ◈ READY
          </div>

          {/* Center content */}
          <motion.div
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Decorative top line */}
            <div className="text-xs tracking-[0.4em] mb-2 font-mono text-[#0a2a0a]">
              ══════════════════════════════════
            </div>

            {/* Main title */}
            <div className="text-center">
              {/* Converted the style object into Tailwind arbitrary classes to fix the TS error */}
              <GlitchText
                text="PORTFOLIO.EXE"
                className="text-5xl md:text-7xl font-bold tracking-widest font-mono text-[#00ff46] [text-shadow:0_0_20px_rgba(0,255,70,0.8),_0_0_60px_rgba(0,255,70,0.3)]"
                glitchIntensity={0.04}
              />
            </div>

            {/* Subtitle */}
            <div className="text-xs tracking-[0.5em] text-center font-mono text-[#006622]">
              ◈ NEURAL_LINK INTERFACE ◈ BUILD 2077.04.29 ◈
            </div>

            {/* Press start prompt */}
            <motion.div
              // Merged the inline styles to Tailwind classes here too
              className="mt-8 text-sm tracking-[0.35em] uppercase font-mono text-[#00ff46] [text-shadow:0_0_10px_rgba(0,255,70,0.6)]"
              animate={{ opacity: [1, 0, 1] }}
              // Changed ease: "steps(1)" to ease: "linear" to fix Framer Motion TS error
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              ▶ CLICK ANYWHERE TO INITIALIZE ◀
            </motion.div>

            {/* Decorative bottom */}
            <div className="text-xs tracking-[0.4em] mt-2 font-mono text-[#0a2a0a]">
              ══════════════════════════════════
            </div>
          </motion.div>

          {/* Bottom bar */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 text-xs font-mono text-[#0d200d]">
            <span>▓▓▒▒░░ MEMORY: 64K FREE</span>
            <span>◈ ◈ ◈</span>
            <span>INSERT COIN ░░▒▒▓▓</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}