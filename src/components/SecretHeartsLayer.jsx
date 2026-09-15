import { secretHeartPositions } from '../data/config.js';

export default function SecretHeartsLayer({ pageId, foundHearts, onCollect }) {
  const hearts = secretHeartPositions.filter((h) => h.page === pageId);
  if (hearts.length === 0) return null;

  return (
    <div className="page-secret-layer">
      {hearts.map((h) => {
        const found = foundHearts.has(h.id);
        const style = { left: h.left };
        if (h.top !== undefined) style.top = h.top;
        if (h.bottom !== undefined) style.bottom = h.bottom;
        return (
          <button
            key={h.id}
            type="button"
            className={`secret-heart${found ? ' found' : ''}`}
            style={style}
            aria-label={`Сердечко ${h.id}`}
            title={`Сердечко ${h.id}`}
            disabled={found}
            onClick={(e) => {
              if (found) return;
              const rect = e.currentTarget.getBoundingClientRect();
              onCollect(h.id, rect.left + rect.width / 2, rect.top + rect.height / 2);
            }}
          >
            ❤
          </button>
        );
      })}
    </div>
  );
}
