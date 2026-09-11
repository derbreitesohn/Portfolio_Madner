"use client";

import { useEffect, useRef } from "react";
import { MuseumEngine, type MuseumCallbacks } from "@/lib/museum/engine";

export default function MuseumViewport({ callbacks, onEngine }: {
  callbacks: MuseumCallbacks;
  onEngine: (engine: MuseumEngine | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let engine: MuseumEngine | undefined;
    try {
      engine = new MuseumEngine(container.current!, callbacks);
      onEngine(engine);
      if (process.env.NODE_ENV === "development") Object.assign(window, { __museumDebug: engine });
    } catch (error) {
      console.error("Museum graphics unavailable", error);
      callbacks.error("Your browser could not start the 3D view. You can still explore every project in the gallery menu.");
    }
    return () => {
      engine?.dispose(); onEngine(null);
      if (process.env.NODE_ENV === "development") Object.assign(window, { __museumDebug: undefined });
    };
  }, [callbacks, onEngine]);
  return <div className="museum-viewport" ref={container} />;
}
