// Список комиксов для страницы "Комиксы". Каждая запись — это либо
// одностраничный комикс (один файл в pages), либо многостраничная история
// (несколько файлов по порядку — пролистываются кликом по картинке в
// просмотрщике). ЗАМЕНИ примеры ниже на свои настоящие файлы из
// assets/comics/ — сколько их и как они сгруппированы, знаешь только ты,
// это нужно прописать руками.
//
// Формат одной записи:
// {
//   id: 'уникальный-id',
//   title: 'Название, которое увидит человек в списке',
//   pages: ['assets/comics/comics1.png', 'assets/comics/comics2.png', ...],
// }
// Для одностраничного комикса в pages — всего один путь.

export const comicsList = [
  {
    id: 'comic1',
    title: 'Школа',
    pages: ['assets/comics/comics1.png'],
  },
  {
    id: 'comic2',
    title: 'Готовимся ко сну',
    pages: ['assets/comics/comics2.png'],
  },
  {
    id: 'comic3',
    title: 'Сны Толи',
    pages: ['assets/comics/comics3.png'],
  },
  {
    id: 'comic4',
    title: 'Леньтяка Мира',
    pages: ['assets/comics/comics4.png'],
  },
  {
    id: 'comic5',
    title: 'Отдых на Мальдивах',
    pages: ['assets/comics/comics5.png'],
  },
  {
    id: 'comic6',
    title: 'Мира и косплей',
    pages: ['assets/comics/comics6.png'],
  },
  {
    id: 'comic7',
    title: 'Наши будни',
    pages: ['assets/comics/comics7.png'],
  },
  {
    id: 'comic8',
    title: 'История судьбы',
    pages: [
      {page:'assets/comics/comics8.png', title:'Признание'},
      {page:'assets/comics/comics9.png', title:'Свадьба'},
      {page:'assets/comics/comics10.png', title:'Медовый месяц'},
      {page:'assets/comics/comics11.png', title:'Ночная страсть'},
      {page:'assets/comics/comics12.png', title:'Неожиданные перемены'},
      {page:'assets/comics/comics13.png', title:'Маленькое чуда'},
    ],
  },
  {
    id: 'comic9',
    title: 'Великий балл',
    pages: ['assets/comics/comics14.png'],
  },
  {
    id: 'comic10',
    title: 'Прогулка по лесу',
    pages: ['assets/comics/comics15.png'],
  },
];
