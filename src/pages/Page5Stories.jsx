import { storiesList, storyContent } from '../data/stories.js';

export default function Page5Stories({ onOpen }) {
  return (
    <section className="page active" id="page5">
      <div className="page-subtitle">
        📗 Сборник всех моих рассказов
      </div>
      <div className="stories-container">
        {storiesList.map((s, idx) => (
          <a
            key={s.id}
            href="#"
            className="story"
            data-story={s.id}
            data-title={s.title}
            onClick={(e) => { e.preventDefault(); onOpen(storyContent[s.id]); }}
          >
            <span className="story-number">📖 {idx + 1}</span>
            <span
              className="story-title"
              style={s.locked ? { filter: 'blur(5px)' } : undefined}
            >
              {s.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
