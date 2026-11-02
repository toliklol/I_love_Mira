import json
import logging
from typing import Any
from aiohttp import web, WSMsgType

LOGGER = logging.getLogger("durak-ws")

# Комнаты в памяти: room_id -> list of client dicts:
# {"ws": ws, "player_id": player_id, "name": name}
DURAK_ROOMS: dict[str, list[dict[str, Any]]] = {}


async def durak_ws_handler(request: web.Request) -> web.WebSocketResponse:
    ws = web.WebSocketResponse(heartbeat=25.0)
    await ws.prepare(request)

    room_id = request.query.get("room", "").strip().upper()
    player_id = request.query.get("playerId", "").strip() or "player"
    name = request.query.get("name", "").strip() or "Игрок"

    if not room_id:
        await ws.close(code=4000, message=b"Room code required")
        return ws

    client_info = {
        "ws": ws,
        "player_id": player_id,
        "name": name,
    }

    if room_id not in DURAK_ROOMS:
        DURAK_ROOMS[room_id] = []

    # Удаляем закрытые соединения
    DURAK_ROOMS[room_id] = [c for c in DURAK_ROOMS[room_id] if not c["ws"].closed]
    room = DURAK_ROOMS[room_id]

    # Если уже есть игрок с таким же player_id (например, обновил страницу), закрываем старый
    for existing in list(room):
        if existing["player_id"] == player_id and existing["ws"] != ws:
            try:
                await existing["ws"].close(code=4001, message=b"New connection replaced old")
            except Exception:
                pass
            if existing in room:
                room.remove(existing)

    room.append(client_info)
    LOGGER.info("Player %s (%s) connected to room %s. Total players: %d", name, player_id, room_id, len(room))

    # Если в комнате уже есть другие игроки (например, хост)
    other_clients = [c for c in room if c["ws"] != ws and not c["ws"].closed]

    # Уведомляем существующих участников о новом подключении
    for client in other_clients:
        try:
            await client["ws"].send_json({
                "type": "peer_joined",
                "payload": {
                    "playerInfo": {
                        "id": player_id,
                        "name": name,
                    }
                }
            })
        except Exception as e:
            LOGGER.warning("Could not send peer_joined: %s", e)

    # И сообщаем новому подключившемуся игроку о том, кто уже есть в комнате
    if other_clients:
        first_client = other_clients[0]
        try:
            await ws.send_json({
                "type": "room_joined",
                "payload": {
                    "playerInfo": {
                        "id": first_client["player_id"],
                        "name": first_client["name"],
                    }
                }
            })
        except Exception as e:
            LOGGER.warning("Could not send room_joined: %s", e)

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    # Проверяем JSON валидность
                    _ = json.loads(msg.data)
                except Exception:
                    continue

                # Пересылаем сообщение всем остальным участникам комнаты
                active_others = [c for c in DURAK_ROOMS.get(room_id, []) if c["ws"] != ws and not c["ws"].closed]
                for client in active_others:
                    try:
                        await client["ws"].send_str(msg.data)
                    except Exception as e:
                        LOGGER.warning("Error relaying message in room %s: %s", room_id, e)

            elif msg.type == WSMsgType.ERROR:
                LOGGER.error("WebSocket in room %s closed with error: %s", room_id, ws.exception())
    finally:
        if room_id in DURAK_ROOMS and client_info in DURAK_ROOMS[room_id]:
            DURAK_ROOMS[room_id].remove(client_info)
            LOGGER.info("Player %s left room %s. Remaining: %d", name, room_id, len(DURAK_ROOMS[room_id]))

            # Уведомляем оставшихся игроков
            for client in DURAK_ROOMS[room_id]:
                if not client["ws"].closed:
                    try:
                        await client["ws"].send_json({
                            "type": "peer_left",
                            "payload": {
                                "player_id": player_id,
                                "name": name,
                            }
                        })
                    except Exception:
                        pass

            if not DURAK_ROOMS[room_id]:
                DURAK_ROOMS.pop(room_id, None)

    return ws
