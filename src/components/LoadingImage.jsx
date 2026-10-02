import { useEffect, useRef, useState } from 'react';

export default function LoadingImage({ onLoad, onError, ...props }) {
  const imageRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const loaded = loadedSrc === props.src;

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoadedSrc(props.src);
  }, [props.src]);

  function handleLoad(event) {
    setLoadedSrc(props.src);
    onLoad?.(event);
  }

  function handleError(event) {
    setLoadedSrc(props.src);
    onError?.(event);
  }

  return (
    <img
      {...props}
      ref={imageRef}
      data-image-loaded={loaded ? 'true' : undefined}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
