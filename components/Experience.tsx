"use client";

import { motion } from "framer-motion";

const CV_DATA = [
  { year: "2024 — Present", title: "Senior Game Engineer", company: "Aether Studios" },
  { year: "2022 — 2024", title: "Full Stack Developer", company: "CyberSystems Inc." },
  { year: "2020 — 2022", title: "Interactive Designer", company: "Studio Flux" },
  { year: "2018 — 2020", title: "Bachelor of Game Design", company: "University of Arts" },
];

export default function Experience() {
  return (
    <section id="experience" className="w-full flex flex-col items-center space-y-24 border-t border-white/5 pt-32">
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">Experience</h2>
        <p className="text-[10px] text-gray-600 tracking-[0.5em] uppercase font-black">History // Credentials</p>
      </div>

      <div className="w-full max-w-4xl px-4">
        {CV_DATA.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 py-16 last:border-0 hover:bg-white/[0.01] transition-all px-8 text-center md:text-left"
          >
            <div className="space-y-2">
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight uppercase group-hover:text-gray-300 transition-colors">{item.title}</h3>
              <p className="text-gray-500 font-bold text-base uppercase tracking-[0.2em]">{item.company}</p>
            </div>
            <span className="text-sm font-mono text-gray-700 md:text-right group-hover:text-gray-400 transition-colors">{item.year}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
