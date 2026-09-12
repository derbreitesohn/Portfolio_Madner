import { ArrowUp, ArrowUpRight } from "lucide-react";
import { personalInfo } from "@/lib/data";

export default function Footer() {
  return (
    <footer id="contact" className="portfolio-footer">
      <div className="portfolio-width">
        <div className="portfolio-contact">
          <div>
            <p className="portfolio-eyebrow">04 / Contact</p>
            <h2>Let&apos;s build<br />something interesting<span>.</span></h2>
            <p className="portfolio-body-copy">Have a project in mind, a role to discuss, or a question about my work? Get in touch.</p>
            <a href={`mailto:${personalInfo.email}`} className="portfolio-email">{personalInfo.email} <ArrowUpRight size={24} aria-hidden="true" /></a>
          </div>
          <div className="portfolio-socials">
            <a href={personalInfo.socials.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={17} aria-hidden="true" /></a>
            <a href={personalInfo.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="portfolio-footer-bottom">
          <span>© {new Date().getFullYear()} Flo Madner</span>
          <span>Code, design & a little overgrowth.</span>
          <a href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
