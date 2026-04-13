import { ImageResponse } from "next/og";

export const alt = "TownsHub Marketing AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #0c2340 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
            borderRadius: 24,
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 0 40px rgba(14,165,233,0.4)",
          }}
        >
          <span style={{ color: "white", fontSize: 42, fontWeight: 900, letterSpacing: -2 }}>
            TH
          </span>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span style={{ color: "white", fontSize: 72, fontWeight: 800, letterSpacing: -3 }}>
            TownsHub
          </span>
          <span
            style={{
              color: "#0ea5e9",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            Marketing AI
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "#94a3b8",
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            marginBottom: 40,
            letterSpacing: 0.5,
          }}
        >
          One Topic. 16 Formats. 300+ Platforms.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { value: "16", label: "Content Formats" },
            { value: "305+", label: "Platforms" },
            { value: "GPT-4o", label: "AI Powered" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "16px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ color: "#0ea5e9", fontSize: 28, fontWeight: 800 }}>
                {stat.value}
              </span>
              <span style={{ color: "#64748b", fontSize: 16, fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: [] }
  );
}
