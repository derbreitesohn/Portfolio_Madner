import { cvDocument } from "@/lib/data";

export default function Navbar() {
  return (
    <header className="portfolio-header">
      <nav className="portfolio-nav portfolio-width" aria-label="Main navigation">
        <a href="#top" className="portfolio-wordmark" aria-label="Flo Madner, back to top">
          MADNER<span>.</span>
        </a>
        <div className="portfolio-nav-links">
          <a href="#about">About</a>
          <a href="#projects">Work</a>
          <a href="#contact" className="portfolio-nav-extra">Contact</a>
          <a href={cvDocument.href} target="_blank" rel="noopener noreferrer" className="portfolio-nav-cv" aria-label="View CV (German PDF, opens in a new tab)">
            CV
          </a>
        </div>
      </nav>
    </header>
  );
}
