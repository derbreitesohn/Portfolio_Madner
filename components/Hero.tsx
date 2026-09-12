import { ArrowDown, ArrowUpRight } from "lucide-react";

interface HeroProps {
  onEnter3D: () => void;
}

export default function Hero({ onEnter3D }: HeroProps) {
  return (
    <section id="top" className="portfolio-hero portfolio-width" aria-labelledby="hero-title">
      <p className="portfolio-eyebrow">Flo Madner <span aria-hidden="true">/</span> Creative developer · Austria</p>
      <h1 id="hero-title">MADNER<span>.</span></h1>
      <p className="portfolio-hero-line">Websites, games & spaces to explore.</p>
      <p className="portfolio-hero-description">
        I bring code and visual design together, from everyday apps to an overgrown museum you can walk through.
      </p>
      <div className="portfolio-actions">
        <button onClick={onEnter3D} className="portfolio-button portfolio-button-primary">
          Enter 3D Museum <ArrowUpRight size={18} aria-hidden="true" />
        </button>
        <a href="#projects" className="portfolio-button portfolio-button-secondary">
          Selected work <ArrowDown size={17} aria-hidden="true" />
        </a>
      </div>
      <div className="portfolio-hero-foot">
        <span>Web development <span aria-hidden="true">/</span> Games <span aria-hidden="true">/</span> 3D</span>
        <a href="#about">A little about me <ArrowDown size={14} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
