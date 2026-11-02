# Endfield API (Python)

Сервис на Python для связи веб-сайта с библиотекой `endfield-py` (Arknights: Endfield).
Сервис хранит фиксированные токены для двух игроков (**Толик** и **Мира**) на бэкенде в переменных окружения, безопасно отдаёт профиль, статистику выносливости/фабрики, оперативников с экипировкой и выполняет ежедневную отметку (Daily Sign-in).

## Переменные окружения (.env)

Токены хранятся на стороне сервера в корневом файле `.env` (или в настройках Environment на Render):

```env
# Игрок 1 — Толик
ENDFIELD_TOKEN_TOLIK="твой_токен_skport"
# Также поддерживается алиас ENDFIELD_TOKEN

# Игрок 2 — Мира
ENDFIELD_TOKEN_MIRA="токен_миры_skport"
```

Если токен второго игрока ещё не задан, API отдаёт понятный статус `{"configured": false}`, а сайт показывает аккуратную карточку ожидания без ошибок.

## Запуск локально

Из корня проекта:

```powershell
Set-Location backend
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
Set-Location ..
.\.venv\Scripts\python.exe -m backend.server
```

Сервер запустится на порту `10000` (http://localhost:10000).

Запуск тестов:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s backend/test -p "test_*.py" -v
```

## Эндпоинты

- `GET /health` — проверка статуса сервиса.
- `GET /api/endfield/players` — список игроков и статус их настройки (`configured: true/false`).
- `GET /api/endfield/account?player=tolik` — профиль, статистика базы, выносливость и оперативники (с кэшированием на 5 минут; для принудительного обновления передайте `&refresh=1`).
- `POST /api/endfield/daily-sign` — ежедневная отметка для игрока: тело запроса `{"playerId": "tolik"}`.

## Деплой на Render

1. Репозиторий подключается к Render как **Blueprint** (`render.yaml`).
2. В панели управления Render задаются переменные окружения:
   - `ENDFIELD_TOKEN_TOLIK`
   - `ENDFIELD_TOKEN_MIRA` (когда появится)
   - `ALLOWED_ORIGINS` (по умолчанию `https://toliklol.github.io,http://localhost:5173,http://127.0.0.1:5173`).
3. URL сервиса на Render прописывается в `.env.production` (`VITE_ENDFIELD_API_URL`).
