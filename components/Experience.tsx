import { cvData, cvDocument } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience" className="portfolio-section portfolio-background" aria-labelledby="background-title">
      <div>
        <h2 id="background-title">Background<span>.</span></h2>
        <p className="portfolio-body-copy">Studying Creative Computing, with practical experience in process automation and university work.</p>
        <aside className="portfolio-cv" aria-labelledby="cv-title">
          <h3 id="cv-title">CV<span>.</span></h3>
          <p>{cvDocument.details}</p>
          <div className="portfolio-cv-actions">
            <a href={cvDocument.href} download={cvDocument.filename} className="portfolio-button portfolio-button-secondary">
              Download CV
            </a>
          </div>
        </aside>
      </div>
      <div className="portfolio-timeline">
        <h3 className="portfolio-timeline-label">Experience</h3>
        {cvData.experience.map((item) => (
          <article key={item.company} className="portfolio-timeline-item">
            <p className="portfolio-timeline-date">{item.period}</p>
            <h4>{item.role}</h4>
            <p className="portfolio-timeline-place">{item.company}</p>
            <p className="portfolio-body-copy">{item.description}</p>
          </article>
        ))}
        <h3 className="portfolio-timeline-label">Education</h3>
        {cvData.education.map((item) => (
          <article key={item.school} className="portfolio-timeline-item">
            <p className="portfolio-timeline-date">{item.period}</p>
            <h4>{item.degree}</h4>
            <p className="portfolio-timeline-place">{item.school}</p>
          </article>
        ))}
        <div className="portfolio-languages">
          <h3 className="portfolio-timeline-label">Languages</h3>
          <p>{cvData.languages.map((item) => `${item.language} (${item.level.toLowerCase()})`).join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
