import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TownsHub Marketing AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://townshub-app.vercel.app').trim()

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <img
          src={`${APP_URL}/og-image.jpg`}
          width={420}
          height={210}
          style={{ objectFit: 'contain', borderRadius: '16px' }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: '32px',
            color: '#94a3b8',
            fontSize: '28px',
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          AI-powered content amplification across 300+ platforms
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #38bdf8, #06b6d4)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
