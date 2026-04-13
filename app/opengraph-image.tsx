import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TownsHub Limited'
export const size = { width: 1200, height: 1200 }
export const contentType = 'image/png'

export default function Image() {
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://townshub-app.vercel.app').trim()

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '1200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}
      >
        <img
          src={`${APP_URL}/og-logo-navy.jpg`}
          width={900}
          height={900}
          style={{ objectFit: 'contain' }}
        />
      </div>
    ),
    { width: 1200, height: 1200 }
  )
}
