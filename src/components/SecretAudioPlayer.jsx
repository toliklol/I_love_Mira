import { useEffect, useRef, useState } from 'react';

let activeAudio = null;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// pauseOthers — функция, останавливающая фоновую музыку при запуске.
export default function SecretAudioPlayer({ pauseOthers, src = 'assets/sounds/Мира в огне.mp3', title = 'Мира в огне' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.45;
    audio.loop = false;
    audioRef.current = audio;

    const update = () => {
      setIsPlaying(!audio.paused);
      setProgress(Number.isFinite(audio.duration) && audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100 : 0);
      setTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', update);
    audio.addEventListener('play', update);
    audio.addEventListener('pause', update);
    audio.addEventListener('loadedmetadata', update);
    const onEnded = () => { audio.currentTime = 0; update(); };
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('play', update);
      audio.removeEventListener('pause', update);
      audio.removeEventListener('loadedmetadata', update);
      audio.removeEventListener('ended', onEnded);
      if (activeAudio === audio) activeAudio = null;
    };
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (activeAudio && activeAudio !== audio) activeAudio.pause();
      pauseOthers?.();
      activeAudio = audio;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function onSeek(e) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration === 0) return;
    audio.currentTime = (Number(e.target.value) / 100) * audio.duration;
  }

  function onVolume(e) {
    if (audioRef.current) audioRef.current.volume = Number(e.target.value);
  }

  return (
    <div className="secret-player">
      <div className="secret-player-title">{title}</div>
      <div className="secret-player-row">
        <button
          className="secret-player-toggle"
          type="button"
          aria-label={isPlaying ? 'Остановить музыку' : 'Включить музыку'}
          onClick={togglePlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <input
          className="secret-player-progress"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          aria-label="Перемотка трека"
          onChange={onSeek}
        />
      </div>
      <div className="secret-player-row secret-player-row_secondary">
        <span className="secret-player-volume-label">🔊</span>
        <input
          className="secret-player-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue={0.45}
          aria-label="Громкость"
          onChange={onVolume}
        />
        <span className="secret-player-time">{formatTime(time)}</span>
      </div>
    </div>
  );
}
