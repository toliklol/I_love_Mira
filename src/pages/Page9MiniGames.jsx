import { useEffect, useMemo, useRef, useState } from 'react';
import { stickerPackConfigs } from '../data/stickerPacks.js';
import LoadingImage from '../components/LoadingImage.jsx';

const DIFFICULTIES = {
  easy: { label: 'Легко', cards: 16, maxMoves: 15, peek: 1200 },
  medium: { label: 'Нормально', cards: 32, maxMoves: 20, peek: 750 },
  hard: { label: 'Сложно', cards: 64, maxMoves: 60, peek: 400 },
};

// Единая ширина сетки для всех сложностей — карточки всегда одного размера,
// разница между сложностями только в количестве строк (и, соответственно,
// в прокрутке для "Сложно"). 4 колонки — чтобы карточки не были совсем
// мелкими на телефоне.
const GRID_COLUMNS = 4;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function createDeck(cardCount) {
  const allCards = stickerPackConfigs.flatMap((pack) => (
    Array.from({ length: pack.count }, (_, index) => ({
      id: `${pack.id}-${index + 1}`,
      packId: pack.id,
      src: `${pack.folder}/sticker${index + 1}.png`,
      label: `${pack.label}, стикер ${index + 1}`,
    }))
  ));

  const selectedCards = shuffle(allCards).slice(0, cardCount / 2);
  return shuffle(selectedCards.flatMap((card) => [
    { ...card, cardId: `${card.id}-a` },
    { ...card, cardId: `${card.id}-b` },
  ]));
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function Page9MiniGames({ onBurst }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [locked, setLocked] = useState(false);
  const [status, setStatus] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const bannerRef = useRef(null);
  const hasCelebratedRef = useRef(false);

  const stickerPoolSize = useMemo(() => stickerPackConfigs.reduce((sum, pack) => sum + pack.count, 0), []);
  const difficultyConfig = DIFFICULTIES[difficulty];
  const pairCount = difficultyConfig.cards / 2;
  const progress = pairCount ? Math.round((matched.length / pairCount) * 100) : 0;

  useEffect(() => {
    if (status !== 'running') return undefined;
    const interval = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || deck.length === 0) return;
    if (matched.length === pairCount) {
      setStatus('won');
    } else if (moves >= difficultyConfig.maxMoves) {
      setStatus('lost');
    }
  }, [deck.length, difficultyConfig.maxMoves, matched.length, moves, pairCount, status]);

  // Маленький праздничный "взрыв" сердечек при победе — тот же эффект,
  // что и у мемов на странице 2, чтобы ощущалось частью того же сайта.
  useEffect(() => {
    if (status !== 'won' || hasCelebratedRef.current || !onBurst) return;
    hasCelebratedRef.current = true;
    const el = bannerRef.current;
    const rect = el?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    onBurst(x, y, '🎉💚✨💛🧡');
  }, [status, onBurst]);

  function startGame(config = difficultyConfig) {
    setDeck(createDeck(config.cards));
    setFlipped([]);
    setMatched([]);
    setLocked(false);
    setElapsed(0);
    setMoves(0);
    hasCelebratedRef.current = false;
    setStatus('running');
  }

  // "Начать заново" теперь возвращает к выбору сложности, а не сразу
  // перезапускает игру на той же сложности — по просьбе: не должно быть
  // так, что таймер и ходы стартуют сами, без осознанного выбора.
  function returnToMenu() {
    setDeck([]);
    setFlipped([]);
    setMatched([]);
    setLocked(false);
    setElapsed(0);
    setMoves(0);
    hasCelebratedRef.current = false;
    setStatus('idle');
  }

  function chooseDifficulty(nextDifficulty) {
    setDifficulty(nextDifficulty);
  }

  function handleCardClick(card) {
    if (status !== 'running' || locked || matched.includes(card.id) || flipped.some((item) => item.cardId === card.cardId)) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);
    if (nextFlipped.length !== 2) return;
    if (nextFlipped[0].id === nextFlipped[1].id) {
      setMatched((items) => [...items, card.id]);
      setFlipped([]);
      return;
    }

    setMoves((value) => value + 1);
    setLocked(true);
    window.setTimeout(() => {
      setFlipped([]);
      setLocked(false);
    }, difficultyConfig.peek);
  }

  return (
    <section className="page active mini-games-page" id="page9">
      <div className="page-subtitle">
        🎮 Мини-игры <span>Играем вместе</span>
      </div>

      <div className="mini-games-menu" aria-label="Выбор мини-игры">
        <button className="mini-game-choice active" type="button">🧠 Найди пару</button>
      </div>

      <div className="memory-intro">
        <div>
          <h1>Стикерная память</h1>
          <p>Открой все пары из нашей коллекции и проверь, насколько хорошо ты помнишь любимые картинки. Правильная пара не тратит ход!</p>
        </div>
        <div className="memory-stats" aria-live="polite">
          <div><span>Время</span><strong>{formatTime(elapsed)}</strong></div>
          <div><span>Прогресс</span><strong>{progress}%</strong></div>
          <div><span>Ходы</span><strong>{moves}/{difficultyConfig.maxMoves}</strong></div>
        </div>
      </div>

      <div className="memory-controls">
        {status === 'idle' && (
          <>
            <div className="difficulty-switch" role="group" aria-label="Сложность">
              {Object.entries(DIFFICULTIES).map(([key, item]) => (
                <button
                  className={difficulty === key ? 'selected' : ''}
                  key={key}
                  type="button"
                  onClick={() => chooseDifficulty(key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button className="memory-start" type="button" onClick={() => startGame()}>Начать игру</button>
          </>
        )}
        {status !== 'idle' && (
          <button className="memory-start memory-restart" type="button" onClick={returnToMenu}>
            ↩ Выбрать сложность заново
          </button>
        )}
      </div>

      {status === 'idle' && (
        <div className="memory-empty">
          <span className="memory-empty-icon">💌</span>
          <strong>{difficultyConfig.cards} случайных карточек ждут тебя</strong>
          <span>Выбор из {stickerPoolSize} стикеров · до {difficultyConfig.maxMoves} ходов</span>
        </div>
      )}

      {status !== 'idle' && (
        <div
          className={`memory-grid${status === 'won' ? ' memory-grid_won' : ''}`}
          style={{ '--memory-columns': GRID_COLUMNS }}
        >
          {deck.map((card, index) => {
            const isVisible = flipped.some((item) => item.cardId === card.cardId) || matched.includes(card.id);
            return (
              <button
                className={`memory-card${isVisible ? ' is-visible' : ''}${matched.includes(card.id) ? ' is-matched' : ''}`}
                key={card.cardId}
                type="button"
                onClick={() => handleCardClick(card)}
                style={{ '--deal-delay': `${Math.min(index * 18, 380)}ms` }}
                aria-label={isVisible ? card.label : 'Закрытая карточка'}
              >
                <span className="memory-card-inner">
                  <span className="memory-card-face memory-card-back">💚</span>
                  <span className="memory-card-face memory-card-front">
                    <LoadingImage src={card.src} alt={card.label} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {status === 'won' && (
        <div className="memory-win" role="status" ref={bannerRef}>
          <span>🎉</span>
          <strong>Поздравляю, ты собрала всю коллекцию!</strong>
          <p>Игра пройдена за {formatTime(elapsed)}. Это было очень красиво.</p>
        </div>
      )}

      {status === 'lost' && (
        <div className="memory-win memory-lose" role="status">
          <span>💭</span>
          <strong>Почти получилось!</strong>
          <p>Ходы закончились. Попробуй ещё раз, запоминая открытые пары.</p>
        </div>
      )}
    </section>
  );
}
