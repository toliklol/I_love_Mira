import { useCallback, useEffect, useState } from 'react';
import { buildPhotoPool, RANDOM_SOLID } from '../data/backgroundConfig.js';

const photoPool = buildPhotoPool();
const ALBUM_COLS = 3;

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Сколько фото показывать в режиме "Семейный альбом" — чем выше страница,
// тем больше фото помещается. Плотность увеличена, чтобы между рядами не
// было заметных пустых промежутков.
function albumPhotoCount(pageHeight) {
  const height = Math.max(pageHeight, window.innerHeight);
  return Math.max(10, Math.min(40, Math.round(height / 140)));
}

// Раскладка сеткой с небольшим случайным сдвигом внутри своей ячейки —
// вместо чистого random(0,100%), который давал сильные наложения и фото,
// вылезающие за край. Сетка сама по себе не даёт фото сильно перекрываться,
// а ограничение (clamp) не даёт им уходить к самому краю экрана. Теперь эта
// раскладка считается в процентах от контейнера, который сам по себе всегда
// точно совпадает по высоте с реальной страницей (см. AlbumBackground.jsx —
// он вложен внутрь .app-wrapper и растянут через inset:0, а не через
// вычисленную в JS высоту), так что "недоезд" до низа страницы больше
// невозможен структурно.
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
    const jitterX = (Math.random() * 0.6 - 0.3) * cellW;
    const jitterY = (Math.random() * 0.5 - 0.25) * cellH;
    const left = Math.min(95, Math.max(5, col * cellW + cellW / 2 + jitterX));
    const top = Math.min(98, Math.max(2, row * cellH + cellH / 2 + jitterY));

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
// pageHeight (из usePageHeight(appWrapperRef)) здесь используется только
// для того, чтобы прикинуть, сколько фото поместится — на саму раскладку
// (высоту контейнера) он больше не влияет, это отдельная, более надёжная
// чисто CSS-механика.
export function useSiteBackground(mode, solidChoice, pageHeight) {
  const [solidPhoto, setSolidPhoto] = useState(() => buildSolidPhoto(solidChoice));
  const [albumPhotos, setAlbumPhotos] = useState(() => buildAlbumPhotos(pageHeight));

  // Если выбрали конкретную картинку в настройках — применяем сразу.
  useEffect(() => {
    if (solidChoice && solidChoice !== RANDOM_SOLID) {
      setSolidPhoto(solidChoice);
    }
  }, [solidChoice]);

  // Высота реального контента изменилась (сменили страницу и т.п.) —
  // пересобираем набор фото под новое количество.
  useEffect(() => {
    if (mode === 'album' && pageHeight > 0) {
      setAlbumPhotos(buildAlbumPhotos(pageHeight));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageHeight, mode]);

  const randomize = useCallback(() => {
    setSolidPhoto((prev) => (solidChoice && solidChoice !== RANDOM_SOLID ? prev : buildSolidPhoto(RANDOM_SOLID)));
    setAlbumPhotos((prev) => (prev.length > 0 ? buildAlbumPhotos(pageHeight) : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solidChoice, pageHeight]);

  return { solidPhoto, albumPhotos, randomize, photoPool };
}
