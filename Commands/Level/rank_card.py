from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io
import os

def _format_number(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.1f}K"
    return str(n)

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
        font_stats = ImageFont.truetype(os.path.join(font_dir, "Inter-Medium.ttf"), 14)
    except Exception:
        try:
            # Fallback to system Arial (Windows/Mac)
            font_bold = ImageFont.truetype("arialbd.ttf", 26)
            font_medium = ImageFont.truetype("arialbd.ttf", 18)
            font_small = ImageFont.truetype("arial.ttf", 14)
            font_stats = ImageFont.truetype("arialbd.ttf", 14)
        except Exception:
            try:
                # Linux fallback
                font_bold = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
                font_medium = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
                font_small = ImageFont.truetype("DejaVuSans.ttf", 14)
                font_stats = ImageFont.truetype("DejaVuSans-Bold.ttf", 14)
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
    
    # Left stats icons
    left_stats = f"💬 {message_count}   🎙 {voice_minutes}   ☺ {reaction_count}   ⬆ {int(progress * 100)}%"
    draw.text((text_x, stats_y), left_stats, fill=(255, 255, 255), font=font_stats)

    # Right stats: GESAMT XP
    total_xp_formatted = _format_number(total_xp).lower() if total_xp >= 1000 else str(total_xp)
    right_stats = f"GESAMT XP  {total_xp_formatted}"
    draw.text((text_x + text_area_width, stats_y), right_stats, fill=(255, 255, 255), font=font_stats, anchor="ra")

    # Convert to bytes
    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
