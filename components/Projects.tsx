"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { projectsData } from "../lib/data";

export default function Projects() {
  return (
    <section id="projects" className="w-full">
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 border-b border-white/5 pb-8">
          <h2 className="text-5xl font-black tracking-tighter uppercase">Selected Work</h2>
          <span className="text-xs font-mono text-gray-600 tracking-widest">NUM_ENTRIES [{String(projectsData.length).padStart(2, "0")}]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
          {projectsData.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group block"
            >
              <div className="aspect-video bg-gray-900/50 mb-10 relative overflow-hidden rounded-sm border border-white/5">
                {project.image ? (
                  <Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 550px" className="object-cover object-center transition-all duration-700 hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-900 opacity-50" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                  {project.link ? (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                      View Project
                    </a>
                  ) : (
                    <button className="px-6 py-2 bg-white/50 text-black text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                      Private
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start gap-4">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-gray-400 transition-colors uppercase tracking-tight">{project.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 border border-white/10 text-gray-500 uppercase font-bold tracking-tighter">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
