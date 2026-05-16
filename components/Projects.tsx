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
    <section id="projects" className="space-y-16 w-full">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">Selected Work</h2>
        <span className="text-xs font-mono text-gray-600 tracking-widest hidden md:block">NUM_ENTRIES [04]</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group block"
          >
            <div className="aspect-video bg-gray-900/50 mb-8 relative overflow-hidden rounded-sm border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-900 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                <button className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">
                  View Case Study
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight group-hover:text-gray-400 transition-colors">{project.title}</h3>
                <div className="flex gap-2">
                  {project.stack.map(s => (
                    <span key={s} className="text-[9px] px-2 py-0.5 border border-white/10 text-gray-500 uppercase font-black tracking-tighter">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em] pt-2">
                {project.type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
