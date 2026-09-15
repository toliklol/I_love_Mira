import { useState } from 'react';
import { jokes } from '../data/jokes.js';

export default function Page3Jokes() {
  const [pressed, setPressed] = useState(null);

  return (
    <section className="page active" id="page3">
      <div className="page-subtitle">
        😉 Наши повадки и приколы <span>🔥</span>
      </div>
      <div className="jokes-list">
        {jokes.map((text, idx) => (
          <div
            key={idx}
            className="joke-item"
            style={{ transform: pressed === idx ? 'scale(0.96)' : '' }}
            onClick={() => { setPressed(idx); setTimeout(() => setPressed(null), 200); }}
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
