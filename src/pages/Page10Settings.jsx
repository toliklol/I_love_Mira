import { BACKGROUND_MODES, RANDOM_SOLID } from '../data/backgroundConfig.js';

export default function Page10Settings({
  music, backgroundMode, onSetBackgroundMode,
  solidChoice, onSetSolidChoice, photoPool,
}) {
  return (
    <section className="page active" id="page10">
      <div className="page-subtitle">
        ⚙️ Настройки <span>Сайт</span>
      </div>

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
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}

        {backgroundMode === 'album' && (
          <p className="settings-hint">
            Фото из 6 и 7 стикер-паков плавают на фоне и прокручиваются вместе со страницей.
            Список исключений — в <code>src/data/backgroundConfig.js</code> (PHOTO_EXCLUDED).
          </p>
        )}

        {backgroundMode === 'pairs' && (
          <p className="settings-hint">
            По углам экрана — две случайные пары стикеров: одна слева, одна справа.
            Список пар — в <code>src/data/backgroundConfig.js</code> (stickerPairs).
          </p>
        )}
      </div>
    </section>
  );
}
