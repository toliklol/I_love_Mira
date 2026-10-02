import { useEffect, useState } from 'react';
import LoadingImage from './LoadingImage.jsx';

// Клик по самой картинке — перелистывает на следующую страницу. Картинка
// теперь показывается по ширине экрана (а не сжатой под высоту) — так
// текст на длинных вертикальных комиксах остаётся читаемым, а сама
// картинка скроллится вверх/вниз внутри модалки.
export default function ComicViewer({ comic, onClose }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    setPageIndex(0);
  }, [comic]);

  const isOpen = !!comic;
  const pageCount = comic?.pages.length || 0;
  const isLastPage = pageIndex >= pageCount - 1;
  const isFirstPage = pageIndex === 0;

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pageIndex, pageCount]);

  if (!isOpen) return null;

  function goNext() {
    if (isLastPage) {
      onClose();
      return;
    }
    setDirection('next');
    setPageIndex((i) => i + 1);
  }

  function goPrev() {
    if (isFirstPage) return;
    setDirection('prev');
    setPageIndex((i) => i - 1);
  }

  return (
    <div className="comic-viewer open" role="dialog" aria-modal="true" aria-label={comic.title}>
      <div className="comic-viewer-overlay" onClick={onClose} />
      <div className="comic-viewer-content">
        <button className="comic-viewer-close" type="button" aria-label="Закрыть" onClick={onClose}>✕</button>
        {comic.id === 'comic8' ? 
          <div className="comic-viewer-title">{comic.pages[pageIndex].title}</div>
          :
          <div className="comic-viewer-title">{comic.title}</div>
        }
        <div className="comic-viewer-stage">
          {!isFirstPage && (
            <button
              className="comic-viewer-nav comic-viewer-nav_prev"
              type="button"
              aria-label="Предыдущая страница"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >‹</button>
          )}

          
            <div className="comic-viewer-scroll">
          {comic.id === 'comic8' ?
            <LoadingImage
              key={pageIndex}
              className={`comic-viewer-image comic-viewer-image_${direction}`}
              src={comic.pages[pageIndex].page}
              alt={`${comic.title}, страница ${pageIndex + 1}`}
              onClick={goNext}
            />:
            <LoadingImage
              key={pageIndex}
              className={`comic-viewer-image comic-viewer-image_${direction}`}
              src={comic.pages[pageIndex]}
              alt={`${comic.title}, страница ${pageIndex + 1}`}
              onClick={goNext}
            />
          }
          </div>

          {!isLastPage && (
            <button
              className="comic-viewer-nav comic-viewer-nav_next"
              type="button"
              aria-label="Следующая страница"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >›</button>
          )}
        </div>

        {pageCount > 1 && (
          <div className="comic-viewer-footer">
            <div className="comic-viewer-dots">
              {comic.pages.map((_, i) => (
                <span key={i} className={`comic-viewer-dot${i === pageIndex ? ' active' : ''}`} />
              ))}
            </div>
            <span className="comic-viewer-page-count">{pageIndex + 1} / {pageCount}</span>
          </div>
        )}

        <p className="comic-viewer-hint">
          {isLastPage ? 'Нажми на картинку, чтобы закрыть' : 'Пролистай картинку вниз и нажми на неё, чтобы читать дальше'}
        </p>
      </div>
    </div>
  );
}
