import { useEffect } from 'react';

export default function StoryModal({ story, onClose }) {
  useEffect(() => {
    if (!story) return undefined;
    document.body.style.overflow = 'hidden';
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [story, onClose]);

  return (
    <div className={`story-modal${story ? ' open' : ''}`} id="storyModal">
      <div className="story-modal-overlay" onClick={onClose} />
      <div className="story-modal-content">
        <button className="story-modal-close" id="storyModalClose" aria-label="Закрыть" onClick={onClose}>✕</button>
        <div className="story-modal-header">
          <h2 id="storyModalTitle">{story?.title || 'Рассказ'}</h2>
        </div>
        <div
          className="story-modal-body"
          id="storyModalBody"
          dangerouslySetInnerHTML={{ __html: story?.content || '' }}
        />
      </div>
    </div>
  );
}
