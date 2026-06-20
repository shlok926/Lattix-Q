import json
import uuid
import structlog
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from app.config import settings
from app.core.claude_client import ClaudeAnalystClient
from app.core.conversation_manager import ConversationManager
from app.core.context_builder import ContextBuilder
from app.core.intent_classifier import IntentClassifier
from app.core.prompt_engine import PromptEngine
from app.core.response_parser import ResponseParser
from app.core.rag import rag_engine, PromptInjectionError
from app.models.chat import (
    ChatRequest, ChatResponse, StreamStartEvent, StreamDoneEvent, MessageRole,
)
from app.session.redis_store import RedisSessionStore

log = structlog.get_logger()
router = APIRouter()

claude_client = ClaudeAnalystClient()
prompt_engine = PromptEngine()
intent_classifier = IntentClassifier()
context_builder = ContextBuilder()

def get_session_store() -> RedisSessionStore:
    from app.main import session_store
    return session_store

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, store: RedisSessionStore = Depends(get_session_store)):
    manager = ConversationManager(store)
    token_estimate = await manager.get_token_estimate(request.session_id)
    if token_estimate > settings.MAX_TOKENS_PER_SESSION:
        raise HTTPException(429, "Session token budget exceeded. Please start a new session.")

    # Secure RAG & Prompt Injection check
    try:
        rag_context = rag_engine.get_secure_context_block(request.message)
    except PromptInjectionError as e:
        log.warning("Chat prompt injection blocked", session_id=request.session_id)
        raise HTTPException(status_code=400, detail="Security violation: Restricted input pattern detected.")

    intent = intent_classifier.classify(request.message)
    context = await context_builder.build_context(
        request.session_id,
        include_simulation=request.include_simulation_context,
        include_report=request.include_report_context,
    )
    built_prompt = prompt_engine.build_system_prompt(intent, context)
    
    # Inject secure RAG documentation context
    if rag_context:
        built_prompt.context_prefix = (built_prompt.context_prefix or "") + f"\n\n{rag_context}"

    messages = await manager.build_claude_messages(
        request.session_id, request.message, built_prompt.context_prefix,
    )
    parsed = await claude_client.get_full_response(
        messages=messages, system_prompt=built_prompt.system_prompt, session_id=request.session_id,
    )
    await manager.add_message(request.session_id, MessageRole.USER, request.message)
    await manager.add_message(request.session_id, MessageRole.ASSISTANT, parsed.markdown_content)

    return ChatResponse(
        session_id=request.session_id,
        intent=intent,
        risk_level=parsed.risk_level,
        confidence=parsed.confidence,
        affects_algorithms=parsed.affects_algorithms,
        next_steps=[s.text for s in parsed.next_steps],
        content=parsed.markdown_content,
        input_tokens=parsed.input_tokens,
        output_tokens=parsed.output_tokens,
    )

@router.post("/stream")
async def stream_chat(request: ChatRequest, store: RedisSessionStore = Depends(get_session_store)):
    manager = ConversationManager(store)
    
    # Secure RAG & Prompt Injection check
    try:
        rag_context = rag_engine.get_secure_context_block(request.message)
    except PromptInjectionError as e:
        log.warning("Stream prompt injection blocked", session_id=request.session_id)
        raise HTTPException(status_code=400, detail="Security violation: Restricted input pattern detected.")

    intent = intent_classifier.classify(request.message)
    context = await context_builder.build_context(
        request.session_id,
        include_simulation=request.include_simulation_context,
        include_report=request.include_report_context,
    )
    built_prompt = prompt_engine.build_system_prompt(intent, context)
    
    # Inject secure RAG documentation context
    if rag_context:
        built_prompt.context_prefix = (built_prompt.context_prefix or "") + f"\n\n{rag_context}"

    messages = await manager.build_claude_messages(
        request.session_id, request.message, built_prompt.context_prefix,
    )
    full_response_buffer: list[str] = []

    async def event_generator():
        start_event = StreamStartEvent(session_id=request.session_id, intent=intent)
        yield f"data: {start_event.model_dump_json()}\n\n"

        async for chunk in claude_client.stream_response(
            messages=messages, system_prompt=built_prompt.system_prompt, session_id=request.session_id,
        ):
            full_response_buffer.append(chunk)
            yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

        full_text = "".join(full_response_buffer)
        parsed = ResponseParser().parse(full_text)

        await manager.add_message(request.session_id, MessageRole.USER, request.message)
        await manager.add_message(request.session_id, MessageRole.ASSISTANT, parsed.markdown_content)

        done_event = StreamDoneEvent(
            risk_level=parsed.risk_level,
            confidence=parsed.confidence,
            affects_algorithms=parsed.affects_algorithms,
            next_steps=[s.text for s in parsed.next_steps],
        )
        yield f"data: {done_event.model_dump_json()}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )

@router.post("/new-session")
async def new_session():
    session_id = str(uuid.uuid4())
    return {"session_id": session_id, "message": "Session created"}

@router.delete("/session/{session_id}")
async def clear_session(session_id: str, store: RedisSessionStore = Depends(get_session_store)):
    manager = ConversationManager(store)
    await manager.clear_session(session_id)
    return {"session_id": session_id, "message": "Session cleared"}
