// components/MainMenu.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";
import GlitchText from "./ui/GlitchText";

type SectionKey = "about" | "projects" | "contact" | null;

const PROJECTS = [
  {
    id: "PRJ_001",
    name: "PROJECT ALPHA",
    date: "2077.01.14",
    stack: "REACT / NODE / POSTGRES",
    status: "DEPLOYED",
    desc: "A high-throughput neural data pipeline for real-time processing. Placeholder for your actual project description.",
    url: "#",
  },
  {
    id: "PRJ_002",
    name: "PROJECT BETA",
    date: "2077.03.02",
    stack: "NEXT.JS / THREE.JS / TAILWIND",
    status: "DEPLOYED",
    desc: "Immersive 3D interface layer for distributed systems management. Placeholder for your actual project description.",
    url: "#",
  },
  {
    id: "PRJ_003",
    name: "PROJECT GAMMA",
    date: "2077.04.19",
    stack: "PYTHON / FASTAPI / REDIS",
    status: "IN_PROGRESS",
    desc: "Autonomous micro-agent framework for asynchronous task orchestration. Placeholder for your actual project description.",
    url: "#",
  },
];

const JAPANESE = ["サイバー", "パンク", "未来", "接続", "システム"];

function StatusBar() {
  const [time, setTime] = useState("");
  const [jp, setJp] = useState(JAPANESE[0]);
  const jpIndex = useRef(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    const j = setInterval(() => {
      jpIndex.current = (jpIndex.current + 1) % JAPANESE.length;
      setJp(JAPANESE[jpIndex.current]);
    }, 2200);
    return () => {
      clearInterval(t);
      clearInterval(j);
    };
  }, []);

  return (
    <div
      className="flex justify-between items-center text-xs px-6 py-3 border-b"
      style={{
        fontFamily: "monospace",
        color: "#006622",
        borderColor: "#001a00",
        background: "rgba(0,0,0,0.85)",
      }}
    >
      <span>
        SYS://PORTFOLIO_OS{" "}
        <span style={{ color: "#00ff46" }}>◈ ONLINE</span>
      </span>
      <span style={{ color: "#003311", letterSpacing: "0.2em" }}>{jp}</span>
      <span>
        LOCAL_TIME:{" "}
        <span style={{ color: "#00ff46" }}>{time}</span>
      </span>
    </div>
  );
}

function NavItem({
  label,
  sublabel,
  isActive,
  onClick,
}: {
  label: string;
  sublabel: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="group flex items-start gap-4 cursor-pointer py-2 px-2 rounded"
      onClick={onClick}
      onHoverStart={() => SFX.hover()}
      style={{
        background: isActive ? "rgba(0,255,70,0.04)" : "transparent",
        borderLeft: isActive ? "2px solid #00ff46" : "2px solid transparent",
      }}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span
        className="text-xs mt-0.5 shrink-0"
        style={{ color: isActive ? "#00ff46" : "#003311", fontFamily: "monospace" }}
      >
        {isActive ? "▶" : "▷"}
      </span>
      <div>
        <div
          className="text-sm tracking-widest uppercase"
          style={{
            fontFamily: "monospace",
            color: isActive ? "#00ff46" : "#006622",
            textShadow: isActive ? "0 0 8px rgba(0,255,70,0.5)" : "none",
          }}
        >
          {label}
        </div>
        <div
          className="text-xs mt-0.5"
          style={{ fontFamily: "monospace", color: "#002a11" }}
        >
          {sublabel}
        </div>
      </div>
    </motion.div>
  );
}

function AboutSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
      style={{ fontFamily: "monospace" }}
    >
      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
      <div
        className="text-xs tracking-widest"
        style={{ color: "#005522" }}
      >
        CAT /dev/user/identity.txt
      </div>
      <div className="text-xs" style={{ color: "#003311" }}>
        ──────────────────────────────────────────
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
        {[
          ["NAME", "[ YOUR_NAME ]"],
          ["ROLE", "[ FULL_STACK DEVELOPER / DESIGNER ]"],
          ["LOCATION", "[ SECTOR_32 // EARTH ]"],
          ["STATUS", "[ AVAILABLE_FOR_HIRE ]"],
          ["SPEC", "[ WEB · 3D · SYSTEMS · UI/UX ]"],
        ].map(([key, val]) => (
          <div key={key} className="contents">
            <span style={{ color: "#004422" }}>{key}:</span>
            <span style={{ color: "#00cc33" }}>{val}</span>
          </div>
        ))}
      </div>

      <div className="text-xs" style={{ color: "#003311" }}>
        ──────────────────────────────────────────
      </div>
      <p
        className="text-xs leading-relaxed max-w-md"
        style={{ color: "#006622" }}
      >
        {">"} Developer operating at the intersection of design and
        engineering. Building interfaces that feel like the future. Replace
        this with your own bio — tell them what you build, why you build it,
        and what drives you.
      </p>
      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
    </motion.div>
  );
}

function ProjectsSection() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
      style={{ fontFamily: "monospace" }}
    >
      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
      <div className="text-xs" style={{ color: "#005522" }}>
        LS /dev/ghost/projects/ --verbose
      </div>
      <div className="text-xs" style={{ color: "#003311" }}>
        ──────────────────────────────────────────
      </div>

      {PROJECTS.map((p, i) => (
        <div key={p.id}>
          <motion.div
            className="cursor-pointer flex items-center gap-3 py-1.5 px-1"
            onClick={() => {
              SFX.select();
              setSelected(selected === i ? null : i);
            }}
            onHoverStart={() => SFX.hover()}
            whileHover={{ x: 3 }}
          >
            <span
              className="text-xs"
              style={{ color: "#004422" }}
            >
              {selected === i ? "▾" : "▸"}
            </span>
            <span
              className="text-xs tracking-widest"
              style={{ color: selected === i ? "#00ff46" : "#00aa44" }}
            >
              {p.id}
            </span>
            <span
              className="text-xs"
              style={{ color: "#006622" }}
            >
              {p.name}
            </span>
            <span
              className="ml-auto text-xs"
              style={{
                color: p.status === "DEPLOYED" ? "#00aa44" : "#886600",
              }}
            >
              [{p.status}]
            </span>
          </motion.div>

          <AnimatePresence>
            {selected === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="ml-6 pl-4 py-3 flex flex-col gap-1.5 text-xs border-l"
                  style={{ borderColor: "#002a11" }}
                >
                  <div>
                    <span style={{ color: "#004422" }}>DATE: </span>
                    <span style={{ color: "#00cc33" }}>{p.date}</span>
                  </div>
                  <div>
                    <span style={{ color: "#004422" }}>STACK: </span>
                    <span style={{ color: "#00cc33" }}>{p.stack}</span>
                  </div>
                  <div
                    className="mt-1 leading-relaxed max-w-sm"
                    style={{ color: "#006622" }}
                  >
                    {">"} {p.desc}
                  </div>
                  <motion.a
                    href={p.url}
                    className="mt-2 text-xs tracking-widest inline-flex items-center gap-2"
                    style={{ color: "#00ff46" }}
                    whileHover={{ x: 2 }}
                  >
                    ▶ ACCESS_PROJECT
                  </motion.a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
    </motion.div>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!name || !message) return;
    SFX.startup();
    setSent(true);
  };

  const inputStyle = {
    background: "transparent",
    border: "1px solid #003311",
    color: "#00cc33",
    fontFamily: "monospace",
    fontSize: "12px",
    padding: "6px 10px",
    outline: "none",
    width: "100%",
    caretColor: "#00ff46",
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3"
      style={{ fontFamily: "monospace" }}
    >
      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
      <div className="text-xs" style={{ color: "#005522" }}>
        INIT /contact/transmission.sh
      </div>
      <div className="text-xs" style={{ color: "#003311" }}>
        ──────────────────────────────────────────
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs mb-2">
        {[
          ["EMAIL", "[ your@email.com ]"],
          ["GITHUB", "[ github.com/yourusername ]"],
          ["LINKEDIN", "[ linkedin.com/in/yourusername ]"],
        ].map(([k, v]) => (
          <div key={k} className="contents">
            <span style={{ color: "#004422" }}>{k}:</span>
            <span style={{ color: "#00aa44" }}>{v}</span>
          </div>
        ))}
      </div>

      <div className="text-xs" style={{ color: "#003311" }}>
        ──────────────────────────────────────────
      </div>

      {!sent ? (
        <div className="flex flex-col gap-3">
          <div className="text-xs" style={{ color: "#005522" }}>
            {">"} COMPOSE TRANSMISSION:
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "#004422" }}>
              SENDER_ID:
            </label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your_name"
              onFocus={() => SFX.hover()}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: "#004422" }}>
              MESSAGE_BODY:
            </label>
            <textarea
              style={{ ...inputStyle, resize: "none", height: "70px" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="your_message_here..."
              onFocus={() => SFX.hover()}
            />
          </div>
          <motion.button
            onClick={handleSend}
            onHoverStart={() => SFX.hover()}
            className="text-xs tracking-widest py-2 px-4 border text-left"
            style={{
              fontFamily: "monospace",
              color: "#00ff46",
              borderColor: "#004422",
              background: "transparent",
              cursor: "pointer",
            }}
            whileHover={{
              backgroundColor: "rgba(0,255,70,0.06)",
              borderColor: "#00ff46",
            }}
          >
            ▶ TRANSMIT_MESSAGE
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-2 text-xs"
        >
          <div style={{ color: "#00ff46" }}>
            ▶ TRANSMISSION QUEUED SUCCESSFULLY
          </div>
          <div style={{ color: "#006622" }}>
            {">"} Message logged. Neural relay active.
          </div>
          <div style={{ color: "#006622" }}>
            {">"} Estimated response: 24-48 HOURS
          </div>
          <div style={{ color: "#003311" }}>
            ════════════════════════════ [SENT]
          </div>
        </motion.div>
      )}
      <div className="text-xs" style={{ color: "#003311" }}>
        ══════════════════════════════════════════
      </div>
    </motion.div>
  );
}

export default function MainMenu() {
  const [activeSection, setActiveSection] = useState<SectionKey>(null);
  const [introLine, setIntroLine] = useState(false);

  useEffect(() => {
    SFX.select();
    const t = setTimeout(() => setIntroLine(true), 400);
    return () => clearTimeout(t);
  }, []);

  const toggle = (key: SectionKey) => {
    SFX.select();
    setActiveSection((prev) => (prev === key ? null : key));
  };

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <StatusBar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR — Navigation */}
        <div
          className="w-72 shrink-0 flex flex-col border-r p-4 gap-2"
          style={{
            borderColor: "#001a00",
            background: "rgba(0,0,0,0.88)",
          }}
        >
          {/* Header */}
          <AnimatePresence>
            {introLine && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <GlitchText
                  text="PORTFOLIO_OS"
                  className="text-base tracking-[0.25em]"
                  style={{
                    color: "#00ff46",
                    fontFamily: "monospace",
                    textShadow: "0 0 12px rgba(0,255,70,0.6)",
                    display: "block",
                  }}
                  glitchIntensity={0.035}
                />
                <div
                  className="text-xs mt-1 tracking-widest"
                  style={{ color: "#003311", fontFamily: "monospace" }}
                >
                  root@sector32:~#
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Directory label */}
          <div
            className="text-xs mb-2"
            style={{ color: "#003311", fontFamily: "monospace" }}
          >
            LS /root --all
          </div>

          {/* Nav items */}
          <NavItem
            label="\about"
            sublabel="identity.txt — 0.4K"
            isActive={activeSection === "about"}
            onClick={() => toggle("about")}
          />
          <NavItem
            label="\projects_portfolio"
            sublabel="/ghost — 3 entries"
            isActive={activeSection === "projects"}
            onClick={() => toggle("projects")}
          />
          <NavItem
            label="\contact"
            sublabel="transmission.sh — OPEN"
            isActive={activeSection === "contact"}
            onClick={() => toggle("contact")}
          />

          {/* Bottom decorations */}
          <div className="mt-auto flex flex-col gap-2">
            <div
              className="text-xs"
              style={{ color: "#001a00", fontFamily: "monospace" }}
            >
              ──────────────────────
            </div>
            <div
              className="text-xs"
              style={{ color: "#002211", fontFamily: "monospace" }}
            >
              MEM: ████████░░ 64%
            </div>
            <div
              className="text-xs"
              style={{ color: "#002211", fontFamily: "monospace" }}
            >
              CPU: █████░░░░░ 48%
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "#001a00", fontFamily: "monospace" }}
            >
              未来 ◈ サイバー ◈ 接続
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Content */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <AnimatePresence mode="wait">
            {activeSection === null && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4"
                style={{ fontFamily: "monospace" }}
              >
                <div
                  className="text-xs tracking-[0.3em]"
                  style={{ color: "#002211" }}
                >
                  ◈ SELECT A DIRECTORY TO EXPLORE ◈
                </div>
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-xs"
                  style={{ color: "#001a00", fontFamily: "monospace" }}
                >
                  █
                </motion.div>
              </motion.div>
            )}
            {activeSection === "about" && (
              <motion.div key="about">
                <AboutSection />
              </motion.div>
            )}
            {activeSection === "projects" && (
              <motion.div key="projects">
                <ProjectsSection />
              </motion.div>
            )}
            {activeSection === "contact" && (
              <motion.div key="contact">
                <ContactSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}