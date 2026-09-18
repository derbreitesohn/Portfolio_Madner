import { personalInfo } from "@/lib/data";

export default function About() {
  return (
    <section id="about" className="portfolio-section portfolio-about" aria-labelledby="about-title">
      <h2 id="about-title">About<span>.</span></h2>
      <div className="portfolio-about-copy">
        <p className="portfolio-body-copy">
          I&apos;m {personalInfo.name}, a Creative Computing student at the University of Applied Sciences St. Pölten, Austria.
          My work moves between web development, game design and 3D environments.
        </p>
        <p className="portfolio-body-copy">
          This is a portfolio website to showcase my projects, from web apps and games to a museum you can walk through.
        </p>
      </div>
    </section>
  );
}
