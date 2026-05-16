// components/sections/About.tsx
"use client";

import { motion } from "framer-motion";

const SKILLS = [
  "React / Next.js", "TypeScript", "Three.js", "TailwindCSS",
  "Node.js", "PostgreSQL", "Python", "Framer Motion"
];

export default function About() {
  return (
    <section id="about" className="min-h-screen py-24 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
            <span className="text-neon-cyan">01.</span> CORE_INTEL
          </h2>
          <div className="space-y-4 text-white/70 leading-relaxed text-lg">
            <p>
              Based in the digital frontier, I build robust, scalable applications with a focus on cutting-edge user interfaces. My approach blends technical precision with creative flair.
            </p>
            <p>
              I believe that the web should be more than just static pages—it should be an immersive experience that reacts to the user.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 border border-white/10 glass-morphism rounded-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-magenta/10 blur-3xl" />
          <h3 className="text-xs tracking-widest text-neon-magenta mb-6 uppercase">Technical Stack</h3>
          <div className="grid grid-cols-2 gap-4">
            {SKILLS.map((skill) => (
              <div key={skill} className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full" />
                {skill}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
