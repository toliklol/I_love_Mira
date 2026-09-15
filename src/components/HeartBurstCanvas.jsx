import { forwardRef } from 'react';

// Фиксированный на весь экран контейнер для частиц "взрыва" сердечек.
// Управляется императивно через useHeartBurst(ref).
const HeartBurstCanvas = forwardRef(function HeartBurstCanvas(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    />
  );
});

export default HeartBurstCanvas;
