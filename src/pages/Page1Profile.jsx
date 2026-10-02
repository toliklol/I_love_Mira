import { useEffect, useState } from 'react';
import { tags } from '../data/config.js';
import LoadingImage from '../components/LoadingImage.jsx';

const TOTAL_PICS = 15; // profilePhoto0..15 участвуют в перекрёстном фейде
const INTERVAL = 3000; // задержка между сменами
const FADE_DURATION = 900; // длительность самого перехода, мс

// Раньше смена аватарки была реализована через связку setInterval(3000мс) +
// рекурсивный setTimeout(30мс), который сам по себе почти успевал занять
// все 3 секунды — из-за этого следующий цикл иногда стартовал до того, как
// закончился предыдущий, и два цикла одновременно писали в одну и ту же
// прозрачность (отсюда "неправильная прозрачность"). Вместо ручного
// покадрового перебора прозрачности теперь используется один индекс текущей
// фотографии + плавный CSS-переход — никаких гонок между таймерами.
export default function Page1Profile() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % TOTAL_PICS);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="page active" id="page1">
      <div className="profile-wrap">
        <div className="avatar-frame" id="avatarContainer">
          <div className="sun-rays" aria-hidden="true"></div>
          {Array.from({ length: TOTAL_PICS }, (_, n) => (
            <LoadingImage
              key={n}
              className="profile-photo"
              id={`profilePhoto${n}`}
              src={`assets/avatars/avatar${n}.png`}
              alt="Фото"
              style={{
                opacity: n === activeIndex ? 1 : 0,
                transition: `opacity ${FADE_DURATION}ms ease`,
              }}
            />
          ))}
        </div>
        <div className="profile-description">
          <h1>Мира Сергеевна</h1>
          <span className="sub">✨ моя любимая зая</span>
          <p>
            Самая невероятная девушка с добрым сердцем, чувством юмора
            и любовью к жизни, которая умеет делать мир ярче одним своим присутствием.
          </p>
          <div>
            {tags.map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>
          <div className="profile-quote">
            💬 «Ты — мой самый любимый человек»
          </div>
        </div>
      </div>
    </section>
  );
}
