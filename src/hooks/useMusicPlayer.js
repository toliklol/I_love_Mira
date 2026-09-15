import { useEffect, useRef, useState } from 'react';
import { musicTracks } from '../data/config.js';

// Фоновый плеер, идентичный меню-плееру в оригинале (кнопки ⏮ ▶/⏸ ⏭).
export function useMusicPlayer() {
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Каждый заход на сайт — случайный трек, а не всегда первый.
    trackIndexRef.current = Math.floor(Math.random() * musicTracks.length);
    const audio = new Audio(musicTracks[trackIndexRef.current]);
    audio.volume = 0.35;
    audio.loop = false;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => changeTrack(1);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    audio.play().catch(() => {});

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeTrack(step) {
    const audio = audioRef.current;
    if (!audio) return;
    trackIndexRef.current = (trackIndexRef.current + step + musicTracks.length) % musicTracks.length;
    audio.src = musicTracks[trackIndexRef.current];
    audio.play().catch(() => {});
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function pause() {
    audioRef.current?.pause();
  }

  return { isPlaying, toggle, next: () => changeTrack(1), prev: () => changeTrack(-1), pause };
}
