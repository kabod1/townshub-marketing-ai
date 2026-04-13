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
        {/* Logo — large and dominant */}
        <img
          src={`${APP_URL}/og-image.jpg`}
          width={860}
          height={430}
          style={{ objectFit: 'contain', borderRadius: '20px' }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: '24px',
            color: '#94a3b8',
            fontSize: '24px',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          AI-powered content amplification across 300+ platforms
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
