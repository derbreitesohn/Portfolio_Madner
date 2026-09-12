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
import "./portfolio.css";
const MuseumExperience = dynamic(() => import("@/components/museum/MuseumExperience"), { ssr: false });

export default function Home() {
  const [is3DMode, setIs3DMode] = useState(false);

  return (
    <main className="portfolio">
      <AnimatePresence mode="wait">
        {is3DMode ? (
          <MuseumExperience key="three" onBack={() => setIs3DMode(false)} />
        ) : (
          <motion.div
            key="standard"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="portfolio-page"
          >
            <a className="portfolio-skip-link" href="#projects">Skip to projects</a>
            <Navbar />
            <Hero onEnter3D={() => setIs3DMode(true)} />
            <div className="portfolio-width">
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
