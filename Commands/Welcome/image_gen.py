import io
import pathlib
import urllib.request
import tempfile
from PIL import Image, ImageDraw, ImageFont

DEFAULT_BG_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"

def _get_default_bg() -> Image.Image:
    temp_dir = pathlib.Path(tempfile.gettempdir())
    bg_path = temp_dir / "default_orbit_bg.jpg"
    if not bg_path.exists():
        try:
            req = urllib.request.Request(DEFAULT_BG_URL, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(bg_path, 'wb') as out_file:
                out_file.write(response.read())
        except Exception:
            return Image.new("RGBA", (800, 300), (43, 45, 49, 255))
    try:
        return Image.open(bg_path).convert("RGBA")
    except Exception:
        return Image.new("RGBA", (800, 300), (43, 45, 49, 255))

def generate_welcome_image(avatar_bytes: bytes, background_path: pathlib.Path, username: str) -> io.BytesIO:
    # 1. Load Background or use default unsplash image
    if background_path.exists() and background_path.name != "nonexistent.png":
        try:
            bg = Image.open(background_path).convert("RGBA")
        except Exception:
            bg = _get_default_bg()
    else:
        bg = _get_default_bg()
        
    bg = bg.resize((800, 300))
    
    # 2. Create gradient overlay (left to right: dark to light)
    gradient = Image.new('RGBA', (800, 300))
    draw_grad = ImageDraw.Draw(gradient)
    for x in range(800):
        # alpha from 0.8 to 0.2 across width
        alpha = int(204 - (153 * (x / 800)))
        draw_grad.line([(x, 0), (x, 300)], fill=(0, 0, 0, alpha))
        
    bg = Image.alpha_composite(bg, gradient)
    
    # 3. Load Avatar
    try:
        avatar = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
    except Exception:
        avatar = Image.new("RGBA", (140, 140), (88, 101, 242, 255))
        
    avatar_size = 140
    avatar = avatar.resize((avatar_size, avatar_size))
    
    # 4. Create Circle Mask for Avatar
    mask = Image.new("L", (avatar_size, avatar_size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, avatar_size, avatar_size), fill=255)
    
    circle_avatar = Image.new("RGBA", (avatar_size, avatar_size))
    circle_avatar.paste(avatar, (0, 0), mask)
    
    # Add border
    border_size = 8
    avatar_with_border = Image.new("RGBA", (avatar_size + border_size, avatar_size + border_size), (0, 0, 0, 0))
    draw_border = ImageDraw.Draw(avatar_with_border)
    draw_border.ellipse((0, 0, avatar_size + border_size, avatar_size + border_size), fill=(17, 17, 17, 255))
    avatar_with_border.paste(circle_avatar, (border_size//2, border_size//2), circle_avatar)
    
    # 5. Paste Avatar onto Background
    left_padding = 50
    bg.paste(avatar_with_border, (left_padding, 35), avatar_with_border)
    
    # 6. Add Text
    draw = ImageDraw.Draw(bg)
    try:
        font_large = ImageFont.truetype("arialbi.ttf", 60) # Arial Bold Italic
    except Exception:
        try:
            font_large = ImageFont.truetype("arial.ttf", 60)
        except Exception:
            font_large = ImageFont.load_default()
            
    try:
        font_small = ImageFont.truetype("arial.ttf", 32)
    except Exception:
        font_small = ImageFont.load_default()
        
    # Draw "WELCOME"
    welcome_text = "WELCOME"
    draw.text((left_padding, 190), welcome_text, fill=(255, 255, 255, 255), font=font_large)
    
    # Draw Username
    u_text = f"@{username}"
    draw.text((left_padding + 5, 255), u_text, fill=(255, 255, 255, 200), font=font_small)
    
    # 7. Save to BytesIO
    out = io.BytesIO()
    bg.save(out, format="PNG")
    out.seek(0)
    return out
