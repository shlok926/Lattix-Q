import json
import redis.asyncio as redis
from typing import List, Optional
from app.config import settings
from app.models.chat import ChatMessage, MessageRole

class RedisSessionStore:
    SESSION_KEY_PREFIX = "qs:analyst:session:"

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._client: Optional[redis.Redis] = None

    async def connect(self):
        self._client = redis.from_url(self.redis_url, decode_responses=True)

    async def disconnect(self):
        if self._client:
            await self._client.aclose()

    def _key(self, session_id: str) -> str:
        return f"{self.SESSION_KEY_PREFIX}{session_id}"

    async def get_messages(self, session_id: str) -> List[ChatMessage]:
        raw = await self._client.get(self._key(session_id))
        if not raw:
            return []
        data = json.loads(raw)
        return [
            ChatMessage(role=MessageRole(m["role"]), content=m["content"])
            for m in data
        ]

    async def append_message(self, session_id: str, message: ChatMessage) -> None:
        messages = await self.get_messages(session_id)
        messages.append(message)
        await self.set_messages(session_id, messages)

    async def set_messages(self, session_id: str, messages: List[ChatMessage]) -> None:
        serialized = json.dumps([
            {"role": m.role.value, "content": m.content} for m in messages
        ])
        await self._client.setex(
            self._key(session_id),
            settings.SESSION_TTL_SECONDS,
            serialized,
        )

    async def delete_session(self, session_id: str) -> None:
        await self._client.delete(self._key(session_id))

    async def session_exists(self, session_id: str) -> bool:
        return bool(await self._client.exists(self._key(session_id)))
