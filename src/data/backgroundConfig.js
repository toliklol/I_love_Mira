export const BACKGROUND_MODE_KEY = 'miraBackgroundMode';
export const SOLID_CHOICE_KEY = 'miraSolidBackgroundChoice';

export const BACKGROUND_MODES = [
  { id: 'solid', label: '🖼️ Сплошной фон' },
  { id: 'album', label: '📸 Семейный альбом' },
  { id: 'pairs', label: '💞 Парные стикеры' },
];

export const DEFAULT_BACKGROUND_MODE = 'solid';
export const RANDOM_SOLID = 'random'; // значение "выбора" фона = случайный (по умолчанию)

// Список исключений — что НЕ должно попадать в фон (ни в "Сплошной фон",
// ни в "Семейный альбом"). Формат — "pack:номер", например "pack6:5".
// Впиши сюда номера картинок, которые не подходят для фона (плохо
// обрезаются, слишком тёмные/светлые, дубликаты и т.п.).
export const PHOTO_EXCLUDED = [
  // 'pack6:5', 'pack7:12',
];

// Общий пул фото для режимов "Сплошной фон" и "Семейный альбом" — берутся
// из 6 и 7 стикер-паков (в них и лежат обычные фото, а не мультяшные стикеры),
// за вычетом PHOTO_EXCLUDED.
export function buildPhotoPool() {
  const excluded = new Set(PHOTO_EXCLUDED);
  const pool = [];
  const packs = [{ id: 'pack6', count: 75 }, { id: 'pack7', count: 68 }];
  packs.forEach(({ id, count }) => {
    for (let n = 1; n <= count; n++) {
      if (excluded.has(`${id}:${n}`)) continue;
      pool.push(`assets/stickerpack/${id}/sticker${n}.png`);
    }
  });
  return pool;
}

// Пары для режима "Парные стикеры" — дефолтная расстановка (просто соседние
// картинки из 6 пака). Замени пути на свои реальные "парные" стикеры/фото —
// например, одинаковая сцена с двух сторон, парные аватарки и т.п.
export function buildDefaultStickerPairs() {
  const pairs = [];
  for (let i = 1; i <= 20; i++) {
    const left = 2 * i - 1;
    const right = 2 * i;
    pairs.push({
      id: `pair${i}`,
      left: `assets/stickerpack/pack6/sticker${left}.png`,
      right: `assets/stickerpack/pack6/sticker${right}.png`,
    });
  }
  return pairs;
}

export const stickerPairs = buildDefaultStickerPairs();
