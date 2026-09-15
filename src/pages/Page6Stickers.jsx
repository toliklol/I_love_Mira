import { useState } from 'react';
import { stickerPackConfigs } from '../data/stickerPacks.js';

export default function Page6Stickers({ onOpenSticker }) {
  const [openPacks, setOpenPacks] = useState(() => new Set(
    stickerPackConfigs.filter((p) => p.defaultOpen).map((p) => p.id)
  ));

  function togglePack(id) {
    setOpenPacks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="page active" id="page6">
      <div>
        <div className="page-subtitle">
          🤗 Все стикеры, что мы создали
        </div>
        <div className="sticker-pack-accordion" id="stickerPackAccordion">
          {stickerPackConfigs.map((pack) => {
            const isOpen = openPacks.has(pack.id);
            const stickers = Array.from({ length: pack.count }, (_, i) => i + 1);
            return (
              <div key={pack.id} className={`sticker-pack-item${isOpen ? ' open' : ''}`} data-pack={pack.id}>
                <button
                  type="button"
                  className="sticker-pack-toggle"
                  aria-expanded={isOpen}
                  onClick={() => togglePack(pack.id)}
                >
                  <span className="sticker-pack-toggle-icon">{isOpen ? '▼' : '▶'}</span>
                  <span>{pack.label}</span>
                </button>
                <div className="sticker-pack-content">
                  <div className="stickers-grid">
                    {stickers.map((n) => {
                      const src = `${pack.folder}/sticker${n}.png`;
                      const caption = `✨ Стикер ${n}`;
                      return (
                        <div
                          key={n}
                          className="sticker"
                          data-image={src}
                          data-caption={caption}
                          onClick={() => onOpenSticker(pack, stickers, n)}
                        >
                          <img src={src} alt={`${pack.label} ${n}`} />
                          <div className="caption">{caption}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
