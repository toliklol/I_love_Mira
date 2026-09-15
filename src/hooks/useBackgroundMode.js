import { useCallback, useState } from 'react';
import {
  BACKGROUND_MODE_KEY, SOLID_CHOICE_KEY, DEFAULT_BACKGROUND_MODE, RANDOM_SOLID,
} from '../data/backgroundConfig.js';

const VALID_MODES = ['solid', 'album', 'pairs'];

function loadMode() {
  try {
    const saved = localStorage.getItem(BACKGROUND_MODE_KEY);
    if (VALID_MODES.includes(saved)) return saved;
  } catch {
    // localStorage недоступен — используем дефолт
  }
  return DEFAULT_BACKGROUND_MODE;
}

function loadSolidChoice() {
  try {
    const saved = localStorage.getItem(SOLID_CHOICE_KEY);
    if (saved) return saved;
  } catch {
    // localStorage недоступен
  }
  return RANDOM_SOLID;
}

// Хранит выбранный режим фона + (для режима "Сплошной фон") конкретную
// выбранную картинку, либо RANDOM_SOLID — тогда фон каждый раз случайный.
export function useBackgroundMode() {
  const [mode, setModeState] = useState(loadMode);
  const [solidChoice, setSolidChoiceState] = useState(loadSolidChoice);

  const setMode = useCallback((next) => {
    if (!VALID_MODES.includes(next)) return;
    setModeState(next);
    try {
      localStorage.setItem(BACKGROUND_MODE_KEY, next);
    } catch {
      // localStorage недоступен — просто не сохраняем между визитами
    }
  }, []);

  const setSolidChoice = useCallback((src) => {
    setSolidChoiceState(src);
    try {
      localStorage.setItem(SOLID_CHOICE_KEY, src);
    } catch {
      // localStorage недоступен
    }
  }, []);

  return { mode, setMode, solidChoice, setSolidChoice };
}
