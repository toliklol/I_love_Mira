import { SECRET_HEART_TOTAL } from '../data/config.js';
import SecretAudioPlayer from '../components/SecretAudioPlayer.jsx';

export default function Page7Music({ foundHearts, unlocked, pauseMusic }) {
  return (
    <section className="page active" id="page7">
      <div id="music">
        <div className="page-subtitle" id="page7Title">
          {unlocked ? '💖 Музыка про тебя)' : '🔒 Крутая закрытая музыка'} <span>{unlocked ? 'Открыто' : 'Секрет'}</span>
        </div>
        <div className="profile-description secret-heart-collector">
          <p id="secretHeartIntro">Найди все сердчечки на сайте))</p>
          <p id="secretHeartProgress">Найдено {foundHearts.size}/{SECRET_HEART_TOTAL}</p>
          <div className="secret-page-state" id="secretPageState">
            {unlocked ? (
              <>
                <p>Ты нашла все сердечки! Теперь 7 страница открыта.</p>
                <SecretAudioPlayer pauseOthers={pauseMusic} />
                <SecretAudioPlayer
                  pauseOthers={pauseMusic}
                  src="assets/sounds/Две ладони, один дом.mp3"
                  title="Две ладони, один дом"
                />
              </>
            ) : (
              <p>Сердечек пока не хватает...</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
