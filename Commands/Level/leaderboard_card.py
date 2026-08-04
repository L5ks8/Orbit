from PIL import Image, ImageDraw, ImageFont
import io
import os
import aiohttp

def _format_number(n) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)


def _load_font(size):
    try:
        font_dir = os.path.join(os.path.dirname(__file__), "fonts")
        f = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), size)
        try:
            f.set_variation_by_axes([14, 700])
        except Exception:
            try:
                f.set_variation_by_name("Bold")
            except Exception:
                pass
        return f
    except Exception:
        pass
    for name in ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def _load_font_regular(size):
    try:
        font_dir = os.path.join(os.path.dirname(__file__), "fonts")
        f = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), size)
        try:
            f.set_variation_by_axes([14, 400])
        except Exception:
            pass
        return f
    except Exception:
        pass
    for name in ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


async def fetch_avatar(url: str) -> bytes:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(str(url)) as resp:
                if resp.status == 200:
                    return await resp.read()
    except Exception:
        pass
    return None


def generate_leaderboard_card(
    entries: list,
    title: str = "Level Leaderboard",
    sort_key: str = "total_xp",
    link_text: str = "Want to see more than Top 10?",
) -> bytes:
    """
    entries: list of dicts with keys:
      - name: str
      - level: int
      - value: int (the stat value)
      - value_label: str (e.g. "XP 36.7k")
      - avatar_bytes: bytes or None
      - rank: int
    """
    SCALE = 2
    FINAL_W = 460
    ROW_H = 52
    HEADER_H = 80
    ENTRY_COUNT = len(entries)
    FINAL_H = HEADER_H + ROW_H * ENTRY_COUNT + 20

    W = FINAL_W * SCALE
    H = FINAL_H * SCALE
    RH = ROW_H * SCALE
    HH = HEADER_H * SCALE

    BG = (43, 45, 49)         # Discord dark embed bg
    ROW_BG = (47, 49, 54)     # Slightly lighter for rows
    ROW_ALT = (43, 45, 49)    # Alternating
    TEXT_WHITE = (255, 255, 255)
    TEXT_GRAY = (148, 155, 164)
    LINK_BLUE = (0, 168, 252)

    card = Image.new("RGBA", (W, H), (*BG, 255))
    draw = ImageDraw.Draw(card)

    font_title = _load_font(20 * SCALE)
    font_link = _load_font_regular(14 * SCALE)
    font_rank = _load_font(16 * SCALE)
    font_name = _load_font(15 * SCALE)
    font_level = _load_font(15 * SCALE)
    font_xp = _load_font_regular(12 * SCALE)

    pad_x = 20 * SCALE
    avatar_size = 36 * SCALE

    # ── Title ──
    draw.text((pad_x, 18 * SCALE), title, fill=TEXT_WHITE, font=font_title)

    # ── Link ──
    draw.text((pad_x, 48 * SCALE), link_text, fill=LINK_BLUE, font=font_link)

    # ── Entries ──
    for i, entry in enumerate(entries):
        y = HH + i * RH
        row_bg = ROW_BG if i % 2 == 0 else ROW_ALT
        draw.rounded_rectangle(
            [(pad_x - 4 * SCALE, y), (W - pad_x + 4 * SCALE, y + RH - 4 * SCALE)],
            radius=8 * SCALE,
            fill=(*row_bg, 255)
        )

        # Avatar
        av_x = pad_x + 4 * SCALE
        av_y = y + (RH - 4 * SCALE - avatar_size) // 2
        avatar_bytes = entry.get("avatar_bytes")
        if avatar_bytes:
            try:
                av_img = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
                av_img = av_img.resize((avatar_size, avatar_size), Image.LANCZOS)
                mask = Image.new("L", (avatar_size, avatar_size), 0)
                ImageDraw.Draw(mask).ellipse((0, 0, avatar_size, avatar_size), fill=255)
                card.paste(av_img, (av_x, av_y), mask)
            except Exception:
                draw.ellipse((av_x, av_y, av_x + avatar_size, av_y + avatar_size), fill=(88, 101, 242))
        else:
            draw.ellipse((av_x, av_y, av_x + avatar_size, av_y + avatar_size), fill=(88, 101, 242))

        # Rank + Name
        text_x = av_x + avatar_size + 10 * SCALE
        rank_str = f"#{entry['rank']}"
        name_str = entry["name"]
        # Truncate long names
        if len(name_str) > 22:
            name_str = name_str[:20] + ".."

        rank_name = f"{rank_str} · {name_str}"
        text_y = y + 8 * SCALE
        draw.text((text_x, text_y), rank_name, fill=TEXT_WHITE, font=font_name)

        # Level (right side, top)
        level_str = f"Level {entry['level']}"
        level_w = draw.textlength(level_str, font=font_level)
        draw.text((W - pad_x - level_w, text_y), level_str, fill=TEXT_WHITE, font=font_level)

        # XP / stat (right side, bottom)
        xp_str = entry.get("value_label", "")
        xp_w = draw.textlength(xp_str, font=font_xp)
        draw.text((W - pad_x - xp_w, text_y + 20 * SCALE), xp_str, fill=TEXT_GRAY, font=font_xp)

    # ── Downsample ──
    card = card.resize((FINAL_W, FINAL_H), Image.LANCZOS)

    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
