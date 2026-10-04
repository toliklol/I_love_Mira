import { useState } from 'react';
import { BACKGROUND_MODES, RANDOM_SOLID } from '../data/backgroundConfig.js';
import { SEASONS } from '../data/seasonConfig.js';
import { updateHistory } from '../data/updateHistory.js';
import LoadingImage from '../components/LoadingImage.jsx';

export default function Page12Settings({
  music, backgroundMode, onSetBackgroundMode,
  solidChoice, onSetSolidChoice, photoPool,
  seasonSetting, onSetSeasonSetting, activeSeason,
}) {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <section className="page active" id="page12">
      <div className="page-subtitle">
        ⚙️ Настройки <span>Сайт</span>
      </div>

      <div className="settings-tabs" role="tablist" aria-label="Настройки и обновления">
        <button
          className={`settings-tab${activeTab === 'settings' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'settings'}
          aria-controls="settings-panel"
          onClick={() => setActiveTab('settings')}
        >Настройки</button>
        <button
          className={`settings-tab${activeTab === 'updates' ? ' active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'updates'}
          aria-controls="updates-panel"
          onClick={() => setActiveTab('updates')}
        >Обновления · {updateHistory.length}</button>
      </div>

      <div id="settings-panel" role="tabpanel" hidden={activeTab !== 'settings'}>
      <div className="settings-block">
        <div className="settings-block-title">Музыка</div>
        <div className="menu-controls settings-music-controls">
          <button
            className="music-control"
            type="button"
            aria-label="Предыдущая песня"
            title="Предыдущая песня"
            onClick={() => music.prev()}
          >⏮</button>
          <button
            className={`music-control music-toggle${music.isPlaying ? ' is-playing' : ''}`}
            type="button"
            aria-label={music.isPlaying ? 'Выключить музыку' : 'Включить музыку'}
            title={music.isPlaying ? 'Выключить музыку' : 'Включить музыку'}
            onClick={() => music.toggle()}
          >{music.isPlaying ? '⏸' : '▶'}</button>
          <button
            className="music-control"
            type="button"
            aria-label="Следующая песня"
            title="Следующая песня"
            onClick={() => music.next()}
          >⏭</button>
        </div>
      </div>

      <div className="settings-block">
        <div className="settings-block-title">Оформление (время года)</div>
        <div className="settings-bg-modes">
          <button
            type="button"
            className={`settings-bg-mode-btn${seasonSetting === 'auto' ? ' active' : ''}`}
            onClick={() => onSetSeasonSetting('auto')}
          >
            🔄 Автоматически (по дате){seasonSetting === 'auto' ? ` — сейчас ${
              SEASONS.find((s) => s.id === activeSeason)?.label || ''
            }` : ''}
          </button>
          {SEASONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`settings-bg-mode-btn${seasonSetting === s.id ? ' active' : ''}`}
              onClick={() => onSetSeasonSetting(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="settings-hint">
          Сезон слегка подкрашивает фон сайта и добавляет тематические
          символы в падающий фон (например, зимой — снег).
        </p>
      </div>

      <div className="settings-block">
        <div className="settings-block-title">Фон сайта</div>
        <div className="settings-bg-modes">
          {BACKGROUND_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`settings-bg-mode-btn${backgroundMode === m.id ? ' active' : ''}`}
              onClick={() => onSetBackgroundMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {backgroundMode === 'solid' && (
          <div className="settings-photo-picker">
            <div className="settings-block-subtitle">Выбери картинку или оставь случайный фон</div>
            <div className="settings-photo-grid">
              <button
                type="button"
                className={`settings-photo-random${solidChoice === RANDOM_SOLID ? ' active' : ''}`}
                onClick={() => onSetSolidChoice(RANDOM_SOLID)}
              >
                🎲<br />Случайный
              </button>
              {photoPool.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`settings-photo-thumb${solidChoice === src ? ' active' : ''}`}
                  onClick={() => onSetSolidChoice(src)}
                >
                  <LoadingImage src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}

        {backgroundMode === 'album' && (
          <p className="settings-hint">
            Все наши картинки в виде фотографий на фоне) Выбираются рандомно и красиво расплологаются на странице
            Зависит от длины страницы, будет больше фото соответственно.
          </p>
        )}

        {backgroundMode === 'pairs' && (
          <p className="settings-hint">
            По углам экрана — две случайные пары стикеров: одна слева, одна справа.
            Список пар я создавал сам) Будет добавляться)
          </p>
        )}
      </div>
      </div>

      <div className="updates-panel" id="updates-panel" role="tabpanel" hidden={activeTab !== 'updates'}>
        <ol className="updates-timeline">
          {updateHistory.map((update) => (
            <li className="update-entry" key={update.commit}>
              <div className="update-entry-meta">
                <time dateTime={update.date}>
                  {new Intl.DateTimeFormat('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  }).format(new Date(`${update.date}T12:00:00`))}
                </time>
                {update.version && (
                  <span className="update-version">
                    {update.version.startsWith('2026-') ? `Патч ${update.version}` : `v${update.version}`}
                  </span>
                )}
                <span className={`update-branch update-branch_${update.branch}`}>{update.branch}</span>
                <code>{update.commit}</code>
              </div>
              <h2>{update.title}</h2>
              <p className="update-commit-message">{update.message}</p>
              {update.details && (
                <ul>
                  {update.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
