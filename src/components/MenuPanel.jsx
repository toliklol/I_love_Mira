import { useEffect, useRef, useState } from 'react';
import { menuItems } from '../data/config.js';

export default function MenuPanel({ open, currentPage, onNavigate, onClose }) {
  // Держим элементы в DOM ещё 400мс после закрытия, чтобы доиграла CSS-анимация
  // (как setTimeout(..., 400) в оригинале).
  const [mounted, setMounted] = useState(open);
  const [animate, setAnimate] = useState(open);
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);
  const touchScrollStart = useRef(0);

  const handleTouchStart = (e) => {
    const container = scrollRef.current;
    if (!container) return;
    touchStartY.current = e.touches[0].clientY;
    touchScrollStart.current = container.scrollTop;
  };

  const handleTouchMove = (e) => {
    const container = scrollRef.current;
    if (!container) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    container.scrollTop = touchScrollStart.current - deltaY;
    e.preventDefault();
  };

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
    setAnimate(false);
    const t = setTimeout(() => setMounted(false), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`menu-overlay${animate ? ' open' : ''}`}
        id="menuOverlay"
        // display управляется отдельно от класса .open (как в оригинале):
        // сначала элемент становится видимым (display), и только на следующий
        // кадр добавляется класс .open, который анимирует opacity/transform.
        // Если делать это одним махом, CSS-переходу не от чего стартовать —
        // элемент был display:none и анимация просто "телепортирует" в конец.
        style={{ display: 'block' }}
        onClick={onClose}
      />
      <nav
        className={`menu-panel${animate ? ' open' : ''}`}
        id="menuPanel"
        style={{ display: 'flex' }}
      >
        <div
          ref={scrollRef}
          className="menu-panel-content"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {menuItems.map((item) => (
            <a
              key={item.page}
              href="#"
              className={currentPage === item.page ? 'active-link' : ''}
              onClick={(e) => { e.preventDefault(); onNavigate(item.page); }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
