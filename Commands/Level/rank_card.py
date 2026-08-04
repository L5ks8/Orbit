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
    bar_color: tuple = (59, 130, 246),
    bg_color: tuple = (22, 22, 30),
) -> bytes:

    WIDTH, HEIGHT = 934, 282
    PADDING = 30
    AVATAR_SIZE = 128
    BAR_HEIGHT = 20
    BAR_RADIUS = 10

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

        avatar_x = PADDING + 10
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        card.paste(avatar_img, (avatar_x, avatar_y), mask)
    except Exception:
        avatar_x = PADDING + 10
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2
        draw.ellipse(
            (avatar_x, avatar_y, avatar_x + AVATAR_SIZE, avatar_y + AVATAR_SIZE),
            fill=(60, 60, 80)
        )

    # Load fonts (use default if custom fonts not available)
    try:
        font_dir = os.path.join(os.path.dirname(__file__), "fonts")
        font_bold = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), 28)
        font_medium = ImageFont.truetype(os.path.join(font_dir, "Inter-Medium.ttf"), 18)
        font_small = ImageFont.truetype(os.path.join(font_dir, "Inter-Medium.ttf"), 14)
        font_stats = ImageFont.truetype(os.path.join(font_dir, "Inter-Medium.ttf"), 16)
    except Exception:
        try:
            # Fallback to system Arial (Windows/Mac)
            font_bold = ImageFont.truetype("arialbd.ttf", 26)
            font_medium = ImageFont.truetype("arialbd.ttf", 18)
            font_small = ImageFont.truetype("arial.ttf", 14)
            font_stats = ImageFont.truetype("arialbd.ttf", 16)
        except Exception:
            try:
                # Linux fallback
                font_bold = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
                font_medium = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
                font_small = ImageFont.truetype("DejaVuSans.ttf", 14)
                font_stats = ImageFont.truetype("DejaVuSans-Bold.ttf", 16)
            except Exception:
                font_bold = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_small = ImageFont.load_default()
                font_stats = ImageFont.load_default()

    text_x = avatar_x + AVATAR_SIZE + 30
    text_area_width = WIDTH - text_x - PADDING

    # Draw RANG and LEVEL (Top Right)
    rang_text = f"RANG {rank}"
    level_text = f"LEVEL {level}"
    rank_level_y = avatar_y + 5

    # Draw Rang & Level in white bold
    draw.text((text_x + text_area_width - 170, rank_level_y), rang_text, fill=(255, 255, 255), font=font_medium)
    draw.text((text_x + text_area_width - 75, rank_level_y), level_text, fill=(255, 255, 255), font=font_medium)

    # Draw username
    name_y = rank_level_y + 32
    display_name = username[:20] + "..." if len(username) > 20 else username
    draw.text((text_x, name_y), display_name, fill=(255, 255, 255), font=font_bold)

    # Draw XP text (e.g. 10 / 2k)
    needed_formatted = _format_number(needed_xp).lower() if needed_xp >= 1000 else str(needed_xp)
    xp_text = f"{current_xp} / {needed_formatted}"
    draw.text((text_x + text_area_width, name_y + 5), xp_text, fill=(255, 255, 255), font=font_bold, anchor="ra")

    # Draw progress bar
    bar_y = name_y + 42
    bar_width = text_area_width

    # Background bar
    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + bar_width, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS,
        fill=(45, 47, 57)
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
    stats_y = bar_y + BAR_HEIGHT + 14
    cur_x = text_x
    
    # 1. Chat icon + message_count
    _draw_chat_icon(draw, cur_x, stats_y + 2)
    cur_x += 22
    msg_str = str(message_count)
    draw.text((cur_x, stats_y), msg_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(msg_str, font=font_stats) + 25

    # 2. Mic icon + voice_minutes
    _draw_mic_icon(draw, cur_x, stats_y + 2)
    cur_x += 20
    voice_str = f"{voice_minutes:.1f}" if isinstance(voice_minutes, float) else str(voice_minutes)
    draw.text((cur_x, stats_y), voice_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(voice_str, font=font_stats) + 25

    # 3. Smile icon + reaction_count
    _draw_smile_icon(draw, cur_x, stats_y + 2)
    cur_x += 22
    react_str = str(reaction_count)
    draw.text((cur_x, stats_y), react_str, fill=(255, 255, 255), font=font_stats)
    cur_x += draw.textlength(react_str, font=font_stats) + 25

    # 4. Arrow icon + progress %
    _draw_arrow_icon(draw, cur_x, stats_y + 2)
    cur_x += 18
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
