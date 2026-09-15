import { useCallback, useEffect, useRef, useState } from 'react';
import { buildPhotoPool, RANDOM_SOLID } from '../data/backgroundConfig.js';

const photoPool = buildPhotoPool();
const ALBUM_COLS = 3;

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Сколько фото показывать в режиме "Семейный альбом" — чем выше страница,
// тем больше фото помещается. Увеличено по сравнению с прошлой версией.
function albumPhotoCount(pageHeight) {
  const height = Math.max(pageHeight, window.innerHeight);
  return Math.max(10, Math.min(40, Math.round(height / 150)));
}

// Раскладка сеткой с небольшим случайным сдвигом внутри своей ячейки —
// вместо чистого random(0,100%), который давал сильные наложения и фото,
// вылезающие за край. Сетка сама по себе не даёт фото сильно перекрываться,
// а ограничение (clamp) не даёт им уходить к самому краю экрана.
function buildAlbumPhotos(pageHeight) {
  const count = albumPhotoCount(pageHeight);
  const chosen = pickRandom(photoPool, count);
  while (chosen.length < count && photoPool.length > 0) {
    chosen.push(photoPool[Math.floor(Math.random() * photoPool.length)]);
  }

  const cols = ALBUM_COLS;
  const rows = Math.max(1, Math.ceil(chosen.length / cols));
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  return chosen.map((src, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (Math.random() * 0.4 - 0.2) * cellW;
    const jitterY = (Math.random() * 0.4 - 0.2) * cellH;
    const left = Math.min(94, Math.max(6, col * cellW + cellW / 2 + jitterX));
    const top = Math.min(97, Math.max(3, row * cellH + cellH / 2 + jitterY));

    return {
      key: `album-${i}`,
      src,
      style: {
        top: top + '%',
        left: left + '%',
        transform: `translate(-50%, -50%) rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`,
      },
    };
  });
}

function buildSolidPhoto(solidChoice) {
  if (solidChoice && solidChoice !== RANDOM_SOLID && photoPool.includes(solidChoice)) {
    return solidChoice;
  }
  return photoPool[Math.floor(Math.random() * photoPool.length)];
}

// Контент для фоновых режимов "Сплошной фон" и "Семейный альбом".
// randomize() пересчитывает выбор — вызывается вместе с остальной
// рандомизацией при переходе по страницам (для "Сплошного фона" только
// когда выбран случайный вариант — если выбрана конкретная картинка, она
// остаётся неизменной).
export function useSiteBackground(mode, solidChoice) {
  const [solidPhoto, setSolidPhoto] = useState(() => buildSolidPhoto(solidChoice));
  const [pageHeight, setPageHeight] = useState(() => (
    typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0
  ));
  const [albumPhotos, setAlbumPhotos] = useState(() => buildAlbumPhotos(pageHeight));

  // Высота страницы у каждой вкладки разная (и может меняться после загрузки
  // картинок) — трекаем её через ResizeObserver на body, а не однократно,
  // чтобы "Семейный альбом" всегда точно покрывал всю прокручиваемую высоту
  // и мог растягиваться/сжиматься вместе со страницей.
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      setPageHeight(document.documentElement.scrollHeight);
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  // Если выбрали конкретную картинку в настройках — применяем сразу.
  useEffect(() => {
    if (solidChoice && solidChoice !== RANDOM_SOLID) {
      setSolidPhoto(solidChoice);
    }
  }, [solidChoice]);

  useEffect(() => {
    if (mode === 'album') setAlbumPhotos(buildAlbumPhotos(pageHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageHeight, mode]);

  const randomize = useCallback(() => {
    setSolidPhoto((prev) => (solidChoice && solidChoice !== RANDOM_SOLID ? prev : buildSolidPhoto(RANDOM_SOLID)));
    setAlbumPhotos(buildAlbumPhotos(document.documentElement.scrollHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solidChoice]);

  return { solidPhoto, albumPhotos, randomize, photoPool, pageHeight };
}
