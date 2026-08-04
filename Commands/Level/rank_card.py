from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import os

def _format_number(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)

def _draw_chat_icon(draw, x, y):
    draw.rounded_rectangle([(x, y), (x + 15, y + 10)], radius=3, outline=(255, 255, 255), width=2)
    draw.polygon([(x + 2, y + 9), (x - 1, y + 14), (x + 6, y + 9)], fill=(255, 255, 255))

def _draw_mic_icon(draw, x, y):
    draw.rounded_rectangle([(x + 4, y), (x + 9, y + 8)], radius=2, outline=(255, 255, 255), width=2)
    draw.arc([(x + 1, y + 3), (x + 12, y + 11)], start=0, end=180, fill=(255, 255, 255), width=2)
    draw.line([(x + 6, y + 11), (x + 6, y + 14)], fill=(255, 255, 255), width=2)

def _draw_smile_icon(draw, x, y):
    draw.ellipse([(x, y), (x + 14, y + 14)], outline=(255, 255, 255), width=2)
    draw.ellipse([(x + 4, y + 4), (x + 5, y + 5)], fill=(255, 255, 255))
    draw.ellipse([(x + 9, y + 4), (x + 10, y + 5)], fill=(255, 255, 255))
    draw.arc([(x + 4, y + 4), (x + 10, y + 10)], start=20, end=160, fill=(255, 255, 255), width=2)

def _draw_arrow_icon(draw, x, y):
    draw.line([(x + 1, y + 6), (x + 6, y + 1), (x + 11, y + 6)], fill=(255, 255, 255), width=2)
    draw.line([(x + 6, y + 1), (x + 6, y + 11)], fill=(255, 255, 255), width=2)
    draw.line([(x + 2, y + 13), (x + 10, y + 13)], fill=(255, 255, 255), width=2)

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
    bar_color: tuple = (255, 165, 0),
    bg_color: tuple = (20, 22, 30),
) -> bytes:

    WIDTH, HEIGHT = 1100, 310
    PADDING = 45
    AVATAR_SIZE = 180
    BAR_HEIGHT = 24
    BAR_RADIUS = 12

    # Create base card
    card = Image.new("RGBA", (WIDTH, HEIGHT), (*bg_color, 255))
    draw = ImageDraw.Draw(card)

    # Load avatar
    try:
        avatar_img = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
        avatar_img = avatar_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.LANCZOS)

        # Create circular mask
        mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, AVATAR_SIZE, AVATAR_SIZE), fill=255)

        avatar_x = PADDING
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        card.paste(avatar_img, (avatar_x, avatar_y), mask)
    except Exception:
        avatar_x = PADDING
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        draw.ellipse(
            (avatar_x, avatar_y, avatar_x + AVATAR_SIZE, avatar_y + AVATAR_SIZE),
            fill=(60, 60, 80)
        )

    # Load fonts
    try:
        font_dir = os.path.join(os.path.dirname(__file__), "fonts")
        font_bold = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), 40)
        font_medium = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), 26)
        font_xp = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), 30)
        font_stats = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), 18)
    except Exception:
        try:
            # Fallback to system Arial (Windows/Mac)
            font_bold = ImageFont.truetype("arialbd.ttf", 38)
            font_medium = ImageFont.truetype("arialbd.ttf", 26)
            font_xp = ImageFont.truetype("arialbd.ttf", 30)
            font_stats = ImageFont.truetype("arialbd.ttf", 18)
        except Exception:
            try:
                # Linux fallback
                font_bold = ImageFont.truetype("DejaVuSans-Bold.ttf", 38)
                font_medium = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
                font_xp = ImageFont.truetype("DejaVuSans-Bold.ttf", 30)
                font_stats = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
            except Exception:
                font_bold = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_xp = ImageFont.load_default()
                font_stats = ImageFont.load_default()

    text_x = avatar_x + AVATAR_SIZE + 35
    text_area_width = WIDTH - text_x - PADDING

    # Draw RANG and LEVEL (Top Right)
    rang_text = f"RANG {rank}"
    level_text = f"LEVEL {level}"
    rank_level_y = 50

    draw.text((text_x + text_area_width - 230, rank_level_y), rang_text, fill=(255, 255, 255), font=font_medium)
    draw.text((text_x + text_area_width - 110, rank_level_y), level_text, fill=(255, 255, 255), font=font_medium)

    # Draw username
    name_y = 105
    display_name = username[:20] + "..." if len(username) > 20 else username
    draw.text((text_x, name_y), display_name, fill=(255, 255, 255), font=font_bold)

    # Draw XP text (e.g. 2525 / 3.9k)
    needed_formatted = _format_number(needed_xp).lower() if needed_xp >= 1000 else str(needed_xp)
    xp_text = f"{current_xp} / {needed_formatted}"
    draw.text((text_x + text_area_width, name_y + 5), xp_text, fill=(255, 255, 255), font=font_xp, anchor="ra")

    # Draw progress bar
    bar_y = 175
    bar_width = text_area_width

    # Background bar
    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + bar_width, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS,
        fill=(40, 44, 58)
    )

    # Progress bar
    progress = current_xp / needed_xp if needed_xp > 0 else 1.0
    progress = min(1.0, max(0.00, progress))
    fill_width = int(bar_width * progress)
    
    # Ensure minimum width so it renders nicely without crashing
    fill_width = max(BAR_RADIUS * 2, fill_width)

    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + fill_width, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS,
        fill=(*bar_color, 255)
    )

    # Draw stats line
    stats_y = 225
    cur_x = text_x
    
    # 1. Chat icon + message_count
    _draw_chat_icon(draw, cur_x, stats_y + 2)
    cur_x += 24
    msg_str = str(message_count)
    draw.text((cur_x, stats_y), msg_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(msg_str, font=font_stats) + 30

    # 2. Mic icon + voice_minutes
    _draw_mic_icon(draw, cur_x, stats_y + 2)
    cur_x += 22
    voice_str = f"{int(voice_minutes)}" if voice_minutes == int(voice_minutes) else f"{voice_minutes:.1f}"
    draw.text((cur_x, stats_y), voice_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(voice_str, font=font_stats) + 30

    # 3. Smile icon + reaction_count
    _draw_smile_icon(draw, cur_x, stats_y + 2)
    cur_x += 24
    react_str = str(reaction_count)
    draw.text((cur_x, stats_y), react_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(react_str, font=font_stats) + 30

    # 4. Arrow icon + progress %
    _draw_arrow_icon(draw, cur_x, stats_y + 2)
    cur_x += 20
    prog_str = f"{int(progress * 100)}%"
    draw.text((cur_x, stats_y), prog_str, fill=(255, 255, 255), font=font_stats)

    # Right stats: GESAMT XP
    total_xp_formatted = _format_number(total_xp).lower() if total_xp >= 1000 else str(total_xp)
    right_stats = f"GESAMT XP  {total_xp_formatted}"
    draw.text((text_x + text_area_width, stats_y), right_stats, fill=(255, 255, 255), font=font_stats, anchor="ra")

    # Convert to bytes
    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
