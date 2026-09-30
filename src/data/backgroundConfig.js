import { stickerPackConfigs } from "./stickerPacks";

export const BACKGROUND_MODE_KEY = 'miraBackgroundMode';
export const SOLID_CHOICE_KEY = 'miraSolidBackgroundChoice';

export const BACKGROUND_MODES = [
  { id: 'solid', label: '🖼️ Сплошной фон' },
  { id: 'album', label: '📸 Семейный альбом' },
  { id: 'pairs', label: '💞 Парные стикеры' },
];

export const DEFAULT_BACKGROUND_MODE = 'album';
export const RANDOM_SOLID = 'random'; // значение "выбора" фона = случайный (по умолчанию)

// Диапазоны картинок, которые НЕ должны попадать в фон.
// Чтобы добавить исключение, укажи пак и границы диапазона, например:
// { pack: 'pack6', from: 4, to: 7 },
// { pack: 'pack6', from: 16, to: 20 }.
const PHOTO_EXCLUDED_RANGES = [
  { pack: 'pack5', from: 1, to: 41 },
  { pack: 'pack5', from: 60, to: 70 },
  { pack: 'pack6', from: 41, to: 42 },
  { pack: 'pack6', from: 57, to: 68 },
];

export function PHOTO_EXCLUDED() {
  return PHOTO_EXCLUDED_RANGES.flatMap(({ pack, from, to }) => {
    const photos = [];
    for (let number = from; number <= to; number++) { 
      photos.push(`${pack}:${number}`);
    }
    console.log(`PHOTO_EXCLUDED: ${photos.join(', ')}`);
    return photos;
  });
}

// Общий пул фото для режимов "Сплошной фон" и "Семейный альбом" — берутся
// из 5 - 7 стикер-паков (в них и лежат обычные фото, а не мультяшные стикеры),
// за вычетом PHOTO_EXCLUDED.
export function buildPhotoPool() {
  const excluded = new Set(PHOTO_EXCLUDED());
  const pool = [];
  const packs = [
    { id: 'pack5', count: stickerPackConfigs[4].count }, 
    { id: 'pack6', count: stickerPackConfigs[5].count }, 
    { id: 'pack7', count: stickerPackConfigs[6].count }
  ];
  packs.forEach(({ id, count }) => {
    for (let n = 1; n <= count; n++) {
      if (excluded.has(`${id}:${n}`)) continue;
      pool.push(`assets/stickerpack/${id}/sticker${n}.png`);
    }
  });
  console.log(`buildPhotoPool: ${pool.length} photos in pool`);
  return pool;
}


const PHOTO_PAIRS = [
  {
    packL: 'pack3',
    packR: 'pack4',
    idL: 42,
    idR: 7
  },
  {
    packL: 'pack3',
    packR: 'pack5',
    idL: 39,
    idR: 61
  },
  {
    packL: 'pack6',
    packR: 'pack6',
    idL: 2,
    idR: 1
  },
  {
    packL: 'pack6',
    packR: 'pack6',
    idL: 35,
    idR: 36
  },
  {
    packL: 'pack1',
    packR: 'pack4',
    idL: 1,
    idR: 16
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 4,
    idR: 9
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 26,
    idR: 14
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 7,
    idR: 16
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 11,
    idR: 10
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 12,
    idR: 64
  },
  {
    packL: 'pack3',
    packR: 'pack5',
    idL: 38,
    idR: 50
  },
  {
    packL: 'pack3',
    packR: 'pack4',
    idL: 4,
    idR: 44
  },
  {
    packL: 'pack1',
    packR: 'pack4',
    idL: 14,
    idR: 39
  },
  {
    packL: 'pack1',
    packR: 'pack5',
    idL: 15,
    idR: 44
  },
  {
    packL: 'pack6',
    packR: 'pack6',
    idL: 37,
    idR: 38
  },
  {
    packL: 'pack1',
    packR: 'pack4',
    idL: 58,
    idR: 47
  },
]
// Пары для режима "Парные стикеры" — дефолтная расстановка (просто соседние
// картинки из 6 пака). Замени пути на свои реальные "парные" стикеры/фото —
// например, одинаковая сцена с двух сторон, парные аватарки и т.п.
export function buildDefaultStickerPairs() {
  const pairs = [];
  let i = 1
  PHOTO_PAIRS.forEach(pair => {
    pairs.push({
      id: `pair${i}`,
      left: `assets/stickerpack/${pair.packL}/sticker${pair.idL}.png`,
      right: `assets/stickerpack/${pair.packR}/sticker${pair.idR}.png`,
    });
    i++;
  });
  return pairs;
}

export const stickerPairs = buildDefaultStickerPairs();
