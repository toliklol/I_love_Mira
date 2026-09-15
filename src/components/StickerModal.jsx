import { useEffect, useRef, useState } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.25;

export default function StickerModal({ sticker, onClose, onNavigate }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);

  const isOpen = !!sticker;

  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [sticker?.src]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
      if (e.key === '+') setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
      if (e.key === '-') setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;

  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  function onWheel(e) {
    e.preventDefault();
    setScale((s) => (e.deltaY < 0
      ? Math.min(MAX_SCALE, s + 0.1)
      : Math.max(MIN_SCALE, s - 0.1)));
  }

  function onPointerDown(e) {
    if (scale <= 1) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startTx: translate.x, startTy: translate.y };
    viewportRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current) return;
    const { startX, startY, startTx, startTy } = dragRef.current;
    setTranslate({ x: startTx + (e.clientX - startX), y: startTy + (e.clientY - startY) });
  }

  function stopDrag() {
    dragRef.current = null;
  }

  function onDoubleClick() {
    if (scale === 1) setScale(2);
    else resetZoom();
  }

  function getTouchDistance(t1, t2) {
    const x = t2.clientX - t1.clientX;
    const y = t2.clientY - t1.clientY;
    return Math.sqrt(x * x + y * y);
  }

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: getTouchDistance(e.touches[0], e.touches[1]), scale };
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const ratio = dist / pinchRef.current.dist;
      setScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchRef.current.scale * ratio)));
    }
  }

  function onTouchEnd() {
    pinchRef.current = null;
  }

  async function downloadSticker() {
    const imageUrl = sticker.src;
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Не удалось загрузить стикер');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = imageUrl.split('/').pop().split('?')[0] || 'sticker.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'sticker.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  return (
    <div className="sticker-modal open" id="stickerModal" aria-hidden="false">
      <div className="sticker-modal-content">
        <button className="sticker-modal-close" id="stickerModalClose" aria-label="Закрыть" onClick={onClose}>✕</button>

        <div className="sticker-nav-buttons" aria-label="Навигация по стикерам">
          <button
            type="button"
            className="sticker-nav-btn"
            id="stickerNavPrev"
            aria-label="Предыдущий стикер"
            title="Предыдущий стикер"
            disabled={!sticker.hasPrev}
            onClick={() => onNavigate(-1)}
          >‹</button>
          <button
            type="button"
            className="sticker-nav-btn"
            id="stickerNavNext"
            aria-label="Следующий стикер"
            title="Следующий стикер"
            disabled={!sticker.hasNext}
            onClick={() => onNavigate(1)}
          >›</button>
        </div>

        <div className="sticker-zoom-controls">
          <button type="button" id="stickerZoomOut" aria-label="Уменьшить стикер" title="Уменьшить"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP))}>−</button>
          <button type="button" id="stickerZoomReset" aria-label="Сбросить масштаб" title="Сбросить масштаб"
            onClick={resetZoom}>{Math.round(scale * 100)}%</button>
          <button type="button" id="stickerZoomIn" aria-label="Увеличить стикер" title="Увеличить"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP))}>+</button>
          <button
            type="button"
            id="stickerDownload"
            className="sticker-download-btn"
            aria-label="Скачать стикер"
            title="Скачать стикер"
            onClick={downloadSticker}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div
          className="sticker-image-viewport"
          id="stickerImageViewport"
          ref={viewportRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onDoubleClick={onDoubleClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            className="sticker-modal-image"
            id="stickerModalImage"
            src={sticker.src}
            alt={sticker.alt}
            draggable="false"
            style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})` }}
          />
        </div>

        <div className="sticker-modal-caption" id="stickerModalCaption">{sticker.caption}</div>
      </div>
    </div>
  );
}
