import { useEffect, useState } from 'react';

const PATCH_VERSION = '2026-09-13-5';
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
        <div className="patch-note-header">✨ Сайт обновился!</div>
        <div className="patch-note-body">
          <p>Что изменилось:</p>
          <ul>
            <li>Новые аватарки</li>
          </ul>
        </div>
        <button className="patch-note-close" id="patchNoteClose" onClick={close}>
          Понятно 💚
        </button>
      </div>
    </div>
  );
}
