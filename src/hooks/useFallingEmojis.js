import { useRef, useState } from 'react';
import { pageEmojis } from '../data/config.js';

const COUNT = 35;

function randomVisualProps() {
  return {
    left: Math.random() * 100 + '%',
    fontSize: (14 + Math.random() * 22) + 'px',
    animationDuration: (12 + Math.random() * 18) + 's',
    animationDelay: (Math.random() * 20) + 's',
    opacity: 0.3 + Math.random() * 0.5,
  };
}

function pickSymbol(pageId) {
  const emojis = pageEmojis[pageId] || pageEmojis.default;
  return emojis[Math.floor(Math.random() * emojis.length)];
}

// Раньше ключ каждого элемента включал pageId, поэтому при каждом переходе
// на другую страницу все 35 эмодзи размонтировались и создавались заново —
// они буквально пропадали и появлялись из ниоткуда. Теперь элементы и их
// "траектория" (позиция, размер, длительность падения) стабильны и не
// пересоздаются — при смене страницы обновляется только сам эмодзи-символ,
// то есть они "на лету" заменяются на актуальные из data/config.js, продолжая
// падать как ни в чём не бывало.
export function useFallingEmojis(pageId) {
  const itemsRef = useRef(null);
  const lastPageRef = useRef(null);
  const [, forceRender] = useState(0);

  if (!itemsRef.current) {
    itemsRef.current = Array.from({ length: COUNT }, (_, i) => ({
      key: `fe-${i}`,
      symbol: pickSymbol(pageId),
      ...randomVisualProps(),
    }));
    lastPageRef.current = pageId;
  } else if (lastPageRef.current !== pageId) {
    lastPageRef.current = pageId;
    itemsRef.current = itemsRef.current.map((item) => ({
      ...item,
      symbol: pickSymbol(pageId),
    }));
    forceRender((n) => n + 1);
  }

  return itemsRef.current;
}
