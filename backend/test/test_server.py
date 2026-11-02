import os
import unittest
from types import SimpleNamespace
from typing import Any

from aiohttp.test_utils import TestClient, TestServer
from pydantic import BaseModel

from backend.server import create_app

ALLOWED_ORIGIN = "https://toliklol.github.io"


class FakeModel(BaseModel):
    char_id: str = "char-1"
    name: str = "Оператор"


class FakeUser(BaseModel):
    uid: str = "6884614192"
    skport_name: str = "TOLIKLOL777"


class FakeProfile(BaseModel):
    name: str = "TOLIKLOL777"
    adventure_level: int = 60
    world_level: int = 7


class FakeEndfield:
    async def __aenter__(self) -> "FakeEndfield":
        return self

    async def close(self) -> None:
        return None

    async def verify_user(self, token: str) -> FakeUser:
        return FakeUser()

    async def get_profile(self, uid: str) -> FakeProfile:
        return FakeProfile()

    async def get_all_characters(self, token: str) -> Any:
        return SimpleNamespace(characters=[FakeModel()])

    async def get_game_stats(self, token: str) -> FakeModel:
        return FakeModel(char_id="stats", name="stat")

    async def get_game_character(self, token: str, char_id: str) -> FakeModel:
        return FakeModel(char_id=char_id, name="Детали")


async def fake_daily_sign(token: str) -> SimpleNamespace:
    return SimpleNamespace(success=True, already_signed=False, message="Отметка выполнена")


async def failed_daily_sign(token: str) -> SimpleNamespace:
    return SimpleNamespace(success=False, already_signed=False, message="Не удалось выполнить отметку")


class ApiServerTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        os.environ["ENDFIELD_TOKEN_TOLIK"] = "test-tolik-token"
        os.environ.pop("ENDFIELD_TOKEN_MIRA", None)
        app = create_app(
            endfield_factory=FakeEndfield,
            daily_sign_function=fake_daily_sign,
            allowed_origins={ALLOWED_ORIGIN},
        )
        self.client = TestClient(TestServer(app))
        await self.client.start_server()

    async def asyncTearDown(self) -> None:
        await self.client.close()

    async def test_health_is_public_and_not_cached(self) -> None:
        response = await self.client.get("/health")
        self.assertEqual(response.status, 200)
        self.assertEqual(await response.json(), {"status": "ok"})
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    async def test_untrusted_origin_is_rejected(self) -> None:
        response = await self.client.post(
            "/api/endfield/account",
            headers={"Origin": "https://untrusted.example", "Content-Type": "application/json"},
            json={"token": "test-token"},
        )
        self.assertEqual(response.status, 403)
        self.assertEqual(
            await response.json(),
            {"error": "Источник запроса не разрешён."},
        )

    async def test_account_requires_valid_token_when_passed_empty(self) -> None:
        response = await self.client.post(
            "/api/endfield/account",
            headers={"Origin": ALLOWED_ORIGIN, "Content-Type": "application/json"},
            json={"token": " "},
        )
        self.assertEqual(response.status, 400)
        self.assertEqual(
            await response.json(),
            {"error": "Введи токен аккаунта Skport."},
        )

    async def test_get_players_returns_configured_status(self) -> None:
        response = await self.client.get(
            "/api/endfield/players",
            headers={"Origin": ALLOWED_ORIGIN},
        )
        self.assertEqual(response.status, 200)
        data = await response.json()
        players = {p["id"]: p for p in data.get("players", [])}
        self.assertTrue(players["tolik"]["configured"])
        self.assertFalse(players["mira"]["configured"])

    async def test_account_returns_roster_stats_and_character_details_for_player(self) -> None:
        response = await self.client.get(
            "/api/endfield/account?player=tolik",
            headers={"Origin": ALLOWED_ORIGIN},
        )
        self.assertEqual(response.status, 200)
        self.assertEqual(
            response.headers["Access-Control-Allow-Origin"],
            ALLOWED_ORIGIN,
        )
        data = await response.json()
        self.assertTrue(data["configured"])
        self.assertEqual(data["playerId"], "tolik")
        self.assertEqual(data["playerName"], "Толик")
        self.assertEqual(data["profile"]["name"], "TOLIKLOL777")
        self.assertEqual(data["game_stats"]["name"], "stat")
        self.assertEqual(data["characters"][0]["details"]["name"], "Детали")

    async def test_account_for_unconfigured_player(self) -> None:
        response = await self.client.get(
            "/api/endfield/account?player=mira",
            headers={"Origin": ALLOWED_ORIGIN},
        )
        self.assertEqual(response.status, 200)
        data = await response.json()
        self.assertFalse(data["configured"])
        self.assertEqual(data["playerId"], "mira")
        self.assertIn("ещё не настроен", data["error"])

    async def test_daily_sign_by_player_id(self) -> None:
        response = await self.client.post(
            "/api/endfield/daily-sign",
            headers={"Origin": ALLOWED_ORIGIN, "Content-Type": "application/json"},
            json={"playerId": "tolik"},
        )
        self.assertEqual(response.status, 200)
        data = await response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["message"], "Отметка выполнена")

    async def test_daily_sign_failure_is_returned_as_an_error(self) -> None:
        app = create_app(
            endfield_factory=FakeEndfield,
            daily_sign_function=failed_daily_sign,
            allowed_origins={ALLOWED_ORIGIN},
        )
        async with TestClient(TestServer(app)) as client:
            response = await client.post(
                "/api/endfield/daily-sign",
                headers={"Origin": ALLOWED_ORIGIN, "Content-Type": "application/json"},
                json={"playerId": "tolik"},
            )
            status = response.status
            payload = await response.json()
        self.assertEqual(status, 422)
        self.assertEqual(
            payload,
            {"error": "Не удалось выполнить отметку"},
        )


if __name__ == "__main__":
    unittest.main()
