import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { personalInfo, skillGroups } from "@/lib/data";

export default function About() {
  return (
    <section id="about" className="portfolio-section portfolio-about" aria-labelledby="about-title">
      <div className="portfolio-about-copy">
        <p className="portfolio-eyebrow">01 / About</p>
        <h2 id="about-title">Curious by nature.<br />Creative through code.</h2>
        <p className="portfolio-body-copy">
          I&apos;m {personalInfo.name}, a Creative Computing student at the University of Applied Sciences St. Pölten, Austria.
          My work moves between web development, game design and 3D environments.
        </p>
        <p className="portfolio-body-copy">
          I enjoy working on both how something looks and how it works. That might mean connecting a React interface to a database,
          building models in Blender, or turning those models into a place someone can explore.
        </p>
        <div className="portfolio-skill-groups">
          {skillGroups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.tools}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="portfolio-about-visual">
        <figure className="portfolio-museum-figure">
          <div className="portfolio-museum-image">
            <Image src="/museum/preview.webp" alt="The flooded museum I built in Blender, with stone arches, climbing plants and a pavilion surrounded by water" fill sizes="(max-width: 800px) 100vw, 540px" />
          </div>
          <figcaption><span>The Flooded Museum</span><span>Blender environment</span></figcaption>
        </figure>
        <div className="portfolio-person">
          <Image src="/images/flo-madner.jpg" alt="Flo Madner" width={64} height={85} className="portfolio-portrait" />
          <div>
            <p>Made by Flo.</p>
            <span>Based in Böheimkirchen, Austria.<br />Outside of code: music, sport and crochet.</span>
          </div>
          <a href="#contact" aria-label="Get in touch with Flo"><ArrowUpRight size={22} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
