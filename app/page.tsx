"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
const MuseumExperience = dynamic(() => import("@/components/museum/MuseumExperience"), { ssr: false });

export default function Home() {
  const [is3DMode, setIs3DMode] = useState(false);

  return (
    <main className="bg-[#050505] text-white min-h-screen w-full font-sans selection:bg-white selection:text-black flex flex-col items-center">
      <AnimatePresence mode="wait">
        {is3DMode ? (
          <MuseumExperience key="three" onBack={() => setIs3DMode(false)} />
        ) : (
          <motion.div
            key="standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center"
          >
            <Navbar />
            <Hero onEnter3D={() => setIs3DMode(true)} />
            
            {/* 
                MANUAL SPACER STRATEGY
                We use empty divs with fixed height to FORCE the gap.
            */}
            <div className="w-full max-w-6xl px-6 flex flex-col items-center">
              
              <About />
              <div className="h-[200px] w-full" /> {/* Spacer */}

              <Projects />
              <div className="h-[200px] w-full" /> {/* Spacer */}

              <Experience />
              <div className="h-[100px] w-full" /> {/* Smaller gap before footer */}

            </div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
