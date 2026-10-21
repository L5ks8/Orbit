import os
import re
import random
import urllib.parse
import asyncio
import aiohttp
from typing import List, Dict, Optional

def _random_ip() -> str:
    """Generates a random public IPv4 to prevent single-IP rate-limiting on reverse-proxy gateways."""
    # Use common public IP ranges (avoiding private/reserved subnets)
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
    # Remove reasoning/thinking tags (e.g. from deepseek or ovh-reasoning)
    text = re.sub(r"<think>[\s\S]*?</think>", "", text, flags=re.DOTALL).strip()
    # Remove bot name prefix if present
    text = re.sub(r"^(Orbit|Assistant|Bot):\s*", "", text, flags=re.IGNORECASE).strip()
    return text


async def generate_ai_response(messages: List[Dict[str, str]], timeout_sec: float = 14.0) -> str:
    """
    Non-blocking, multi-tier AI generator that protects the Discord event loop from freezing.
    Tier 0: Direct API Keys (Groq, Gemini, OpenAI) if configured in environment
    Tier 1: Pollinations POST with rotating client IP headers
    Tier 2: Pollinations /openai OpenAI-compatible chat endpoint with rotating IP headers
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
                    "Authorization": f"Bearer {gemini_key}",
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

    # ── Tier 1: Pollinations POST with rotating IP headers (2 attempts) ───────
    api_key = os.environ.get("POLLINATIONS_API_KEY")
    for _ in range(2):
        try:
            async with aiohttp.ClientSession() as session:
                headers = _get_headers()
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"

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

    # ── Tier 2: Pollinations /openai endpoint with rotating IP headers ────────
    try:
        async with aiohttp.ClientSession() as session:
            headers = _get_headers()
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
                timeout=aiohttp.ClientTimeout(total=7.5),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    if _is_valid_answer(content):
                        return _clean_response(content)
    except Exception:
        pass

    # ── Tier 3: Pollinations GET endpoint with rotating IP headers ────────────
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
                headers = _get_headers()
                headers.pop("Content-Type", None)
                encoded_user = urllib.parse.quote(user_content[:500])
                encoded_sys = urllib.parse.quote(system_content[:500]) if system_content else ""
                url = f"https://text.pollinations.ai/{encoded_user}?model=openai-fast"
                if encoded_sys:
                    url += f"&system={encoded_sys}"

                async with session.get(
                    url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=6.5),
                ) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        if _is_valid_answer(text):
                            return _clean_response(text)
    except Exception:
        pass

    # ── Tier 4: Off-thread G4F with auto-routing ──────────────────────────────
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
