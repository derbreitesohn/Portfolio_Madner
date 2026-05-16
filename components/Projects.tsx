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
    <section id="projects" className="space-y-12 w-full max-w-6xl mb-32">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 border-b border-white/5 pb-8">
        <h2 className="text-5xl font-black tracking-tighter uppercase">Selected Work</h2>
        <span className="text-xs font-mono text-gray-600 tracking-widest">NUM_ENTRIES [04]</span>
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
            <div className="aspect-video bg-gray-900/50 mb-6 relative overflow-hidden rounded-sm border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-900 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest">
                  Read More
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-gray-400 transition-colors uppercase">{project.title}</h3>
                <div className="flex gap-2">
                  {project.stack.map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 border border-white/10 text-gray-500 uppercase font-bold tracking-tighter">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest pt-1">
                {project.type}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
