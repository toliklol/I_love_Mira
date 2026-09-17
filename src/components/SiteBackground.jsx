// "Сплошной фон" остаётся фиксированным (position:fixed) слоем на весь
// экран — в отличие от "Семейного альбома", которому нужно прокручиваться
// вместе со страницей, этот вариант должен просто стоять на месте.
export default function SiteBackground({ mode, solidPhoto }) {
  if (mode !== 'solid') return null;

  return (
    <div
      className="site-bg site-bg_solid"
      style={{ backgroundImage: `linear-gradient(rgba(8, 36, 22, 0.42), rgba(8, 36, 22, 0.42)), url(${solidPhoto})` }}
    />
  );
}
