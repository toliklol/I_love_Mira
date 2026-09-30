import { useMemo } from 'react';
import { stickerPairs } from '../data/backgroundConfig.js';

function pickTwoDistinctPairs() {
  const shuffled = [...stickerPairs].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1] || shuffled[0]];
}

// Замена старому механизму "4 стикера по углам": вместо случайных одиночных
// картинок теперь берутся 2 пары — одна "живёт" на левой стороне (сверху и
// снизу), вторая — на правой. Размер и позиционирование — как у старого
// функционала (крупные картинки в углах экрана, ~15vh).
export default function PairedStickers({ refreshKey }) {
  const [leftPair, rightPair] = useMemo(() => pickTwoDistinctPairs(), [refreshKey]);
  if (!leftPair) return null;

  return (
    <div className="paired-stickers" aria-hidden="true">
      <img className="paired-sticker paired-sticker_top-left" src={leftPair.left} alt="" />
      <img className="paired-sticker paired-sticker_bottom-left" src={rightPair.left} alt="" />
      <img className="paired-sticker paired-sticker_top-right" src={leftPair.right} alt="" />
      <img className="paired-sticker paired-sticker_bottom-right" src={rightPair.right} alt="" />
    </div>
  );
}
