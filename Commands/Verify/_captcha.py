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

def _draw_bmp_line(pixels: List[List[List[int]]], x0: int, y0: int, x1: int, y1: int, color: List[int], width: int, height: int) -> None:
    dist = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(dist + 1):
        t = i / float(dist)
        px = int(x0 + (x1 - x0) * t)
        py = int(y0 + (y1 - y0) * t)
        for dy in range(-1, 2):
            for dx in range(-1, 2):
                ny, nx = py + dy, px + dx
                if 0 <= ny < height and 0 <= nx < width:
                    pixels[ny][nx] = color

def _generate_fallback_bmp(code: str) -> bytes:
    width = 340
    height = 160
    
    pixels = [[[30, 31, 34] for _ in range(width)] for _ in range(height)]
    chars = list(FONT_GRID.keys())
    
    decoy_colors = [[80, 85, 95], [100, 105, 115], [90, 110, 125]]
    for _ in range(25):
        char = random.choice(chars)
        grid = FONT_GRID[char]
        dx = random.randint(10, width - 30)
        dy = random.randint(10, height - 35)
        color = random.choice(decoy_colors)
        
        for r_idx, row in enumerate(grid):
            for c_idx, col in enumerate(row):
                if col == '#':
                    for y_off in range(3):
                        for x_off in range(3):
                            py = dy + r_idx * 3 + y_off
                            px = dx + c_idx * 3 + x_off
                            if 0 <= py < height and 0 <= px < width:
                                pixels[py][px] = color

    targets = []
    step = (width - 40) // 5
    for idx in range(5):
        tx = 20 + idx * step + random.randint(-4, 4)
        ty = random.randint(25, height - 55)
        targets.append((tx, ty))

    cord_color = [255, 204, 0]
    for idx in range(len(targets) - 1):
        x0, y0 = targets[idx]
        x1, y1 = targets[idx + 1]
        cx0, cy0 = x0 + 10, y0 + 10
        cx1, cy1 = x1 + 10, y1 + 10
        _draw_bmp_line(pixels, cx0, cy0, cx1, cy1, cord_color, width, height)

    target_colors = [
        [255, 255, 255],
        [87, 242, 135],
        [254, 231, 92],
        [88, 101, 242],
        [235, 69, 158]
    ]
    
    for idx, char in enumerate(code):
        tx, ty = targets[idx]
        grid = FONT_GRID[char]
        color = target_colors[idx % len(target_colors)]
        
        for r_idx, row in enumerate(grid):
            for c_idx, col in enumerate(row):
                if col == '#':
                    for y_off in range(4):
                        for x_off in range(4):
                            py = ty + r_idx * 4 + y_off
                            px = tx + c_idx * 4 + x_off
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

def generate_captcha() -> Tuple[str, bytes]:
    chars = list(FONT_GRID.keys())
    code = "".join(random.choices(chars, k=5))
    
    try:
        from PIL import Image, ImageDraw, ImageFont
        width = 380
        height = 180
        img = Image.new("RGB", (width, height), color=(30, 31, 34))
        draw = ImageDraw.Draw(img)
        
        try:
            decoy_font = ImageFont.truetype("arial.ttf", 28)
            target_font = ImageFont.truetype("arial.ttf", 40)
        except Exception:
            decoy_font = ImageFont.load_default()
            target_font = ImageFont.load_default()

        decoy_colors = [(75, 80, 90), (95, 100, 110), (85, 105, 120), (105, 90, 80)]
        for _ in range(26):
            char = random.choice(chars)
            dx = random.randint(10, width - 35)
            dy = random.randint(10, height - 35)
            draw.text((dx, dy), char, fill=random.choice(decoy_colors), font=decoy_font)

        targets = []
        step = (width - 50) // 5
        for idx in range(5):
            tx = 25 + idx * step + random.randint(-6, 6)
            ty = random.randint(25, height - 65)
            targets.append((tx, ty))

        cord_points = []
        for tx, ty in targets:
            cord_points.append((tx + 14, ty + 20))
            
        draw.line(cord_points, fill=(255, 204, 0), width=4)
        for cx, cy in cord_points:
            draw.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=(235, 69, 158), outline=(255, 255, 255), width=2)

        target_colors = [
            (255, 255, 255),
            (87, 242, 135),
            (254, 231, 92),
            (88, 101, 242),
            (235, 69, 158)
        ]
        
        for idx, char in enumerate(code):
            tx, ty = targets[idx]
            color = target_colors[idx % len(target_colors)]
            draw.text((tx, ty), char, fill=color, font=target_font)
            
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return code, buffer.getvalue()
    except Exception:
        bmp_bytes = _generate_fallback_bmp(code)
        return code, bmp_bytes
