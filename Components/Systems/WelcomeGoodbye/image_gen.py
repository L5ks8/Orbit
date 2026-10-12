import io
import pathlib
import urllib.request
import tempfile
from PIL import Image, ImageDraw, ImageFont

FONT_BOLD_ITALIC_URL = "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-BlackItalic.ttf"
FONT_REGULAR_URL = "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Medium.ttf"

def _generate_gradient_bg(width: int = 800, height: int = 300, accent: tuple = (88, 101, 242)) -> Image.Image:
    base = Image.new("RGBA", (width, height), (22, 24, 29, 255))
    draw = ImageDraw.Draw(base)
    for x in range(width):
        ratio = x / width
        r = int(24 + (34 - 24) * ratio)
        g = int(26 + (38 - 26) * ratio)
        b = int(32 + (45 - 32) * ratio)
        draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))
        
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    ar, ag, ab = accent[:3]
    for r in range(280, 0, -4):
        alpha = int(40 * (1 - r / 280))
        glow_draw.ellipse((-30 - r, 70 - r, -30 + r, 70 + r), fill=(ar, ag, ab, alpha))
        
    return Image.alpha_composite(base, glow)

def _get_bg(background_path: pathlib.Path, accent: tuple) -> Image.Image:
    if background_path and background_path.exists() and background_path.name != "nonexistent.png":
        try:
            return Image.open(background_path).convert("RGBA").resize((800, 300))
        except Exception:
            pass
    return _generate_gradient_bg(800, 300, accent)

def _get_font(url: str, filename: str, size: int) -> ImageFont.FreeTypeFont:
    temp_dir = pathlib.Path(tempfile.gettempdir())
    font_path = temp_dir / filename
    if not font_path.exists() or font_path.stat().st_size == 0:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3.0) as response:
                data = response.read()
                if len(data) > 1000:
                    tmp = temp_dir / (filename + ".tmp")
                    with open(tmp, 'wb') as out_file:
                        out_file.write(data)
                    tmp.replace(font_path)
        except Exception:
            pass
            
    if font_path.exists() and font_path.stat().st_size > 0:
        try:
            return ImageFont.truetype(str(font_path), size)
        except Exception:
            pass

    for sys_font in ["DejaVuSans-Bold.ttf", "arialbd.ttf", "segoeuib.ttf", "DejaVuSans.ttf", "arial.ttf", "segoeui.ttf"]:
        try:
            return ImageFont.truetype(sys_font, size)
        except Exception:
            continue
            
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()

def _build_card(avatar_bytes: bytes, background_path: pathlib.Path, username: str, title: str, accent: tuple) -> io.BytesIO:
    bg = _get_bg(background_path, accent)

    gradient = Image.new('RGBA', (800, 300))
    draw_grad = ImageDraw.Draw(gradient)
    ar, ag, ab = accent[:3]
    for x in range(800):
        alpha = int(190 - (140 * (x / 800)))
        draw_grad.line([(x, 0), (x, 300)], fill=(ar // 5, ag // 5, ab // 5, alpha))
    bg = Image.alpha_composite(bg, gradient)

    avatar_size = 140
    try:
        if avatar_bytes:
            avatar = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
        else:
            avatar = Image.new("RGBA", (avatar_size, avatar_size), accent)
    except Exception:
        avatar = Image.new("RGBA", (avatar_size, avatar_size), accent)

    avatar = avatar.resize((avatar_size, avatar_size))

    mask = Image.new("L", (avatar_size, avatar_size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, avatar_size, avatar_size), fill=255)

    circle_avatar = Image.new("RGBA", (avatar_size, avatar_size))
    circle_avatar.paste(avatar, (0, 0), mask)

    border_size = 6
    avatar_with_border = Image.new("RGBA", (avatar_size + border_size, avatar_size + border_size), (0, 0, 0, 0))
    draw_border = ImageDraw.Draw(avatar_with_border)
    draw_border.ellipse((0, 0, avatar_size + border_size, avatar_size + border_size), fill=(*accent[:3], 255))
    avatar_with_border.paste(circle_avatar, (border_size // 2, border_size // 2), circle_avatar)

    left_padding = 50
    top_padding = (300 - (avatar_size + border_size)) // 2
    bg.paste(avatar_with_border, (left_padding, top_padding), avatar_with_border)

    draw = ImageDraw.Draw(bg)
    font_large = _get_font(FONT_BOLD_ITALIC_URL, "orbit_font_bold_italic.ttf", 46)
    font_small = _get_font(FONT_REGULAR_URL, "orbit_font_regular.ttf", 26)

    text_x = left_padding + avatar_size + border_size + 35
    text_y_title = top_padding + 22
    text_y_user = text_y_title + 52

    draw.text((text_x, text_y_title), title, fill=(255, 255, 255, 255), font=font_large)

    clean_user = str(username or "User").strip()
    if len(clean_user) > 22:
        clean_user = clean_user[:20] + "..."
    user_tag = f"@{clean_user}"

    draw.text((text_x, text_y_user), user_tag, fill=(220, 225, 235, 210), font=font_small)

    out = io.BytesIO()
    bg.save(out, format="PNG", optimize=True)
    out.seek(0)
    return out

def generate_welcome_image(avatar_bytes: bytes, background_path: pathlib.Path, username: str) -> io.BytesIO:
    return _build_card(avatar_bytes, background_path, username, "WELCOME", (88, 101, 242))

def generate_goodbye_image(avatar_bytes: bytes, background_path: pathlib.Path, username: str) -> io.BytesIO:
    return _build_card(avatar_bytes, background_path, username, "GOODBYE", (237, 66, 69))

