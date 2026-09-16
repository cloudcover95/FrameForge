"""Pioneer identity. Client username is display-only.

Verify with GET https://api.minepi.com/v2/me
Authorization: Bearer <accessToken>

Never persist the raw access token. Bind gold ends to `uid`.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

ME_URL = os.environ.get("FF_PI_ME_URL", "https://api.minepi.com/v2/me")


class Pioneer:
    def __init__(self, uid: str, username: str = "", verified: bool = False) -> None:
        self.uid = uid
        self.username = username
        self.verified = verified

    def as_dict(self) -> dict[str, Any]:
        return {"uid": self.uid, "username": self.username, "verified": self.verified}


def guest() -> Pioneer:
    return Pioneer(uid="guest", username="guest", verified=False)


def verify_access_token(access_token: str, timeout: float = 8.0) -> Pioneer:
    token = (access_token or "").strip()
    if not token:
        return guest()
    req = urllib.request.Request(ME_URL, headers={"Authorization": "Bearer " + token})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return guest()
    user = raw.get("user") if isinstance(raw.get("user"), dict) else raw
    uid = str(user.get("uid") or "")
    name = str(user.get("username") or "")
    if not uid:
        return guest()
    return Pioneer(uid=uid, username=name, verified=True)
