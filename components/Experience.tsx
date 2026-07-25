"use client";

import { motion } from "framer-motion";

import { cvData } from "../lib/data";

export default function Experience() {
  return (
    <section id="experience" className="w-full border-t border-white/5 pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-4">Background</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            A track record of delivering high-stakes interactive software and visually stunning interfaces.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-12">
          {cvData.experience.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8 last:border-0"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase">{item.role}</h3>
                <p className="text-gray-500 font-medium">{item.company}</p>
                <p className="text-gray-600 text-xs mt-2">{item.description}</p>
              </div>
              <span className="text-sm font-mono text-gray-600 md:text-right tabular-nums">{item.period}</span>
            </motion.div>
          ))}
          <h2 className="text-2xl font-bold uppercase tracking-widest !mt-24 mb-8 border-t border-white/5 pt-16">Education</h2>
          {cvData.education.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8 last:border-0"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase">{item.degree}</h3>
                <p className="text-gray-500 font-medium">{item.school}</p>
              </div>
              <span className="text-sm font-mono text-gray-600 md:text-right tabular-nums">{item.period}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
