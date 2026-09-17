// Рендерится как сосед .app-wrapper (а не внутри него), чтобы покрывать
// не только саму карточку, но и весь документ целиком — включая зелёные
// поля сверху/снизу, где у .app-wrapper стоит margin: 15vh. Высота
// приходит из usePageHeight() — это реальная высота document.body,
// измеренная безопасным способом (см. комментарий в usePageHeight.js).
export default function AlbumBackground({ photos, pageHeight }) {
  return (
    <div className="album-bg" style={{ height: (pageHeight || 0) + 'px' }} aria-hidden="true">
      {photos.map((photo) => (
        <div key={photo.key} className="album-frame" style={photo.style}>
          <img src={photo.src} alt="" />
        </div>
      ))}
    </div>
  );
}
