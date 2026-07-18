import io
import math
import random
import string
import struct
from typing import Tuple, List

FONT_GRID = {
    'A': [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    'C': [" ### ", "#   #", "#    ", "#    ", "#    ", "#   #", " ### "],
    'D': ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
    'E': ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
    'F': ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
    'G': [" ### ", "#   #", "#    ", "# ###", "#   #", "#   #", " ### "],
    'H': ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
    'J': ["#####", "   # ", "   # ", "   # ", "#  # ", "#  # ", " ##  "],
    'K': ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
    'L': ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
    'M': ["#   #", "## ##", "# # #", "#   #", "#   #", "#   #", "#   #"],
    'N': ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
    'P': ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
    'R': ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
    'S': [" ### ", "#   #", "#    ", " ### ", "    #", "#   #", " ### "],
    'T': ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
    'U': ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
    'V': ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
    'W': ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
    'X': ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
    'Y': ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
    'Z': ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
    '2': [" ### ", "#   #", "    #", " ### ", " #   ", "#    ", "#####"],
    '3': [" ### ", "#   #", "    #", " ### ", "    #", "#   #", " ### "],
    '4': ["#   #", "#   #", "#   #", "#####", "    #", "    #", "    #"],
    '5': ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
    '6': [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
    '7': ["#####", "    #", "   # ", "  #  ", "  #  ", "  #  ", "  #  "],
    '9': [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "]
}

BRIGHT_COLORS_RGB = [
    [87, 242, 135],   
    [0, 255, 127],    
    [254, 231, 92],   
    [255, 215, 0],    
    [0, 210, 255],    
    [88, 101, 242],   
    [235, 69, 158],   
    [255, 20, 147],   
    [255, 140, 0],    
    [255, 99, 71],    
    [186, 85, 211],   
    [237, 66, 69]     
]

BRIGHT_COLORS_TUPLE = [tuple(c) for c in BRIGHT_COLORS_RGB]

def _draw_bmp_line(pixels: List[List[List[int]]], x0: int, y0: int, x1: int, y1: int, color: List[int], width: int, height: int) -> None:
    dist = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(dist + 1):
        t = i / float(dist)
        px = int(x0 + (x1 - x0) * t)
        py = int(y0 + (y1 - y0) * t)
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                ny, nx = py + dy, px + dx
                if 0 <= ny < height and 0 <= nx < width:
                    pixels[ny][nx] = color

def _generate_fallback_bmp(code: str) -> bytes:
    width = 400
    height = 180

    pixels = [[[0, 0, 0] for _ in range(width)] for _ in range(height)]
    chars = list(FONT_GRID.keys())

    decoy_colors = [[35, 35, 35], [45, 45, 45], [55, 55, 55]]
    for _ in range(20):
        char = random.choice(chars)
        grid = FONT_GRID[char]
        dx = random.randint(10, width - 40)
        dy = random.randint(10, height - 40)
        color = random.choice(decoy_colors)
        
        for r_idx, row in enumerate(grid):
            for c_idx, col in enumerate(row):
                if col == '#':
                    for y_off in range(4):
                        for x_off in range(4):
                            py = dy + r_idx * 4 + y_off
                            px = dx + c_idx * 4 + x_off
                            if 0 <= py < height and 0 <= px < width:
                                pixels[py][px] = color

    targets = []
    step = (width - 60) // 5
    for idx in range(5):
        tx = 30 + idx * step + random.randint(-4, 4)
        ty = random.randint(30, height - 70)
        targets.append((tx, ty))

    cord_color = [255, 255, 255]
    for idx in range(len(targets) - 1):
        x0, y0 = targets[idx]
        x1, y1 = targets[idx + 1]
        cx0, cy0 = x0 + 17, y0 + 24
        cx1, cy1 = x1 + 17, y1 + 24
        _draw_bmp_line(pixels, cx0, cy0, cx1, cy1, cord_color, width, height)

    for idx, char in enumerate(code):
        tx, ty = targets[idx]
        grid = FONT_GRID[char]
        color = random.choice(BRIGHT_COLORS_RGB)
        
        for r_idx, row in enumerate(grid):
            for c_idx, col in enumerate(row):
                if col == '#':
                    for y_off in range(7):
                        for x_off in range(7):
                            py = ty + r_idx * 7 + y_off
                            px = tx + c_idx * 7 + x_off
                            if 0 <= py < height and 0 <= px < width:
                                pixels[py][px] = color

    filesize = 54 + (width * height * 3)
    bmp_header = struct.pack(
        "<2sIHHI IiiHHIIiiII",
        b"BM", filesize, 0, 0, 54,
        40, width, height, 1, 24, 0, width * height * 3, 2835, 2835, 0, 0
    )
    
    pixel_data = bytearray()
    for y in range(height - 1, -1, -1):
        for x in range(width):
            r, g, b = pixels[y][x]
            pixel_data.extend([b, g, r])
        padding = (4 - (width * 3) % 4) % 4
        pixel_data.extend([0] * padding)
        
    return bmp_header + bytes(pixel_data)

def _get_truetype_font(ImageFont, size: int):
    font_paths = [
        "arial.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
    ]
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()

def generate_captcha() -> Tuple[str, bytes]:
    chars = list(FONT_GRID.keys())
    code = "".join(random.choices(chars, k=5))
    
    try:
        from PIL import Image, ImageDraw, ImageFont
        width = 420
        height = 190
        
        img = Image.new("RGB", (width, height), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        decoy_font = _get_truetype_font(ImageFont, 32)
        target_font = _get_truetype_font(ImageFont, 56)  

        decoy_colors = [(40, 40, 40), (50, 50, 50), (60, 60, 60)]
        for _ in range(20):
            char = random.choice(chars)
            dx = random.randint(10, width - 40)
            dy = random.randint(10, height - 40)
            draw.text((dx, dy), char, fill=random.choice(decoy_colors), font=decoy_font)

        targets = []
        step = (width - 60) // 5
        for idx in range(5):
            tx = 30 + idx * step + random.randint(-6, 6)
            ty = random.randint(30, height - 85)
            targets.append((tx, ty))

        cord_points = []
        for tx, ty in targets:
            cord_points.append((tx + 20, ty + 28))

        draw.line(cord_points, fill=(255, 255, 255), width=5)
        for cx, cy in cord_points:
            draw.ellipse((cx - 6, cy - 6, cx + 6, cy + 6), fill=(255, 255, 255), outline=(0, 0, 0), width=2)

        for idx, char in enumerate(code):
            tx, ty = targets[idx]
            color = random.choice(BRIGHT_COLORS_TUPLE)
            draw.text((tx, ty), char, fill=color, font=target_font)
            
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return code, buffer.getvalue()
    except Exception:
        bmp_bytes = _generate_fallback_bmp(code)
        return code, bmp_bytes

