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
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
            borderRadius: "24px",
            width: "96px",
            height: "96px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <span style={{ color: "white", fontSize: "42px", fontWeight: 900 }}>
            TH
          </span>
        </div>

        {/* Brand name */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "16px" }}>
          <span style={{ color: "white", fontSize: "72px", fontWeight: 800 }}>
            TownsHub
          </span>
          <span style={{ color: "#0ea5e9", fontSize: "32px", fontWeight: 700 }}>
            Marketing AI
          </span>
        </div>

        {/* Tagline */}
        <div style={{ display: "flex", marginBottom: "40px" }}>
          <span style={{ color: "#94a3b8", fontSize: "28px", fontWeight: 400 }}>
            One Topic. 16 Formats. 300+ Platforms.
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px" }}>
          {[
            { value: "16", label: "Content Formats" },
            { value: "305+", label: "Platforms" },
            { value: "GPT-4o", label: "AI Powered" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "16px",
                padding: "16px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ color: "#0ea5e9", fontSize: "28px", fontWeight: 800 }}>
                {stat.value}
              </span>
              <span style={{ color: "#64748b", fontSize: "16px", fontWeight: 500 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
