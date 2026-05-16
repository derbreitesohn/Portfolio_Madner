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
            className="w-full flex flex-col items-center"
          >
            <Navbar />
            <Hero onEnter3D={() => setIs3DMode(true)} />
            
            {/* 
                CORE CONTENT WRAPPER 
                We use a centered flex column with massive margins between elements.
            */}
            <div className="w-full flex flex-col items-center px-6">
              
              <div className="w-full max-w-6xl mb-[400px]">
                <About />
              </div>

              <div className="w-full max-w-6xl mb-[400px]">
                <Projects />
              </div>

              <div className="w-full max-w-6xl mb-[400px]">
                <Experience />
              </div>

            </div>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
