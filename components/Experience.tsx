import { cvDocument } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience" className="portfolio-section portfolio-background" aria-labelledby="cv-title">
      <div className="portfolio-cv">
        <h2 id="cv-title">CV<span>.</span></h2>
        <p>{cvDocument.details}</p>
        <div className="portfolio-cv-actions">
          <a href={cvDocument.href} download={cvDocument.filename} className="portfolio-button portfolio-button-secondary">
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
