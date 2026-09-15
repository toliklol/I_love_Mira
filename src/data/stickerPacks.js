export const stickerPackConfigs = [
  { id: 'pack1', label: 'Наш 1 стикер пак😀', folder: 'assets/stickerpack/pack1', count: 49, defaultOpen: false },
  { id: 'pack2', label: 'Наш 2 стикер пак😘', folder: 'assets/stickerpack/pack2', count: 27, defaultOpen: false },
  { id: 'pack3', label: 'Наш 3 стикер пак🤩', folder: 'assets/stickerpack/pack3', count: 51, defaultOpen: false },
  { id: 'pack4', label: 'Наш 4 стикер пак😻', folder: 'assets/stickerpack/pack4', count: 45, defaultOpen: false },
  { id: 'pack5', label: 'Наш 5 стикер пак👨‍🦱', folder: 'assets/stickerpack/pack5', count: 45, defaultOpen: false },
  { id: 'pack6', label: 'Наш 6 общий стикер пак❤️', folder: 'assets/stickerpack/pack6', count: 75, defaultOpen: false },
  { id: 'pack7', label: 'Наш 7 красивые фото❤️‍🔥', folder: 'assets/stickerpack/pack7', count: 68, defaultOpen: false },
];

// Стикеры по краям карточки — берутся из тех же папок.
export const bgStickerPackSources = [
  { folder: 'assets/stickerpack/pack1', count: 46 },
  { folder: 'assets/stickerpack/pack2', count: 12 },
  { folder: 'assets/stickerpack/pack3', count: 49 },
  { folder: 'assets/stickerpack/pack6', count: 3 },
];

export const BG_STICKER_EXCLUDED = [
  'pack2:3', 'pack2:4', 'pack2:6',
  'pack3:3', 'pack3:5', 'pack3:20',
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
