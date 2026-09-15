export default function SiteBackground({ mode, solidPhoto, albumPhotos, pageHeight }) {
  if (mode === 'solid') {
    return (
      <div
        className="site-bg site-bg_solid"
        style={{ backgroundImage: `linear-gradient(rgba(8, 36, 22, 0.78), rgba(8, 36, 22, 0.78)), url(${solidPhoto})` }}
      />
    );
  }

  if (mode === 'album') {
    return (
      // Высота выставляется явно в пикселях (а не 100%), потому что у body
      // нет собственной заданной высоты — она сама определяется контентом,
      // и проценты от неё в такой ситуации не сработают.
      <div className="site-bg site-bg_album" style={{ height: (pageHeight || 0) + 'px' }}>
        {albumPhotos.map((photo) => (
          <div key={photo.key} className="album-frame" style={photo.style}>
            <img src={photo.src} alt="" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
