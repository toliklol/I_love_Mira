import { useEffect, useRef } from 'react';

const PARTICLES_COUNT = 28;
const GRAVITY = 0.12;
const FRICTION = 0.98;
const BOUNCE_DAMPING = 0.55;

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Хук с DOM-канвасом для "взрыва" сердечек/стикеров в заданной точке экрана.
// canvasRef должен указывать на фиксированный на весь экран контейнер.
export function useHeartBurst(canvasRef) {
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const particles = particlesRef.current;

    if (particles.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const bottomLimit = window.innerHeight - 20;
    const rightLimit = window.innerWidth - 10;
    const leftLimit = 10;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p.el) continue;

      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= FRICTION;

      if (p.y + 10 > bottomLimit) {
        p.y = bottomLimit - 10;
        p.vy = -p.vy * BOUNCE_DAMPING;
        p.vx *= 0.96;
        if (Math.abs(p.vy) < 0.15) p.vy = 0;
      }
      if (p.x < leftLimit) { p.x = leftLimit; p.vx = -p.vx * 0.4; }
      else if (p.x > rightLimit) { p.x = rightLimit; p.vx = -p.vx * 0.4; }
      if (p.y < -30) { p.y = -30; p.vy = 0; }

      p.life -= 0.004;
      if (p.life < 0) p.life = 0;
      p.opacity = Math.min(1, p.life * 1.3);

      p.el.style.left = p.x + 'px';
      p.el.style.top = p.y + 'px';
      p.el.style.opacity = p.opacity;
      p.rotation += p.vx * 0.25;
      p.el.style.transform = `rotate(${p.rotation}deg)`;

      if (p.opacity < 0.03 || p.y > bottomLimit + 60) {
        p.el.remove();
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      animationFrameRef.current = null;
      canvas.innerHTML = '';
    }
  }

  function burst(centerX, centerY, stickerString) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stickers = (stickerString || '❤️🧡💛💚💙💜').match(/\p{Emoji}/gu) || ['❤️'];
    if (stickers.length === 0) stickers.push('❤️');

    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const angle = getRandom(0, Math.PI * 2);
      const speed = getRandom(1.5, 5.5);
      const vx = Math.cos(angle) * speed * getRandom(0.7, 1.3);
      const vy = Math.sin(angle) * speed * getRandom(0.7, 1.3) - 0.5;
      const symbol = stickers[Math.floor(Math.random() * stickers.length)];
      const size = getRandom(0.9, 2.0);
      const rotation = getRandom(-80, 80);

      const p = {
        x: centerX + getRandom(-8, 8),
        y: centerY + getRandom(-8, 8),
        vx, vy, symbol, size, rotation,
        opacity: 1, life: 1, el: null,
      };

      const el = document.createElement('span');
      el.className = 'heart-particle';
      el.textContent = p.symbol;
      el.style.fontSize = p.size + 'rem';
      el.style.transform = `rotate(${p.rotation}deg)`;
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.opacity = '1';
      canvas.appendChild(el);
      p.el = el;

      particlesRef.current.push(p);
    }

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }

  return burst;
}
