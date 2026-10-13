import io
import os
import re
import html
import asyncio
import aiohttp
from datetime import datetime, timezone
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
    elif "background-color:" in s:
        m = re.search(r'background-color:\s*([^;]+)', s)
        if m:
            s = m.group(1).strip()
    elif "color:" in s:
        m = re.search(r'color:\s*([^;]+)', s)
        if m:
            s = m.group(1).strip()

    # Match rgb(r, g, b)
    m_rgb = re.search(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', s)
    if m_rgb:
        try:
            return (int(m_rgb.group(1)), int(m_rgb.group(2)), int(m_rgb.group(3)))
        except Exception:
            pass

    if s.startswith("#"):
        s = s[1:]
        if len(s) == 3:
            s = "".join(c * 2 for c in s)
        if len(s) >= 6:
            try:
                return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))
            except Exception:
                pass
    return default

class TranscriptHTMLParser(HTMLParser):
    """Robust HTML parser supporting Orbit transcripts, discord-html-transcripts, and generic HTML formats."""
    def __init__(self):
        super().__init__()
        self.messages = []
        self._current_msg = None
        self._current_embed = None
        self._current_field = None
        self._tag_stack = []  # list of dict: {"tag": str, "role": str, "buffer": list}

    def _get_active_buffer(self):
        for item in reversed(self._tag_stack):
            if item.get("role") and item.get("buffer") is not None:
                return item["buffer"]
        return None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        classes_str = attrs_dict.get("class", "")
        classes = set(classes_str.split())

        tag_lower = tag.lower()
        role = None
        buffer = None

        # Message Container
        if tag_lower == "div" and any(c in classes for c in [
            "message", "chatlog__message-group", "chatlog__message", "discord-message"
        ]):
            if self._current_msg:
                self.messages.append(self._current_msg)
            self._current_msg = {
                "author": "Unknown",
                "author_id": attrs_dict.get("data-author-id") or attrs_dict.get("data-user-id") or "",
                "author_color": attrs_dict.get("data-author-color") or "",
                "is_bot": attrs_dict.get("data-is-bot", "").lower() == "true",
                "avatar_url": "",
                "time": "",
                "text": "",
                "embeds": [],
                "attachments": []
            }
            role = "message"

        # Avatar Image or Container
        elif tag_lower == "img" and any(c in classes for c in [
            "avatar", "chatlog__author-avatar", "chatlog__avatar", "discord-author-avatar"
        ]):
            if self._current_msg:
                self._current_msg["avatar_url"] = attrs_dict.get("src", "")
        elif any(c in classes for c in [
            "avatar", "chatlog__author-avatar-container", "chatlog__avatar-container"
        ]):
            role = "avatar"
        elif tag_lower == "img" and any(item.get("role") == "avatar" for item in self._tag_stack):
            if self._current_msg:
                self._current_msg["avatar_url"] = attrs_dict.get("src", "")

        # Author Name
        elif any(c in classes for c in [
            "msg-author", "chatlog__author-name", "discord-author-name"
        ]):
            role = "author"
            buffer = []
            style = attrs_dict.get("style", "")
            if "color:" in style and self._current_msg:
                self._current_msg["author_color"] = style

        # Bot Badge
        elif any(c in classes for c in [
            "bot-badge", "chatlog__bot-tag", "chatlog__bot-tag--verified", "discord-bot-tag"
        ]):
            if self._current_msg:
                self._current_msg["is_bot"] = True

        # Timestamp
        elif any(c in classes for c in [
            "msg-time", "chatlog__timestamp", "discord-timestamp"
        ]) or tag_lower == "time":
            role = "time"
            buffer = []

        # Message Text
        elif any(c in classes for c in [
            "msg-text", "chatlog__content", "chatlog__markdown", "discord-message-body"
        ]):
            role = "text"
            buffer = []

        # Embed Container
        elif any(c in classes for c in [
            "embed", "chatlog__embed", "discord-embed"
        ]):
            color_src = (
                attrs_dict.get("data-color")
                or attrs_dict.get("style", "")
                or attrs_dict.get("data-embed-color", "")
            )
            color_rgb = parse_hex_or_rgb(color_src, (88, 101, 242))
            self._current_embed = {
                "color": color_rgb,
                "author": "",
                "author_icon_url": "",
                "title": "",
                "desc": "",
                "fields": [],
                "footer": "",
                "footer_icon_url": "",
                "thumbnail_url": "",
                "image_url": ""
            }
            role = "embed"

        # Inside Embed Elements
        elif self._current_embed:
            if any(c in classes for c in ["embed-author", "chatlog__embed-author"]):
                role = "embed-author"
                buffer = []
            elif any(c in classes for c in ["embed-title", "chatlog__embed-title"]):
                role = "embed-title"
                buffer = []
            elif any(c in classes for c in ["embed-desc", "embed-description", "chatlog__embed-description"]):
                role = "embed-desc"
                buffer = []
            elif any(c in classes for c in ["embed-field", "chatlog__embed-field"]):
                is_inline = any("inline" in c for c in classes)
                self._current_field = {"name": "", "value": "", "inline": is_inline}
                role = "embed-field"
            elif any(c in classes for c in ["embed-field-name", "chatlog__embed-field-name"]):
                role = "field-name"
                buffer = []
            elif any(c in classes for c in ["embed-field-value", "chatlog__embed-field-value"]):
                role = "field-value"
                buffer = []
            elif any(c in classes for c in ["embed-footer", "chatlog__embed-footer"]):
                role = "embed-footer"
                buffer = []
            elif tag_lower == "img" and any("thumbnail" in c for c in classes):
                self._current_embed["thumbnail_url"] = attrs_dict.get("src", "")
            elif tag_lower == "img" and any("image" in c for c in classes):
                self._current_embed["image_url"] = attrs_dict.get("src", "")
            elif tag_lower == "img" and any("author" in c for c in classes):
                self._current_embed["author_icon_url"] = attrs_dict.get("src", "")
            elif tag_lower == "img" and any("footer" in c for c in classes):
                self._current_embed["footer_icon_url"] = attrs_dict.get("src", "")
            elif any(c in classes for c in ["chatlog__embed-color-pill"]):
                # Extract color from style
                pill_style = attrs_dict.get("style", "")
                self._current_embed["color"] = parse_hex_or_rgb(pill_style, self._current_embed["color"])

        # Attachments
        elif any(c in classes for c in ["attachment", "chatlog__attachment"]):
            role = "attachment"
        elif tag_lower == "img" and any(item.get("role") == "attachment" for item in self._tag_stack):
            if self._current_msg:
                self._current_msg["attachments"].append({
                    "url": attrs_dict.get("src", ""),
                    "is_image": True,
                    "filename": attrs_dict.get("alt", "image.png")
                })
        elif tag_lower == "a" and any(item.get("role") == "attachment" for item in self._tag_stack):
            role = "attachment-link"
            buffer = []
            self._attachment_href = attrs_dict.get("href", "")

        # Line breaks
        if tag_lower in ["br", "hr"]:
            buf = self._get_active_buffer()
            if buf is not None:
                buf.append("\n")

        self._tag_stack.append({"tag": tag_lower, "role": role, "buffer": buffer})

    def handle_endtag(self, tag):
        tag_lower = tag.lower()

        # Find matching tag from stack
        match_idx = -1
        for idx in range(len(self._tag_stack) - 1, -1, -1):
            if self._tag_stack[idx]["tag"] == tag_lower:
                match_idx = idx
                break

        if match_idx == -1:
            return

        # Pop all tags down to matched tag
        popped_items = self._tag_stack[match_idx:]
        self._tag_stack = self._tag_stack[:match_idx]

        for item in reversed(popped_items):
            role = item.get("role")
            buf = item.get("buffer")
            text_val = "".join(buf).strip() if buf is not None else ""

            if role == "message":
                if self._current_msg:
                    self.messages.append(self._current_msg)
                    self._current_msg = None
            elif role == "author":
                if self._current_msg and text_val:
                    self._current_msg["author"] = text_val
            elif role == "time":
                if self._current_msg and text_val:
                    self._current_msg["time"] = text_val
            elif role == "text":
                if self._current_msg and text_val:
                    self._current_msg["text"] = text_val
            elif role == "embed-author":
                if self._current_embed and text_val:
                    self._current_embed["author"] = text_val
            elif role == "embed-title":
                if self._current_embed and text_val:
                    self._current_embed["title"] = text_val
            elif role == "embed-desc":
                if self._current_embed and text_val:
                    self._current_embed["desc"] = text_val
            elif role == "field-name":
                if self._current_field:
                    self._current_field["name"] = text_val
            elif role == "field-value":
                if self._current_field:
                    self._current_field["value"] = text_val
            elif role == "embed-field":
                if self._current_field and self._current_embed:
                    if self._current_field.get("name") or self._current_field.get("value"):
                        self._current_embed["fields"].append(self._current_field)
                    self._current_field = None
            elif role == "embed-footer":
                if self._current_embed and text_val:
                    self._current_embed["footer"] = text_val
            elif role == "embed":
                if self._current_embed and self._current_msg:
                    self._current_msg["embeds"].append(self._current_embed)
                    self._current_embed = None
            elif role == "attachment-link":
                if self._current_msg and text_val:
                    self._current_msg["attachments"].append({
                        "url": getattr(self, "_attachment_href", ""),
                        "is_image": False,
                        "filename": text_val
                    })

    def handle_data(self, data):
        buf = self._get_active_buffer()
        if buf is not None:
            buf.append(data)

    def handle_entityref(self, name):
        self.handle_data(html.unescape(f"&{name};"))

    def handle_charref(self, name):
        self.handle_data(html.unescape(f"&#{name};"))


def parse_transcript(html_content: str):
    parser = TranscriptHTMLParser()
    parser.feed(html_content)
    if parser._current_msg and (parser._current_msg.get("author") or parser._current_msg.get("text") or parser._current_msg.get("embeds")):
        parser.messages.append(parser._current_msg)
    return parser.messages


def normalize_avatar_url(url: str) -> str:
    if not url:
        return ""
    if "cdn.discordapp.com" in url:
        if ".webp" in url:
            url = url.replace(".webp", ".png")
        if "size=" not in url:
            sep = "&" if "?" in url else "?"
            url += f"{sep}size=128"
    return url


async def fetch_avatar_bytes(session, url: str) -> bytes:
    if not url:
        return None
    url = normalize_avatar_url(url)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
    try:
        async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=8)) as resp:
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


async def generate_transcript_image(messages, page: int, per_page: int = 50, guild=None, bot=None):
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
    font_embed_author = _get_font(14, bold=True)
    font_embed_title = _get_font(17, bold=True)
    font_embed_desc = _get_font(15, bold=False)
    font_embed_field_name = _get_font(14, bold=True)
    font_embed_field_val = _get_font(14, bold=False)
    font_embed_footer = _get_font(12, bold=False)
    font_attachment = _get_font(14, bold=False)

    # 1. Resolve members & profile data using Discord API directly
    user_avatar_cache = {}  # str(user_id) -> bytes
    url_avatar_cache = {}   # url -> bytes

    for msg in page_msgs:
        author_id = msg.get("author_id", "")
        author_name = msg.get("author", "Unknown")

        member = None
        if author_id and author_id.isdigit():
            uid = int(author_id)
            if guild:
                member = guild.get_member(uid)
            if not member and bot:
                member = bot.get_user(uid)
            if not member and bot:
                try:
                    member = await bot.fetch_user(uid)
                except Exception:
                    pass

        if not member and guild:
            for m in guild.members:
                if m.display_name == author_name or m.name == author_name:
                    member = m
                    break

        if member:
            msg["author"] = getattr(member, "display_name", member.name)
            if getattr(member, "bot", False):
                msg["is_bot"] = True
            if hasattr(member, "color") and member.color and member.color.value != 0:
                msg["author_color"] = f"#{member.color.value:06x}"

            # Fetch avatar directly from Discord Asset with proper size
            s_uid = str(member.id)
            if s_uid not in user_avatar_cache:
                try:
                    av_data = await member.display_avatar.with_format("png").with_size(128).read()
                    user_avatar_cache[s_uid] = av_data
                except Exception:
                    pass
            if s_uid in user_avatar_cache:
                msg["avatar_bytes"] = user_avatar_cache[s_uid]

        # Check for bot hints
        if "noctaly" in author_name.lower() or "bot" in author_name.lower():
            msg["is_bot"] = True

        # Resolve raw mentions
        msg["text"] = resolve_mentions_in_text(msg.get("text", ""), guild)
        for emb in msg.get("embeds", []):
            emb["title"] = resolve_mentions_in_text(emb.get("title", ""), guild)
            emb["desc"] = resolve_mentions_in_text(emb.get("desc", ""), guild)
            emb["author"] = resolve_mentions_in_text(emb.get("author", ""), guild)
            emb["footer"] = resolve_mentions_in_text(emb.get("footer", ""), guild)
            for f in emb.get("fields", []):
                f["name"] = resolve_mentions_in_text(f.get("name", ""), guild)
                f["value"] = resolve_mentions_in_text(f.get("value", ""), guild)

    # 2. Fetch missing avatars via HTTP session concurrently
    needed_urls = set()
    for m in page_msgs:
        if not m.get("avatar_bytes") and m.get("avatar_url"):
            needed_urls.add(m["avatar_url"])

    if needed_urls:
        async with aiohttp.ClientSession() as session:
            tasks = [fetch_avatar_bytes(session, url) for url in needed_urls]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for url, data in zip(needed_urls, results):
                if isinstance(data, bytes) and len(data) > 0:
                    url_avatar_cache[url] = data

    # 3. Layout measurement
    msg_layouts = []
    total_height = PADDING_Y * 2
    max_text_width = WIDTH - (PADDING_X * 2) - AVATAR_SIZE - 20
    EMBED_MAX_W = min(max_text_width, 740)

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
            emb_h = 24  # top & bottom padding

            # Author
            emb_author_lines = []
            if emb.get("author"):
                wrapped_auth = wrap_text(emb["author"], font_embed_author, emb_inner_w)
                for l in wrapped_auth:
                    lb = font_embed_author.getbbox("A")
                    lh = (lb[3] - lb[1]) + 6
                    emb_author_lines.append((l, lh))
                    emb_h += lh
                emb_h += 4

            # Title
            title_lines = []
            if emb.get("title"):
                wrapped = wrap_text(emb["title"], font_embed_title, emb_inner_w)
                for l in wrapped:
                    lb = font_embed_title.getbbox("A")
                    lh = (lb[3] - lb[1]) + 6
                    title_lines.append((l, lh))
                    emb_h += lh
                emb_h += 6

            # Description
            desc_lines = []
            if emb.get("desc"):
                wrapped = wrap_text(emb["desc"], font_embed_desc, emb_inner_w)
                for l in wrapped:
                    lb = font_embed_desc.getbbox("A")
                    lh = (lb[3] - lb[1]) + 6
                    desc_lines.append((l, lh))
                    emb_h += lh
                emb_h += 8

            # Fields
            field_items = []
            fields = emb.get("fields", [])
            for f in fields:
                fname = f.get("name", "")
                fval = f.get("value", "")
                inline = f.get("inline", False)
                fw = (emb_inner_w - 16) // 2 if inline else emb_inner_w

                fname_lines = wrap_text(fname, font_embed_field_name, fw)
                fval_lines = wrap_text(fval, font_embed_field_val, fw)

                fn_h = sum([(font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 5) for _ in fname_lines])
                fv_h = sum([(font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 5) for _ in fval_lines])
                total_f_h = fn_h + fv_h + 8

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
                wrapped_foot = wrap_text(footer_text, font_embed_footer, emb_inner_w)
                for l in wrapped_foot:
                    lb = font_embed_footer.getbbox("A")
                    lh = (lb[3] - lb[1]) + 4
                    footer_lines.append((l, lh))
                    emb_h += lh
                emb_h += 4

            emb_color = parse_hex_or_rgb(emb.get("color"), (88, 101, 242))

            embed_layouts.append({
                "emb": emb,
                "color": emb_color,
                "author_lines": emb_author_lines,
                "title_lines": title_lines,
                "desc_lines": desc_lines,
                "fields": field_items,
                "footer_lines": footer_lines,
                "height": emb_h,
                "width": EMBED_MAX_W
            })
            embeds_total_h += emb_h + 12

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
        av_bytes = msg.get("avatar_bytes")
        if not av_bytes and msg.get("author_id"):
            av_bytes = user_avatar_cache.get(str(msg.get("author_id")))
        if not av_bytes and msg.get("avatar_url"):
            av_bytes = url_avatar_cache.get(msg.get("avatar_url"))

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

        # Avatar drawing (Real avatar or anti-aliased procedural avatar)
        avatar_drawn = False
        if av_b:
            try:
                av_img = Image.open(io.BytesIO(av_b)).convert("RGBA")
                av_img = av_img.resize((AVATAR_SIZE, AVATAR_SIZE), Image.Resampling.LANCZOS)
                mask = Image.new("L", (AVATAR_SIZE, AVATAR_SIZE), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.ellipse((0, 0, AVATAR_SIZE - 1, AVATAR_SIZE - 1), fill=255)
                av_img.putalpha(mask)
                img.alpha_composite(av_img, (PADDING_X, current_y))
                avatar_drawn = True
            except Exception:
                pass

        if not avatar_drawn:
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
            # Left color border
            draw.rounded_rectangle((text_x, cur_content_y, text_x + 4, cur_content_y + emb_h), radius=2, fill=(*emb_col, 255))

            inner_x = text_x + 16
            inner_y = cur_content_y + 10

            # Embed author
            for a_line, lh in emb_lo["author_lines"]:
                draw.text((inner_x, inner_y), a_line, font=font_embed_author, fill=(242, 243, 245, 255))
                inner_y += lh
            if emb_lo["author_lines"]:
                inner_y += 4

            # Embed title
            for t_line, lh in emb_lo["title_lines"]:
                draw.text((inner_x, inner_y), t_line, font=font_embed_title, fill=(242, 243, 245, 255))
                inner_y += lh
            if emb_lo["title_lines"]:
                inner_y += 6

            # Embed description
            for d_line, lh in emb_lo["desc_lines"]:
                draw.text((inner_x, inner_y), d_line, font=font_embed_desc, fill=(219, 222, 225, 255))
                inner_y += lh
            if emb_lo["desc_lines"]:
                inner_y += 8

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
                        col1_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 5
                    for vl in item["val_lines"]:
                        draw.text((inner_x, col1_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col1_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 5

                    # Column 2
                    col2_x = inner_x + item["width"] + 16
                    col2_y = inner_y
                    for nl in item2["name_lines"]:
                        draw.text((col2_x, col2_y), nl, font=font_embed_field_name, fill=(242, 243, 245, 255))
                        col2_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 5
                    for vl in item2["val_lines"]:
                        draw.text((col2_x, col2_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col2_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 5

                    inner_y += max(item["height"], item2["height"])
                    fi += 2
                else:
                    col_y = inner_y
                    for nl in item["name_lines"]:
                        draw.text((inner_x, col_y), nl, font=font_embed_field_name, fill=(242, 243, 245, 255))
                        col_y += font_embed_field_name.getbbox("A")[3] - font_embed_field_name.getbbox("A")[1] + 5
                    for vl in item["val_lines"]:
                        draw.text((inner_x, col_y), vl, font=font_embed_field_val, fill=(219, 222, 225, 255))
                        col_y += font_embed_field_val.getbbox("A")[3] - font_embed_field_val.getbbox("A")[1] + 5
                    inner_y += item["height"]
                    fi += 1

            # Embed footer
            for f_line, lh in emb_lo["footer_lines"]:
                draw.text((inner_x, inner_y), f_line, font=font_embed_footer, fill=(148, 155, 164, 255))
                inner_y += lh

            cur_content_y += emb_h + 12

        # Attachments
        for att_lo in att_layouts:
            fname = att_lo["filename"]
            att_h = att_lo["height"]
            draw.rounded_rectangle((text_x, cur_content_y, text_x + 360, cur_content_y + att_h), radius=4, fill=(43, 45, 49, 255))
            draw.text((text_x + 12, cur_content_y + 8), f"📎 {fname}", font=font_attachment, fill=(0, 168, 252, 255))
            cur_content_y += att_h + 8

        current_y += layout["height"]

    return img
