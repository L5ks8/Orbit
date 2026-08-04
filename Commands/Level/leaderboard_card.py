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
    **kwargs
) -> bytes:
    """
    entries: list of dicts with keys:
      - name: str
      - level: int
      - value_label: str (e.g. "XP 36.7k")
      - avatar_bytes: bytes or None
      - rank: int
    """
    SCALE = 2
    FINAL_W = 460
    ROW_H = 50
    SPACING = 8
    ENTRY_COUNT = len(entries)
    FINAL_H = (ROW_H + SPACING) * ENTRY_COUNT

    W = FINAL_W * SCALE
    H = FINAL_H * SCALE
    RH = ROW_H * SCALE
    SPACE = SPACING * SCALE

    # Transparent background for the main card
    card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(card)

    ROW_BG = (35, 36, 40)
    TEXT_WHITE = (255, 255, 255)
    TEXT_GRAY = (148, 155, 164)

    font_rank = _load_font(16 * SCALE)
    font_name = _load_font(15 * SCALE)
    font_level = _load_font(16 * SCALE)
    font_xp = _load_font_regular(12 * SCALE)

    avatar_size = 42 * SCALE
    pad_x = 0  # We use the full width for the rows now

    for i, entry in enumerate(entries):
        y = i * (RH + SPACE)
        
        # Pill shape row
        draw.rounded_rectangle(
            [(0, y), (W, y + RH)],
            radius=RH // 2,
            fill=(*ROW_BG, 255)
        )

        # Avatar
        av_x = 4 * SCALE
        av_y = y + (RH - avatar_size) // 2
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

        # Rank Color
        rank_val = entry["rank"]
        if rank_val == 1:
            rank_col = (255, 215, 0)    # Gold
        elif rank_val == 2:
            rank_col = (192, 192, 192)  # Silver
        elif rank_val == 3:
            rank_col = (205, 127, 50)   # Bronze
        else:
            rank_col = TEXT_WHITE

        # Rank Text
        text_x = av_x + avatar_size + 12 * SCALE
        rank_str = f"#{rank_val}"
        draw.text((text_x, y + 14 * SCALE), rank_str, fill=rank_col, font=font_rank)
        
        # Dot Separator
        rank_w = draw.textlength(rank_str, font=font_rank)
        dot_str = " · "
        draw.text((text_x + rank_w, y + 14 * SCALE), dot_str, fill=TEXT_GRAY, font=font_rank)

        # Name Text
        dot_w = draw.textlength(dot_str, font=font_rank)
        name_x = text_x + rank_w + dot_w
        name_str = entry["name"]
        if len(name_str) > 22:
            name_str = name_str[:20] + ".."
        
        draw.text((name_x, y + 15 * SCALE), name_str, fill=TEXT_WHITE, font=font_name)

        # Level (right side, top)
        level_str = f"Level {entry['level']}"
        level_w = draw.textlength(level_str, font=font_level)
        draw.text((W - 16 * SCALE - level_w, y + 8 * SCALE), level_str, fill=TEXT_WHITE, font=font_level)

        # XP / stat (right side, bottom)
        xp_str = entry.get("value_label", "")
        xp_w = draw.textlength(xp_str, font=font_xp)
        draw.text((W - 16 * SCALE - xp_w, y + 28 * SCALE), xp_str, fill=TEXT_GRAY, font=font_xp)

    # ── Downsample ──
    card = card.resize((FINAL_W, FINAL_H), Image.LANCZOS)

    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
