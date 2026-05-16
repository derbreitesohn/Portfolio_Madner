"use client";

import { motion } from "framer-motion";

const PROJECTS = [
  { id: 1, title: "XENO_DAWN", stack: ["C#", "Unity", "ShaderGraph"], type: "Game Engineering" },
  { id: 2, title: "FLUX_INTERFACE", stack: ["React", "Three.js", "Tailwind"], type: "Web Design" },
  { id: 3, title: "CORE_PIPELINE", stack: ["Rust", "WASM", "Next.js"], type: "Full Stack" },
  { id: 4, title: "NEBULA_ENGINE", stack: ["C++", "OpenGL", "Vulkan"], type: "Game Engine" },
];

export default function Projects() {
  return (
    <section id="projects" className="w-full space-y-24 py-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase">Selected Work</h2>
        <div className="h-[1px] w-12 bg-gray-800" />
        <span className="text-[10px] font-mono text-gray-600 tracking-[0.4em] uppercase">Architecture // Archive</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20 w-full max-w-6xl mx-auto">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="group flex flex-col items-center text-center"
          >
            <div className="w-full aspect-video bg-gray-900/40 mb-8 relative overflow-hidden rounded-sm border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-900 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                <button className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-sm">
                  View Project
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
                {project.type}
              </span>
              <h3 className="text-3xl font-bold tracking-tight group-hover:text-gray-400 transition-colors uppercase">{project.title}</h3>
              <div className="flex justify-center gap-3">
                {project.stack.map(s => (
                  <span key={s} className="text-[9px] px-2 py-0.5 border border-white/10 text-gray-600 uppercase font-black tracking-tighter">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
