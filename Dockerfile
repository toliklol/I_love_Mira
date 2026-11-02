FROM python:3.11-slim

WORKDIR /app

# Отключаем буферизацию вывода Python и создание .pyc
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000

# Копируем зависимости
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Копируем код бэкенда
COPY backend/ ./backend/

EXPOSE 10000

CMD ["python", "-m", "backend.server"]
