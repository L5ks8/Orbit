import os
import re
import random
import urllib.parse
import asyncio
import aiohttp
from typing import List, Dict, Optional

# Cache of active models available on the user's Groq key
_GROQ_RESOLVED_MODELS: List[str] = []

def _random_ip() -> str:
    """Generates a random public IPv4 to prevent single-IP rate-limiting on reverse-proxy gateways."""
    first_octet = random.choice([45, 82, 85, 91, 109, 141, 151, 178, 185, 194, 212])
    return f"{first_octet}.{random.randint(10, 240)}.{random.randint(10, 240)}.{random.randint(10, 240)}"


def _get_headers() -> Dict[str, str]:
    ip = _random_ip()
    return {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Referer": "https://pollinations.ai/",
        "Origin": "https://pollinations.ai",
        "X-Forwarded-For": ip,
        "X-Real-IP": ip,
    }


def _is_valid_answer(text: Optional[str]) -> bool:
    if not text or not isinstance(text, str):
        return False
    stripped = text.strip()
    if not stripped:
        return False
    lower = stripped.lower()
    if lower.startswith("error"):
        return False
    if "model_not_found" in lower:
        return False
    if "free limit reached" in lower or "please wait" in lower:
        return False
    if "rate limit" in lower or "rate_limit_exceeded" in lower:
        return False
    return True


def _clean_response(text: str) -> str:
    """Strips thinking blocks, leading bot-name prefixes, or citations from AI outputs."""
    # Remove reasoning/thinking tags (e.g. from reasoning models)
    text = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.DOTALL).strip()
    # Remove bot name prefix if present
    text = re.sub(r"^(Orbit|Assistant|Bot):\s*", "", text, flags=re.IGNORECASE).strip()
    return text


async def _get_groq_models(session: aiohttp.ClientSession, groq_key: str) -> List[str]:
    """Fetches the exact active models available on the user's Groq key and sorts by quality."""
    global _GROQ_RESOLVED_MODELS
    if _GROQ_RESOLVED_MODELS:
        return _GROQ_RESOLVED_MODELS

    headers = {"Authorization": f"Bearer {groq_key}"}
    try:
        async with session.get(
            "https://api.groq.com/openai/v1/models",
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=4.0),
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                raw_models = [
                    m["id"] for m in data.get("data", [])
                    if "whisper" not in m.get("id", "").lower()
                    and "guard" not in m.get("id", "").lower()
                ]
                print(f"[Orbit AI] Groq models available on this key: {raw_models}")
                
                def _sort_preference(m_id: str) -> int:
                    m_lower = m_id.lower()
                    if "llama-3.3" in m_lower:
                        return 0
                    if "llama-3.1-70b" in m_lower:
                        return 1
                    if "llama-3.1-8b" in m_lower:
                        return 2
                    if "llama3-70b" in m_lower:
                        return 3
                    if "llama3-8b" in m_lower:
                        return 4
                    if "mixtral" in m_lower:
                        return 5
                    if "gemma" in m_lower:
                        return 6
                    return 7

                sorted_models = sorted(raw_models, key=_sort_preference)
                if sorted_models:
                    _GROQ_RESOLVED_MODELS = sorted_models
                    return _GROQ_RESOLVED_MODELS
    except Exception as e:
        print(f"[Orbit AI] Groq model discovery fallback notice: {e}")

    # Standard fallback IDs
    return [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama3-70b-8192",
        "llama3-8b-8192",
        "mixtral-8x7b-32768",
    ]


async def generate_ai_response(messages: List[Dict[str, str]], timeout_sec: float = 14.0) -> str:
    """
    Non-blocking, multi-tier AI generator.
    Tier 0: Groq Open-Source Inference (Meta Llama 3.3 / 3.1)
    Tier 1: Gemini / OpenAI (if configured in environment)
    Tier 2: Pollinations POST with rotating client IP headers
    Tier 3: Pollinations /openai OpenAI-compatible chat endpoint
    Tier 4: G4F fallback in a worker thread
    """

    # ── Tier 0: Groq Open-Source Inference ───────────────────────────────────
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        groq_key = groq_key.strip()
        try:
            async with aiohttp.ClientSession() as session:
                models_to_try = await _get_groq_models(session, groq_key)
                for model in models_to_try:
                    try:
                        payload = {
                            "model": model,
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 1024,
                        }
                        headers = {
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {groq_key}",
                        }
                        async with session.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            json=payload,
                            headers=headers,
                            timeout=aiohttp.ClientTimeout(total=8.0),
                        ) as resp:
                            if resp.status == 200:
                                data = await resp.json()
                                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                                if _is_valid_answer(content):
                                    return _clean_response(content)
                            else:
                                err_body = await resp.text()
                                print(f"[Orbit AI] Groq ({model}) status {resp.status}: {err_body[:200]}")
                    except Exception as err:
                        print(f"[Orbit AI] Groq ({model}) request error: {err}")
                        continue
        except Exception as e:
            print(f"[Orbit AI] Groq session error: {e}")

    # ── Optional: Google Gemini / OpenAI Direct API Keys ────────────────────
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gemini-1.5-flash",
                    "messages": messages,
                }
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {gemini_key.strip()}",
                }
                async with session.post(
                    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=8.0),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        if _is_valid_answer(content):
                            return _clean_response(content)
        except Exception:
            pass

    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": messages,
                }
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key.strip()}",
                }
                async with session.post(
                    "https://api.openai.com/v1/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=8.0),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                        if _is_valid_answer(content):
                            return _clean_response(content)
        except Exception:
            pass

    # ── Fallback Tier 1: Pollinations POST with rotating IP headers (2 attempts)
    api_key = os.environ.get("POLLINATIONS_API_KEY")
    for _ in range(2):
        try:
            async with aiohttp.ClientSession() as session:
                headers = _get_headers()
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key.strip()}"

                payload = {
                    "messages": messages,
                    "model": "openai" if api_key else "openai-fast",
                    "seed": random.randint(1, 999999),
                    "jsonMode": False,
                }

                async with session.post(
                    "https://text.pollinations.ai/",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=7.5),
                ) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        if _is_valid_answer(text):
                            return _clean_response(text)
        except Exception:
            pass

    # ── Fallback Tier 2: Pollinations /openai endpoint with rotating IP headers
    try:
        async with aiohttp.ClientSession() as session:
            headers = _get_headers()
            if api_key:
                headers["Authorization"] = f"Bearer {api_key.strip()}"

            payload = {
                "messages": messages,
                "model": "openai" if api_key else "openai-fast",
            }

            async with session.post(
                "https://text.pollinations.ai/openai",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=7.5),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if _is_valid_answer(content):
                        return _clean_response(content)
    except Exception:
        pass

    # ── Fallback Tier 3: Off-thread G4F with auto-routing ──────────────────────
    try:
        def _call_g4f_sync():
            import g4f
            from g4f.client import Client

            client = Client()
            for model_name in ["gpt-4o-mini", "llama-3.3-70b"]:
                try:
                    res = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                    )
                    content = res.choices[0].message.content
                    if _is_valid_answer(content):
                        return content.strip()
                except Exception:
                    continue
            return None

        g4f_result = await asyncio.wait_for(
            asyncio.to_thread(_call_g4f_sync),
            timeout=min(timeout_sec, 8.0),
        )
        if _is_valid_answer(g4f_result):
            return _clean_response(g4f_result)
    except Exception:
        pass

    raise RuntimeError("All AI providers are currently busy or unavailable. Please try again shortly.")
