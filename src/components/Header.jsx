import { useEffect, useState } from 'react';
import { START_DATE } from '../data/config.js';

function getDays() {
  const diff = new Date() - START_DATE;
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

export default function Header({ menuOpen, onToggleMenu }) {
  const [days, setDays] = useState(getDays);

  useEffect(() => {
    const id = setInterval(() => setDays(getDays()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="header">
      <div className="timer-block">
        <span className="timer-label">❤️ Дней с нашей встречи</span>
        <span className="timer-value" id="timerDisplay">{days} <span>дней</span></span>
      </div>
      <button
        className={`burger-btn${menuOpen ? ' active' : ''}`}
        id="burgerBtn"
        aria-label="Открыть меню"
        onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  );
}
