import { useCallback, useState } from 'react';
import { SECRET_HEART_KEY, SECRET_HEART_TOTAL } from '../data/config.js';

function loadSaved() {
  try {
    const raw = localStorage.getItem(SECRET_HEART_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function save(set) {
  try {
    localStorage.setItem(SECRET_HEART_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage недоступен — молча игнорируем
  }
}

export function useSecretHearts(onFound) {
  const [foundHearts, setFoundHearts] = useState(loadSaved);

  const collect = useCallback((heartId, screenX, screenY) => {
    setFoundHearts((prev) => {
      if (prev.has(heartId)) return prev;
      const next = new Set(prev);
      next.add(heartId);
      save(next);
      return next;
    });

    const sound = new Audio('assets/sounds/winning-sound-effect.mp3');
    sound.volume = 0.35;
    sound.play().catch(() => {});

    onFound?.(screenX, screenY);
  }, [onFound]);

  const unlocked = foundHearts.size >= SECRET_HEART_TOTAL;

  return { foundHearts, collect, unlocked };
}
