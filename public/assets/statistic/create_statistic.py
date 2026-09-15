import json
import re
from pathlib import Path
from collections import Counter


# ============================================================
# НАСТРОЙКИ
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

TELEGRAM_FILE_KEYWORD = "Telegram"
TIKTOK_FILE_KEYWORD = "TikTok"

TIKTOK_CHAT_NAME = "Chat History with zaika_mira24:"


# ============================================================
# СТОП-СЛОВА
# ============================================================
#
# Эти слова не учитываются в "самых частых словах".
# При необходимости список можно изменять.
#

STOP_WORDS = {
    "и",
    "в",
    "во",
    "не",
    "что",
    "он",
    "она",
    "оно",
    "они",
    "на",
    "я",
    "с",
    "со",
    "как",
    "а",
    "то",
    "все",
    "всё",
    "так",
    "его",
    "ее",
    "её",
    "но",
    "да",
    "ты",
    "к",
    "у",
    "же",
    "мы",
    "вы",
    "за",
    "бы",
    "по",
    "только",
    "мне",
    "было",
    "вот",
    "от",
    "меня",
    "еще",
    "ещё",
    "нет",
    "о",
    "из",
    "ему",
    "теперь",
    "когда",
    "уже",
    "вам",
    "ну",
    "для",
    "до",
    "или",
    "если",
    "быть",
    "это",
    "там",
    "тут",
    "их",
    "где",
    "при",
    "чем",
    "чтобы",
    "потому",
    "сам",
    "сама",
    "себя",
    "этот",
    "эта",
    "эти",
    "тот",
    "та",
    "те",
    "мой",
    "моя",
    "мои",
    "твой",
    "твоя",
    "твои",
    "наш",
    "наша",
    "наши",
    "ваш",
    "ваша",
    "ваши",
    "просто",
    "очень",
    "давай"
}

# ============================================================
# ОБЪЕДИНЕНИЕ ИМЁН ДЛЯ ОБЩЕЙ СТАТИСТИКИ
# ============================================================

NAME_MAPPING = {
    "toliklol777": "Толя",
    "Толя Константинов": "Толя",

    "zaika_mira24": "Мира",
    "Мирочка❤️‍🔥": "Мира"
}

# ============================================================
# ЗАГРУЗКА JSON
# ============================================================

def load_json(path):
    """Загружает JSON-файл."""

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


# ============================================================
# ПОИСК ФАЙЛА
# ============================================================

def find_file(keyword):
    """
    Ищет JSON-файл в папке data по ключевому слову
    в названии.

    Например:
        Telegram.json
        Telegram_chat.json
        my_Telegram_export.json
    """

    if not DATA_DIR.exists():
        return None

    for path in DATA_DIR.iterdir():

        if not path.is_file():
            continue

        if path.suffix.lower() != ".json":
            continue

        # Не используем уже созданные статистики
        if path.name.lower().startswith("statistics_"):
            continue

        if keyword.lower() in path.stem.lower():
            return path

    return None


# ============================================================
# TELEGRAM
# ============================================================

def get_telegram_messages(data):
    """
    Извлекает сообщения из Telegram result.json.

    Telegram обычно имеет структуру:

    {
        "messages": [
            {
                "id": 1,
                "type": "message",
                "date": "...",
                "from": "...",
                "text": "..."
            }
        ]
    }
    """

    messages = []

    raw_messages = data.get("messages", [])

    for message in raw_messages:

        # Игнорируем service-сообщения
        if message.get("type") != "message":
            continue

        author = message.get("from")
        date = message.get("date")

        if not author:
            continue

        if not date:
            continue

        text = message.get("text", "")

        # Telegram иногда хранит текст
        # в виде списка объектов
        if isinstance(text, list):

            parts = []

            for item in text:

                if isinstance(item, str):
                    parts.append(item)

                elif isinstance(item, dict):
                    parts.append(
                        str(item.get("text", ""))
                    )

            text = "".join(parts)

        messages.append({
            "author": str(author),
            "date": str(date),
            "text": str(text)
        })

    return messages


# ============================================================
# TIKTOK
# ============================================================

def get_tiktok_messages(data):
    """
    Извлекает сообщения ТОЛЬКО из:

    Direct Message
        -> Direct Messages
            -> ChatHistory
                -> Chat History with zaika_mira24:

    Все остальные TikTok-чаты игнорируются.
    """

    messages = []

    try:

        chat_history = (
            data
            ["Direct Message"]
            ["Direct Messages"]
            ["ChatHistory"]
        )

    except (KeyError, TypeError):

        print(
            "ОШИБКА: В TikTok-файле не найдена "
            "структура Direct Message -> "
            "Direct Messages -> ChatHistory."
        )

        return messages

    # Получаем только нужный чат
    raw_messages = chat_history.get(
        TIKTOK_CHAT_NAME,
        []
    )

    if not raw_messages:

        print(
            f"ПРЕДУПРЕЖДЕНИЕ: чат "
            f"'{TIKTOK_CHAT_NAME}' не найден "
            f"или в нём нет сообщений."
        )

        return messages

    for message in raw_messages:

        if not isinstance(message, dict):
            continue

        date = message.get("Date")
        author = message.get("From")
        text = message.get("Content", "")

        if not date:
            continue

        if not author:
            continue

        messages.append({
            "author": str(author),
            "date": str(date),
            "text": str(text)
        })

    return messages


# ============================================================
# ПОЛУЧЕНИЕ СЛОВ
# ============================================================

def get_words(text):
    """
    Извлекает слова из сообщения.

    Поддерживаются:
        русский
        английский
        цифры
        слова через дефис
    """

    return re.findall(
        r"[A-Za-zА-Яа-яЁё0-9]+(?:[-'][A-Za-zА-Яа-яЁё0-9]+)*",
        text.lower()
    )


# ============================================================
# СТАТИСТИКА
# ============================================================

def create_statistics(messages, source, merge_names=False):
    """
    Создаёт статистику для набора сообщений.

    Если merge_names=True, пользователи объединяются:

        toliklol777        -> Толя
        Толя Константинов  -> Толя

        zaika_mira24       -> Мира
        Мирочка❤️‍🔥        -> Мира
    """

    # --------------------------------------------------------
    # Нормализуем имена
    # --------------------------------------------------------

    processed_messages = []

    for message in messages:

        author = message["author"]

        if merge_names:
            author = NAME_MAPPING.get(
                author,
                author
            )

        processed_messages.append({
            "author": author,
            "date": message["date"],
            "text": message["text"]
        })

    messages = processed_messages

    total_messages = len(messages)

    # --------------------------------------------------------
    # УЧАСТНИКИ
    # --------------------------------------------------------

    participant_counter = Counter(
        message["author"]
        for message in messages
    )

    participants = {}

    for author, count in participant_counter.most_common():

        percentage = (
            count / total_messages * 100
            if total_messages > 0
            else 0
        )

        participants[author] = {
            "messages": count,
            "percentage": round(
                percentage,
                2
            )
        }

    # --------------------------------------------------------
    # СТАТИСТИКА ПО ДНЯМ
    # --------------------------------------------------------

    daily_counter = Counter()

    for message in messages:

        date = message["date"][:10]

        daily_counter[date] += 1

    top_5_days = []

    for date, count in daily_counter.most_common(5):

        percentage = (
            count / total_messages * 100
            if total_messages > 0
            else 0
        )

        top_5_days.append({
            "date": date,
            "messages": count,
            "percentage": round(
                percentage,
                2
            )
        })

    # --------------------------------------------------------
    # СТАТИСТИКА ПО МЕСЯЦАМ
    # --------------------------------------------------------

    monthly_counter = Counter()

    for message in messages:

        month = message["date"][:7]

        monthly_counter[month] += 1

    top_5_months = []

    for month, count in monthly_counter.most_common(5):

        percentage = (
            count / total_messages * 100
            if total_messages > 0
            else 0
        )

        top_5_months.append({
            "month": month,
            "messages": count,
            "percentage": round(
                percentage,
                2
            )
        })

    # --------------------------------------------------------
    # САМЫЕ ЧАСТЫЕ СЛОВА
    # --------------------------------------------------------

    top_words = {}

    for author in participant_counter:

        word_counter = Counter()

        for message in messages:

            if message["author"] != author:
                continue

            words = get_words(
                message["text"]
            )

            for word in words:

                if len(word) < 2:
                    continue

                if word in STOP_WORDS:
                    continue

                word_counter[word] += 1

        top_words[author] = [
            {
                "word": word,
                "count": count
            }
            for word, count
            in word_counter.most_common(5)
        ]

    # --------------------------------------------------------
    # РЕЗУЛЬТАТ
    # --------------------------------------------------------

    return {
        "source": source,

        "total_messages": total_messages,

        "participants": participants,

        "top_5_days": top_5_days,

        "top_5_months": top_5_months,

        "top_5_words_by_participant": top_words
    }


# ============================================================
# СОХРАНЕНИЕ JSON
# ============================================================

def save_json(data, path):
    """
    Сохраняет статистику в красивом JSON.
    """

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=4
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("ГЕНЕРАЦИЯ СТАТИСТИКИ")
    print("=" * 60)

    print()

    # --------------------------------------------------------
    # Проверяем папку
    # --------------------------------------------------------

    if not DATA_DIR.exists():

        print(
            "ОШИБКА: папка 'data' не существует."
        )

        print(
            "Создай папку data рядом со скриптом."
        )

        return

    # --------------------------------------------------------
    # Ищем Telegram
    # --------------------------------------------------------

    telegram_file = find_file(
        TELEGRAM_FILE_KEYWORD
    )

    if telegram_file is None:

        print(
            "ОШИБКА: Telegram JSON-файл "
            "не найден в папке data."
        )

        print(
            "Например, файл должен называться "
            "Telegram.json"
        )

        return

    # --------------------------------------------------------
    # Ищем TikTok
    # --------------------------------------------------------

    tiktok_file = find_file(
        TIKTOK_FILE_KEYWORD
    )

    if tiktok_file is None:

        print(
            "ОШИБКА: TikTok JSON-файл "
            "не найден в папке data."
        )

        print(
            "Например, файл должен называться "
            "TikTok.json"
        )

        return

    # --------------------------------------------------------
    # Показываем найденные файлы
    # --------------------------------------------------------

    print(
        f"Telegram файл: {telegram_file.name}"
    )

    print(
        f"TikTok файл:   {tiktok_file.name}"
    )

    print()

    # --------------------------------------------------------
    # Загружаем Telegram
    # --------------------------------------------------------

    print(
        "Читаю Telegram..."
    )

    telegram_data = load_json(
        telegram_file
    )

    telegram_messages = get_telegram_messages(
        telegram_data
    )

    print(
        f"  Найдено сообщений: "
        f"{len(telegram_messages)}"
    )

    print()

    # --------------------------------------------------------
    # Загружаем TikTok
    # --------------------------------------------------------

    print(
        "Читаю TikTok..."
    )

    tiktok_data = load_json(
        tiktok_file
    )

    tiktok_messages = get_tiktok_messages(
        tiktok_data
    )

    print(
        f"  Чат: {TIKTOK_CHAT_NAME}"
    )

    print(
        f"  Найдено сообщений: "
        f"{len(tiktok_messages)}"
    )

    print()

    # --------------------------------------------------------
    # Telegram статистика
    # --------------------------------------------------------

    print(
        "Создаю статистику Telegram..."
    )

    telegram_statistics = create_statistics(
        telegram_messages,
        "Telegram"
    )

    # --------------------------------------------------------
    # TikTok статистика
    # --------------------------------------------------------

    print(
        "Создаю статистику TikTok..."
    )

    tiktok_statistics = create_statistics(
        tiktok_messages,
        "TikTok"
    )

    # --------------------------------------------------------
    # ОБЩАЯ СТАТИСТИКА
    # --------------------------------------------------------

    print(
        "Создаю общую статистику..."
    )

    all_messages = (
        telegram_messages +
        tiktok_messages
    )

    total_statistics = create_statistics(
        all_messages,
        "Telegram + TikTok",
        merge_names=True
    )

    # --------------------------------------------------------
    # Имена выходных файлов
    # --------------------------------------------------------

    telegram_output = (
        DATA_DIR /
        "statistics_telegram.json"
    )

    tiktok_output = (
        DATA_DIR /
        "statistics_tiktok.json"
    )

    total_output = (
        DATA_DIR /
        "statistics_total.json"
    )

    # --------------------------------------------------------
    # Сохраняем Telegram
    # --------------------------------------------------------

    save_json(
        telegram_statistics,
        telegram_output
    )

    # --------------------------------------------------------
    # Сохраняем TikTok
    # --------------------------------------------------------

    save_json(
        tiktok_statistics,
        tiktok_output
    )

    # --------------------------------------------------------
    # Сохраняем общую
    # --------------------------------------------------------

    save_json(
        total_statistics,
        total_output
    )

    # --------------------------------------------------------
    # ФИНАЛ
    # --------------------------------------------------------

    print()

    print("=" * 60)
    print("ГОТОВО!")
    print("=" * 60)

    print()

    print(
        f"Telegram сообщений: "
        f"{len(telegram_messages)}"
    )

    print(
        f"TikTok сообщений:   "
        f"{len(tiktok_messages)}"
    )

    print(
        f"Всего сообщений:     "
        f"{len(all_messages)}"
    )

    print()

    print("Созданы файлы:")

    print(
        f"  {telegram_output}"
    )

    print(
        f"  {tiktok_output}"
    )

    print(
        f"  {total_output}"
    )

    print()

    print("=" * 60)


# ============================================================
# ЗАПУСК
# ============================================================

if __name__ == "__main__":
    main()