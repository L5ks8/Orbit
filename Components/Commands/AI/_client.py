import os
import re
import urllib.parse
import asyncio
import aiohttp
from typing import List, Dict, Optional

# List of working G4F models to try in fallback
FALLBACK_G4F_MODELS = ["gpt-4o-mini", "llama-3.3-70b", "deepseek-chat"]

async def generate_ai_response(messages: List[Dict[str, str]], timeout_sec: float = 14.0) -> str:
    """
    Non-blocking, multi-tier AI generator that protects the Discord event loop from freezing.
    1. Direct Async Pollinations (OpenAI-compatible POST via aiohttp)
    2. Direct Async Pollinations (GET endpoint via aiohttp)
    3. G4F (DuckDuckGo / DDG / Blackbox) executed strictly inside a worker thread
    """
    # ── Tier 1: Direct Async Pollinations (POST) ───────────────────────────
    try:
        async with aiohttp.ClientSession() as session:
            headers = {"Content-Type": "application/json"}
            api_key = os.environ.get("POLLINATIONS_API_KEY")
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            payload = {
                "messages": messages,
                "model": "mistral" if not api_key else "openai",
                "seed": 42,
                "jsonMode": False
            }

            async with session.post(
                "https://text.pollinations.ai/",
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=6.5)
            ) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    text = text.strip()
                    if text and not text.lower().startswith("error") and "model_not_found" not in text:
                        return _clean_response(text)
    except Exception:
        pass

    # ── Tier 2: Direct Async Pollinations (GET with system query) ───────────
    try:
        system_content = ""
        user_content = ""
        for m in messages:
            if m.get("role") == "system":
                system_content = m.get("content", "")
            elif m.get("role") == "user":
                user_content = m.get("content", "")

        if user_content:
            async with aiohttp.ClientSession() as session:
                encoded_user = urllib.parse.quote(user_content[:1000])
                encoded_sys = urllib.parse.quote(system_content[:1500]) if system_content else ""
                url = f"https://text.pollinations.ai/{encoded_user}"
                if encoded_sys:
                    url += f"?system={encoded_sys}"

                async with session.get(
                    url,
                    timeout=aiohttp.ClientTimeout(total=6.0)
                ) as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        text = text.strip()
                        if text and not text.lower().startswith("error") and "model_not_found" not in text:
                            return _clean_response(text)
    except Exception:
        pass

    # ── Tier 3: Off-thread G4F with DuckDuckGo / DDG / Blackbox ────────────
    # Must run strictly in a thread pool to avoid blocking Discord Gateway!
    try:
        def _call_g4f_sync():
            import g4f
            from g4f.client import Client

            providers_to_try = [
                getattr(g4f.Provider, "DuckDuckGo", None),
                getattr(g4f.Provider, "DDG", None),
                getattr(g4f.Provider, "Blackbox", None),
                getattr(g4f.Provider, "FreeGpt", None)
            ]
            valid_providers = [p for p in providers_to_try if p is not None]

            for prov in valid_providers:
                for model_name in ["gpt-4o-mini", "llama-3.3-70b"]:
                    try:
                        client = Client(provider=prov)
                        res = client.chat.completions.create(
                            model=model_name,
                            messages=messages
                        )
                        content = res.choices[0].message.content
                        if content and len(content.strip()) > 0:
                            return content.strip()
                    except Exception:
                        continue
            return None

        # Execute off-thread with strict timeout
        g4f_result = await asyncio.wait_for(
            asyncio.to_thread(_call_g4f_sync),
            timeout=min(timeout_sec, 8.0)
        )
        if g4f_result:
            return _clean_response(g4f_result)
    except Exception:
        pass

    raise RuntimeError("All AI providers are currently busy or unavailable. Please try again shortly.")


def _clean_response(text: str) -> str:
    """Strips leading bot-name prefixes or citations from AI outputs."""
    # Remove leading bot prefix e.g. "Orbit: "
    text = re.sub(r"^(Orbit|Assistant|Bot):\s*", "", text, flags=re.IGNORECASE).strip()
    return text
