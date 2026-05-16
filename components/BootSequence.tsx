// components/BootSequence.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: "PORTFOLIO_OS v2.0.77 — BIOS INITIALIZATION", delay: 0 },
  { text: "Copyright (C) 2077 NEURAL_LINK Corp. All rights reserved.", delay: 120 },
  { text: "", delay: 80 },
  { text: "Performing memory check...", delay: 200 },
  { text: "RAM: 65536K OK", delay: 600 },
  { text: "", delay: 60 },
  { text: "Detecting hardware...", delay: 200 },
  { text: "CPU: GHOST_CORE v9 @ 4.20GHz ............. [OK]", delay: 400 },
  { text: "GPU: NEON_RENDER X ...................... [OK]", delay: 300 },
  { text: "NEURAL: SYNAPTIC_BRIDGE detected ........ [OK]", delay: 300 },
  { text: "", delay: 100 },
  { text: "Loading kernel modules:", delay: 200 },
  { text: "  [  0.000] kernel: CYBERPUNK_CORE 5.77.0 SMP", delay: 200 },
  { text: "  [  0.142] init: Starting Portfolio Management System...", delay: 300 },
  { text: "  [  0.391] NET: Registered protocol family AF_NEON", delay: 200 },
  { text: "  [  0.512] Input: HUMAN_INTERFACE_DEVICE as /dev/user", delay: 250 },
  { text: "", delay: 80 },
  { text: "Mounting filesystems:", delay: 200 },
  { text: "  /dev/sda1 on / type ext4 ........... [MOUNTED]", delay: 300 },
  { text: "  /dev/ghost on /projects ............ [MOUNTED]", delay: 250 },
  { text: "  /dev/neon on /contact .............. [MOUNTED]", delay: 250 },
  { text: "", delay: 100 },
  { text: "Starting services:", delay: 200 },
  { text: "  portfolio.service .................. [STARTED]", delay: 400 },
  { text: "  glitch-engine.service .............. [STARTED]", delay: 300 },
  { text: "  ambient-audio.service .............. [STARTED]", delay: 300 },
  { text: "", delay: 200 },
  { text: "SYSTEM BOOT COMPLETE", delay: 300 },
  { text: "Welcome to PORTFOLIO_OS. Type 'help' for commands.", delay: 200 },
];

const LOADING_STEPS = 20;

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineIndex = useRef(0);
  const charTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  // Type lines one by one
  useEffect(() => {
    SFX.boot();

    function typeNextLine() {
      if (lineIndex.current >= BOOT_LINES.length) {
        // All lines typed, show loading bar
        setShowLoading(true);
        return;
      }

      const { text, delay } = BOOT_LINES[lineIndex.current];
      lineIndex.current++;

      charTimeout.current = setTimeout(() => {
        setVisibleLines((prev) => [...prev, text]);
        if (text !== "") SFX.keypress();
        typeNextLine();
      }, delay + Math.random() * 40);
    }

    typeNextLine();
    return () => {
      if (charTimeout.current) clearTimeout(charTimeout.current);
    };
  }, []);

  // Animate loading bar after lines done
  useEffect(() => {
    if (!showLoading) return;
    SFX.startup();

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingProgress(step);
      SFX.keypress();
      if (step >= LOADING_STEPS) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => {
          SFX.select();
          setExiting(true);
          setTimeout(onComplete, 800);
        }, 600);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [showLoading, onComplete]);

  const filledBars = Math.floor(loadingProgress);
  const barFilled = "█".repeat(filledBars);
  const barEmpty = "░".repeat(LOADING_STEPS - filledBars);
  const percent = Math.floor((loadingProgress / LOADING_STEPS) * 100);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-40 bg-black flex flex-col p-6 md:p-10 crt-flicker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6 }}
        >
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden flex flex-col gap-0.5 text-xs md:text-sm leading-relaxed"
            style={{
              fontFamily: "monospace",
              color: "#00cc33",
              textShadow: "0 0 6px rgba(0,204,51,0.7)",
              overflowY: "hidden",
            }}
          >
            {visibleLines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {line === "" ? "\u00A0" : line}
              </div>
            ))}

            {/* Loading bar section */}
            {showLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex flex-col gap-2"
              >
                <div>Loading system resources...</div>
                <div className="flex items-center gap-2">
                  <span>[</span>
                  <span style={{ color: "#00ff46", letterSpacing: "0.05em" }}>
                    {barFilled}
                  </span>
                  <span style={{ color: "#003311" }}>{barEmpty}</span>
                  <span>]</span>
                  <span className="ml-2">{percent}%</span>
                </div>
                {done && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2"
                    style={{ color: "#00ff46" }}
                  >
                    ▶ INITIALIZATION COMPLETE — LAUNCHING INTERFACE...
                    <span className="cursor-blink ml-1">█</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}