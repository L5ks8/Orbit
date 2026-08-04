from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import os

def _format_number(n) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)

# ── Icon drawing functions (designed for ~16px at 2x = 32px canvas) ──

def _draw_chat_icon(draw, x, y, s=28, col=(255, 255, 255)):
    """Speech bubble icon."""
    w = int(s * 1.1)
    h = int(s * 0.75)
    r = int(s * 0.2)
    lw = max(2, int(s * 0.12))
    draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=r, outline=col, width=lw)
    # Tail
    tx = x + int(w * 0.15)
    ty = y + h - 1
    draw.polygon([
        (tx, ty),
        (tx - int(s * 0.15), ty + int(s * 0.35)),
        (tx + int(s * 0.3), ty)
    ], fill=col)

def _draw_mic_icon(draw, x, y, s=28, col=(255, 255, 255)):
    """Microphone icon."""
    lw = max(2, int(s * 0.12))
    # Mic body (rounded rect)
    bw = int(s * 0.35)
    bh = int(s * 0.5)
    bx = x + (s - bw) // 2
    draw.rounded_rectangle([(bx, y), (bx + bw, y + bh)], radius=int(bw * 0.4), outline=col, width=lw)
    # Arc under mic
    aw = int(s * 0.7)
    ax = x + (s - aw) // 2
    ay = y + int(bh * 0.4)
    draw.arc([(ax, ay), (ax + aw, ay + int(s * 0.55))], start=0, end=180, fill=col, width=lw)
    # Stem
    cx = x + s // 2
    stem_top = ay + int(s * 0.55) // 2
    stem_bot = y + int(s * 0.9)
    draw.line([(cx, stem_top), (cx, stem_bot)], fill=col, width=lw)

def _draw_smile_icon(draw, x, y, s=28, col=(255, 255, 255)):
    """Smiley face icon."""
    lw = max(2, int(s * 0.12))
    draw.ellipse([(x, y), (x + s, y + s)], outline=col, width=lw)
    # Eyes
    er = max(2, int(s * 0.06))
    ley = y + int(s * 0.35)
    draw.ellipse([(x + int(s * 0.3) - er, ley - er), (x + int(s * 0.3) + er, ley + er)], fill=col)
    draw.ellipse([(x + int(s * 0.7) - er, ley - er), (x + int(s * 0.7) + er, ley + er)], fill=col)
    # Smile arc
    sw = int(s * 0.4)
    sx = x + (s - sw) // 2
    sy = y + int(s * 0.35)
    draw.arc([(sx, sy), (sx + sw, sy + int(s * 0.4))], start=10, end=170, fill=col, width=lw)

def _draw_arrow_up_icon(draw, x, y, s=28, col=(255, 255, 255)):
    """Upload/arrow-up icon."""
    lw = max(2, int(s * 0.12))
    cx = x + s // 2
    # Arrow head
    head_w = int(s * 0.45)
    head_top = y + int(s * 0.1)
    head_bot = y + int(s * 0.45)
    draw.line([(cx - head_w, head_bot), (cx, head_top), (cx + head_w, head_bot)], fill=col, width=lw, joint="curve")
    # Stem
    draw.line([(cx, head_top), (cx, y + int(s * 0.75))], fill=col, width=lw)
    # Base line
    draw.line([(x + int(s * 0.15), y + int(s * 0.9)), (x + int(s * 0.85), y + int(s * 0.9))], fill=col, width=lw)


def generate_rank_card(
    username: str,
    avatar_bytes: bytes,
    rank: int,
    level: int,
    current_xp: int,
    needed_xp: int,
    total_xp: int,
    message_count: int = 0,
    voice_minutes: int = 0,
    reaction_count: int = 0,
    bar_color: tuple = (88, 101, 242),
    bg_color: tuple = (30, 33, 43),
) -> bytes:

    # ── Render at 2x for super-sampled anti-aliasing ──
    SCALE = 2
    FINAL_W, FINAL_H = 1000, 280
    WIDTH = FINAL_W * SCALE
    HEIGHT = FINAL_H * SCALE

    PADDING = 40 * SCALE
    AVATAR_SIZE = 160 * SCALE
    BAR_HEIGHT = 20 * SCALE
    BAR_RADIUS = 10 * SCALE
    ICON_SIZE = 14 * SCALE

    card = Image.new("RGBA", (WIDTH, HEIGHT), (*bg_color, 255))
    draw = ImageDraw.Draw(card)

    # ── Avatar ──
    try:
        avatar_img = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
        avatar_img = avatar_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.LANCZOS)
        mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, AVATAR_SIZE, AVATAR_SIZE), fill=255)
        avatar_x = PADDING
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        card.paste(avatar_img, (avatar_x, avatar_y), mask)
    except Exception:
        avatar_x = PADDING
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        draw.ellipse((avatar_x, avatar_y, avatar_x + AVATAR_SIZE, avatar_y + AVATAR_SIZE), fill=(60, 60, 80))

    # ── Fonts ──
    def load_font(size):
        sz = size * SCALE
        try:
            font_dir = os.path.join(os.path.dirname(__file__), "fonts")
            return ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), sz)
        except Exception:
            pass
        for name in ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]:
            try:
                return ImageFont.truetype(name, sz)
            except Exception:
                continue
        return ImageFont.load_default()

    font_rl = load_font(24)      # RANG / LEVEL
    font_name = load_font(34)    # Username
    font_xp = load_font(28)      # XP numbers
    font_stats = load_font(17)   # Stats line

    text_x = avatar_x + AVATAR_SIZE + 30 * SCALE
    text_area_w = WIDTH - text_x - PADDING

    # ── RANG & LEVEL (top-right) ──
    rl_y = 40 * SCALE
    rang_str = f"RANG {rank}"
    level_str = f"LEVEL {level}"

    # Right-align: LEVEL first, then RANG with gap
    level_w = draw.textlength(level_str, font=font_rl)
    rang_w = draw.textlength(rang_str, font=font_rl)
    gap = 20 * SCALE

    level_x = text_x + text_area_w - level_w
    rang_x = level_x - gap - rang_w

    draw.text((rang_x, rl_y), rang_str, fill=(255, 255, 255), font=font_rl)
    draw.text((level_x, rl_y), level_str, fill=(255, 255, 255), font=font_rl)

    # ── Username (left) & XP (right) ──
    name_y = 90 * SCALE
    display_name = username[:20] + "..." if len(username) > 20 else username
    draw.text((text_x, name_y), display_name, fill=(255, 255, 255), font=font_name)

    needed_fmt = _format_number(needed_xp).lower() if needed_xp >= 1000 else str(needed_xp)
    xp_str = f"{current_xp} / {needed_fmt}"
    draw.text((text_x + text_area_w, name_y + 4 * SCALE), xp_str, fill=(255, 255, 255), font=font_xp, anchor="ra")

    # ── Progress bar ──
    bar_y = 145 * SCALE
    bar_w = text_area_w

    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + bar_w, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS, fill=(50, 54, 68)
    )

    progress = current_xp / needed_xp if needed_xp > 0 else 1.0
    progress = min(1.0, max(0.0, progress))
    fill_w = max(BAR_RADIUS * 2, int(bar_w * progress))

    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + fill_w, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS, fill=(*bar_color, 255)
    )

    # ── Stats line ──
    stats_y = 195 * SCALE
    cur_x = text_x
    icon_gap = 8 * SCALE     # gap between icon and number
    stat_gap = 22 * SCALE    # gap between stats

    # 1) Chat
    _draw_chat_icon(draw, cur_x, stats_y, s=ICON_SIZE, col=(255, 255, 255))
    cur_x += ICON_SIZE + icon_gap
    t = str(message_count)
    draw.text((cur_x, stats_y + 2 * SCALE), t, fill=(255, 255, 255), font=font_stats)
    cur_x += int(draw.textlength(t, font=font_stats)) + stat_gap

    # 2) Mic
    _draw_mic_icon(draw, cur_x, stats_y, s=ICON_SIZE, col=(255, 255, 255))
    cur_x += ICON_SIZE + icon_gap
    t = str(voice_minutes) if isinstance(voice_minutes, int) else f"{voice_minutes:.1f}"
    draw.text((cur_x, stats_y + 2 * SCALE), t, fill=(255, 255, 255), font=font_stats)
    cur_x += int(draw.textlength(t, font=font_stats)) + stat_gap

    # 3) Smiley
    _draw_smile_icon(draw, cur_x, stats_y, s=ICON_SIZE, col=(255, 255, 255))
    cur_x += ICON_SIZE + icon_gap
    t = str(reaction_count)
    draw.text((cur_x, stats_y + 2 * SCALE), t, fill=(255, 255, 255), font=font_stats)
    cur_x += int(draw.textlength(t, font=font_stats)) + stat_gap

    # 4) Arrow up
    _draw_arrow_up_icon(draw, cur_x, stats_y, s=ICON_SIZE, col=(255, 255, 255))
    cur_x += ICON_SIZE + icon_gap
    t = f"{int(progress * 100)}%"
    draw.text((cur_x, stats_y + 2 * SCALE), t, fill=(255, 255, 255), font=font_stats)

    # Right: GESAMT XP
    total_fmt = _format_number(total_xp).lower() if total_xp >= 1000 else str(total_xp)
    draw.text(
        (text_x + text_area_w, stats_y + 2 * SCALE),
        f"GESAMT XP  {total_fmt}",
        fill=(255, 255, 255), font=font_stats, anchor="ra"
    )

    # ── Downsample 2x → final size for crisp anti-aliasing ──
    card = card.resize((FINAL_W, FINAL_H), Image.LANCZOS)

    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
