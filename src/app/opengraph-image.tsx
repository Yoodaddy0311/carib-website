import { ImageResponse } from 'next/og';

// Static export compatibility
export const dynamic = 'force-static';

export const alt = 'Carib - AI 업무 자동화 전문가 그룹';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            width: 12,
            height: 12,
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 60,
            width: 12,
            height: 12,
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: 60,
            width: 80,
            height: 4,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
          }}
        />

        {/* Shark Icon */}
        <div
          style={{
            display: 'flex',
            marginBottom: 24,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shark body */}
            <path
              d="M15 50 C15 50 25 30 50 30 C75 30 90 45 90 50 C90 55 75 70 50 70 C25 70 15 50 15 50 Z"
              fill="rgba(255,255,255,0.95)"
            />
            {/* Dorsal fin */}
            <path d="M45 30 L55 10 L60 30 Z" fill="rgba(255,255,255,0.95)" />
            {/* Tail */}
            <path d="M15 50 L5 35 L10 50 L5 65 L15 50 Z" fill="rgba(255,255,255,0.95)" />
            {/* Eye */}
            <circle cx="75" cy="48" r="4" fill="#2563eb" />
            {/* Gill lines */}
            <path d="M65 45 L68 55" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 44 L63 56" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-2px',
              marginBottom: 32,
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            Carib
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.4,
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span>반복되는 업무는 AI에게,</span>
            <span>창의적인 일은 사람에게.</span>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            AI 업무 자동화 전문가 그룹
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 20,
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          carib.team
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
