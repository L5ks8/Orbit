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

    # Draw rounded border
    border_color = (50, 50, 60, 255)
    draw.rounded_rectangle(
        [(0, 0), (WIDTH - 1, HEIGHT - 1)],
        radius=16,
        outline=border_color,
        width=2
    )

    # Load avatar
    try:
        avatar_img = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
        avatar_img = avatar_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.LANCZOS)

        # Create circular mask
        mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((0, 0, AVATAR_SIZE, AVATAR_SIZE), fill=255)

        # Draw avatar border circle
        border_size = AVATAR_SIZE + 6
        avatar_x = PADDING + 10
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2 - 10
        draw.ellipse(
            (avatar_x - 3, avatar_y - 3, avatar_x + AVATAR_SIZE + 3, avatar_y + AVATAR_SIZE + 3),
            outline=(80, 80, 100),
            width=2
        )

        card.paste(avatar_img, (avatar_x, avatar_y), mask)
    except Exception:
        avatar_x = PADDING + 10
        avatar_y = (HEIGHT - AVATAR_SIZE) // 2 - 10
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
        font_stats = ImageFont.truetype(os.path.join(font_dir, "Inter-Medium.ttf"), 12)
    except Exception:
        font_bold = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_stats = ImageFont.load_default()

    text_x = avatar_x + AVATAR_SIZE + 30
    text_area_width = WIDTH - text_x - PADDING

    # Draw RANK and LEVEL
    rank_text = f"RANK #{rank}"
    level_text = f"LEVEL {level}"
    rank_level_y = avatar_y + 5

    # Draw rank/level on the right side
    rl_text = f"RANK {rank}    LEVEL {level}"
    draw.text((text_x + text_area_width // 2 - 30, rank_level_y), rank_text, fill=(180, 180, 200), font=font_medium)
    draw.text((text_x + text_area_width // 2 + 80, rank_level_y), level_text, fill=(255, 255, 255), font=font_medium)

    # Draw username
    name_y = rank_level_y + 30
    # Truncate name if too long
    display_name = username[:20] + "..." if len(username) > 20 else username
    draw.text((text_x, name_y), display_name, fill=(255, 255, 255), font=font_bold)

    # Draw XP text
    xp_text = f"{current_xp:,} / {needed_xp:,}"
    draw.text((text_x + text_area_width - 10, name_y + 5), xp_text, fill=(200, 200, 220), font=font_medium, anchor="ra")

    # Draw progress bar
    bar_y = name_y + 42
    bar_width = text_area_width - 10

    # Background bar
    draw.rounded_rectangle(
        [(text_x, bar_y), (text_x + bar_width, bar_y + BAR_HEIGHT)],
        radius=BAR_RADIUS,
        fill=(40, 40, 55)
    )

    # Progress bar
    progress = current_xp / needed_xp if needed_xp > 0 else 1.0
    progress = min(1.0, max(0.02, progress))  # min 2% so it shows something
    fill_width = int(bar_width * progress)

    if fill_width > BAR_RADIUS * 2:
        draw.rounded_rectangle(
            [(text_x, bar_y), (text_x + fill_width, bar_y + BAR_HEIGHT)],
            radius=BAR_RADIUS,
            fill=(*bar_color, 255)
        )

    # Draw stats line
    stats_y = bar_y + BAR_HEIGHT + 12
    stats = [
        (f"📨 {_format_number(message_count)}"),
        (f"🎙 {_format_number(voice_minutes)}"),
        (f"😄 {_format_number(reaction_count)}"),
        (f"⬆ {int(progress * 100)}%"),
        (f"TOTAL XP {_format_number(total_xp)}")
    ]
    stat_text = "  •  ".join(stats)
    draw.text((text_x, stats_y), stat_text, fill=(130, 130, 160), font=font_stats)

    # Convert to bytes
    output = io.BytesIO()
    card.save(output, format="PNG")
    return output.getvalue()
