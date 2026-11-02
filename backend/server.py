import asyncio
import json
import logging
import os
import time
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Any

from aiohttp import web
from endfield import Endfield

from backend.daily_sign import SignResult, daily_sign
from backend.durak_ws import durak_ws_handler

MAX_TOKEN_LENGTH = 8 * 1024
CACHE_TTL_SECONDS = 300  # 5 минут кэширования для мгновенной загрузки

DEFAULT_ALLOWED_ORIGINS = {
    "https://toliklol.github.io",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}

PLAYERS_CONFIG = {
    "tolik": {
        "id": "tolik",
        "name": "Толик",
        "env_keys": ["ENDFIELD_TOKEN_TOLIK", "ENDFIELD_TOKEN", "ENDFIELD_TOKEN_1"],
    },
    "mira": {
        "id": "mira",
        "name": "Мира",
        "env_keys": ["ENDFIELD_TOKEN_MIRA", "ENDFIELD_TOKEN_2"],
    },
}

LOGGER = logging.getLogger("endfield-api")
DailySign = Callable[[str], Awaitable[SignResult]]
ALLOWED_ORIGINS_KEY = web.AppKey("allowed_origins", set[str])
ENDFIELD_FACTORY_KEY = web.AppKey("endfield_factory", Callable[[], Endfield])
ENDFIELD_CLIENT_KEY = web.AppKey("endfield", Endfield)
DAILY_SIGN_KEY = web.AppKey("daily_sign", DailySign)
CACHE_KEY = web.AppKey("cache", dict[str, tuple[float, dict[str, Any]]])


class ApiError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def load_env_file() -> None:
    for candidate in (
        Path(".env"),
        Path(__file__).resolve().parent.parent / ".env",
    ):
        if candidate.is_file():
            try:
                for line in candidate.read_text(encoding="utf-8-sig").splitlines():
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if line.startswith("export "):
                        line = line[7:].lstrip()
                    key, sep, val = line.partition("=")
                    if sep:
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key and key not in os.environ:
                            os.environ[key] = val
            except Exception as error:
                LOGGER.warning("Could not read %s: %s", candidate, error)
            break


load_env_file()


def get_player_token(player_id: str) -> str | None:
    config = PLAYERS_CONFIG.get(player_id)
    if not config:
        return None
    for key in config["env_keys"]:
        val = os.environ.get(key, "").strip().strip("'\"")
        if val:
            return val
    return None


def parse_allowed_origins(value: str | None) -> set[str]:
    if value is None:
        return DEFAULT_ALLOWED_ORIGINS.copy()
    return {origin.strip() for origin in value.split(",") if origin.strip()}


def json_error(status: int, message: str) -> web.Response:
    return web.json_response({"error": message}, status=status)


@web.middleware
async def api_error_middleware(request: web.Request, handler: Callable) -> web.StreamResponse:
    try:
        return await handler(request)
    except ApiError as error:
        return json_error(error.status, error.message)
    except web.HTTPRequestEntityTooLarge:
        return json_error(413, "Размер запроса превышает допустимый лимит.")
    except web.HTTPException as error:
        return json_error(error.status, error.reason)


@web.middleware
async def cors_middleware(request: web.Request, handler: Callable) -> web.StreamResponse:
    origin = request.headers.get("Origin")
    allowed_origins = request.app[ALLOWED_ORIGINS_KEY]

    if origin and origin not in allowed_origins:
        response = json_error(403, "Источник запроса не разрешён.")
    elif request.method == "OPTIONS":
        if not origin:
            response = json_error(403, "Для запроса требуется разрешённый источник.")
        else:
            response = web.Response(status=204)
    else:
        response = await handler(request)

    response.headers["Vary"] = "Origin"
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Max-Age"] = "600"
    return response


# --- Патчи ассетов для библиотеки endfield ---

class _BusinessCardBackgrounds(dict):
    def get(self, key, default=None):
        background = super().get(key)
        if background is not None:
            return background
        return super().get("3", default)


class _RelicAssets(dict):
    def get(self, key, default=None):
        item = super().get(key)
        if item is not None:
            return item
        if default == {}:
            return {"SuitId": "0"}
        return default


def patch_endfield_resolver(client: Endfield) -> None:
    try:
        resolver = getattr(client, "_resolver", None)
        if resolver is not None:
            if hasattr(resolver, "business_card_bg") and isinstance(resolver.business_card_bg, dict):
                resolver.business_card_bg = _BusinessCardBackgrounds(resolver.business_card_bg)
            if hasattr(resolver, "relic_item") and isinstance(resolver.relic_item, dict):
                resolver.relic_item = _RelicAssets(resolver.relic_item)
            if hasattr(resolver, "get_weapon_icon_url"):
                old_get = resolver.get_weapon_icon_url
                resolver.get_weapon_icon_url = lambda w_id: old_get(w_id) or ""
    except Exception as exc:
        LOGGER.warning("Could not apply resolver patches: %s", exc)


# --- Эндпоинты API ---

async def health(_: web.Request) -> web.Response:
    return web.json_response({"status": "ok"})


async def get_players(_: web.Request) -> web.Response:
    players = []
    for pid, conf in PLAYERS_CONFIG.items():
        token = get_player_token(pid)
        players.append({
            "id": conf["id"],
            "name": conf["name"],
            "configured": bool(token),
        })
    return web.json_response({"players": players})


async def account(request: web.Request) -> web.Response:
    player_id: str | None = None
    direct_token: str | None = None
    force_refresh = False

    if request.method == "GET":
        player_id = request.query.get("player", "tolik").lower()
        force_refresh = request.query.get("refresh", "0") in ("1", "true", "yes")
    elif request.method == "POST":
        if request.content_type == "application/json":
            try:
                body = json.loads(await request.text())
            except Exception:
                raise ApiError(400, "Передай корректный JSON.") from None

            if not isinstance(body, dict):
                raise ApiError(400, "Ожидается объект JSON.")

            if "token" in body:
                raw_token = body.get("token")
                if not isinstance(raw_token, str) or not raw_token.strip():
                    raise ApiError(400, "Введи токен аккаунта Skport.")
                direct_token = raw_token.strip()

            if body.get("player"):
                player_id = str(body["player"]).lower()
            elif body.get("playerId"):
                player_id = str(body["playerId"]).lower()

            if body.get("refresh"):
                force_refresh = bool(body["refresh"])

    if direct_token:
        if len(direct_token) > MAX_TOKEN_LENGTH:
            raise ApiError(413, "Токен превышает допустимую длину.")
        token = direct_token
        player_id = "custom"
        player_info = {"id": "custom", "name": "Игрок"}
    else:
        if not player_id:
            player_id = "tolik"
        if player_id not in PLAYERS_CONFIG:
            raise ApiError(404, f"Неизвестный игрок: {player_id}.")
        player_info = PLAYERS_CONFIG[player_id]
        token = get_player_token(player_id)
        if not token:
            return web.json_response({
                "configured": False,
                "playerId": player_id,
                "playerName": player_info["name"],
                "error": f"Токен для игрока {player_info['name']} ещё не настроен в .env на сервере.",
            })

    # Проверка кэша
    cache = request.app[CACHE_KEY]
    cache_key = f"{player_id}:{token[:8]}"
    if not force_refresh and cache_key in cache:
        cached_time, cached_data = cache[cache_key]
        if time.time() - cached_time < CACHE_TTL_SECONDS:
            return web.json_response(cached_data)

    client = request.app[ENDFIELD_CLIENT_KEY]
    patch_endfield_resolver(client)

    try:
        user_data = None
        user = None
        if hasattr(client, "verify_user"):
            user = await client.verify_user(token)
            if user is None:
                raise ApiError(422, "Не удалось подтвердить аккаунт. Проверь валидность токена Skport.")
            user_data = user.model_dump(mode="json") if hasattr(user, "model_dump") else user.__dict__

        profile_data = None
        if user is not None and hasattr(client, "get_profile"):
            try:
                uid = getattr(user, "uid", None)
                if uid is not None:
                    profile = await client.get_profile(uid)
                    if profile is not None:
                        profile_data = (
                            profile.model_dump(mode="json")
                            if hasattr(profile, "model_dump")
                            else profile.__dict__
                        )
            except Exception as exc:
                LOGGER.warning("Could not fetch player profile: %s", exc)

        game_stats = await client.get_game_stats(token)
        if game_stats is None:
            raise ApiError(502, "Не удалось загрузить игровую статистику аккаунта.")

        roster = await client.get_all_characters(token)
        if roster is None:
            raise ApiError(502, "Не удалось загрузить список персонажей.")

        semaphore = asyncio.Semaphore(6)

        async def with_details(summary: Any) -> dict[str, Any]:
            details_data = None
            try:
                async with semaphore:
                    details = await client.get_game_character(token, summary.char_id)
                if details is not None:
                    details_data = (
                        details.model_dump(mode="json")
                        if hasattr(details, "model_dump")
                        else details.__dict__
                    )
            except Exception as exc:
                LOGGER.info("No detailed stats for character %s: %s", getattr(summary, "name", "unknown"), exc)

            summary_data = (
                summary.model_dump(mode="json")
                if hasattr(summary, "model_dump")
                else summary.__dict__
            )
            return {
                **summary_data,
                "details": details_data,
            }

        characters = await asyncio.gather(
            *(with_details(summary) for summary in roster.characters)
        )

        response_data = {
            "configured": True,
            "playerId": player_id,
            "playerName": player_info["name"],
            "user": user_data,
            "profile": profile_data,
            "game_stats": (
                game_stats.model_dump(mode="json")
                if hasattr(game_stats, "model_dump")
                else game_stats.__dict__
            ),
            "characters": characters,
            "fetched_at": int(time.time()),
        }

        cache[cache_key] = (time.time(), response_data)
        return web.json_response(response_data)

    except ApiError:
        raise
    except Exception as error:
        LOGGER.error("Account request failed (%s): %s", type(error).__name__, error)
        raise ApiError(
            502,
            "Не удалось получить ответ от сервисов Endfield. Попробуй позже.",
        ) from None


async def sign_in(request: web.Request) -> web.Response:
    player_id: str | None = None
    direct_token: str | None = None

    if request.content_type == "application/json":
        try:
            body = json.loads(await request.text())
            if isinstance(body, dict):
                if body.get("player"):
                    player_id = str(body["player"]).lower()
                elif body.get("playerId"):
                    player_id = str(body["playerId"]).lower()
                if body.get("token"):
                    direct_token = str(body["token"]).strip()
        except Exception:
            raise ApiError(400, "Передай корректный JSON.") from None

    if direct_token:
        token = direct_token
        player_id = "custom"
    else:
        if not player_id:
            player_id = "tolik"
        if player_id not in PLAYERS_CONFIG:
            raise ApiError(404, f"Неизвестный игрок: {player_id}.")
        token = get_player_token(player_id)
        if not token:
            raise ApiError(400, f"Токен для игрока {PLAYERS_CONFIG[player_id]['name']} ещё не настроен в .env.")

    try:
        result = await request.app[DAILY_SIGN_KEY](token)
    except Exception as error:
        LOGGER.error("Daily sign request failed (%s): %s", type(error).__name__, error)
        raise ApiError(
            502,
            "Не удалось выполнить ежедневную отметку. Попробуй позже.",
        ) from None

    # Очищаем кэш аккаунта, чтобы обновить ежедневные очки и статус
    cache = request.app[CACHE_KEY]
    cache_key = f"{player_id}:{token[:8]}"
    cache.pop(cache_key, None)

    if not getattr(result, "success", False):
        raise ApiError(422, getattr(result, "message", "Не удалось выполнить отметку."))

    return web.json_response({
        "success": True,
        "already_signed": getattr(result, "already_signed", False),
        "message": result.message,
    })


async def start_endfield_client(app: web.Application) -> None:
    client = app[ENDFIELD_FACTORY_KEY]()
    await client.__aenter__()
    patch_endfield_resolver(client)
    app[ENDFIELD_CLIENT_KEY] = client


async def close_endfield_client(app: web.Application) -> None:
    client = app.get(ENDFIELD_CLIENT_KEY)
    if client is not None:
        await client.close()


def create_app(
    endfield_factory: Callable[[], Endfield] = lambda: Endfield(timeout=20),
    daily_sign_function: DailySign = daily_sign,
    allowed_origins: set[str] | None = None,
) -> web.Application:
    app = web.Application(
        client_max_size=16 * 1024,
        middlewares=[cors_middleware, api_error_middleware],
    )
    app[ALLOWED_ORIGINS_KEY] = (
        allowed_origins
        if allowed_origins is not None
        else parse_allowed_origins(os.environ.get("ALLOWED_ORIGINS"))
    )
    app[ENDFIELD_FACTORY_KEY] = endfield_factory
    app[DAILY_SIGN_KEY] = daily_sign_function
    app[CACHE_KEY] = {}
    app.on_startup.append(start_endfield_client)
    app.on_cleanup.append(close_endfield_client)

    app.router.add_get("/health", health)
    app.router.add_get("/api/endfield/players", get_players)
    app.router.add_get("/api/endfield/account", account)
    app.router.add_post("/api/endfield/account", account)
    app.router.add_post("/api/endfield/daily-sign", sign_in)
    app.router.add_get("/api/durak/ws", durak_ws_handler)
    return app


def main() -> None:
    logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
    web.run_app(create_app(), host="0.0.0.0", port=int(os.environ.get("PORT", "10000")))


if __name__ == "__main__":
    main()
