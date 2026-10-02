// "Сплошной фон" остаётся фиксированным (position:fixed) слоем на весь
// экран — в отличие от "Семейного альбома", которому нужно прокручиваться
// вместе со страницей, этот вариант должен просто стоять на месте.
import LoadingImage from './LoadingImage.jsx';

export default function SiteBackground({ mode, solidPhoto }) {
  if (mode !== 'solid') return null;

  return (
    <div className="site-bg site-bg_solid" aria-hidden="true">
      <LoadingImage className="site-bg-image" src={solidPhoto} alt="" />
    </div>
  );
}
