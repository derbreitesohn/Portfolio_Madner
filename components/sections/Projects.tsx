// components/sections/Projects.tsx
"use client";

import { motion } from "framer-motion";

const PROJECTS = [
  {
    title: "NEURAL_LINK",
    tech: "Next.js / Three.js / GSAP",
    desc: "A high-performance neural data visualization interface for real-time biometrics tracking.",
    color: "cyan"
  },
  {
    title: "VOID_ENGINE",
    tech: "Rust / WASM / WebGL",
    desc: "Lightweight 3D rendering engine optimized for low-latency web applications.",
    color: "magenta"
  },
  {
    title: "SYNTH_OS",
    tech: "React / Tailwind / Node",
    desc: "A fully custom dashboard for managing distributed microservices across hybrid clouds.",
    color: "cyan"
  }
];

export default function Projects() {
  return (
    <section id="projects" className="min-h-screen py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold flex items-center gap-4">
          <span className="text-neon-magenta">02.</span> DEPLOYED_WORK
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROJECTS.map((project, i) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative p-8 border border-white/5 glass-morphism rounded-sm hover:border-neon-cyan/50 transition-all duration-500"
          >
            <div className={`absolute top-0 right-0 w-1 h-0 group-hover:h-full transition-all duration-500 ${project.color === 'cyan' ? 'bg-neon-cyan' : 'bg-neon-magenta'}`} />
            <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-neon-cyan transition-colors">{project.title}</h3>
            <p className="text-xs text-white/40 mb-4 font-mono uppercase">{project.tech}</p>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {project.desc}
            </p>
            <a href="#" className="text-xs tracking-[0.2em] font-bold hover:underline">VIEW_SOURCE //</a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
