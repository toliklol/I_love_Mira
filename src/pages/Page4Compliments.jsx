import { useMemo, useState } from 'react';
import { compliments } from '../data/compliments.js';

export default function Page4Compliments() {
  const shuffled = useMemo(() => [...compliments].sort(() => Math.random() - 0.5), []);
  const [pressed, setPressed] = useState(null);

  return (
    <section className="page active" id="page4">
      <div className="page-subtitle">
        💚 Слова, которые я хочу сказать тебе <span>∞</span>
      </div>
      <div className="compliments-container" id="complimentList">
        {shuffled.map((word, idx) => (
          <span
            key={idx}
            className="compliment-chip"
            style={pressed === idx ? { background: 'rgba(165, 214, 167, 0.15)', transform: 'scale(0.92)' } : undefined}
            onClick={() => { setPressed(idx); setTimeout(() => setPressed(null), 200); }}
          >
            💚 {word}
          </span>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: '0.7rem', color: 'rgba(165,214,167,0.5)', textAlign: 'center' }}>
        листай вниз ❤️
      </p>
    </section>
  );
}
