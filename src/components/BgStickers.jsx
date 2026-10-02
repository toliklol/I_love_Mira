import { useRef, useState } from 'react';
import LoadingImage from './LoadingImage.jsx';

const SPIN_DURATION = 700; // мс, должно совпадать с длительностью .spin-once в CSS

export default function BgStickers({ stickers }) {
  const [spinning, setSpinning] = useState(() => new Set());
  const timeoutsRef = useRef({});

  function handleClick(key) {
    setSpinning((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    clearTimeout(timeoutsRef.current[key]);
    timeoutsRef.current[key] = setTimeout(() => {
      setSpinning((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, SPIN_DURATION);
  }

  return (
    <div className="bg-stickers-container" id="bgStickersContainer">
      {stickers.map((s) => {
        const isSpinning = spinning.has(s.key);
        return (
          <LoadingImage
            key={s.key}
            src={s.src}
            alt=""
            className={`bg-sticker-item${isSpinning ? ' spin-once' : ''}`}
            // Пока крутится — сбрасываем animation-delay в 0, иначе унаследованная
            // от "парения" случайная задержка (до 3с) заставит спин стартовать
            // не сразу по клику, а с опозданием.
            style={isSpinning ? { ...s.style, animationDelay: '0s' } : s.style}
            onClick={() => handleClick(s.key)}
          />
        );
      })}
    </div>
  );
}
