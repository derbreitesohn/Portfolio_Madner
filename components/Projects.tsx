import Image from "next/image";
import { projectsData } from "@/lib/data";

const order = ["portfolio", "meniscus", "pat-pat", "liji", "ccl1-pawsup", "steelfang"];
const selectedProjects = [...projectsData].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

export default function Projects() {
  return (
    <section id="projects" className="portfolio-section" aria-labelledby="work-title">
      <div className="portfolio-section-heading">
        <div>
          <h2 id="work-title">Selected work<span>.</span></h2>
        </div>
      </div>
      <div className="portfolio-project-grid">
        {selectedProjects.map((project, index) => (
          <article key={project.slug} className="portfolio-project" aria-labelledby={`project-${project.slug}`}>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={`portfolio-project-image portfolio-project-image-${project.slug}`} aria-label={`${project.displayTitle}: ${project.linkLabel.toLowerCase()} (opens in a new tab)`}>
              <Image src={project.image} alt={`${project.displayTitle} project preview`} fill sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 552px" />
              <span className="portfolio-project-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </a>
            <div className="portfolio-project-meta"><span>{project.category}</span><span>{project.period}</span></div>
            <h3 id={`project-${project.slug}`}>{project.displayTitle}</h3>
            <p className="portfolio-body-copy">{project.description}</p>
            <ul className="portfolio-tags" aria-label={`${project.displayTitle} technologies`}>
              {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
            </ul>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="portfolio-text-link" aria-label={`${project.linkLabel}: ${project.displayTitle} (opens in a new tab)`}>
              {project.linkLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
