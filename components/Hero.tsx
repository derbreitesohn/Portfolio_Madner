interface HeroProps {
  onEnter3D: () => void;
}

export default function Hero({ onEnter3D }: HeroProps) {
  return (
    <section id="top" className="portfolio-hero portfolio-width" aria-labelledby="hero-title">
      <h1 id="hero-title">MADNER<span>.</span></h1>
      <div className="portfolio-actions">
        <button onClick={onEnter3D} className="portfolio-button portfolio-button-primary">
          Enter 3D Museum
        </button>
        <a href="#projects" className="portfolio-button portfolio-button-secondary">
          Selected work
        </a>
      </div>
    </section>
  );
}
