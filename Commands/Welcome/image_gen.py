import io
import pathlib
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def generate_welcome_image(avatar_bytes: bytes, background_path: pathlib.Path, username: str) -> io.BytesIO:
    # 1. Load Background or create default
    if background_path.exists():
        try:
            bg = Image.open(background_path).convert("RGBA")
        except Exception:
            bg = Image.new("RGBA", (800, 300), (43, 45, 49, 255))
    else:
        bg = Image.new("RGBA", (800, 300), (43, 45, 49, 255))
        
    bg = bg.resize((800, 300))
    
    # 2. Load Avatar
    try:
        avatar = Image.open(io.BytesIO(avatar_bytes)).convert("RGBA")
    except Exception:
        avatar = Image.new("RGBA", (150, 150), (88, 101, 242, 255))
        
    avatar = avatar.resize((150, 150))
    
    # 3. Create Circle Mask for Avatar
    mask = Image.new("L", (150, 150), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse((0, 0, 150, 150), fill=255)
    
    # Apply mask to avatar
    circle_avatar = Image.new("RGBA", (150, 150))
    circle_avatar.paste(avatar, (0, 0), mask)
    
    # 4. Paste Avatar onto Background (Center horizontally, slightly above center vertically)
    bg.paste(circle_avatar, (325, 40), circle_avatar)
    
    # 5. Add Text (Welcome + Username)
    draw = ImageDraw.Draw(bg)
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_small = ImageFont.truetype("arial.ttf", 24)
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        
    # Draw "WELCOME"
    welcome_text = "WELCOME"
    # Using textbbox to center text
    left, top, right, bottom = draw.textbbox((0, 0), welcome_text, font=font_large)
    w_w = right - left
    draw.text(((800 - w_w) / 2, 210), welcome_text, fill=(255, 255, 255, 255), font=font_large)
    
    # Draw Username
    u_text = f"@{username}"
    left, top, right, bottom = draw.textbbox((0, 0), u_text, font=font_small)
    u_w = right - left
    draw.text(((800 - u_w) / 2, 255), u_text, fill=(180, 185, 190, 255), font=font_small)
    
    # 6. Save to BytesIO
    out_buffer = io.BytesIO()
    bg.convert("RGB").save(out_buffer, format="PNG")
    out_buffer.seek(0)
    return out_buffer
