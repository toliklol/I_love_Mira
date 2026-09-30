import { useEffect, useState } from 'react';

const VERSION = '2.0' 
const PATCH_VERSION = `2026-09-20-${VERSION}`;
const STORAGE_KEY = 'lastSeenPatchVersion';

export default function PatchNote() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    let lastSeen;
    try {
      lastSeen = localStorage.getItem(STORAGE_KEY);
    } catch {
      lastSeen = PATCH_VERSION;
    }
    if (lastSeen !== PATCH_VERSION) {
      setVisible(true);
      requestAnimationFrame(() => setAnimateIn(true));
    }
  }, []);

  function close() {
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 300);
    try {
      localStorage.setItem(STORAGE_KEY, PATCH_VERSION);
    } catch {
      // localStorage недоступен
    }
  }

  if (!visible) return null;

  return (
    <div
      className={`patch-note-overlay${animateIn ? ' visible' : ''}`}
      id="patchNoteOverlay"
      onClick={(e) => { if (e.target.id === 'patchNoteOverlay') close(); }}
    >
      <div className="patch-note-modal">
        <div className="patch-note-header">✨ Сайт обновился до версии {VERSION}!</div>
        <div className="patch-note-body">
          <p>Что изменилось:</p>
          <ul>
            <li>Полное видоизменение на сайте</li>
            <li>Перевел на новый фрейморк React(поможет в учебе))</li>
            <li>Добавил все новые стикеры и новый каталог "Архив"</li>
            <li>Добавил эффекты сезонов(весна, лето[в разработке], осень и зима)</li>
            <li>Добавил 3 разных вида фона (сплошное изображение, семейный альбом, парные стикеры)</li>
            <li>Добавил страницу настроек для выбора</li>
            <li>Добавил новуй страницу с мини-играми, и мини-игру "Найди пару"</li>
            <li>Теперь при загрузке сайта, включается рандомная музыка</li>
            <li>Добавил новую музыку</li>
            <li>На почти каждой странице появились новые данные</li>
            <li>Новая музыка про нас</li>
            <li>Исправил все известные баги, стикеры на фоне теперь не пропадают при переходе между страницами</li>
            <li>Добавил новую страницу с комиксами</li>
          </ul>
        </div>
        <button className="patch-note-close" id="patchNoteClose" onClick={close}>
          Понятно 💚
        </button>
      </div>
    </div>
  );
}
