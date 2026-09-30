import os
import re
import shutil
import tempfile
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox
from pathlib import Path

try:
    from PIL import Image, ImageTk
except ImportError:
    raise SystemExit("Установите Pillow: pip install pillow")

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    Observer = None

    class FileSystemEventHandler:
        pass


# ============================================================
# НАСТРОЙКИ
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
STICKERPACK_DIR = BASE_DIR / "Stickerpack"
INCOMING_DIR = BASE_DIR / "Incoming"
DELETE_DIR = STICKERPACK_DIR / "delete"
PACK_COUNT = 7

THUMB_SIZE = 130
CELL_W = 160
CELL_H = 205
POLL_DELAY = 0.4


# ============================================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ============================================================

STICKER_RE = re.compile(r"^sticker(\d+)\.png$", re.IGNORECASE)


def ensure_directories():
    STICKERPACK_DIR.mkdir(parents=True, exist_ok=True)
    INCOMING_DIR.mkdir(parents=True, exist_ok=True)
    DELETE_DIR.mkdir(parents=True, exist_ok=True)

    for i in range(1, PACK_COUNT + 1):
        (STICKERPACK_DIR / f"pack{i}").mkdir(parents=True, exist_ok=True)


def sticker_files(pack_dir: Path):
    items = []

    for path in pack_dir.iterdir():
        if not path.is_file():
            continue

        match = STICKER_RE.match(path.name)
        if match:
            items.append((int(match.group(1)), path))

    items.sort(key=lambda x: x[0])
    return [path for _, path in items]


def delete_files():
    """
    Все PNG из общего архива delete.

    Файлы вида stickerN.png сортируются по номеру N (как в паках).
    Любые прочие PNG (например, временный .deleted_*.png только что
    перемещённого стикера, ещё не переименованный) считаются вновь
    добавленными и ставятся в конец, в порядке их появления (по mtime).
    Благодаря этому только что удалённый стикер всегда попадает в
    конец архива, а не становится sticker1.
    """
    numbered = []
    others = []

    for path in DELETE_DIR.iterdir():
        if not path.is_file() or path.suffix.lower() != ".png":
            continue

        match = STICKER_RE.match(path.name)
        if match:
            numbered.append((int(match.group(1)), path))
        else:
            others.append(path)

    numbered.sort(key=lambda x: x[0])
    others.sort(key=lambda p: p.stat().st_mtime)

    return [path for _, path in numbered] + others


def move_to_delete(pack_dir: Path, index: int):
    """Перемещает стикер из пака в общий архив Stickerpack/delete."""
    paths = sticker_files(pack_dir)

    if index < 1 or index > len(paths):
        raise ValueError("Некорректный номер стикера.")

    source = paths[index - 1]
    DELETE_DIR.mkdir(parents=True, exist_ok=True)

    # Уникальное временное имя предотвращает конфликт с delete/stickerN.png.
    temp = DELETE_DIR / f".deleted_{time.time_ns()}.png"
    os.replace(source, temp)

    try:
        # Оставшиеся файлы пака становятся sticker1...N.
        atomic_rename_sequence(sticker_files(pack_dir), pack_dir)

        # Архив тоже становится одной последовательностью sticker1...N.
        archived = delete_files()
        atomic_rename_sequence(archived, DELETE_DIR)
    except Exception:
        # Если дальнейшая операция не удалась, файл остаётся в delete,
        # а не уничтожается.
        raise


def normalize_delete():
    """Перенумеровывает все PNG в Stickerpack/delete."""
    files = delete_files()
    if files:
        atomic_rename_sequence(files, DELETE_DIR)
    return len(files)


def wait_until_file_ready(path: Path, timeout=30):
    start = time.time()
    last_size = -1
    stable_count = 0

    while time.time() - start < timeout:
        try:
            if not path.exists():
                return False

            size = path.stat().st_size

            if size > 0 and size == last_size:
                stable_count += 1
                if stable_count >= 3:
                    with open(path, "rb"):
                        pass
                    return True
            else:
                stable_count = 0

            last_size = size
        except OSError:
            pass

        time.sleep(0.3)

    return False


def atomic_rename_sequence(paths, destination_dir):
    """
    Безопасно переименовывает последовательность файлов.

    Сначала все stickerN.png получают уникальные временные имена,
    затем получают окончательные sticker1.png ... stickerN.png.

    Поэтому не возникает конфликтов вида sticker5 -> sticker6,
    когда sticker6 уже существует.
    """
    destination_dir = Path(destination_dir)
    destination_dir.mkdir(parents=True, exist_ok=True)

    temp_dir = destination_dir / ".sticker_manager_tmp"
    temp_dir.mkdir(exist_ok=True)

    temp_paths = []

    try:
        # Шаг 1. Убираем все старые имена во временную область.
        for index, source in enumerate(paths):
            source = Path(source)

            if not source.exists():
                raise FileNotFoundError(f"Файл не найден: {source}")

            temp_name = f"__sticker_manager_{time.time_ns()}_{index}.tmp"
            temp_path = temp_dir / temp_name

            os.replace(source, temp_path)
            temp_paths.append(temp_path)

        # Шаг 2. Возвращаем файлы уже с правильными именами.
        for index, temp_path in enumerate(temp_paths, start=1):
            target = destination_dir / f"sticker{index}.png"
            os.replace(temp_path, target)

    except Exception:
        # В случае ошибки пытаемся вернуть временные файлы обратно.
        for temp_path in temp_paths:
            if temp_path.exists():
                # Имя восстановления максимально безопасное.
                restore = destination_dir / (
                    f"recovery_{time.time_ns()}_{temp_path.name}.png"
                )
                try:
                    os.replace(temp_path, restore)
                except OSError:
                    pass
        raise

    finally:
        try:
            if temp_dir.exists() and not any(temp_dir.iterdir()):
                temp_dir.rmdir()
        except OSError:
            pass


def reorder_pack(pack_dir: Path, old_index: int, new_index: int):
    """
    Перемещает стикер old_index на позицию new_index (1-based).
    """
    paths = sticker_files(pack_dir)

    if not paths:
        return

    if old_index < 1 or old_index > len(paths):
        raise ValueError("Некорректный исходный индекс.")

    if new_index < 1:
        new_index = 1

    if new_index > len(paths):
        new_index = len(paths)

    if old_index == new_index:
        return

    item = paths.pop(old_index - 1)
    paths.insert(new_index - 1, item)

    atomic_rename_sequence(paths, pack_dir)


def add_to_pack(source: Path, pack_dir: Path):
    paths = sticker_files(pack_dir)

    # Сначала убеждаемся, что входящий файл действительно PNG.
    try:
        with Image.open(source) as img:
            img.verify()
    except Exception:
        raise ValueError(f"Файл не является корректным PNG: {source.name}")

    # Копируем во временный файл внутри pack, затем включаем его
    # в общую безопасную перенумерацию.
    temp_name = f".incoming_{time.time_ns()}.png"
    temp_path = pack_dir / temp_name

    shutil.copy2(source, temp_path)

    try:
        paths.append(temp_path)

        # atomic_rename_sequence ожидает существующие файлы,
        # а temp_path не обязан иметь stickerN-имя.
        atomic_rename_sequence(paths, pack_dir)
    except Exception:
        try:
            temp_path.unlink(missing_ok=True)
        except OSError:
            pass
        raise

    # Только после успешного добавления удаляем оригинал.
    source.unlink()


# ============================================================
# WATCHDOG
# ============================================================

class IncomingHandler(FileSystemEventHandler):
    def __init__(self, app):
        super().__init__()
        self.app = app

    def on_created(self, event):
        if event.is_directory:
            return

        path = Path(event.src_path)

        if path.suffix.lower() != ".png":
            return

        # Watchdog может увидеть файл до окончания его копирования.
        threading.Thread(
            target=self._process,
            args=(path,),
            daemon=True
        ).start()

    def _process(self, path):
        if not wait_until_file_ready(path):
            return

        # Небольшая пауза после стабилизации файла.
        time.sleep(0.2)

        self.app.process_incoming(path)


# ============================================================
# GUI
# ============================================================

class StickerManager(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Sticker Manager")
        self.geometry("1100x760")
        self.minsize(850, 600)

        self.selected_pack = 1
        self.drag_source_index = None
        self.drag_widget = None
        self.photo_refs = []
        self.busy = False

        self.style = ttk.Style(self)

        try:
            self.style.theme_use("vista")
        except tk.TclError:
            pass

        ensure_directories()
        try:
            normalize_delete()
        except Exception as exc:
            messagebox.showwarning(
                "Архив delete",
                f"Не удалось упорядочить архив delete:\n{exc}"
            )
        self.create_ui()
        self.load_pack()

        self.observer = None
        self.incoming_seen = set()

        if WATCHDOG_AVAILABLE:
            self.observer = Observer()
            self.observer.schedule(
                IncomingHandler(self),
                str(INCOMING_DIR),
                recursive=False
            )
            self.observer.start()
        else:
            self.poll_incoming()

        self.protocol("WM_DELETE_WINDOW", self.on_close)

    # --------------------------------------------------------
    # UI
    # --------------------------------------------------------

    def create_ui(self):
        header = ttk.Frame(self, padding=(15, 12))
        header.pack(fill="x")

        title = ttk.Label(
            header,
            text="Sticker Manager",
            font=("Segoe UI", 20, "bold")
        )
        title.pack(side="left")

        self.status_var = tk.StringVar(value="Готово")
        status = ttk.Label(
            header,
            textvariable=self.status_var
        )
        status.pack(side="right")

        # Выбор pack
        pack_bar = ttk.Frame(self, padding=(15, 0, 15, 10))
        pack_bar.pack(fill="x")

        ttk.Label(
            pack_bar,
            text="Стикерпак:"
        ).pack(side="left", padx=(0, 8))

        self.pack_buttons = []

        for i in range(1, PACK_COUNT + 1):
            btn = ttk.Button(
                pack_bar,
                text=f"Pack {i}",
                command=lambda n=i: self.select_pack(n)
            )
            btn.pack(side="left", padx=3)
            self.pack_buttons.append(btn)

        ttk.Button(
            pack_bar,
            text="⟳ Обновить",
            command=self.load_pack
        ).pack(side="right")

        # Информация
        info = ttk.Frame(self, padding=(15, 0, 15, 10))
        info.pack(fill="x")

        self.pack_info_var = tk.StringVar()
        ttk.Label(
            info,
            textvariable=self.pack_info_var
        ).pack(side="left")

        incoming_text = (
            f"Incoming: {INCOMING_DIR}\n"
            "PNG-файлы, добавленные сюда, автоматически попадут "
            "в конец выбранного Pack."
        )

        incoming = ttk.Label(
            info,
            text=incoming_text,
            justify="right"
        )
        incoming.pack(side="right")

        # Область стикеров
        container = ttk.Frame(self, padding=(15, 0, 15, 15))
        container.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(
            container,
            highlightthickness=0,
            background="#f5f5f5"
        )

        scrollbar = ttk.Scrollbar(
            container,
            orient="vertical",
            command=self.canvas.yview
        )

        self.canvas.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side="right", fill="y")
        self.canvas.pack(side="left", fill="both", expand=True)

        self.grid_frame = ttk.Frame(self.canvas)

        self.canvas_window = self.canvas.create_window(
            (0, 0),
            window=self.grid_frame,
            anchor="nw"
        )

        self.grid_frame.bind(
            "<Configure>",
            self.on_grid_configure
        )

        self.canvas.bind(
            "<Configure>",
            self.on_canvas_configure
        )

        # Нижняя панель
        footer = ttk.Frame(self, padding=(15, 0, 15, 12))
        footer.pack(fill="x")

        ttk.Label(
            footer,
            text=(
                "Перетаскивание: зажмите стикер и перенесите его "
                "на нужную позицию."
            )
        ).pack(side="left")

        ttk.Button(
            footer,
            text="Открыть delete",
            command=self.open_delete
        ).pack(side="right", padx=(8, 0))

        ttk.Button(
            footer,
            text="Открыть Incoming",
            command=self.open_incoming
        ).pack(side="right")

    # --------------------------------------------------------
    # PACK
    # --------------------------------------------------------

    def select_pack(self, number):
        if self.busy:
            return

        self.selected_pack = number
        self.load_pack()

    def current_pack_dir(self):
        return STICKERPACK_DIR / f"pack{self.selected_pack}"

    def load_pack(self):
        pack_dir = self.current_pack_dir()
        files = sticker_files(pack_dir)

        for widget in self.grid_frame.winfo_children():
            widget.destroy()

        self.photo_refs.clear()

        self.pack_info_var.set(
            f"Pack {self.selected_pack} — {len(files)} стикеров"
        )

        columns = max(
            1,
            self.canvas.winfo_width() // CELL_W
        )

        for index, path in enumerate(files, start=1):
            row = (index - 1) // columns
            column = (index - 1) % columns

            card = self.create_sticker_card(
                index,
                path
            )
            card.grid(
                row=row,
                column=column,
                padx=8,
                pady=8,
                sticky="n"
            )

        self.canvas.after_idle(
            lambda: self.canvas.configure(
                scrollregion=self.canvas.bbox("all")
            )
        )

        self.status_var.set(
            f"Pack {self.selected_pack}: {len(files)} стикеров"
        )

    def create_sticker_card(self, index, path):
        card = tk.Frame(
            self.grid_frame,
            width=CELL_W,
            height=CELL_H,
            bd=1,
            relief="solid",
            background="white",
            cursor="hand2"
        )
        card.pack_propagate(False)

        image_label = tk.Label(
            card,
            background="white"
        )
        image_label.pack(
            fill="both",
            expand=True,
            padx=5,
            pady=(5, 0)
        )

        try:
            img = Image.open(path)
            img.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)

            photo = ImageTk.PhotoImage(img)
            image_label.configure(image=photo)
            self.photo_refs.append(photo)
        except Exception:
            image_label.configure(
                text="Ошибка\nPNG",
                font=("Segoe UI", 11)
            )

        number_label = tk.Label(
            card,
            text=f"sticker{index}.png",
            background="white",
            font=("Segoe UI", 10)
        )
        number_label.pack(pady=(3, 3))

        delete_button = tk.Button(
            card,
            text="🗑 Удалить в архив",
            command=lambda i=index: self.confirm_delete(i),
            font=("Segoe UI", 9),
            cursor="hand2"
        )
        delete_button.pack(pady=(0, 6))

        # Поддерживаем drag за карточку, картинку и имя.
        for widget in (card, image_label, number_label):
            widget.bind(
                "<ButtonPress-1>",
                lambda e, i=index: self.drag_start(e, i)
            )
            widget.bind(
                "<B1-Motion>",
                self.drag_motion
            )
            widget.bind(
                "<ButtonRelease-1>",
                self.drag_end
            )

        return card

    def confirm_delete(self, index):
        if self.busy:
            return

        if not messagebox.askyesno(
            "Удалить в архив",
            (
                f"Переместить sticker{index}.png в "
                f"Stickerpack\\delete?\n\n"
                "Файл не будет удалён. Он попадёт в общий архив, "
                "а текущий Pack автоматически перенумеруется."
            )
        ):
            return

        self.delete_sticker(index)

    def delete_sticker(self, index):
        self.set_busy(True)
        pack_number = self.selected_pack

        def worker():
            try:
                move_to_delete(
                    STICKERPACK_DIR / f"pack{pack_number}",
                    index
                )
                self.after(
                    0,
                    lambda: self.operation_finished(
                        f"sticker{index}.png перемещён в архив delete"
                    )
                )
            except Exception as exc:
                self.after(
                    0,
                    lambda: self.operation_error(
                        f"Не удалось переместить стикер в архив:\n{exc}"
                    )
                )

        threading.Thread(target=worker, daemon=True).start()

    # --------------------------------------------------------
    # DRAG & DROP
    # --------------------------------------------------------

    def drag_start(self, event, index):
        if self.busy:
            return

        self.drag_source_index = index
        self.drag_widget = event.widget

        self.status_var.set(
            f"Перемещение sticker{index}.png — отпустите на нужной позиции"
        )

    def drag_motion(self, event):
        if self.drag_source_index is None:
            return

        # Визуально показываем, что идёт перенос.
        self.configure(cursor="exchange")

    def drag_end(self, event):
        self.configure(cursor="")

        if self.drag_source_index is None or self.busy:
            self.drag_source_index = None
            return

        x = self.canvas.winfo_pointerx()
        y = self.canvas.winfo_pointery()

        target_widget = self.winfo_containing(x, y)

        target_index = self.find_card_index(target_widget)

        source_index = self.drag_source_index
        self.drag_source_index = None

        if target_index is None:
            self.status_var.set("Перемещение отменено")
            return

        if source_index == target_index:
            self.status_var.set("Позиция не изменилась")
            return

        self.reorder(source_index, target_index)

    def find_card_index(self, widget):
        while widget is not None:
            if widget.master == self.grid_frame:
                text = ""
                for child in widget.winfo_children():
                    if isinstance(child, tk.Label):
                        value = child.cget("text")
                        if value.startswith("sticker"):
                            text = value
                            break

                match = re.match(r"sticker(\d+)\.png", text)
                if match:
                    return int(match.group(1))

            widget = getattr(widget, "master", None)

        return None

    def reorder(self, source_index, target_index):
        self.set_busy(True)

        def worker():
            try:
                reorder_pack(
                    self.current_pack_dir(),
                    source_index,
                    target_index
                )

                self.after(
                    0,
                    lambda: self.operation_finished(
                        f"sticker{source_index}.png → позиция {target_index}"
                    )
                )
            except Exception as exc:
                self.after(
                    0,
                    lambda: self.operation_error(str(exc))
                )

        threading.Thread(target=worker, daemon=True).start()

    # --------------------------------------------------------
    # INCOMING
    # --------------------------------------------------------

    def poll_incoming(self):
        """Обнаруживает PNG без установленного watchdog."""
        current = {
            path for path in INCOMING_DIR.iterdir()
            if path.is_file() and path.suffix.lower() == ".png"
        }

        for path in current - self.incoming_seen:
            threading.Thread(
                target=self._process_polled_file,
                args=(path,),
                daemon=True
            ).start()

        self.incoming_seen = current
        self.after(500, self.poll_incoming)

    def _process_polled_file(self, path):
        if wait_until_file_ready(path):
            self.process_incoming(path)

    def process_incoming(self, path):
        if not path.exists():
            return

        # Читаем выбранный pack из GUI-потока безопасно.
        selected_pack = self.selected_pack
        pack_dir = STICKERPACK_DIR / f"pack{selected_pack}"

        self.after(
            0,
            lambda: self.status_var.set(
                f"Обнаружен новый PNG: {path.name}"
            )
        )

        try:
            add_to_pack(path, pack_dir)

            self.after(
                0,
                lambda: self.load_pack()
            )

            self.after(
                0,
                lambda: self.status_var.set(
                    f"{path.name} добавлен в Pack {selected_pack}"
                )
            )

        except Exception as exc:
            self.after(
                0,
                lambda: self.status_var.set(
                    f"Ошибка добавления {path.name}: {exc}"
                )
            )

    # --------------------------------------------------------
    # GUI HELPERS
    # --------------------------------------------------------

    def set_busy(self, value):
        self.busy = value

        if value:
            self.status_var.set("Выполняется операция...")
        else:
            self.status_var.set("Готово")

    def operation_finished(self, message):
        self.set_busy(False)
        self.load_pack()
        self.status_var.set(message)

    def operation_error(self, message):
        self.set_busy(False)
        messagebox.showerror(
            "Ошибка",
            message
        )
        self.load_pack()
        self.status_var.set("Операция завершилась с ошибкой")

    def on_grid_configure(self, event=None):
        self.canvas.configure(
            scrollregion=self.canvas.bbox("all")
        )

    def on_canvas_configure(self, event):
        # При изменении ширины окна пересчитываем количество колонок.
        self.load_pack()

    def open_incoming(self):
        try:
            os.startfile(INCOMING_DIR)
        except Exception as exc:
            messagebox.showerror(
                "Ошибка",
                f"Не удалось открыть папку:\n{exc}"
            )

    def open_delete(self):
        try:
            os.startfile(DELETE_DIR)
        except Exception as exc:
            messagebox.showerror(
                "Ошибка",
                f"Не удалось открыть папку delete:\n{exc}"
            )

    def on_close(self):
        try:
            if self.observer is not None:
                self.observer.stop()
                self.observer.join(timeout=2)
        except Exception:
            pass

        self.destroy()


# ============================================================
# START
# ============================================================

if __name__ == "__main__":
    app = StickerManager()
    app.mainloop()