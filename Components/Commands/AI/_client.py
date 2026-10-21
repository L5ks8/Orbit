import os
import re
import urllib.parse
import asyncio
import aiohttp
from typing import List, Dict, Optional

BROWSER_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Referer": "https://pollinations.ai/",
    "Origin": "https://pollinations.ai",
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
    # Remove reasoning/thinking tags (e.g. from deepseek or ovh-reasoning)
    text = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.DOTALL).strip()
    # Remove bot name prefix if present
    text = re.sub(r"^(Orbit|Assistant|Bot):\s*", "", text, flags=re.IGNORECASE).strip()
    return text


async def generate_ai_response(messages: List[Dict[str, str]], timeout_sec: float = 14.0) -> str:
    """
    Non-blocking, multi-tier AI generator that protects the Discord event loop from freezing.
    Tier 0: Optional Direct API Keys (Groq, OpenAI) if configured
    Tier 1: Pollinations POST with anonymous fast model ('openai-fast') & browser headers
    Tier 2: Pollinations /openai OpenAI-compatible chat endpoint
    Tier 3: Pollinations GET endpoint with model parameter
    Tier 4: G4F fallback in a worker thread
    """

    # ── Tier 0: Direct API Keys if configured in environment ─────────────────
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7,
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
                    "Authorization": f"Bearer {openai_key}",
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

    # ── Tier 1: Pollinations POST with anonymous model ('openai-fast') ─────────
    try:
        async with aiohttp.ClientSession() as session:
            headers = dict(BROWSER_HEADERS)
            api_key = os.environ.get("POLLINATIONS_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            payload = {
                "messages": messages,
                "model": "openai" if api_key else "openai-fast",
                "seed": 42,
                "jsonMode": False,
            }

            async with session.post(
                "https://text.pollinations.ai/",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=9.0),
            ) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    if _is_valid_answer(text):
                        return _clean_response(text)
    except Exception:
        pass

    # ── Tier 2: Pollinations /openai endpoint ────────────────────────────────
    try:
        async with aiohttp.ClientSession() as session:
            headers = dict(BROWSER_HEADERS)
            api_key = os.environ.get("POLLINATIONS_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            payload = {
                "messages": messages,
                "model": "openai" if api_key else "openai-fast",
            }

            async with session.post(
                "https://text.pollinations.ai/openai",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=9.0),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if _is_valid_answer(content):
                        return _clean_response(content)
    except Exception:
        pass

    # ── Tier 3: Pollinations GET endpoint ─────────────────────────────────────
    try:
        user_content = ""
        system_content = ""
        for m in messages:
            if m.get("role") == "system":
                system_content = m.get("content", "")
            elif m.get("role") == "user":
                user_content = m.get("content", "")

        if user_content:
            async with aiohttp.ClientSession() as session:
                headers = dict(BROWSER_HEADERS)
                headers.pop("Content-Type", None)
                encoded_user = urllib.parse.quote(user_content[:500])
                encoded_sys = urllib.parse.quote(system_content[:500]) if system_content else ""
                url = f"https://text.pollinations.ai/{encoded_user}?model=openai-fast"
                if encoded_sys:
                    url += f"&system={encoded_sys}"

                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=7.0),
                ) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        if _is_valid_answer(text):
                            return _clean_response(text)
    except Exception:
        pass

    # ── Tier 4: Off-thread G4F ───────────────────────────────────────────────
    try:
        def _call_g4f_sync():
            import g4f
            from g4f.client import Client

            providers_to_try = [
                getattr(g4f.Provider, "DuckDuckGo", None),
                getattr(g4f.Provider, "Blackbox", None),
                getattr(g4f.Provider, "FreeGpt", None),
                getattr(g4f.Provider, "ChatGptEs", None),
            ]
            valid_providers = [p for p in providers_to_try if p is not None]

            for prov in valid_providers:
                for model_name in ["gpt-4o-mini", "llama-3.3-70b"]:
                    try:
                        client = Client(provider=prov)
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
