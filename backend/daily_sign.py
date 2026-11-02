import asyncio
import hashlib
import hmac
import time
from dataclasses import dataclass
from urllib import parse

import aiohttp
from endfield.auth.api import cfg
from endfield.auth.auth import PLATFORM, VNAME, get_endfield_roles, login

WEB_ORIGIN = "https://game.skport.com"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
)
CODE_ALREADY_SIGNED = 10001
CODE_NO_ROLE_LOCATION = 19001


@dataclass(frozen=True)
class SignResult:
    success: bool
    already_signed: bool
    message: str


def _sign(token: str, path: str, timestamp: str, body: str = "") -> str:
    header_json = (
        f'{{"platform":"{PLATFORM}","timestamp":"{timestamp}",'
        f'"dId":"","vName":"{VNAME}"}}'
    )
    mac = hmac.new(
        token.encode(),
        (path + body + timestamp + header_json).encode(),
        hashlib.sha256,
    )
    return hashlib.md5(mac.hexdigest().encode()).hexdigest()


async def _refresh_sign_token(
    session: aiohttp.ClientSession,
    base: str,
    cred: str,
) -> str | None:
    headers = {
        "User-Agent": BROWSER_UA,
        "Accept": "application/json, text/plain, */*",
        "cred": cred,
        "platform": PLATFORM,
        "vName": VNAME,
        "Origin": WEB_ORIGIN,
        "Referer": WEB_ORIGIN + "/",
    }
    async with session.get(base + "/web/v1/auth/refresh", headers=headers) as response:
        data = await response.json(content_type=None)
    if data.get("code") == 0 and (data.get("data") or {}).get("token"):
        return data["data"]["token"]
    return None


def _headers(cred: str, role: str, timestamp: str, sign: str) -> dict[str, str]:
    return {
        "User-Agent": BROWSER_UA,
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "sk-language": "en",
        "sk-game-role": role,
        "cred": cred,
        "platform": PLATFORM,
        "vName": VNAME,
        "timestamp": timestamp,
        "sign": sign,
        "Origin": WEB_ORIGIN,
        "Referer": WEB_ORIGIN + "/",
    }


async def _sign_once(token: str) -> SignResult:
    parsed = parse.urlparse(cfg["SIGN_URL"])
    base = f"{parsed.scheme}://{parsed.netloc}"
    timeout = aiohttp.ClientTimeout(total=60)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        cred, login_sign_token = await login(session, token, cfg)
        binding = await get_endfield_roles(session, cred, login_sign_token, cfg)

        role = binding.get("defaultRole") or (binding.get("roles") or [None])[0]
        if not role:
            return SignResult(False, False, "У аккаунта нет роли Endfield")
        who = f"{role.get('nickname', '?')}({role.get('serverName', '?')})"
        role_str = f"3_{role['roleId']}_{role['serverId']}"

        sign_token = await _refresh_sign_token(session, base, cred) or login_sign_token
        timestamp = str(int(time.time()))
        sign = _sign(sign_token, parsed.path, timestamp)
        headers = _headers(cred, role_str, timestamp, sign)

        try:
            async with session.get(cfg["SIGN_URL"], headers=headers) as response:
                status = await response.json(content_type=None)
            if status.get("code") == 0 and (status.get("data") or {}).get("hasToday") is True:
                return SignResult(True, True, f"{who} - Already signed in today")
        except (aiohttp.ClientError, asyncio.TimeoutError, ValueError):
            pass

        async with session.post(cfg["SIGN_URL"], headers=headers) as response:
            data = await response.json(content_type=None)

    code = data.get("code")
    message = data.get("message", "Unknown error")
    if code == 0:
        info = data.get("data") or {}
        resource_map = info.get("resourceInfoMap") or {}
        rewards = ", ".join(
            f"{resource_map[item['id']]['name']}x"
            f"{resource_map[item['id']].get('count', 1)}"
            for item in info.get("awardIds", [])
            if item.get("id") in resource_map
        ) or "no reward info"
        return SignResult(True, False, f"{who} - Sign-in successful! Rewards: {rewards}")
    if code == CODE_ALREADY_SIGNED:
        return SignResult(True, True, f"{who} - Already signed in today")

    hint = ""
    if code == CODE_NO_ROLE_LOCATION:
        hint = " [сервер не видит персонажа: войдите в игру этим персонажем и повторите]"
    return SignResult(False, False, f"{who} - Sign-in failed (code {code}): {message}{hint}")


async def daily_sign(
    token: str,
    retries: int = 2,
    retry_delay: float = 5.0,
) -> SignResult:
    token = token.strip().strip("'\"")
    if not token:
        raise ValueError("Токен пустой")

    result = SignResult(False, False, "Не выполнялось")
    for attempt in range(retries + 1):
        try:
            return await _sign_once(token)
        except Exception as error:
            result = SignResult(False, False, f"[Account Failed: {error}")
            if attempt < retries:
                await asyncio.sleep(retry_delay)
    return result
