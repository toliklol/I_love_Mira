import { useCallback, useMemo, useState } from 'react';
import { SEASON_KEY, getSeasonByDate } from '../data/seasonConfig.js';

const VALID = ['auto', 'winter', 'spring', 'summer', 'autumn'];

function loadSeasonSetting() {
  try {
    const saved = localStorage.getItem(SEASON_KEY);
    if (VALID.includes(saved)) return saved;
  } catch {
    // localStorage недоступен
  }
  return 'auto';
}

// seasonSetting — то, что выбрал человек в настройках ('auto' или конкретный
// сезон). activeSeason — то, что реально применяется прямо сейчас (если
// 'auto' — вычисляется по текущей дате).
export function useSeason() {
  const [seasonSetting, setSeasonSettingState] = useState(loadSeasonSetting);

  const setSeasonSetting = useCallback((next) => {
    if (!VALID.includes(next)) return;
    setSeasonSettingState(next);
    try {
      localStorage.setItem(SEASON_KEY, next);
    } catch {
      // localStorage недоступен — просто не сохраняем между визитами
    }
  }, []);

  const activeSeason = useMemo(
    () => (seasonSetting === 'auto' ? getSeasonByDate() : seasonSetting),
    [seasonSetting],
  );

  return { seasonSetting, setSeasonSetting, activeSeason };
}
