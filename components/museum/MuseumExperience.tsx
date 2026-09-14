"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Grid2X2, Pause, RotateCcw, X } from "lucide-react";
import { museumProjects, type MuseumProject } from "@/lib/museum/projects";
import type { MuseumEngine, MuseumCallbacks } from "@/lib/museum/engine";
import { SPAWN } from "@/lib/museum/physics";
import "./museum.css";

const Viewport = dynamic(() => import("./MuseumViewport"), { ssr: false });

function MuseumDialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { previous?.focus(); };
  }, []);
  return <dialog className="museum-dialog" ref={dialog} aria-label={title} onCancel={(e) => { e.preventDefault(); close(); }}
    onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div className="museum-dialog-inner">
      <button className="museum-icon-button museum-close" onClick={close} aria-label="Close dialog"><X size={20} /></button>
      {children}
    </div>
  </dialog>;
}

function Joystick({ move }: { move: (x: number, y: number) => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointer = useRef<number | null>(null);
  const update = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(x, y);
    if (length > 38) { x *= 38 / length; y *= 38 / length; }
    setOffset({ x, y });
    move(x / 38, y / 38);
  };
  const reset = () => { pointer.current = null; setOffset({ x: 0, y: 0 }); move(0, 0); };
  return <div className="museum-joystick" role="group" aria-label="Touch movement control"
    onPointerDown={(e) => { pointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
    onPointerMove={update} onPointerUp={reset} onPointerCancel={reset} onLostPointerCapture={reset}>
    <span style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
    <small>MOVE</small>
  </div>;
}

function MuseumMap({ position, yaw, visited }: { position: number[]; yaw: number; visited: Set<string> }) {
  return <svg className="museum-map" viewBox="0 0 100 100" role="img" aria-label="Museum plan and your location">
    <rect x="7" y="7" width="86" height="86" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
    <rect x="20" y="20" width="60" height="60" fill="currentColor" opacity=".07" />
    <path d="M20 50H80M50 20V80" stroke="currentColor" opacity=".3" strokeWidth="2" />
    <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" opacity=".4" />
    {museumProjects.map((p, i) => <circle key={p.id} cx={i < 3 ? 8 : 92} cy={i % 3 === 0 ? 79 : i % 3 === 1 ? 50 : 22}
      r="2.7" fill="currentColor" opacity={visited.has(p.id) ? 1 : 0.5} />)}
    <g transform={`translate(${50 + position[0] * 1.46},${50 + position[2] * 1.46}) rotate(${-yaw * 180 / Math.PI})`}>
      <path d="M0 -5L3.5 3L0 1.5L-3.5 3Z" fill="currentColor" />
    </g>
  </svg>;
}

export default function MuseumExperience({ onBack }: { onBack: () => void }) {
  const engine = useRef<MuseumEngine | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [panel, setPanel] = useState<"gallery" | MuseumProject | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visited, setVisited] = useState(new Set<string>());
  const [position, setPosition] = useState<[number, number, number]>([...SPAWN]);
  const [yaw, setYaw] = useState(0);
  const [balanced, setBalanced] = useState(false);
  const [atExhibit, setAtExhibit] = useState<MuseumProject | null>(null);
  const [touch, setTouch] = useState(false);

  const openProject = useCallback((id: string) => {
    const project = museumProjects.find((p) => p.id === id);
    if (!project) return;
    engine.current?.pause();
    setVisited((old) => new Set([...old, id]));
    setPanel(project);
  }, []);
  const callbacks = useMemo<MuseumCallbacks>(() => ({
    progress: setProgress,
    ready: () => setReady(true),
    active: setActive,
    hover: setHovered,
    open: openProject,
    gallery: () => setPanel("gallery"),
    error: setError,
    position: (p, y) => { setPosition(p); setYaw(y); },
  }), [openProject]);
  const onEngine = useCallback((value: MuseumEngine | null) => {
    engine.current = value;
    if (value) { setTouch(value.touch); setBalanced(value.touch); }
  }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  const play = () => { setEntered(true); setAtExhibit(null); engine.current?.play(); };
  const leaveMuseum = () => { engine.current?.pause(); onBack(); };
  const gallery = () => { engine.current?.pause(); setPanel("gallery"); };
  const visit = (project: MuseumProject) => {
    engine.current?.visit(project.id);
    setEntered(true);
    setAtExhibit(project);
    setPanel(null);
  };
  const retry = () => { setError(""); setReady(false); setActive(false); setProgress(0); setAttempt((n) => n + 1); };
  const hoveredProject = museumProjects.find((p) => p.id === hovered);

  return <section className={`museum ${active ? "museum-is-active" : ""}`} aria-label="Interactive portfolio museum"
    data-ready={ready} data-active={active} data-position={position.join(",")} data-project-count={museumProjects.length}>
    <Viewport key={attempt} callbacks={callbacks} onEngine={onEngine} />
    <div className="museum-vignette" />
    <header className="museum-header">
      <div className="museum-brand"><strong>MADNER<span>.</span></strong></div>
      <nav aria-label="Museum navigation">
        <button className="museum-nav-button" onClick={gallery}><Grid2X2 size={16} /><span>Gallery</span><small>{visited.size}/06</small></button>
        {active && <button className="museum-icon-button" onClick={() => engine.current?.pause()} aria-label="Pause exploration"><Pause size={18} /></button>}
        <button className="museum-nav-button museum-exit" onClick={leaveMuseum}><ArrowLeft size={16} /><span>Back to portfolio</span></button>
      </nav>
    </header>

    {!active && !entered && <div className={`museum-welcome ${ready && !error ? "museum-has-scene" : ""}`}>
      {(!ready || error) && <Image className="museum-preview" src="/museum/preview.webp" alt="" fill preload sizes="100vw" />}
      <div className="museum-welcome-shade" />
      <div className="museum-introduction">
        <h1>Flooded<br />museum<span>.</span></h1>
        {error ? <p className="museum-load-error" role="alert">{error}</p> :
          !ready && <p className="museum-load-label" role="status">{`Opening the museum · ${progress}%`}</p>}
        {!ready && !error && <div className="museum-progress" role="progressbar" aria-label="Loading museum" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>}
        <div className="museum-welcome-actions">
          {error ? <button className="museum-primary" onClick={retry}>Try again <RotateCcw size={16} /></button> :
            <button className="museum-primary" onClick={play} disabled={!ready}>Enter the museum <ArrowRight size={18} /></button>}
          <button className="museum-text-button" onClick={gallery}>Browse the projects</button>
        </div>
      </div>
    </div>}

    {entered && !active && !panel && <div className="museum-pause-wrap">
      <div className="museum-pause-card">
        {atExhibit && <p className="museum-eyebrow">{`EXHIBIT ${atExhibit.number}`}</p>}
        <h2>{error ? "A brief interruption." : atExhibit ? atExhibit.title : "Paused"}</h2>
        <p>{error || (atExhibit ? "Your next project is right in front of you." : "Continue your walk, or choose a project from the gallery.")}</p>
        <button className="museum-primary" onClick={error ? retry : play} disabled={!ready && !error}>
          {error ? "Reload the museum" : ready ? "Continue walking" : `Opening · ${progress}%`} <ArrowRight size={18} />
        </button>
        {atExhibit && <button className="museum-text-button" onClick={() => openProject(atExhibit.id)}>Read about this project</button>}
        <button className="museum-text-button" onClick={gallery}>Choose a project</button>
        <button className="museum-secondary museum-pause-exit" onClick={leaveMuseum}><ArrowLeft size={16} /> Back to portfolio</button>
        <div className="museum-settings">
          <button onClick={() => { engine.current?.reset(); setAtExhibit(null); }}><RotateCcw size={13} /> Return to entrance</button>
          <label><input type="checkbox" checked={balanced} onChange={(e) => { setBalanced(e.target.checked); engine.current?.setQuality(e.target.checked); }} /> Lighter graphics</label>
        </div>
        <small>{touch ? "Use the jump button to step out of the shallow pool." : "Space to jump · Shift to move faster · Esc to pause · G for gallery"}</small>
      </div>
    </div>}

    {active && <>
      <div className={`museum-reticle ${hoveredProject ? "museum-reticle-target" : ""}`} aria-hidden="true" />
      {hoveredProject && <button className="museum-interact" onClick={() => openProject(hoveredProject.id)}><span>{hoveredProject.number}</span>{hoveredProject.title}<small>{touch ? "Tap to explore" : "Click or E to explore"}</small></button>}
      <div className="museum-location"><MuseumMap position={position} yaw={yaw} visited={visited} /><span>{Math.abs(position[0]) > 20 || Math.abs(position[2]) > 20 ? "THE GALLERIES" : "THE COURTYARD"}</span></div>
      <p className="museum-walk-hint">{touch ? "Drag the scene to look around" : "WASD · Walk     SPACE · Jump     ESC · Pause / exit     G · Gallery"}</p>
      {touch && <div className="museum-touch-controls"><Joystick move={(x, y) => engine.current?.setStick(x, y)} /><button onPointerDown={() => engine.current?.requestJump()} className="museum-jump">Jump ↑</button></div>}
    </>}

    {panel === "gallery" && <MuseumDialog title="Project gallery" close={() => setPanel(null)}>
      <p className="museum-eyebrow">THE COLLECTION · 01—06</p><h2>Things I&apos;ve made.</h2>
      <p className="museum-dialog-subtitle">Choose a project, or find its frame in the museum.</p>
      <div className="museum-project-grid">{museumProjects.map((project) => <article key={project.id}>
        <button className="museum-project-cover" onClick={() => openProject(project.id)} aria-label={`Read about ${project.title}`}>
          <Image src={project.image} alt={project.title} fill sizes="(max-width: 600px) 90vw, 380px" />
          <span>{project.number}{visited.has(project.id) ? " · VISITED" : ""}</span>
        </button>
        <div className="museum-project-row"><h3>{project.title}</h3><button className="museum-icon-button" onClick={() => openProject(project.id)} aria-label={`Open ${project.title}`}><ArrowRight size={18} /></button></div>
        <p>{project.technologies.slice(0, 3).join(" · ")}</p>
        {ready && !error && <button className="museum-visit" onClick={() => visit(project)}>Visit this frame <ArrowRight size={14} /></button>}
      </article>)}</div>
    </MuseumDialog>}

    {panel && panel !== "gallery" && <MuseumDialog key={panel.id} title={panel.title} close={() => setPanel(null)}>
      <button className="museum-text-button museum-collection-back" onClick={() => setPanel("gallery")}><ArrowLeft size={15} /> All projects</button>
      <div className="museum-detail-image"><Image src={panel.image} alt={`${panel.title} preview`} fill sizes="(max-width: 900px) 90vw, 850px" /></div>
      <p className="museum-eyebrow">EXHIBIT {panel.number} · {panel.period}</p>
      <h2>{panel.title}</h2><p className="museum-project-description">{panel.description}</p>
      <ul className="museum-tags">{panel.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
      <div className="museum-detail-actions"><a className="museum-primary" href={panel.link} target="_blank" rel="noopener noreferrer">Explore project <ExternalLink size={16} /></a>
        {ready && !error && <button className="museum-text-button" onClick={() => visit(panel)}>Visit its frame <ArrowRight size={16} /></button>}
      </div>
    </MuseumDialog>}
  </section>;
}
