// components/ui/GlitchText.tsx
"use client";

import { useEffect, useState } from "react";

const GLITCH_CHARS = "アイウエオカキクケコ#$%&@!?ΔΦΩ░▒▓";

interface GlitchTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  glitchIntensity?: number;
}

export default function GlitchText({
  text,
  className = "",
  style,
  glitchIntensity = 0.03,
}: GlitchTextProps) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < glitchIntensity) {
        const arr = text.split("");
        const idx = Math.floor(Math.random() * arr.length);
        arr[idx] =
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setDisplayed(arr.join(""));
        setTimeout(() => setDisplayed(text), 80);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [text, glitchIntensity]);

  return (
    <span className={className} style={style}>
      {displayed}
    </span>
  );
}