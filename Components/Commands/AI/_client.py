import os
import re
import io
import base64
import random
import urllib.parse
import asyncio
import aiohttp
from typing import List, Dict, Optional, Any

# Cache of active models available on the user's Groq key
_GROQ_RESOLVED_MODELS: List[str] = []

GROQ_VISION_MODELS = [
    "llama-3.2-11b-vision-preview",
    "llama-3.2-90b-vision-preview",
]

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


def _prepare_image_bytes(raw_bytes: bytes) -> bytes:
    """Extracts a high quality frame from GIFs or converts images to standard JPEG for vision APIs."""
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(raw_bytes))
        if getattr(im, "is_animated", False):
            # Extract keyframe from animated GIF / WebP
            im.seek(im.n_frames // 2)
        rgb_im = im.convert("RGB")
        # Resize if overly massive to save bandwidth
        max_dim = 1600
        if rgb_im.width > max_dim or rgb_im.height > max_dim:
            rgb_im.thumbnail((max_dim, max_dim))
        buf = io.BytesIO()
        rgb_im.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception:
        return raw_bytes


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
                    if "120b" in m_lower:
                        return 0
                    if "70b" in m_lower or "llama-3.3" in m_lower:
                        return 1
                    if "qwen" in m_lower:
                        return 2
                    if "20b" in m_lower:
                        return 3
                    if "8b" in m_lower:
                        return 4
                    if "llama" in m_lower:
                        return 5
                    if "mixtral" in m_lower:
                        return 6
                    return 10

                sorted_models = sorted(raw_models, key=_sort_preference)
                if sorted_models:
                    _GROQ_RESOLVED_MODELS = sorted_models
                    return _GROQ_RESOLVED_MODELS
    except Exception as e:
        print(f"[Orbit AI] Groq model discovery fallback notice: {e}")

    # Standard fallback IDs
    return [
        "openai/gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
        "llama-3.1-8b-instant",
    ]


async def generate_ai_response(
    messages: List[Dict[str, Any]],
    timeout_sec: float = 14.0,
    image_bytes: Optional[bytes] = None,
    image_url: Optional[str] = None
) -> str:
    """
    Non-blocking, multi-tier multimodal AI generator.
    Supports text, images (PNG, JPG, WebP), and animated GIFs.
    """

    # ── Fetch Image Data if URL provided ─────────────────────────────────────
    if image_url and not image_bytes:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url, timeout=aiohttp.ClientTimeout(total=6.0)) as r:
                    if r.status == 200:
                        image_bytes = await r.read()
        except Exception as e:
            print(f"[Orbit AI] Failed to download image attachment: {e}")

    # ── Process Image for Multimodal Vision ──────────────────────────────────
    vision_messages = None
    if image_bytes:
        try:
            processed_bytes = _prepare_image_bytes(image_bytes)
            b64_img = base64.b64encode(processed_bytes).decode("utf-8")
            data_url = f"data:image/jpeg;base64,{b64_img}"

            # Clone messages and inject multimodal structure on the last user message
            vision_messages = []
            for m in messages:
                if m.get("role") == "user" and m is messages[-1]:
                    user_text = m.get("content", "")
                    if isinstance(user_text, list):
                        vision_messages.append(m)
                    else:
                        vision_messages.append({
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_text or "Was ist auf diesem Bild oder GIF zu sehen? Bitte beschreibe es genau."},
                                {"type": "image_url", "image_url": {"url": data_url}}
                            ]
                        })
                else:
                    vision_messages.append(m)
        except Exception as e:
            print(f"[Orbit AI] Error preparing vision payload: {e}")

    # ── Multimodal Tier A: Groq Vision Models ────────────────────────────────
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        groq_key = groq_key.strip()
        if vision_messages:
            for v_model in GROQ_VISION_MODELS:
                try:
                    async with aiohttp.ClientSession() as session:
                        payload = {
                            "model": v_model,
                            "messages": vision_messages,
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
                            timeout=aiohttp.ClientTimeout(total=9.0),
                        ) as resp:
                            if resp.status == 200:
                                data = await resp.json()
                                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                                if _is_valid_answer(content):
                                    return _clean_response(content)
                            else:
                                err_text = await resp.text()
                                print(f"[Orbit AI] Groq vision ({v_model}) status {resp.status}: {err_text[:200]}")
                except Exception as err:
                    print(f"[Orbit AI] Groq vision error: {err}")

    # ── Multimodal Tier B: Google Gemini Vision ──────────────────────────────
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gemini-1.5-flash",
                    "messages": vision_messages if vision_messages else messages,
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

    # ── Multimodal Tier C: Free HuggingFace BLIP Image Captioning Fallback ────
    # If the user supplied an image but primary vision models couldn't process it,
    # extract a description via BLIP serverless and enrich the text conversation!
    if image_bytes and not vision_messages:
        pass
    elif image_bytes and vision_messages:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
                    data=image_bytes,
                    timeout=aiohttp.ClientTimeout(total=5.0)
                ) as hf_resp:
                    if hf_resp.status == 200:
                        hf_data = await hf_resp.json()
                        if isinstance(hf_data, list) and len(hf_data) > 0:
                            caption = hf_data[0].get("generated_text", "")
                            if caption:
                                # Append visual details to regular text prompt
                                last_user = messages[-1]["content"]
                                messages[-1]["content"] = f"{last_user}\n\n[Angehängtes Bild/GIF Erkennung: {caption}]"
        except Exception:
            pass

    # ── Text Engine: Groq High-Performance Models ────────────────────────────
    if groq_key:
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
