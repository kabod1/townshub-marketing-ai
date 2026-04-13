import { ImageResponse } from "next/og";

export const alt = "TownsHub Marketing AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function Image() {
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://townshub-app.vercel.app").trim();

  // Fetch the real logo as base64 so Satori can embed it
  const logoRes = await fetch(`${APP_URL}/og-logo.png`);
  const logoBuffer = await logoRes.arrayBuffer();
  const logoBytes = new Uint8Array(logoBuffer);
  let binary = "";
  for (let i = 0; i < logoBytes.byteLength; i++) {
    binary += String.fromCharCode(logoBytes[i]);
  }
  const logoSrc = `data:image/png;base64,${btoa(binary)}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0e2244 50%, #0a1628 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {/* Real logo */}
        <img
          src={logoSrc}
          width={320}
          height={320}
          style={{ objectFit: "contain" }}
        />

        {/* Tagline */}
        <div style={{ display: "flex" }}>
          <span
            style={{
              color: "#94a3b8",
              fontSize: "26px",
              fontWeight: 400,
              letterSpacing: "0.5px",
            }}
          >
            One Topic. 16 Formats. 300+ Platforms.
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
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
                borderRadius: "14px",
                padding: "12px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span style={{ color: "#38bdf8", fontSize: "24px", fontWeight: 800 }}>
                {stat.value}
              </span>
              <span style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
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
