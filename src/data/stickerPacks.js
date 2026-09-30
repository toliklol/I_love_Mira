export const stickerPackConfigs = [
  { id: 'pack1', label: 'Твой чиби стикерпак😀', folder: 'assets/stickerpack/pack1', count: 59, defaultOpen: false },
  { id: 'pack2', label: 'Твой подростковый стикерпак😘', folder: 'assets/stickerpack/pack2', count: 32, defaultOpen: false },
  { id: 'pack3', label: 'Твой 18+ стикерпак🤩', folder: 'assets/stickerpack/pack3', count: 56, defaultOpen: false },
  { id: 'pack4', label: 'Мой стикерпак c белым котиком 😻', folder: 'assets/stickerpack/pack4', count: 48, defaultOpen: false },
  { id: 'pack5', label: 'Мой стикерпак👨‍🦱', folder: 'assets/stickerpack/pack5', count: 70, defaultOpen: false },
  { id: 'pack6', label: 'Наши общие картинки❤️', folder: 'assets/stickerpack/pack6', count: 115, defaultOpen: false },
  { id: 'pack7', label: 'Твои красивые картинки❤️‍🔥', folder: 'assets/stickerpack/pack7', count: 112, defaultOpen: false },
  { id: 'pack8', label: 'Архив стикеров🗑', folder: 'assets/stickerpack/delete', count: 57, defaultOpen: false },
];

// Стикеры по краям карточки — берутся из тех же папок.
export const bgStickerPackSources = [
  { folder: stickerPackConfigs[0].folder, count: stickerPackConfigs[0].count },
  { folder: stickerPackConfigs[1].folder, count: 15 },
  { folder: stickerPackConfigs[2].folder, count: stickerPackConfigs[2].count },
  { folder: stickerPackConfigs[3].folder, count: 4 },
];

export const BG_STICKER_EXCLUDED = [
  'pack3:3', 'pack3:5', 'pack3:20',
  'pack3:8', 'pack3:15', 'pack3:16',
  'pack3:17', 'pack3:18', 'pack3:27',
  'pack3:28', 'pack3:29', 'pack3:30',
  'pack3:52', 'pack3:53', 'pack3:55',
  'pack3:56',
];

export const BG_STICKER_ANCHORS = [
  { left: -6, edge: 'top', offset: 50 },
  { left: 90, edge: 'top', offset: 6 },
  { left: 45, edge: 'top', offset: -45 },
  { left: -6, edge: 'bottom', offset: 10 },
  { left: 92, edge: 'bottom', offset: 14 },
  { left: 45, edge: 'bottom', offset: -40 },
];

export const BG_STICKER_JITTER = 3;
export const BG_STICKER_JITTER_PX = 6;
export const BG_STICKER_MIN_SIZE = 50;
export const BG_STICKER_MAX_SIZE = 75;
export const BG_STICKER_MAX_ROTATE = 24;
