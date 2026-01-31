import { ImageResponse } from 'next/og';

// Static export compatibility
export const dynamic = 'force-static';

export const alt = '커피챗 예약 | Carib';
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

        {/* Coffee icon */}
        <div
          style={{
            display: 'flex',
            marginBottom: 24,
            fontSize: 64,
          }}
        >
          <span role="img" aria-label="coffee">
            &#9749;
          </span>
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
          {/* Brand name */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '-1px',
              marginBottom: 16,
            }}
          >
            Carib
          </div>

          {/* Page Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-2px',
              marginBottom: 24,
              textShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
            }}
          >
            30분 무료 상담
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            AI 업무 자동화 전문가와 함께
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: 800,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            맞춤 솔루션을 찾아보세요
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
