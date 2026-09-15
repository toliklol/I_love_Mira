export const START_DATE = new Date(2026, 0, 10);

export const AVATAR_COUNT = 15; // avatar0..avatar15 существуют на диске
export const AVATAR_CROSSFADE_COUNT = 7; // сколько из них крутится в перекрёстном фейде

export const SECRET_HEART_TOTAL = 10;
export const SECRET_HEART_KEY = 'miraSecretHearts';

export const secretHeartPositions = [
  { id: 1, page: 'page1', left: '80%', top: '83%' },
  { id: 2, page: 'page2', left: '73%', top: '-65px' },
  { id: 3, page: 'page2', left: '7%', bottom: '-20px' },
  { id: 4, page: 'page3', left: '1%', bottom: '-40px' },
  { id: 5, page: 'page3', left: '80%', top: '42%' },
  { id: 6, page: 'page5', left: '45%', bottom: '-250px' },
  { id: 7, page: 'page6', left: '80%', top: '25%' },
  { id: 8, page: 'page7', left: '60%', top: '2px' },
  { id: 9, page: 'page9', left: '5%', bottom: '-80px' },
  { id: 10, page: 'page9', left: '58%', top: '62%' },
];

export const musicTracks = [
  'assets/sounds/Ghostrifter-Official-Purple-Dream(chosic.com).mp3',
  'assets/sounds/Lovely-Long-Version-chosic.com_.mp3',
  'assets/sounds/ron-gelinas-chillout-lounge-where-will-i-go(chosic.com).mp3',
  'assets/sounds/scott-buckley-reverie(chosic.com).mp3',
  'assets/sounds/The-Kyoto-Connection-Hachiko-The-Faithtful-Dog(chosic.com).mp3',
];

export const menuItems = [
  { page: 'page1', label: '👤 Главная' },
  { page: 'page2', label: '🖼️ Любимые мемы и стикеры' },
  { page: 'page3', label: '😉 Наши повадки и приколы' },
  { page: 'page4', label: '💚 Комплименты' },
  { page: 'page5', label: '📕 Мои рассказы' },
  { page: 'page6', label: '🤗 Наши стикеры' },
  { page: 'page7', label: '🎶 Музыка' },
  { page: 'page8', label: '📊 Статистика переписки' },
  { page: 'page9', label: '😏 Продолжение следует...' },
  { page: 'page10', label: '⚙️ Настройки' },
];

export const pageEmojis = {
  page1: ['❤️', '💚', '🌸', '🌿', '💕', '✨', '🌺', '🦋'],
  page2: ['😎', '😱', '✨', '💌', '🌟', '🔥', '🤩', '😹'],
  page3: ['😉', '😜', '😂', '🤣', '😎', '🤪', '😁', '🤗'],
  page4: ['💚', '💖', '💞', '💓', '💗', '🧡', '💛', '💙', '💜', '🤎', '🖤', '🤍', '❣', '💕', '💘', '💝'],
  page5: ['📕', '📖', '✍️', '📝', '💕', '🔞'],
  page6: ['💞', '💌', '📈', '📩', '❤', '🤗', '☺', '😚'],
  page7: ['🎶', '🎵', '🎼', '🎧', '🎙', '🎤', '😘'],
  page8: ['📊', '📈', '🔢', '💚', '✨', '📌'],
  page9: ['🕳', '🥽', '🔑', '🧱', '🛠', '⛑', '⏳'],
  page10: ['⚙️', '🎛️', '🖼️', '📸', '💞', '🔧'],
  default: ['❤️', '💚', '🌸', '🌿'],
};

export const tags = [
  '💤 Сон', '📚 Книги', '☕ Кофе', '🎥 Фильмы', '♊ Близнецы', '🍀 Удача',
  '🥳 Веселье', '🎮 Игры', '🌸 Красота', '💌 Поэт', '✒️ Писатель', '🧠 Гений',
];

export const STATS_FILES = {
  telegram: 'assets/statistic/data/statistics_telegram.json',
  tiktok: 'assets/statistic/data/statistics_tiktok.json',
  total: 'assets/statistic/data/statistics_total.json',
};

export const PARTICIPANT_COLORS = ['#a5d6a7', '#ffd76a', '#ff8bb8', '#90caf9'];

export const MONTHS_FULL = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
