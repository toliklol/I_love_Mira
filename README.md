# I love Mira — React-версия

Проект перенесён с чистого HTML/CSS/JS на React (Vite), с разбивкой на компоненты.
Функциональность и вёрстка сохранены максимально близко к оригиналу.

## Важно: один момент, который я НЕ перенёс

На странице 5 ("Мои рассказы") в оригинальном `index.html` тексты рассказов №1–4
содержат откровенные сексуальные сцены с описанием реального, конкретного человека
по имени. Я не переношу и не воспроизвожу такой контент про реального,
узнаваемого человека — это то, что я не делаю в принципе, независимо от того, кто
его написал и для кого.

Структура страницы и модальное окно рассказов полностью работают: названия
рассказов на месте, окно открывается/закрывается, листается — просто вместо
текста стоит заглушка. Впиши свой текст сам в `src/data/stories.js`, в поле
`content` каждого рассказа (можно использовать простой HTML: `<p>...</p>`).

## Установка и запуск

```bash
npm install
npm run dev       # локальный запуск (http://localhost:5173)
npm run build     # сборка в папку dist/
```

## Куда положить картинки/видео/звуки

Всё, что раньше лежало в `assets/...` рядом с `index.html`, нужно положить в
`public/assets/...` — с теми же путями и именами файлов, один в один. Например:

```
public/assets/avatars/avatar0.png ... avatar15.png
public/assets/video/banbu.mp4, 30k.mp4, estella.mp4
public/assets/comics1.jpg, comics2.jpg, awayM.webp, ... (все мемы со страницы 2)
public/assets/mystickers/*.webp        (случайные стикеры фона)
public/assets/stickerpack/pack1/sticker1.png ... sticker49.png
public/assets/stickerpack/pack2/... (27 шт.)
public/assets/stickerpack/pack3/... (51 шт.)
public/assets/stickerpack/pack4/... (45 шт.)
public/assets/stickerpack/pack5/... (45 шт.)
public/assets/stickerpack/pack6/... (75 шт.)
public/assets/stickerpack/pack7/... (68 шт.)
public/assets/sounds/emoji_salut.mp3
public/assets/sounds/winning-sound-effect.mp3
public/assets/sounds/Мира в огне.mp3
public/assets/sounds/Ghostrifter-Official-Purple-Dream(chosic.com).mp3
public/assets/sounds/Lovely-Long-Version-chosic.com_.mp3
public/assets/sounds/ron-gelinas-chillout-lounge-where-will-i-go(chosic.com).mp3
public/assets/sounds/scott-buckley-reverie(chosic.com).mp3
public/assets/sounds/The-Kyoto-Connection-Hachiko-The-Faithtful-Dog(chosic.com).mp3
public/assets/statistic/data/statistics_telegram.json
public/assets/statistic/data/statistics_tiktok.json
public/assets/statistic/data/statistics_total.json
```

Все пути (`src="assets/..."`) уже прописаны в коде точно как в оригинале —
достаточно просто скопировать твою папку `assets` целиком в `public/assets`.

Шрифты (Cera Stencil) и `sw.js` я уже перенёс в `public/` — они подключены и
работают без доп. настройки.

## Sticker Manager

Утилита для управления стикер-паками: добавление, удаление, переупорядочивание,
архивация. Запускается как отдельное Tkinter-приложение.

### Установка зависимостей

```bash
pip install pillow watchdog
```

`watchdog` опционален — без него работает режим опроса папки `Incoming`.

### Запуск

```bash
# Из корня проекта:
.venv\Scripts\python.exe public/assets/sticker_manager.py
```

> **Важно:** запускайте из корня проекта или используйте относительный путь,
> чтобы не было проблем с кириллицей в пути.

### Как работает

| Папка / Действие | Что происходит |
|---|---|
| Положить `*.png` в `Incoming/` | Файл автоматически добавляется в конец текущего Pack |
| Кнопка **🗑 Удалить** на карточке | Стикер переносится в общий архив `deleted/` |
| Drag & drop карточки | Перемещает стикер на новую позицию в текущем Pack |
| **⟳ Обновить** | Перезагружает текущий Pack с диска |
| **📦 Упорядочить deleted** | Приводит архив `deleted/` к именам `sticker1.png … stickerN.png` |
| **Открыть Incoming / deleted** | Открывает папку в проводнике |

Структура папок, создаваемая утилитой:

```
public/assets/
  Stickerpack/
    pack1/  …  pack7/    — стикеры (sticker1.png … stickerN.png)
  Incoming/               — перетаскивайте сюда новые PNG
  deleted/                — архив удалённых стикеров
```

## Структура проекта

```
src/
  App.jsx                 — главный компонент: состояние страницы, меню, модалки
  index.css               — стили (перенесены как есть из style.css)
  data/                    — статические данные, вытащенные из оригинального JS
    compliments.js         — 121 комплимент
    jokes.js                — 13 приколов
    memes.js                 — 23 карточки мемов/стикеров (страница 2)
    stickerPacks.js          — конфиг 7 стикер-паков + фоновые стикеры
    stories.js                — заголовки рассказов (текст — заглушка, см. выше)
    config.js                 — таймер, меню, музыка, секретные сердечки, статистика
  hooks/
    useFallingEmojis.js       — падающие эмодзи-фон (свои для каждой страницы)
    useRandomBackground.js    — случайный фон body + стикеры по краям карточки
    useMusicPlayer.js         — фоновый плеер (меню, ⏮ ▶/⏸ ⏭)
    useSecretHearts.js        — пасхалка с 10 сердечками (localStorage)
    useHeartBurst.js          — физика "взрыва" стикеров при клике на мем
  components/
    Header.jsx, MenuPanel.jsx, FallingBackground.jsx, BgStickers.jsx,
    SecretHeartsLayer.jsx, HeartBurstCanvas.jsx, PatchNote.jsx,
    StoryModal.jsx, StickerModal.jsx, SecretAudioPlayer.jsx
  pages/
    Page1Profile.jsx  — главная (аватар с перекрёстным фейдом, теги, цитата)
    Page2Memes.jsx     — мемы/видео + взрыв стикеров по клику
    Page3Jokes.jsx      — список приколов
    Page4Compliments.jsx — облако комплиментов
    Page5Stories.jsx      — список рассказов + модалка (текст — заглушка)
    Page6Stickers.jsx      — аккордеон стикер-паков + модалка просмотра (зум/пан/свайп/скачать)
    Page7Music.jsx           — секретный трек, открывается после 10 сердечек
    Page8Stats.jsx            — статистика переписки (табы Итого/Telegram/TikTok)
    Page9Other.jsx             — статичная страница-заглушка
```

## Мелкие отличия от оригинала (осознанные упрощения)

- **Аккордеон стикер-паков**: раскрытие использует `max-height: none` вместо
  анимированной высоты в пикселях — раскрывается мгновенно, без плавной
  анимации высоты (остальные анимации и открытие/закрытие работают).
- **Смена аватарки на странице 1**: в оригинале использовался таймер в 1мс
  (фактически работал на скорости, которую позволял браузер). В React-версии
  использован тик в 30мс — визуально плавный кроссфейд той же длительности.
- Кнопка `musicUnlock` в меню была в оригинальном JS, но не существовала в
  разметке (мёртвый код) — в переносе она не появляется по той же причине.

Всё остальное — таймер дней, падающие эмодзи, меню и свайп для его закрытия,
пасхалка с сердечками, статистика, стикеры с зумом/панорамированием/свайпами/
скачиванием, музыкальный плеер, "взрыв" стикеров при клике на мем, уведомление
об обновлении сайта — перенесено с тем же поведением, что и в оригинале.
