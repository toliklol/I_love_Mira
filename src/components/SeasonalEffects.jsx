import { useMemo } from 'react';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function Snowfall() {
  const flakes = useMemo(() => Array.from({ length: 55 }, (_, i) => {
    const size = rand(2, 6);
    return {
      key: `snow-${i}`,
      left: rand(0, 100) + '%',
      size,
      duration: rand(9, 18),
      delay: rand(0, 15),
      drift: rand(20, 70) * (Math.random() < 0.5 ? -1 : 1),
      opacity: rand(0.45, 0.95),
      blur: size > 4 ? 0 : 0.5,
    };
  }), []);

  return (
    <div className="season-fx season-fx_snow" aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.key}
          className="season-snowflake"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            filter: f.blur ? `blur(${f.blur}px)` : undefined,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            '--drift': f.drift + 'px',
          }}
        />
      ))}
    </div>
  );
}

function FallingLeaves() {
  const colors = ['#c96a2e', '#d98736', '#a8461f', '#e0a63a', '#8a3b1f'];
  const leaves = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    key: `leaf-${i}`,
    left: rand(0, 100) + '%',
    size: rand(14, 24),
    duration: rand(8, 15),
    delay: rand(0, 14),
    drift: rand(40, 90) * (Math.random() < 0.5 ? -1 : 1),
    spin: rand(180, 720) * (Math.random() < 0.5 ? -1 : 1),
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: rand(0.6, 0.95),
  })), []);

  return (
    <div className="season-fx season-fx_leaves" aria-hidden="true">
      {leaves.map((l) => (
        <svg
          key={l.key}
          className="season-leaf"
          viewBox="0 0 32 32"
          style={{
            left: l.left,
            width: l.size,
            height: l.size,
            opacity: l.opacity,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            '--drift': l.drift + 'px',
            '--spin': l.spin + 'deg',
          }}
        >
          <path d="M16 2C6 6 4 20 16 30 28 20 26 6 16 2Z" fill={l.color} />
          <line x1="16" y1="5" x2="16" y2="26" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        </svg>
      ))}
    </div>
  );
}

function FallingPetals() {
  const colors = ['#ffd3e6', '#ffc1dc', '#ffffff', '#ffb8d6'];
  const petals = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    key: `petal-${i}`,
    left: rand(0, 100) + '%',
    size: rand(10, 18),
    duration: rand(9, 16),
    delay: rand(0, 14),
    drift: rand(35, 80) * (Math.random() < 0.5 ? -1 : 1),
    spin: rand(120, 480) * (Math.random() < 0.5 ? -1 : 1),
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: rand(0.65, 0.95),
  })), []);

  return (
    <div className="season-fx season-fx_petals" aria-hidden="true">
      {petals.map((p) => (
        <svg
          key={p.key}
          className="season-petal"
          viewBox="0 0 20 32"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': p.drift + 'px',
            '--spin': p.spin + 'deg',
          }}
        >
          <path d="M10 0C4 6 0 14 0 20c0 7 4 12 10 12s10-5 10-12c0-6-4-14-10-20Z" fill={p.color} />
        </svg>
      ))}
    </div>
  );
}

function SummerSun() {
  return (
    <div className="season-fx season-fx_sun" aria-hidden="true">
      <div className="season-sun-rays" />
      <div className="season-sun-core" />
      <div className="season-sun-flare season-sun-flare_1" />
      <div className="season-sun-flare season-sun-flare_2" />
    </div>
  );
}

// Реалистичные (насколько это возможно на чистом CSS/SVG) сезонные эффекты —
// отдельный слой поверх обычного падающего фона эмодзи. Зимой — снег,
// осенью — листья, весной — лепестки, летом — солнце в углу экрана.
export default function SeasonalEffects({ season }) {
  if (season === 'winter') return <Snowfall />;
  if (season === 'autumn') return <FallingLeaves />;
  if (season === 'spring') return <FallingPetals />;
  if (season === 'summer') return <SummerSun />;
  return null;
}
