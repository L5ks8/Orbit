import io
import os
import re
import html
import asyncio
import aiohttp
from html.parser import HTMLParser
from PIL import Image, ImageDraw, ImageFont

def _get_font(size: int, bold: bool = False):
    font_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Level", "fonts"))
    ttf_name = "Inter-Bold.ttf" if bold else "Inter-Medium.ttf"
    primary_path = os.path.join(font_dir, ttf_name)
    if os.path.exists(primary_path):
        try:
            return ImageFont.truetype(primary_path, size)
        except Exception:
            pass

    fallback_names = (
        ["arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf"]
        if bold
        else ["arial.ttf", "Arial.ttf", "DejaVuSans.ttf"]
    )
    for name in fallback_names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def parse_hex_or_rgb(color_val, default=(88, 101, 242)):
    if not color_val:
        return default
    if isinstance(color_val, (tuple, list)) and len(color_val) >= 3:
        return tuple(int(c) for c in color_val[:3])
    s = str(color_val).strip()
    if "border-left-color:" in s:
        m = re.search(r'border-left-color:\s*([^;]+)', s)
        if m:
            s = m.group(1).strip()
    elif "color:" in s:
        m = re.search(r'color:\s*([^;]+)', s)
        if m:
            s = m.group(1).strip()
    if s.startswith("#"):
        s = s[1:]
        if len(s) == 3:
            s = "".join(c * 2 for c in s)
        if len(s) == 6:
            try:
                return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))
            except Exception:
                pass
    return default

class TranscriptHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.messages = []
        self._current_msg = None
        self._current_embed = None
        self._current_field = None
        self._current_tag_stack = []
        self._text_buffers = {}

    def _start_buffer(self, tag_key):
        self._text_buffers[tag_key] = []

    def _get_buffer(self, tag_key):
        return "".join(self._text_buffers.get(tag_key, [])).strip()

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes = attrs_dict.get("class", "").split()

        if tag == "div" and "message" in classes:
            if self._current_msg:
                self.messages.append(self._current_msg)
            self._current_msg = {
                "author": "Unknown",
                "author_id": attrs_dict.get("data-author-id", ""),
                "author_color": attrs_dict.get("data-author-color", ""),
                "is_bot": attrs_dict.get("data-is-bot", "").lower() == "true",
                "avatar_url": "",
                "time": "",
                "text": "",
                "embeds": [],
                "attachments": []
            }
            return

        if not self._current_msg:
            return

        # Avatar img
        if tag == "img" and "avatar" in self._current_tag_stack:
            self._current_msg["avatar_url"] = attrs_dict.get("src", "")
            return

        # Avatar container
        if tag == "div" and "avatar" in classes:
            self._current_tag_stack.append("avatar")
            return

        # Author span
        if tag == "span" and "msg-author" in classes:
            self._current_tag_stack.append("msg-author")
            self._start_buffer("author")
            style = attrs_dict.get("style", "")
            if "color:" in style:
                self._current_msg["author_color"] = style
            return

        # Bot badge
        if tag == "span" and "bot-badge" in classes:
            self._current_msg["is_bot"] = True
            return

        # Timestamp span
        if tag == "span" and "msg-time" in classes:
            self._current_tag_stack.append("msg-time")
            self._start_buffer("time")
            return

        # Message text container
        if tag == "div" and "msg-text" in classes:
            self._current_tag_stack.append("msg-text")
            self._start_buffer("text")
            return

        # Embed container
        if tag == "div" and "embed" in classes:
            color_src = attrs_dict.get("data-color") or attrs_dict.get("style", "")
            color_rgb = parse_hex_or_rgb(color_src, (88, 101, 242))
            self._current_embed = {
                "color": color_rgb,
                "author": "",
                "title": "",
                "desc": "",
                "fields": [],
                "footer": "",
                "thumbnail_url": "",
                "image_url": ""
            }
            self._current_tag_stack.append("embed")
            return

        # Inside Embed
        if self._current_embed:
            if tag == "div" and "embed-author" in classes:
                self._current_tag_stack.append("embed-author")
                self._start_buffer("embed-author")
            elif tag == "div" and "embed-title" in classes:
                self._current_tag_stack.append("embed-title")
                self._start_buffer("embed-title")
            elif tag == "div" and ("embed-desc" in classes or "embed-description" in classes):
                self._current_tag_stack.append("embed-desc")
                self._start_buffer("embed-desc")
            elif tag == "div" and "embed-field" in classes:
                is_inline = "embed-field-inline" in classes
                self._current_field = {"name": "", "value": "", "inline": is_inline}
                self._current_tag_stack.append("embed-field")
            elif tag == "div" and "embed-field-name" in classes:
                self._current_tag_stack.append("embed-field-name")
                self._start_buffer("embed-field-name")
            elif tag == "div" and "embed-field-value" in classes:
                self._current_tag_stack.append("embed-field-value")
                self._start_buffer("embed-field-value")
            elif tag == "div" and "embed-footer" in classes:
                self._current_tag_stack.append("embed-footer")
                self._start_buffer("embed-footer")
            elif tag == "img" and "embed-thumbnail" in classes:
                self._current_embed["thumbnail_url"] = attrs_dict.get("src", "")
            elif tag == "img" and "embed-image" in classes:
                self._current_embed["image_url"] = attrs_dict.get("src", "")
            return

        # Attachments
        if tag == "div" and "attachment" in classes:
            if "image-attachment" in classes:
                pass
            return
        if tag == "img" and "attachment" in "".join(self._current_tag_stack):
            self._current_msg["attachments"].append({
                "url": attrs_dict.get("src", ""),
                "is_image": True,
                "filename": attrs_dict.get("alt", "image")
            })
            return
        if tag == "a" and "attachment" in "".join(self._current_tag_stack):
            self._current_tag_stack.append("attachment-link")
            self._start_buffer("attachment-link")
            self._attachment_href = attrs_dict.get("href", "")
            return

    def handle_endtag(self, tag):
        if not self._current_msg:
            return

        if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "avatar":
            self._current_tag_stack.pop()
            return

        if tag == "span" and self._current_tag_stack and self._current_tag_stack[-1] == "msg-author":
            self._current_tag_stack.pop()
            self._current_msg["author"] = self._get_buffer("author")
            return

        if tag == "span" and self._current_tag_stack and self._current_tag_stack[-1] == "msg-time":
            self._current_tag_stack.pop()
            self._current_msg["time"] = self._get_buffer("time")
            return

        if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "msg-text":
            self._current_tag_stack.pop()
            self._current_msg["text"] = self._get_buffer("text")
            return

        if self._current_embed:
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-author":
                self._current_tag_stack.pop()
                self._current_embed["author"] = self._get_buffer("embed-author")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-title":
                self._current_tag_stack.pop()
                self._current_embed["title"] = self._get_buffer("embed-title")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-desc":
                self._current_tag_stack.pop()
                self._current_embed["desc"] = self._get_buffer("embed-desc")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-field-name":
                self._current_tag_stack.pop()
                if self._current_field:
                    self._current_field["name"] = self._get_buffer("embed-field-name")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-field-value":
                self._current_tag_stack.pop()
                if self._current_field:
                    self._current_field["value"] = self._get_buffer("embed-field-value")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-field":
                self._current_tag_stack.pop()
                if self._current_field:
                    self._current_embed["fields"].append(self._current_field)
                    self._current_field = None
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed-footer":
                self._current_tag_stack.pop()
                self._current_embed["footer"] = self._get_buffer("embed-footer")
                return
            if tag == "div" and self._current_tag_stack and self._current_tag_stack[-1] == "embed":
                self._current_tag_stack.pop()
                self._current_msg["embeds"].append(self._current_embed)
                self._current_embed = None
                return

        if tag == "a" and self._current_tag_stack and self._current_tag_stack[-1] == "attachment-link":
            self._current_tag_stack.pop()
            filename = self._get_buffer("attachment-link") or "attachment"
            href = getattr(self, "_attachment_href", "")
            self._current_msg["attachments"].append({
                "url": href,
                "is_image": False,
                "filename": filename
            })
            return

    def handle_data(self, data):
        if not self._current_tag_stack:
            return
        top = self._current_tag_stack[-1]
        if top == "msg-author":
            self._text_buffers.setdefault("author", []).append(data)
        elif top == "msg-time":
            self._text_buffers.setdefault("time", []).append(data)
        elif top == "msg-text":
            self._text_buffers.setdefault("text", []).append(data)
        elif top == "embed-author":
            self._text_buffers.setdefault("embed-author", []).append(data)
        elif top == "embed-title":
            self._text_buffers.setdefault("embed-title", []).append(data)
        elif top == "embed-desc":
            self._text_buffers.setdefault("embed-desc", []).append(data)
        elif top == "embed-field-name":
            self._text_buffers.setdefault("embed-field-name", []).append(data)
        elif top == "embed-field-value":
            self._text_buffers.setdefault("embed-field-value", []).append(data)
        elif top == "embed-footer":
            self._text_buffers.setdefault("embed-footer", []).append(data)
        elif top == "attachment-link":
            self._text_buffers.setdefault("attachment-link", []).append(data)

    def handle_entityref(self, name):
        self.handle_data(html.unescape(f"&{name};"))

    def handle_charref(self, name):
        self.handle_data(html.unescape(f"&#{name};"))

def parse_transcript(html_content: str):
    parser = TranscriptHTMLParser()
    parser.feed(html_content)
    if parser._current_msg and parser._current_msg.get("author"):
        parser.messages.append(parser._current_msg)
    return parser.messages

def normalize_avatar_url(url: str) -> str:
    if not url:
        return ""
    if "cdn.discordapp.com" in url:
        if ".webp" in url:
            url = url.replace(".webp", ".png")
        if "size=" in url:
            url = re.sub(r'size=\d+', 'size=128', url)
        elif "?" in url:
            url += "&size=128"
        else:
            url += "?size=128"
    return url

async def fetch_avatar(session, url: str) -> bytes:
    if not url:
        return None
    url = normalize_avatar_url(url)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    try:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
            if resp.status == 200:
                return await resp.read()
    except Exception:
        pass
    return None

DISCORD_DEFAULT_COLORS = [
    (88, 101, 242),   # Blurple
    (87, 242, 135),   # Green
    (254, 231, 92),   # Yellow
    (235, 69, 158),   # Fuchsia
    (237, 66, 69),    # Red
]

def generate_procedural_avatar(author_name: str, size: int) -> Image.Image:
    av_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(av_img)
    color_idx = abs(hash(author_name or "User")) % len(DISCORD_DEFAULT_COLORS)
    bg_color = DISCORD_DEFAULT_COLORS[color_idx]
    draw.ellipse((0, 0, size - 1, size - 1), fill=bg_color)
    initial = (author_name[0] if author_name else "?").upper()
    font = _get_font(int(size * 0.5), bold=True)
    bbox = font.getbbox(initial)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), initial, font=font, fill=(255, 255, 255, 255))
    return av_img

def resolve_mentions_in_text(text: str, guild=None) -> str:
    if not text:
        return ""
    import re
    from datetime import datetime, timezone

    def replace_user(m):
        uid = int(m.group(1))
        if guild:
            mem = guild.get_member(uid)
            if mem:
                return f"@{mem.display_name}"
            usr = getattr(guild, "_state", None)
            if usr and hasattr(usr, "get_user"):
                u = usr.get_user(uid)
                if u:
                    return f"@{u.display_name}"
        return f"@{uid}"

    def replace_role(m):
        rid = int(m.group(1))
        if guild:
            r = guild.get_role(rid)
            if r:
                return f"@{r.name}"
        return f"@role-{rid}"

    def replace_channel(m):
        cid = int(m.group(1))
        if guild:
            c = guild.get_channel(cid)
            if c:
                return f"#{c.name}"
        return f"#channel-{cid}"

    def replace_ts(m):
        ts = int(m.group(1))
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        return dt.strftime("%Y-%m-%d %H:%M:%S")

    text = re.sub(r'<@!?(\d+)>', replace_user, text)
    text = re.sub(r'<@&(\d+)>', replace_role, text)
    text = re.sub(r'<#(\d+)>', replace_channel, text)
    text = re.sub(r'<t:(\d+)(?::[a-zA-Z])?>', replace_ts, text)
    return text

def wrap_text(text: str, font, max_width: int):
    if not text:
        return []
    lines = []
    for raw_paragraph in text.split("\n"):
        paragraph = raw_paragraph.strip()
        if not paragraph:
            continue
        words = paragraph.split(" ")
        cur = []
        for word in words:
            test_line = (" ".join(cur + [word])).strip()
            bbox = font.getbbox(test_line)
            w = bbox[2] - bbox[0]
            if w > max_width and cur:
                lines.append(" ".join(cur))
                cur = [word]
            else:
                cur.append(word)
        if cur:
            lines.append(" ".join(cur))
    return lines

async def generate_transcript_image(messages, page: int, per_page: int = 50, guild=None):
    start_idx = page * per_page
    end_idx = start_idx + per_page
    page_msgs = messages[start_idx:end_idx]

    if not page_msgs:
        return None

    WIDTH = 1200
    PADDING_X = 40
    PADDING_Y = 32
    MSG_SPACING = 24
    AVATAR_SIZE = 52

    font_author = _get_font(22, bold=True)
    font_bot = _get_font(11, bold=True)
    font_time = _get_font(14, bold=False)
    font_text = _get_font(18, bold=False)
    font_header = _get_font(20, bold=True)
    font_embed_title = _get_font(17, bold=True)
    font_embed_desc = _get_font(15, bold=False)
    font_embed_field_name = _get_font(14, bold=True)
    font_embed_field_val = _get_font(14, bold=False)
    font_embed_footer = _get_font(13, bold=False)
    font_attachment = _get_font(14, bold=False)

    # 1. Preprocess mentions and resolve server profiles
    for msg in page_msgs:
        author_name = msg.get("author", "Unknown")
        author_id = msg.get("author_id", "")

        # Server member resolution
        if guild:
            member = None
            if author_id and author_id.isdigit():
                member = guild.get_member(int(author_id))
            if not member:
                for m in guild.members:
                    if m.display_name == author_name or m.name == author_name:
                        member = m
                        break
            if member:
                msg["author"] = member.display_name
                if member.bot:
                    msg["is_bot"] = True
                if member.color and member.color.value != 0:
                    msg["author_color"] = f"#{member.color.value:06x}"
                # Override or provide accurate server display avatar
                current_av = msg.get("avatar_url", "")
                if not current_av or "embed/avatars" in current_av:
                    msg["avatar_url"] = member.display_avatar.with_format("png").with_size(128).url

        # Check for bot hint
        if "noctaly" in author_name.lower() or "bot" in author_name.lower():
            msg["is_bot"] = True

        # Resolve raw mentions in text and embeds
        msg["text"] = resolve_mentions_in_text(msg.get("text", ""), guild)
        for emb in msg.get("embeds", []):
            emb["title"] = resolve_mentions_in_text(emb.get("title", ""), guild)
            emb["desc"] = resolve_mentions_in_text(emb.get("desc", ""), guild)
            for f in emb.get("fields", []):
                f["name"] = resolve_mentions_in_text(f.get("name", ""), guild)
                f["value"] = resolve_mentions_in_text(f.get("value", ""), guild)

    # 2. Fetch avatars concurrently with caching
    avatar_cache = {}
    unique_urls = list(set([m.get("avatar_url") for m in page_msgs if m.get("avatar_url")]))
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_avatar(session, url) for url in unique_urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for url, data in zip(unique_urls, results):
            if isinstance(data, bytes):
                avatar_cache[url] = data

    # 3. Layout and measurement
    msg_layouts = []
    total_height = PADDING_Y * 2
    max_text_width = WIDTH - (PADDING_X * 2) - AVATAR_SIZE - 20
    EMBED_MAX_W = min(max_text_width, 700)

    for msg in page_msgs:
        author = msg.get("author", "Unknown")
        time_str = msg.get("time", "")
        text = msg.get("text", "")
        is_bot = msg.get("is_bot", False)
        embeds = msg.get("embeds", [])
        attachments = msg.get("attachments", [])

        # Author header measurement
        author_bbox = font_author.getbbox(author)
        author_h = author_bbox[3] - author_bbox[1]

        # Text lines measurement
        text_lines = []
        text_h = 0
        if text:
            raw_lines = text.split("\n")
            for rline in raw_lines:
                rline = rline.strip()
                if not rline:
                    continue
                is_hdr = rline.startswith("#")
                clean_rline = rline.lstrip("#").strip() if is_hdr else rline
                fnt = font_header if is_hdr else font_text
                wrapped = wrap_text(clean_rline, fnt, max_text_width)
                for wline in wrapped:
                    line_bbox = fnt.getbbox("A")
                    lh = (line_bbox[3] - line_bbox[1]) + 8
                    text_lines.append((wline, fnt, is_hdr, lh))
                    text_h += lh

        # Embeds measurement
        embed_layouts = []
        embeds_total_h = 0
        for emb in embeds:
            emb_inner_w = EMBED_MAX_W - 32
            emb_h = 16  # top & bottom padding

            # Title
            title_lines = []
            if emb.get("title"):
                wrapped = wrap_text(emb["title"], font_embed_title, emb_inner_w)
                for l in wrapped:
                    lb = font_embed_title.getbbox("A")
                    lh = (lb[3] - lb[1]) + 6
                    title_lines.append((l, lh))
                    emb_h += lh
                emb_h += 4

            # Description
            desc_lines = []
            if emb.get("desc"):
                wrapped = wrap_text(emb["desc"], font_embed_desc, emb_inner_w)
                for l in wrapped:
                    lb = font_embed_desc.getbbox("A")
                    lh = (lb[3] - lb[1]) + 6
                    desc_lines.append((l, lh))
                    emb_h += lh
                emb_h += 6

            # Fields
            field_items = []
            fields = emb.get("fields", [])
            for f in fields:
                fname = f.get("name", "")
                fval = f.get("value", "")
                inline = f.get("inline", False)
                fw = (emb_inner_w - 12) // 2 if inline else emb_inner_w

                fname_lines = wrap_text(fname, font_embed_field_name, fw)
                fval_lines = wrap_text(fval, font_embed_field_val, fw)

                fn_h = sum([(font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 4) for _ in fname_lines])
                fv_h = sum([(font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 4) for _ in fval_lines])
                total_f_h = fn_h + fv_h + 6

                field_items.append({
                    "name_lines": fname_lines,
                    "val_lines": fval_lines,
                    "inline": inline,
                    "height": total_f_h,
                    "width": fw
                })

            # Calculate fields vertical height (pair inlines)
            i = 0
            while i < len(field_items):
                item = field_items[i]
                if item["inline"] and i + 1 < len(field_items) and field_items[i + 1]["inline"]:
                    row_h = max(item["height"], field_items[i + 1]["height"])
                    emb_h += row_h
                    i += 2
                else:
                    emb_h += item["height"]
                    i += 1

            # Footer
            footer_text = emb.get("footer", "")
            footer_lines = []
            if footer_text:
                wrapped = wrap_text(footer_text, font_embed_footer, emb_inner_w)
                for l in wrapped:
                    lb = font_embed_footer.getbbox("A")
                    lh = (lb[3] - lb[1]) + 4
                    footer_lines.append((l, lh))
                    emb_h += lh
                emb_h += 4

            emb_color = parse_hex_or_rgb(emb.get("color"), (88, 101, 242))

            embed_layouts.append({
                "emb": emb,
                "color": emb_color,
                "title_lines": title_lines,
                "desc_lines": desc_lines,
                "fields": field_items,
                "footer_lines": footer_lines,
                "height": emb_h,
                "width": EMBED_MAX_W
            })
            embeds_total_h += emb_h + 10

        # Attachments measurement
        att_layouts = []
        att_total_h = 0
        for att in attachments:
            fname = att.get("filename", "Attachment")
            att_h = 36
            att_layouts.append({"filename": fname, "height": att_h})
            att_total_h += att_h + 8

        content_h = author_h + 8 + text_h + embeds_total_h + att_total_h
        msg_h = max(AVATAR_SIZE, content_h) + MSG_SPACING

        # Resolve avatar bytes
        av_bytes = avatar_cache.get(msg.get("avatar_url"))

        msg_layouts.append({
            "msg": msg,
            "author_h": author_h,
            "text_lines": text_lines,
            "embed_layouts": embed_layouts,
            "att_layouts": att_layouts,
            "height": msg_h,
            "avatar_bytes": av_bytes
        })
        total_height += msg_h

    # 4. Canvas rendering
    img = Image.new("RGBA", (WIDTH, total_height), (49, 51, 56, 255))
    draw = ImageDraw.Draw(img)

    current_y = PADDING_Y
    for layout in msg_layouts:
        msg = layout["msg"]
        author = msg.get("author", "Unknown")
        time_str = msg.get("time", "")
        is_bot = msg.get("is_bot", False)
        av_b = layout["avatar_bytes"]
        text_lines = layout["text_lines"]
        embed_layouts = layout["embed_layouts"]
        att_layouts = layout["att_layouts"]

        # Avatar drawing
        if av_b:
            try:
                av_img = Image.open(io.BytesIO(av_b)).convert("RGBA")
                av_img = av_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
                mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.ellipse((0, 0, AVATAR_SIZE - 1, AVATAR_SIZE - 1), fill=255)
                av_img.putalpha(mask)
                img.alpha_composite(av_img, (PADDING_X, current_y))
            except Exception:
                proc_av = generate_procedural_avatar(author, AVATAR_SIZE)
                img.alpha_composite(proc_av, (PADDING_X, current_y))
        else:
            proc_av = generate_procedural_avatar(author, AVATAR_SIZE)
            img.alpha_composite(proc_av, (PADDING_X, current_y))

        # Author header
        text_x = PADDING_X + AVATAR_SIZE + 18
        author_color = parse_hex_or_rgb(msg.get("author_color"), (242, 243, 245))
        draw.text((text_x, current_y), author, font=font_author, fill=(*author_color, 255))

        author_bbox = font_author.getbbox(author)
        author_w = author_bbox[2] - author_bbox[0]
        cur_header_x = text_x + author_w + 10

        # BOT Badge
        if is_bot:
            badge_text = "BOT"
            bb_box = font_bot.getbbox(badge_text)
            bb_w = bb_box[2] - bb_box[0] + 8
            bb_h = 16
            bb_y = current_y + (layout["author_h"] - bb_h) // 2 + 1
            draw.rounded_rectangle((cur_header_x, bb_y, cur_header_x + bb_w, bb_y + bb_h), radius=3, fill=(88, 101, 242, 255))
            draw.text((cur_header_x + 4, bb_y + 1), badge_text, font=font_bot, fill=(255, 255, 255, 255))
            cur_header_x += bb_w + 10

        # Timestamp
        draw.text((cur_header_x, current_y + (layout["author_h"] - 14) // 2), time_str, font=font_time, fill=(148, 155, 164, 255))

        # Message text lines
        cur_content_y = current_y + layout["author_h"] + 8
        for line_str, fnt, is_hdr, lh in text_lines:
            text_col = (242, 243, 245, 255) if is_hdr else (219, 222, 225, 255)
            draw.text((text_x, cur_content_y), line_str, font=fnt, fill=text_col)
            cur_content_y += lh

        # Embeds
        for emb_lo in embed_layouts:
            emb_w = emb_lo["width"]
            emb_h = emb_lo["height"]
            emb_col = emb_lo["color"]

            # Embed background box
            draw.rounded_rectangle((text_x, cur_content_y, text_x + emb_w, cur_content_y + emb_h), radius=4, fill=(43, 45, 49, 255))
            # Left color bar
            draw.rounded_rectangle((text_x, cur_content_y, text_x + 4, cur_content_y + emb_h), radius=2, fill=(*emb_col, 255))

            inner_x = text_x + 16
            inner_y = cur_content_y + 8

            # Embed title
            for t_line, lh in emb_lo["title_lines"]:
                draw.text((inner_x, inner_y), t_line, font=font_embed_title, fill=(242, 243, 245, 255))
                inner_y += lh
            if emb_lo["title_lines"]:
                inner_y += 4

            # Embed description
            for d_line, lh in emb_lo["desc_lines"]:
                draw.text((inner_x, inner_y), d_line, font=font_embed_desc, fill=(219, 222, 225, 255))
                inner_y += lh
            if emb_lo["desc_lines"]:
                inner_y += 6

            # Embed fields
            f_items = emb_lo["fields"]
            fi = 0
            while fi < len(f_items):
                item = f_items[fi]
                if item["inline"] and fi + 1 < len(f_items) and f_items[fi + 1]["inline"]:
                    item2 = f_items[fi + 1]
                    # Column 1
                    col1_y = inner_y
                    for nl in item["name_lines"]:
                        draw.text((inner_x, col1_y), nl, font=font_embed_field_name, fill=(242, 243, 245, 255))
                        col1_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 4
                    for vl in item["val_lines"]:
                        draw.text((inner_x, col1_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col1_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 4

                    # Column 2
                    col2_x = inner_x + item["width"] + 12
                    col2_y = inner_y
                    for nl in item2["name_lines"]:
                        draw.text((col2_x, col2_y), nl, font=font_embed_field_name, fill=(242, 243, 245, 255))
                        col2_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 4
                    for vl in item2["val_lines"]:
                        draw.text((col2_x, col2_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col2_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 4

                    inner_y += max(item["height"], item2["height"])
                    fi += 2
                else:
                    col_y = inner_y
                    for nl in item["name_lines"]:
                        draw.text((inner_x, col_y), nl, font=font_embed_field_name, fill=(242, 243, 245, 255))
                        col_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 4
                    for vl in item["val_lines"]:
                        draw.text((inner_x, col_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 4
                    inner_y += item["height"]
                    fi += 1

            # Embed footer
            for f_line, lh in emb_lo["footer_lines"]:
                draw.text((inner_x, inner_y), f_line, font=font_embed_footer, fill=(148, 155, 164, 255))
                inner_y += lh

            cur_content_y += emb_h + 10

        # Attachments
        for att_lo in att_layouts:
            att_box_w = min(max_text_width, 400)
            draw.rounded_rectangle((text_x, cur_content_y, text_x + att_box_w, cur_content_y + att_lo["height"]), radius=4, fill=(43, 45, 49, 255))
            att_title = f"📎 {att_lo['filename']}"
            draw.text((text_x + 12, cur_content_y + 9), att_title, font=font_attachment, fill=(0, 168, 252, 255))
            cur_content_y += att_lo["height"] + 8

        current_y += layout["height"]

    return img
