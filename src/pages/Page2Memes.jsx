import { useState } from 'react';
import { memes } from '../data/memes.js';

export default function Page2Memes({ onBurst }) {
  const [pressed, setPressed] = useState(null);

  function handleClick(e, meme, idx) {
    // Клик по нативным элементам управления видео (play/pause, перемотка,
    // громкость) не должен считаться "тапом по карточке" — иначе звук
    // хлопка и взрыв стикеров будут срабатывать сами по себе при
    // обычном пользовании плеером.
    if (e.target.closest('video[controls]')) return;

    const sound = new Audio('assets/sounds/emoji_salut.mp3');
    sound.play().catch(() => {});

    setPressed(idx);
    setTimeout(() => setPressed(null), 200);

    const rect = e.currentTarget.getBoundingClientRect();
    onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, meme.stickers);
  }

  return (
    <section className="page active" id="page2">
      <div className="page-subtitle">
        🖼️ Любимые мемы и стикеры <span>Наши</span>
      </div>
      <div className="meme-grid">
        {memes.map((meme, idx) => (
          <div
            key={idx}
            className={`meme-card${meme.type === 'video' ? ' meme-card_video' : ''}${meme.wide ? ' meme-card_wide' : ''}`}
            data-stickers={meme.stickers}
            style={{ transform: pressed === idx ? 'scale(0.92)' : '' }}
            onClick={(e) => handleClick(e, meme, idx)}
          >
            {meme.type === 'video' ? (
              <video
                className="video-placeholder"
                src={meme.src}
                autoPlay={!meme.controls}
                loop
                muted={!meme.controls}
                controls={meme.controls}
              />
            ) : (
              <img
                src={meme.src}
                alt="мем"
                style={meme.style ? Object.fromEntries(
                  meme.style.split(';').filter(Boolean).map((decl) => {
                    const [k, v] = decl.split(':');
                    const camel = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                    return [camel, v.trim()];
                  })
                ) : undefined}
              />
            )}
            <div className="caption">{meme.caption}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', textAlign: 'center' }}>
        * тапни по карточке
      </p>
    </section>
  );
}
