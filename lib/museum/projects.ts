import { projectsData } from "@/lib/data";

// Stable Blender ID -> project slug. Reordering the 2D portfolio cannot change a frame.
const FRAME_PROJECTS: Record<string, string> = {
  project_01: "pat-pat",
  project_02: "meniscus",
  project_03: "liji",
  project_04: "ccl1-pawsup",
  project_05: "portfolio",
  project_06: "steelfang",
};

export const museumProjects = Object.entries(FRAME_PROJECTS).map(([id, slug], index) => {
  const project = projectsData.find((p) => p.slug === slug);
  if (!project) throw new Error(`Museum project is missing: ${slug}`);
  return {
    ...project,
    id,
    number: String(index + 1).padStart(2, "0"),
    image: project.image || "/museum/preview.webp",
  };
});

export type MuseumProject = (typeof museumProjects)[number];
