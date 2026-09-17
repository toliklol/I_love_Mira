import { useEffect, useRef, useState } from 'react';

import Header from './components/Header.jsx';
import MenuPanel from './components/MenuPanel.jsx';
import FallingBackground from './components/FallingBackground.jsx';
import SeasonalEffects from './components/SeasonalEffects.jsx';
import BgStickers from './components/BgStickers.jsx';
import SiteBackground from './components/SiteBackground.jsx';
import AlbumBackground from './components/AlbumBackground.jsx';
import PairedStickers from './components/PairedStickers.jsx';
import HeartBurstCanvas from './components/HeartBurstCanvas.jsx';
import PatchNote from './components/PatchNote.jsx';
import SecretHeartsLayer from './components/SecretHeartsLayer.jsx';
import StoryModal from './components/StoryModal.jsx';
import StickerModal from './components/StickerModal.jsx';

import Page1Profile from './pages/Page1Profile.jsx';
import Page2Memes from './pages/Page2Memes.jsx';
import Page3Jokes from './pages/Page3Jokes.jsx';
import Page4Compliments from './pages/Page4Compliments.jsx';
import Page5Stories from './pages/Page5Stories.jsx';
import Page6Stickers from './pages/Page6Stickers.jsx';
import Page7Music from './pages/Page7Music.jsx';
import Page8Stats from './pages/Page8Stats.jsx';
import Page9Other from './pages/Page9Other.jsx';
import Page10Settings from './pages/Page10Settings.jsx';

import { useRandomBackground } from './hooks/useRandomBackground.js';
import { useBackgroundMode } from './hooks/useBackgroundMode.js';
import { useSiteBackground } from './hooks/useSiteBackground.js';
import { usePageHeight } from './hooks/usePageHeight.js';
import { useSeason } from './hooks/useSeason.js';
import { useMusicPlayer } from './hooks/useMusicPlayer.js';
import { useSecretHearts } from './hooks/useSecretHearts.js';
import { useHeartBurst } from './hooks/useHeartBurst.js';

const PAGE_IDS = ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8', 'page9', 'page10'];

export default function App() {
  const [currentPage, setCurrentPage] = useState('page1');
  // Счётчик переходов — используется как часть React-key страницы, чтобы
  // гарантированно пересоздавать DOM-узел .page на каждый переход и всегда
  // заново проигрывать CSS-анимацию pageSlide (иначе при некоторых сценариях
  // навигации React мог посчитать, что показывать уже нечего пересоздавать).
  const [transitionKey, setTransitionKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [story, setStory] = useState(null);

  // Стикеры: { pack, list, index }
  const [stickerView, setStickerView] = useState(null);

  const burstCanvasRef = useRef(null);
  const burst = useHeartBurst(burstCanvasRef);
  const pageHeight = usePageHeight();

  const { cardStickers, randomize } = useRandomBackground();
  const {
    mode: backgroundMode, setMode: setBackgroundMode,
    solidChoice, setSolidChoice,
  } = useBackgroundMode();
  const {
    solidPhoto, albumPhotos, randomize: randomizeBackground, photoPool,
  } = useSiteBackground(backgroundMode, solidChoice, pageHeight);
  const { seasonSetting, setSeasonSetting, activeSeason } = useSeason();
  const music = useMusicPlayer();
  const { foundHearts, collect, unlocked } = useSecretHearts((x, y) => burst(x, y, '❤️💚✨🎉💫'));

  // Сезонная тема — вешаем атрибут на body, чтобы CSS мог подкрашивать
  // акцентные цвета под текущий сезон (см. body[data-season="..."] в index.css).
  useEffect(() => {
    document.body.dataset.season = activeSeason;
    return () => { delete document.body.dataset.season; };
  }, [activeSeason]);

  // Регистрируем service worker для кеширования картинок (см. public/sw.js).
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Не удалось зарегистрировать service worker:', err);
        });
      });
    }
  }, []);

  function goToPage(pageId) {
    setCurrentPage(pageId);
    setTransitionKey((n) => n + 1);
    randomize();
    randomizeBackground();
    setMenuOpen(false);
  }

  function toggleMenu() {
    setMenuOpen((v) => !v);
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  // Свайп влево для закрытия меню (как в оригинале).
  const touchStart = useRef({ x: 0, y: 0 });
  useEffect(() => {
    function onTouchStart(e) {
      touchStart.current = { x: e.changedTouches[0].screenX, y: e.changedTouches[0].screenY };
    }
    function onTouchMove(e) {
      if (!menuOpen) return;
      const dx = e.changedTouches[0].screenX - touchStart.current.x;
      const dy = e.changedTouches[0].screenY - touchStart.current.y;
      if (dx < -40 && Math.abs(dx) > Math.abs(dy)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false);
    }
    document.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function openStory(content) {
    music.pause();
    setStory(content);
  }

  function openSticker(pack, list, number) {
    const index = list.indexOf(number);
    setStickerView({
      pack, list, index,
      src: `${pack.folder}/sticker${number}.png`,
      alt: `${pack.label} ${number}`,
      caption: `✨ Стикер ${number}`,
      hasPrev: index > 0,
      hasNext: index < list.length - 1,
    });
  }

  function navigateSticker(step) {
    setStickerView((prev) => {
      if (!prev) return prev;
      const nextIndex = prev.index + step;
      if (nextIndex < 0 || nextIndex >= prev.list.length) return prev;
      const number = prev.list[nextIndex];
      return {
        ...prev,
        index: nextIndex,
        src: `${prev.pack.folder}/sticker${number}.png`,
        alt: `${prev.pack.label} ${number}`,
        caption: `✨ Стикер ${number}`,
        hasPrev: nextIndex > 0,
        hasNext: nextIndex < prev.list.length - 1,
      };
    });
  }

  function collectHeart(id, x, y) {
    collect(id, x, y);
  }

  return (
    <>
      <SiteBackground mode={backgroundMode} solidPhoto={solidPhoto} />
      {backgroundMode === 'album' && <AlbumBackground photos={albumPhotos} pageHeight={pageHeight} />}
      {backgroundMode === 'pairs' && <PairedStickers refreshKey={transitionKey} />}
      <div className={`season-overlay season-overlay_${activeSeason}`} aria-hidden="true" />
      <SeasonalEffects season={activeSeason} />

      <FallingBackground pageId={currentPage} />

      <div className="app-wrapper" id="app">
        <BgStickers stickers={cardStickers} />

        <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} />

        <MenuPanel
          open={menuOpen}
          currentPage={currentPage}
          onNavigate={goToPage}
          onClose={() => setMenuOpen(false)}
        />

        {PAGE_IDS.map((pageId) => {
          if (pageId !== currentPage) return null;
          return (
            <div key={`${pageId}-${transitionKey}`} style={{ position: 'relative' }}>
              {pageId === 'page1' && <Page1Profile />}
              {pageId === 'page2' && (
                <Page2Memes onBurst={(x, y, stickers) => burst(x, y, stickers)} />
              )}
              {pageId === 'page3' && <Page3Jokes />}
              {pageId === 'page4' && <Page4Compliments />}
              {pageId === 'page5' && <Page5Stories onOpen={openStory} />}
              {pageId === 'page6' && <Page6Stickers onOpenSticker={openSticker} />}
              {pageId === 'page7' && (
                <Page7Music foundHearts={foundHearts} unlocked={unlocked} pauseMusic={music.pause} />
              )}
              {pageId === 'page8' && <Page8Stats />}
              {pageId === 'page9' && <Page9Other />}
              {pageId === 'page10' && (
                <Page10Settings
                  music={music}
                  backgroundMode={backgroundMode}
                  onSetBackgroundMode={setBackgroundMode}
                  solidChoice={solidChoice}
                  onSetSolidChoice={setSolidChoice}
                  photoPool={photoPool}
                  seasonSetting={seasonSetting}
                  onSetSeasonSetting={setSeasonSetting}
                  activeSeason={activeSeason}
                />
              )}

              <SecretHeartsLayer pageId={pageId} foundHearts={foundHearts} onCollect={collectHeart} />
            </div>
          );
        })}

        <div className="footer-note">✨ сделано с любовью и душой</div>
      </div>

      <StoryModal story={story} onClose={() => setStory(null)} />
      <StickerModal sticker={stickerView} onClose={() => setStickerView(null)} onNavigate={navigateSticker} />
      <HeartBurstCanvas ref={burstCanvasRef} />
      <PatchNote />
    </>
  );
}
