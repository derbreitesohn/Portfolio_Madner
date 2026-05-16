// components/sections/Contact.tsx
"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section id="contact" className="min-h-[70vh] py-24 px-6 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-2xl w-full p-12 border border-neon-cyan/20 glass-morphism relative"
      >
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-32 h-[2px] bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
        
        <h2 className="text-3xl font-black mb-6 tracking-tighter uppercase">Establish Connection</h2>
        <p className="text-white/60 mb-8 leading-relaxed">
          Ready to build something extraordinary? My frequency is always open for innovative projects and collaborations.
        </p>
        
        <a 
          href="mailto:placeholder@email.com"
          className="inline-block px-10 py-4 bg-transparent border border-neon-cyan text-neon-cyan font-bold tracking-[0.2em] hover:bg-neon-cyan hover:text-black transition-all duration-300"
        >
          SEND_SIGNAL
        </a>

        <div className="mt-12 flex justify-center gap-8 text-xs tracking-widest text-white/40">
          <a href="#" className="hover:text-neon-magenta transition-colors">GITHUB</a>
          <a href="#" className="hover:text-neon-magenta transition-colors">LINKEDIN</a>
          <a href="#" className="hover:text-neon-magenta transition-colors">TWITTER</a>
        </div>
      </motion.div>
      
      <footer className="mt-24 text-[10px] tracking-[0.4em] text-white/20 uppercase">
        © 2026 Florian Madner // All Rights Reserved
      </footer>
    </section>
  );
}
