import { useEffect, useState } from 'react';

function getStartDate(today) {
  const start = new Date(today.getFullYear(), 8, 17);
  if (start > today) start.setFullYear(start.getFullYear() - 1);
  return start;
}

function formatDayCount(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  const word = lastTwo >= 11 && lastTwo <= 14 ? 'дней'
    : last === 1 ? 'день'
      : last >= 2 && last <= 4 ? 'дня' : 'дней';
  return `${count} ${word}`;
}

export default function Page11Other() {
  const [today, setToday] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  useEffect(() => {
    const updateToday = () => {
      const now = new Date();
      setToday(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    };
    const timer = window.setInterval(updateToday, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const startDate = getStartDate(today);
  const streakDays = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) / 86400000) + 1;

  return (
    <section className="page active" id="page11">
      <div className="page-subtitle">
        Эта страница пуста)
      </div>
      <div className="profile-description">
        <p style={{ textAlign: 'center' }}>🚧 Ведутся программисткие работы 🚧</p>
        <p>Скоро тут будет, кое что очень интересное)))</p>
        <p>Сайт будет обновляться!</p>
      </div>
      <div className="profile-description profile-description_flex">
        <p>Мои другие работы:</p>
        <a href="https://toliklol777.github.io/Happy-Birthday/">Поздравление с днём рождения!</a>
        <a href="https://disk.yandex.ru/d/mDddu0-F-CycEg">Записи геймплея Silver Palace</a>
        <a href="https://drive.google.com/drive/folders/1yVyHFxZfdgZ8cy7d5mW97vE7q548ty7L?usp=sharing">Мои инструкции к базе</a>
        <a href="https://drive.google.com/drive/folders/1gf2w5A_9U2d6RcwmfM5-ivEK9BXpzGc7?usp=sharing">Аватарки и видео из игры</a>
      </div>
      <div className="no-mistake-counter">
        <h1>Дней без косяков</h1>
        <span className="no-mistake-count">{formatDayCount(streakDays)}</span>
        <span className="no-mistake-caption">с {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(startDate)}</span>
      </div>
    </section>
  );
}
