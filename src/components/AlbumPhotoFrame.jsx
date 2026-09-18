import { useState } from 'react';

const MIN_SIZE = 92;
const MAX_SIZE = 150;

// Клэмпит размер к [MIN_SIZE, MAX_SIZE] по большей/меньшей стороне,
// сохраняя пропорции строго — сначала подтягивает слишком маленькую
// картинку до минимума, потом (если понадобилось) ужимает слишком
// большую до максимума. Один и тот же коэффициент применяется к обеим
// сторонам, поэтому искажений не бывает (проверено на квадратных,
// широких и высоких картинках).
function computeSize(naturalW, naturalH) {
  let w = naturalW;
  let h = naturalH;
  const upScale = Math.max(MIN_SIZE / w, MIN_SIZE / h, 1);
  w *= upScale;
  h *= upScale;
  const downScale = Math.min(MAX_SIZE / w, MAX_SIZE / h, 1);
  w *= downScale;
  h *= downScale;
  return { width: Math.round(w), height: Math.round(h) };
}

// Раньше рамка брала размер картинки "как есть" (width/height: auto) —
// маленькие/низкого разрешения фото стикер-паков оставались крошечными
// внутри большой белой рамки. Теперь при загрузке фото узнаём его реальные
// пиксельные размеры (onLoad -> naturalWidth/naturalHeight) и считаем
// итоговый размер сами, а не полагаемся на CSS min/max по обеим осям
// одновременно — на вытянутых картинках это давало искажение пропорций.
export default function AlbumPhotoFrame({ photo }) {
  const [size, setSize] = useState(null);

  function handleLoad(e) {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setSize(computeSize(naturalWidth, naturalHeight));
    }
  }

  return (
    <div
      className="album-frame"
      style={{
        ...photo.style,
        width: size ? size.width : MIN_SIZE,
        height: size ? size.height : MIN_SIZE,
      }}
    >
      <img src={photo.src} alt="" onLoad={handleLoad} />
    </div>
  );
}