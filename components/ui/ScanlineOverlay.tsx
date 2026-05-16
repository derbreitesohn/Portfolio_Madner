// components/ui/ScanlineOverlay.tsx
"use client";

export default function ScanlineOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      {/* Moving scanline sweep */}
      <div
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        style={{ opacity: 0.04 }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "4px",
            background: "rgba(0,255,70,0.6)",
            animation: "scanline 6s linear infinite",
          }}
        />
      </div>
    </>
  );
}