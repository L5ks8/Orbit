import io
import os
import aiohttp
import asyncio
from html.parser import HTMLParser
from PIL import Image, ImageDraw, ImageFont, ImageOps
import textwrap

def _load_font(size):
    try:
        font_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Level", "fonts")
        f = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), size)
        try:
            f.set_variation_by_axes([14, 700])
        except Exception:
            pass
        return f
    except Exception:
        pass
    for name in ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def _load_font_regular(size):
    try:
        font_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Level", "fonts")
        f = ImageFont.truetype(os.path.join(font_dir, "Inter-Bold.ttf"), size)
        try:
            f.set_variation_by_axes([14, 400])
        except Exception:
            pass
        return f
    except Exception:
        pass
    for name in ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()

class TranscriptHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.messages = []
        self._current_msg = {}
        self._in_div = None
        self._text_buffer = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "div" and attrs_dict.get("class") == "message":
            if self._current_msg:
                self.messages.append(self._current_msg)
            self._current_msg = {"text": ""}
        
        elif tag == "img" and "avatar" in self._in_div:
            self._current_msg["avatar_url"] = attrs_dict.get("src")
            
        elif tag == "span" and attrs_dict.get("class") == "msg-author":
            self._in_div = "author"
            self._text_buffer = []
            
        elif tag == "span" and attrs_dict.get("class") == "msg-time":
            self._in_div = "time"
            self._text_buffer = []
            
        elif tag == "div" and attrs_dict.get("class") == "msg-text":
            self._in_div = "text"
            self._text_buffer = []
            
        elif tag == "div" and attrs_dict.get("class") == "avatar":
            self._in_div = "avatar"

    def handle_endtag(self, tag):
        if self._in_div:
            text = "".join(self._text_buffer).strip()
            if self._in_div == "author":
                self._current_msg["author"] = text
            elif self._in_div == "time":
                self._current_msg["time"] = text
            elif self._in_div == "text":
                # Only add if we actually captured text, handles multiple msg-text parts or formatting
                if "text" not in self._current_msg:
                    self._current_msg["text"] = text
                else:
                    self._current_msg["text"] += text
            self._in_div = None
            self._text_buffer = []

    def handle_data(self, data):
        if self._in_div:
            self._text_buffer.append(data)
            
    def handle_entityref(self, name):
        from html import unescape
        if self._in_div:
            self._text_buffer.append(unescape(f"&{name};"))
            
    def handle_charref(self, name):
        from html import unescape
        if self._in_div:
            self._text_buffer.append(unescape(f"&#{name};"))

def parse_transcript(html_content: str):
    parser = TranscriptHTMLParser()
    parser.feed(html_content)
    if parser._current_msg and "author" in parser._current_msg:
        parser.messages.append(parser._current_msg)
    return parser.messages

async def fetch_avatar(session, url: str) -> bytes:
    if not url: return None
    try:
        async with session.get(str(url), timeout=5) as resp:
            if resp.status == 200:
                return await resp.read()
    except Exception:
        pass
    return None

def wrap_text(text, font, max_width):
    words = text.split(' ')
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        # Use getbbox() as getsize() is deprecated
        bbox = font.getbbox(' '.join(current_line))
        w = bbox[2] - bbox[0]
        if w > max_width:
            if len(current_line) == 1:
                lines.append(current_line[0])
                current_line = []
            else:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
    if current_line:
        lines.append(' '.join(current_line))
    return lines

async def generate_transcript_image(messages, page: int, per_page: int = 50):
    start_idx = page * per_page
    end_idx = start_idx + per_page
    page_msgs = messages[start_idx:end_idx]
    
    if not page_msgs:
        return None
        
    WIDTH = 1200
    PADDING_X = 40
    PADDING_Y = 40
    MSG_SPACING = 30
    AVATAR_SIZE = 64
    
    font_author = _load_font(28)
    font_time = _load_font_regular(20)
    font_text = _load_font_regular(26)
    
    # Calculate heights and pre-wrap text
    msg_layouts = []
    total_height = PADDING_Y * 2
    
    # We need to fetch avatars concurrently for this page
    avatar_urls = [m.get("avatar_url") for m in page_msgs]
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_avatar(session, url) for url in avatar_urls]
        avatar_bytes_list = await asyncio.gather(*tasks)
    
    for idx, msg in enumerate(page_msgs):
        author = msg.get("author", "Unknown")
        time_str = msg.get("time", "")
        text = msg.get("text", "")
        
        # Max width for text is WIDTH - PADDING_X*2 - AVATAR_SIZE - 20 (spacing)
        max_text_width = WIDTH - (PADDING_X * 2) - AVATAR_SIZE - 30
        
        # Split text by newlines first
        lines = []
        for raw_line in text.split('\\n'):
            for subline in raw_line.split('\n'):
                wrapped = wrap_text(subline, font_text, max_text_width)
                lines.extend(wrapped)
        
        # Height calculations
        # getbbox returns (left, top, right, bottom)
        author_bbox = font_author.getbbox(author)
        author_h = author_bbox[3] - author_bbox[1]
        
        text_h = 0
        if lines:
            line_bbox = font_text.getbbox("A")
            line_h = line_bbox[3] - line_bbox[1] + 8 # 8px line spacing
            text_h = len(lines) * line_h
            
        msg_h = max(AVATAR_SIZE, author_h + 10 + text_h) + MSG_SPACING
        
        msg_layouts.append({
            "msg": msg,
            "lines": lines,
            "height": msg_h,
            "avatar_bytes": avatar_bytes_list[idx]
        })
        
        total_height += msg_h
        
    # Generate image
    img = Image.new("RGBA", (WIDTH, total_height), (49, 51, 56, 255)) # Discord dark mode bg
    draw = ImageDraw.Draw(img)
    
    current_y = PADDING_Y
    
    for layout in msg_layouts:
        msg = layout["msg"]
        avatar_b = layout["avatar_bytes"]
        author = msg.get("author", "Unknown")
        time_str = msg.get("time", "")
        lines = layout["lines"]
        
        # Draw avatar
        if avatar_b:
            try:
                av_img = Image.open(io.BytesIO(avatar_b)).convert("RGBA")
                av_img = av_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
                
                # Circular mask
                mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.ellipse((0, 0, AVATAR_SIZE, AVATAR_SIZE), fill=255)
                av_img.putalpha(mask)
                
                img.alpha_composite(av_img, (PADDING_X, current_y))
            except Exception:
                draw.ellipse((PADDING_X, current_y, PADDING_X + AVATAR_SIZE, current_y + AVATAR_SIZE), fill=(88, 101, 242))
        else:
            draw.ellipse((PADDING_X, current_y, PADDING_X + AVATAR_SIZE, current_y + AVATAR_SIZE), fill=(88, 101, 242))
            
        # Draw author and time
        text_x = PADDING_X + AVATAR_SIZE + 20
        draw.text((text_x, current_y), author, font=font_author, fill=(242, 243, 245, 255))
        
        author_bbox = font_author.getbbox(author)
        author_w = author_bbox[2] - author_bbox[0]
        author_h = author_bbox[3] - author_bbox[1]
        
        draw.text((text_x + author_w + 12, current_y + (author_h/2) - 8), time_str, font=font_time, fill=(148, 155, 164, 255))
        
        # Draw text lines
        line_y = current_y + author_h + 10
        line_bbox = font_text.getbbox("A")
        line_h = line_bbox[3] - line_bbox[1] + 8
        
        for line in lines:
            draw.text((text_x, line_y), line, font=font_text, fill=(219, 222, 225, 255))
            line_y += line_h
            
        current_y += layout["height"]
        
    return img
