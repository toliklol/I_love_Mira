export const SEASON_KEY = 'miraSeasonMode'; // 'auto' | 'winter' | 'spring' | 'summer' | 'autumn'

export const SEASONS = [
  { id: 'winter', label: '❄️ Зима', months: [12, 1, 2] },
  { id: 'spring', label: '🌸 Весна', months: [3, 4, 5] },
  { id: 'summer', label: '☀️ Лето', months: [6, 7, 8] },
  { id: 'autumn', label: '🍂 Осень', months: [9, 10, 11] },
];

export function getSeasonByDate(date = new Date()) {
  const month = date.getMonth() + 1;
  const found = SEASONS.find((s) => s.months.includes(month));
  return found ? found.id : 'winter';
}

// Символы, которые подмешиваются в падающий фон поверх обычных
// эмодзи страницы, когда активен соответствующий сезон.
export const SEASON_PARTICLES = {
  winter: ['❄️', '❄', '🌨️', '⛄'],
  spring: ['🌸', '🌷', '🦋', '🌿'],
  summer: ['☀️', '🌻', '🍉', '🌊'],
  autumn: ['🍁', '🍂', '🌰', '🍄'],
};

// Лёгкий цветовой акцент поверх обычной зелёной темы — не переопределяет
// весь дизайн, а слегка подкрашивает фон под настроение сезона.
export const SEASON_OVERLAY_COLOR = {
  winter: 'rgba(120, 180, 255, 0.16)',
  spring: 'rgba(255, 170, 205, 0.14)',
  summer: 'rgba(255, 205, 80, 0.14)',
  autumn: 'rgba(255, 140, 60, 0.16)',
};
