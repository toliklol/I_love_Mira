import { useEffect, useState } from 'react';
import {
  STATS_FILES, PARTICIPANT_COLORS, MONTHS_FULL, MONTHS_SHORT,
} from '../data/config.js';

function formatNumber(num) {
  return Number(num).toLocaleString('ru-RU');
}

function formatDay(dateStr) {
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const monthName = MONTHS_SHORT[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} ${monthName} ${y}`;
}

function formatMonth(monthStr) {
  const parts = String(monthStr).split('-');
  if (parts.length !== 2) return monthStr;
  const [y, m] = parts;
  const monthName = MONTHS_FULL[parseInt(m, 10) - 1] || m;
  return `${monthName} ${y}`;
}

function StatsPanel({ data }) {
  if (!data) return null;
  const topDay = data.top_5_days?.[0];
  const topMonth = data.top_5_months?.[0];
  const participants = Object.entries(data.participants || {});
  const days = data.top_5_days || [];
  const months = data.top_5_months || [];
  const maxDay = Math.max(...days.map((d) => d.percentage), 0.0001);
  const maxMonth = Math.max(...months.map((m) => m.percentage), 0.0001);
  const words = Object.entries(data.top_5_words_by_participant || {});

  return (
    <div className="active-panel">
      <div className="stats-overview">
        <div className="stats-overview-card">
          <div className="stats-overview-value">{formatNumber(data.total_messages)}</div>
          <div className="stats-overview-label">Сообщений всего</div>
        </div>
        <div className="stats-overview-card">
          <div className="stats-overview-value">{topDay ? formatNumber(topDay.messages) : '—'}</div>
          <div className="stats-overview-label">Рекорд за день</div>
        </div>
        <div className="stats-overview-card">
          <div className="stats-overview-value">{topMonth ? formatNumber(topMonth.messages) : '—'}</div>
          <div className="stats-overview-label">Рекорд за месяц</div>
        </div>
      </div>

      <div className="stats-card stats-participants">
        <div className="stats-section-title">👥 Участники</div>
        <div className="stats-bar">
          {participants.map(([name, info], idx) => (
            <div key={name} className="stats-bar-seg" style={{ width: `${info.percentage}%`, background: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length] }} />
          ))}
        </div>
        <div className="stats-legend">
          {participants.map(([name, info], idx) => (
            <div key={name} className="stats-legend-item">
              <span className="stats-legend-dot" style={{ background: PARTICIPANT_COLORS[idx % PARTICIPANT_COLORS.length] }} />
              <span className="stats-legend-name">{name}</span>
              <span className="stats-legend-value">{formatNumber(info.messages)} · {info.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-section-title">🔥 Топ-5 дней по активности</div>
        <div className="stats-rows">
          {days.map((item, idx) => (
            <div key={idx} className="stats-row">
              <span className="stats-row-label">{formatDay(item.date)}</span>
              <div className="stats-row-bar"><div className="stats-row-bar-fill" style={{ width: `${Math.max(6, (item.percentage / maxDay) * 100)}%` }} /></div>
              <span className="stats-row-value">{formatNumber(item.messages)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-section-title">📅 Топ-5 месяцев по активности</div>
        <div className="stats-rows">
          {months.map((item, idx) => (
            <div key={idx} className="stats-row">
              <span className="stats-row-label">{formatMonth(item.month)}</span>
              <div className="stats-row-bar"><div className="stats-row-bar-fill" style={{ width: `${Math.max(6, (item.percentage / maxMonth) * 100)}%` }} /></div>
              <span className="stats-row-value">{formatNumber(item.messages)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-section-title">💬 Топ-5 слов</div>
        <div className="stats-words-grid">
          {words.map(([name, list]) => (
            <div key={name} className="stats-words-col">
              <div className="stats-words-name">{name}</div>
              {list.map((w) => (
                <div key={w.word} className="stats-word-chip">
                  <span className="stats-word-text">{w.word}</span>
                  <span className="stats-word-count">{formatNumber(w.count)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page8Stats() {
  const [tab, setTab] = useState('total');
  const [data, setData] = useState({});
  const [status, setStatus] = useState('loading'); // loading | loaded | error

  useEffect(() => {
    const keys = Object.keys(STATS_FILES);
    Promise.all(keys.map((key) => fetch(STATS_FILES[key]).then((res) => {
      if (!res.ok) throw new Error('Не удалось загрузить ' + STATS_FILES[key]);
      return res.json();
    })))
      .then((responses) => {
        const next = {};
        keys.forEach((key, idx) => { next[key] = responses[idx]; });
        setData(next);
        setStatus('loaded');
      })
      .catch((err) => {
        console.error('Ошибка загрузки статистики:', err);
        setStatus('error');
      });
  }, []);

  return (
    <section className="page active" id="page8">
      <div className="page-subtitle">
        📊 Статистика переписки <span>Цифры</span>
      </div>

      <div className="stats-tabs" id="statsTabs" role="tablist">
        <button className={`stats-tab${tab === 'total' ? ' active-tab' : ''}`} type="button" onClick={() => setTab('total')}>💚 Итого</button>
        <button className={`stats-tab${tab === 'telegram' ? ' active-tab' : ''}`} type="button" onClick={() => setTab('telegram')}>✈️ Telegram</button>
        <button className={`stats-tab${tab === 'tiktok' ? ' active-tab' : ''}`} type="button" onClick={() => setTab('tiktok')}>🎵 TikTok</button>
      </div>

      {status !== 'loaded' && (
        <div className={`stats-status${status === 'error' ? ' stats-status_error' : ''}`} id="statsStatus">
          {status === 'error'
            ? '😔 Не удалось загрузить статистику. Проверь файлы в assets/statistic/data/'
            : '⏳ Считаем сообщения...'}
        </div>
      )}

      <div className={`stats-wrapper${status === 'loaded' ? ' loaded' : ''}`} id="statsWrapper">
        {status === 'loaded' && <StatsPanel data={data[tab]} />}
      </div>
    </section>
  );
}
