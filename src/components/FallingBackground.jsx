import { useFallingEmojis } from '../hooks/useFallingEmojis.js';

export default function FallingBackground({ pageId }) {
  const items = useFallingEmojis(pageId);
  return (
    <div className="falling-container" id="fallingContainer">
      {items.map((it) => (
        <div
          key={it.key}
          className="falling-item"
          style={{
            left: it.left,
            fontSize: it.fontSize,
            animationDuration: it.animationDuration,
            animationDelay: it.animationDelay,
            opacity: it.opacity,
          }}
        >
          {it.symbol}
        </div>
      ))}
    </div>
  );
}
