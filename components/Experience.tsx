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
    <section id="experience" className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-white/5 pt-20 w-full max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Background</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          A track record of delivering high-stakes interactive software and visually stunning interfaces.
        </p>
      </div>

      <div className="lg:col-span-2 space-y-12 w-full">
        {CV_DATA.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8 last:border-0"
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase">{item.title}</h3>
              <p className="text-gray-500 font-medium">{item.company}</p>
            </div>
            <span className="text-sm font-mono text-gray-600 md:text-right">{item.year}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
