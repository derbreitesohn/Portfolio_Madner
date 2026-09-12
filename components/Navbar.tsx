import { ArrowUpRight } from "lucide-react";
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
          <a href="#experience" className="portfolio-nav-extra">Background</a>
          <a href="#contact" className="portfolio-nav-extra">Contact</a>
          <a href={cvDocument.href} target="_blank" rel="noopener noreferrer" className="portfolio-nav-cv" aria-label="View CV (German PDF, opens in a new tab)">
            CV <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  );
}
