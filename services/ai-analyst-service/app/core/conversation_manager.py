from typing import List
from app.config import settings
from app.models.chat import ChatMessage, MessageRole
from app.session.redis_store import RedisSessionStore

class ConversationManager:
    def __init__(self, session_store: RedisSessionStore):
        self.store = session_store
        self.max_messages = settings.MAX_HISTORY_MESSAGES

    async def get_history(self, session_id: str) -> List[ChatMessage]:
        return await self.store.get_messages(session_id)

    async def add_message(self, session_id: str, role: MessageRole, content: str) -> None:
        msg = ChatMessage(role=role, content=content)
        await self.store.append_message(session_id, msg)
        history = await self.get_history(session_id)
        if len(history) > self.max_messages:
            trimmed = [history[0]] + history[-(self.max_messages - 1):]
            await self.store.set_messages(session_id, trimmed)

    async def build_claude_messages(self, session_id: str, current_user_message: str, context_prefix: str = "") -> list:
        history = await self.get_history(session_id)
        messages = [{"role": m.role.value, "content": m.content} for m in history]
        augmented_message = current_user_message
        if context_prefix:
            augmented_message = f"{context_prefix}\n\nUser: {current_user_message}"
        messages.append({"role": "user", "content": augmented_message})
        return messages

    async def clear_session(self, session_id: str) -> None:
        await self.store.delete_session(session_id)

    async def get_token_estimate(self, session_id: str) -> int:
        history = await self.get_history(session_id)
        return sum(len(m.content) for m in history) // 4
