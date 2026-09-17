import { useEffect, useState } from 'react';

// Меряем высоту не .app-wrapper, а document.body — но НЕ через
// scrollHeight (это давало обратную связь: сам абсолютно
// спозиционированный фон-альбом добавлял себя же в scrollHeight через
// переполнение, и однажды раздувшись, высота больше не уменьшалась).
//
// ResizeObserver.contentRect у body — это его LAYOUT-высота (та, что
// реально участвует в раскладке: обычный поток + min-height: 100vh),
// а не scrollable-overflow-высота. Absolutely positioned потомки (наш
// собственный фон-альбом) физически НЕ участвуют в этом расчёте — проверено
// отдельным тестом в браузере. Поэтому она включает отступы (margin)
// вокруг .app-wrapper — то есть даёт высоту всего документа целиком — но
// без циклической зависимости от собственного фона.
export function usePageHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const h = entry?.contentRect?.height ?? document.body.offsetHeight;
      setHeight(Math.ceil(h));
    });
    observer.observe(document.body);
    setHeight(document.body.offsetHeight);

    return () => observer.disconnect();
  }, []);

  return height;
}
