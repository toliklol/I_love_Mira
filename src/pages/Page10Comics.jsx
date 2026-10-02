import { comicsList } from '../data/comicsConfig.js';
import LoadingImage from '../components/LoadingImage.jsx';

export default function Page10Comics({ onOpenComic }) {
  return (
    <section className="page active" id="page10">
      <div className="page-subtitle">
        📖 Комиксы <span>Наше</span>
      </div>

      <div className="comics-grid">
        {comicsList.map((comic) => (
          <button
            key={comic.id}
            type="button"
            className="comic-card"
            onClick={() => onOpenComic(comic)}
          >
            <span className="comic-card-cover">
              {comic.id === 'comic8'
                ? <LoadingImage src={comic.pages[0].page} alt="" />
                : <LoadingImage src={comic.pages[0]} alt="" />}
              {comic.pages.length > 1 && (
                <span className="comic-card-pages">{comic.pages.length} стр.</span>
              )}
            </span>
            <span className="comic-card-title">{comic.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
