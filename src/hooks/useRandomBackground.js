import { useCallback, useState } from 'react';
import {
  bgStickerPackSources, BG_STICKER_EXCLUDED, BG_STICKER_ANCHORS,
  BG_STICKER_JITTER, BG_STICKER_JITTER_PX, BG_STICKER_MIN_SIZE,
  BG_STICKER_MAX_SIZE, BG_STICKER_MAX_ROTATE,
} from '../data/stickerPacks.js';

// Раньше этот хук ещё и красил body четырьмя случайными стикерами по углам
// экрана — эта часть теперь заменена настраиваемым фоном (см. настройки в
// меню и useSiteBackground.js), поэтому здесь остались только стикеры,
// "плавающие" по краям карточки.

function buildBgStickerPool() {
  const excluded = new Set(BG_STICKER_EXCLUDED);
  const pool = [];
  bgStickerPackSources.forEach((pack) => {
    const match = pack.folder.match(/pack(\d+)/);
    const packId = match ? `pack${match[1]}` : pack.folder;
    for (let n = 1; n <= pack.count; n++) {
      const path = `${pack.folder}/sticker${n}.png`;
      const shortId = `${packId}:${n}`;
      if (excluded.has(path) || excluded.has(shortId)) continue;
      pool.push(path);
    }
  });
  return pool;
}

const bgStickerPool = buildBgStickerPool();

function buildCardStickers() {
  const shuffledPool = [...bgStickerPool].sort(() => Math.random() - 0.5);
  const shuffledAnchors = [...BG_STICKER_ANCHORS].sort(() => Math.random() - 0.5);

  return shuffledAnchors
    .map((anchor, i) => {
      if (shuffledPool.length === 0) return null;
      const jitterLeft = (Math.random() * 2 - 1) * BG_STICKER_JITTER;
      const jitterOffset = (Math.random() * 2 - 1) * BG_STICKER_JITTER_PX;
      const size = BG_STICKER_MIN_SIZE + Math.random() * (BG_STICKER_MAX_SIZE - BG_STICKER_MIN_SIZE);
      const rotate = (Math.random() * 2 - 1) * BG_STICKER_MAX_ROTATE;
      const opacity = 0.85 + Math.random() * 0.15;
      const floatDuration = 5 + Math.random() * 4;
      const src = shuffledPool[i % shuffledPool.length];

      const style = {
        position: 'absolute',
        left: (anchor.left + jitterLeft) + '%',
        width: size + 'px',
        opacity,
        '--rot': rotate + 'deg',
        '--float-duration': floatDuration + 's',
        animationDelay: (Math.random() * 3) + 's',
        transform: `rotate(${rotate}deg)`,
      };
      if (anchor.edge === 'bottom') {
        style.bottom = (anchor.offset + jitterOffset) + 'px';
      } else {
        style.top = (anchor.offset + jitterOffset) + 'px';
      }

      return { key: `bgs-${i}`, src, style };
    })
    .filter(Boolean);
}

// Хук: случайные стикеры по краям карточки.
// Вызови randomize(), чтобы перегенерировать (аналог random_stickerbg() из оригинала).
export function useRandomBackground() {
  const [cardStickers, setCardStickers] = useState(() => buildCardStickers());

  const randomize = useCallback(() => {
    setCardStickers(buildCardStickers());
  }, []);

  return { cardStickers, randomize };
}
