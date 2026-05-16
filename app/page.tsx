"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import ThreePlaceholder from "@/components/ThreePlaceholder";

export default function Home() {
  const [is3DMode, setIs3DMode] = useState(false);

  return (
    <main className="bg-[#050505] text-white min-h-screen w-full font-sans selection:bg-white selection:text-black">
      <AnimatePresence mode="wait">
        {is3DMode ? (
          <ThreePlaceholder key="three" onBack={() => setIs3DMode(false)} />
        ) : (
          <motion.div
            key="standard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full"
          >
            <Navbar />
            <Hero onEnter3D={() => setIs3DMode(true)} />
            
            {/* 
                We remove 'space-y' here because the components now 
                handle their own massive viewport-based padding.
            */}
            <div className="max-w-6xl mx-auto px-6 w-full flex flex-col items-center">
              <About />
              <Projects />
              <Experience />
            </div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
