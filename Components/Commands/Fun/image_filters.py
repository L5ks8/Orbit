import os
import io
import math
import random
from typing import Optional, Literal
from io import BytesIO

import aiohttp
import discord
from discord import app_commands
from discord.ext import commands
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter, ImageFont

from Components.Commands._utils import make_embed, InteractionContext, ORBIT_COLOR
from Components.emojis import Emojis


def _get_font(size: int) -> ImageFont.ImageFont:
    """Finds an available system font or falls back to default."""
    font_candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "C:\\Windows\\Fonts\\impact.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
    ]
    for p in font_candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    """Wraps text into multiple lines so it doesn't overflow max_width."""
    words = text.split()
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(" ".join(current_line))
            current_line = [word]
    if current_line:
        lines.append(" ".join(current_line))
    return lines or [text]


def _draw_outlined_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.ImageFont,
    text_color=(255, 255, 255, 255),
    outline_color=(0, 0, 0, 255),
    outline_width: int = 2
):
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline_color)
    draw.text((x, y), text, font=font, fill=text_color)


class ImageFilters(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.session = aiohttp.ClientSession()

    def cog_unload(self):
        self.bot.loop.create_task(self.session.close())

    async def get_avatar_bytes(self, user: discord.Member | discord.User) -> bytes:
        url = user.display_avatar.replace(size=512, format="png").url
        async with self.session.get(url) as resp:
            return await resp.read()

    async def get_target_image_bytes(
        self,
        ctx: InteractionContext,
        image: Optional[discord.Attachment] = None,
        user: Optional[discord.Member] = None
    ) -> bytes:
        if image:
            return await image.read()
        target = user or ctx.author
        return await self.get_avatar_bytes(target)

    # ── Classic Avatar Overlays ──────────────────────────────────────────────

    @app_commands.command(name="jail", description="Put a user or image behind bars.")
    async def jail(self, interaction: discord.Interaction, user: discord.Member = None, image: discord.Attachment = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            avatar = Image.open(BytesIO(raw_bytes)).convert("RGBA")
            width, height = avatar.size

            jail_img_path = os.path.join(os.path.dirname(__file__), "..", "..", "Website", "static", "img", "jailbars.png")
            if not os.path.exists(jail_img_path):
                jail_img_path = os.path.join(os.path.dirname(__file__), "..", "..", "Website", "frontend", "public", "img", "jailbars.png")
            if os.path.exists(jail_img_path):
                jail_overlay = Image.open(jail_img_path).convert("RGBA").resize((width, height))
                avatar.paste(jail_overlay, (0, 0), jail_overlay)
            else:
                jail_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
                draw = ImageDraw.Draw(jail_overlay)
                bar_width = max(4, width // 15)
                for x in range(bar_width, width, bar_width * 3):
                    draw.rectangle([x, 0, x + bar_width, height], fill=(50, 50, 50, 210))
                draw.rectangle([0, height // 3, width, height // 3 + bar_width], fill=(50, 50, 50, 210))
                draw.rectangle([0, 2 * height // 3, width, 2 * height // 3 + bar_width], fill=(50, 50, 50, 210))
                avatar.paste(jail_overlay, (0, 0), jail_overlay)

            buffer = BytesIO()
            avatar.save(buffer, "PNG")
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="jail.png"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error: {e}", discord.Color.red()))

    @app_commands.command(name="wasted", description="GTA Wasted effect.")
    async def wasted(self, interaction: discord.Interaction, user: discord.Member = None, image: discord.Attachment = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            avatar = Image.open(BytesIO(raw_bytes)).convert("RGBA")
            avatar = ImageOps.grayscale(avatar).convert("RGBA")
            enhancer = ImageEnhance.Brightness(avatar)
            avatar = enhancer.enhance(0.5)

            width, height = avatar.size
            draw = ImageDraw.Draw(avatar)
            banner_height = max(40, height // 4)
            banner_y = (height - banner_height) // 2
            draw.rectangle([0, banner_y, width, banner_y + banner_height], fill=(0, 0, 0, 160))

            font = _get_font(max(24, banner_height // 2))
            text = "W A S T E D"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_x = (width - (bbox[2] - bbox[0])) // 2
            text_y = banner_y + (banner_height - (bbox[3] - bbox[1])) // 2
            _draw_outlined_text(draw, text, text_x, text_y, font, text_color=(255, 30, 30, 255), outline_color=(0, 0, 0, 255), outline_width=2)

            buffer = BytesIO()
            avatar.save(buffer, "PNG")
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="wasted.png"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error: {e}", discord.Color.red()))

    @app_commands.command(name="triggered", description="Shaking red triggered GIF.")
    async def triggered(self, interaction: discord.Interaction, user: discord.Member = None, image: discord.Attachment = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            avatar = Image.open(BytesIO(raw_bytes)).convert("RGBA")
            avatar = avatar.resize((320, 320))

            red_layer = Image.new("RGBA", avatar.size, (255, 0, 0, 90))
            avatar = Image.alpha_composite(avatar, red_layer)

            frames = []
            for _ in range(12):
                x_offset = random.randint(-12, 12)
                y_offset = random.randint(-12, 12)
                frame = Image.new("RGBA", (320, 320), (0, 0, 0, 255))
                frame.paste(avatar, (x_offset, y_offset), avatar)
                frames.append(frame.convert("RGB"))

            buffer = BytesIO()
            frames[0].save(buffer, format="GIF", save_all=True, append_images=frames[1:], duration=30, loop=0)
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="triggered.gif"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error: {e}", discord.Color.red()))

    @app_commands.command(name="rip", description="Put an avatar or image on a tombstone.")
    async def rip(self, interaction: discord.Interaction, user: discord.Member = None, image: discord.Attachment = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            avatar = Image.open(BytesIO(raw_bytes)).convert("RGBA")
            avatar = ImageOps.grayscale(avatar).convert("RGBA")

            width, height = avatar.size
            tombstone = Image.new("RGBA", (width + 60, height + 90), (0, 0, 0, 0))
            draw = ImageDraw.Draw(tombstone)
            draw.rounded_rectangle([0, 0, width + 60, height + 90], radius=40, fill=(90, 90, 90, 255))
            font = _get_font(24)
            draw.text(((width + 60) // 2 - 25, 12), "R. I. P.", font=font, fill=(0, 0, 0, 255))
            tombstone.paste(avatar, (30, 48), avatar)

            buffer = BytesIO()
            tombstone.save(buffer, "PNG")
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="rip.png"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error generating image: {e}", discord.Color.red()))

    # ── Creative Meme Generator ──────────────────────────────────────────────

    @app_commands.command(name="meme", description="Generate a classic meme with custom top and bottom text.")
    @app_commands.describe(
        top_text="Text displayed at the top of the meme",
        bottom_text="Optional text displayed at the bottom",
        image="Optional: Upload an image to use",
        user="Optional: Target user whose avatar to use"
    )
    async def meme(
        self,
        interaction: discord.Interaction,
        top_text: str,
        bottom_text: Optional[str] = None,
        image: Optional[discord.Attachment] = None,
        user: Optional[discord.Member] = None
    ):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            img = Image.open(BytesIO(raw_bytes)).convert("RGBA")
            
            # Constrain size for crisp text rendering
            max_size = 900
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size))

            width, height = img.size
            draw = ImageDraw.Draw(img)

            # Determine dynamic font size based on image width
            font_size = max(24, int(width / 11))
            font = _get_font(font_size)
            max_line_width = int(width * 0.92)
            outline_width = max(2, int(font_size / 14))

            # Render Top Text
            top_lines = _wrap_text(draw, top_text.upper(), font, max_line_width)
            line_height = int(font_size * 1.15)
            y_start = 12
            for i, line in enumerate(top_lines):
                bbox = draw.textbbox((0, 0), line, font=font)
                x = (width - (bbox[2] - bbox[0])) // 2
                _draw_outlined_text(draw, line, x, y_start + (i * line_height), font, outline_width=outline_width)

            # Render Bottom Text
            if bottom_text:
                bot_lines = _wrap_text(draw, bottom_text.upper(), font, max_line_width)
                total_bot_h = len(bot_lines) * line_height
                y_start_bot = height - total_bot_h - 16
                for i, line in enumerate(bot_lines):
                    bbox = draw.textbbox((0, 0), line, font=font)
                    x = (width - (bbox[2] - bbox[0])) // 2
                    _draw_outlined_text(draw, line, x, y_start_bot + (i * line_height), font, outline_width=outline_width)

            buffer = BytesIO()
            img.save(buffer, "PNG")
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="meme.png"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Failed to generate meme: {e}", discord.Color.red()))

    # ── Creative Image Effects & Editing ─────────────────────────────────────

    @app_commands.command(name="editimage", description="Apply artistic and creative effects to an image or avatar.")
    @app_commands.describe(
        effect="The visual effect to apply",
        image="Optional: The image to edit",
        user="Optional: User whose avatar to edit"
    )
    @app_commands.choices(effect=[
        app_commands.Choice(name="Deepfry (Extreme saturation, high contrast & meme look)", value="deepfry"),
        app_commands.Choice(name="Grayscale (Clean Black & White)", value="grayscale"),
        app_commands.Choice(name="Pixelate (Retro 8-Bit Pixel Art)", value="pixelate"),
        app_commands.Choice(name="Invert (Negative Colors)", value="invert"),
        app_commands.Choice(name="Blur (Soft aesthetic focus)", value="blur"),
        app_commands.Choice(name="Sepia (Warm vintage nostalgia)", value="sepia"),
        app_commands.Choice(name="Mirror (Horizontal reflection)", value="mirror"),
        app_commands.Choice(name="Sketch (Pencil outline contour)", value="sketch"),
    ])
    async def editimage(
        self,
        interaction: discord.Interaction,
        effect: str,
        image: Optional[discord.Attachment] = None,
        user: Optional[discord.Member] = None
    ):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            im = Image.open(BytesIO(raw_bytes)).convert("RGB")

            # Apply selected effect
            if effect == "grayscale":
                result = ImageOps.grayscale(im).convert("RGB")

            elif effect == "invert":
                result = ImageOps.invert(im)

            elif effect == "blur":
                result = im.filter(ImageFilter.GaussianBlur(radius=6))

            elif effect == "deepfry":
                # High saturation + sharpness + contrast + yellow/red noise
                color_boost = ImageEnhance.Color(im).enhance(3.5)
                contrast_boost = ImageEnhance.Contrast(color_boost).enhance(3.0)
                sharp = contrast_boost.filter(ImageFilter.SHARPEN).filter(ImageFilter.SHARPEN)
                result = sharp

            elif effect == "pixelate":
                # Downscale to 12% and upscale with nearest neighbor
                w, h = im.size
                small = im.resize((max(16, w // 8), max(16, h // 8)), resample=Image.NEAREST)
                result = small.resize((w, h), resample=Image.NEAREST)

            elif effect == "sepia":
                gray = ImageOps.grayscale(im)
                result = ImageOps.colorize(gray, black="#2e1d0c", white="#ffd79e").convert("RGB")

            elif effect == "mirror":
                result = ImageOps.mirror(im)

            elif effect == "sketch":
                contour = im.filter(ImageFilter.CONTOUR)
                result = ImageOps.grayscale(contour).convert("RGB")

            else:
                result = im

            buffer = BytesIO()
            result.save(buffer, "JPEG", quality=90)
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename=f"{effect}.jpg"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Failed to edit image: {e}", discord.Color.red()))

    # ── Top-Caption Meme Card ────────────────────────────────────────────────

    @app_commands.command(name="caption", description="Add a modern white caption bar with black text above an image.")
    @app_commands.describe(
        caption="Text to place on the caption card",
        image="Optional: Image to caption",
        user="Optional: User avatar to caption"
    )
    async def caption(
        self,
        interaction: discord.Interaction,
        caption: str,
        image: Optional[discord.Attachment] = None,
        user: Optional[discord.Member] = None
    ):
        ctx = InteractionContext(interaction)
        await ctx.defer()

        try:
            raw_bytes = await self.get_target_image_bytes(ctx, image=image, user=user)
            im = Image.open(BytesIO(raw_bytes)).convert("RGB")
            w, h = im.size

            font_size = max(20, int(w / 14))
            font = _get_font(font_size)

            temp_draw = ImageDraw.Draw(im)
            lines = _wrap_text(temp_draw, caption, font, int(w * 0.92))
            line_height = int(font_size * 1.3)
            caption_h = (len(lines) * line_height) + 32

            # Create new image with white header
            card = Image.new("RGB", (w, h + caption_h), (255, 255, 255))
            card.paste(im, (0, caption_h))

            draw = ImageDraw.Draw(card)
            y_curr = 16
            for line in lines:
                bbox = draw.textbbox((0, 0), line, font=font)
                x = (w - (bbox[2] - bbox[0])) // 2
                draw.text((x, y_curr), line, font=font, fill=(0, 0, 0))
                y_curr += line_height

            buffer = BytesIO()
            card.save(buffer, "JPEG", quality=90)
            buffer.seek(0)
            await ctx.send(file=discord.File(fp=buffer, filename="caption.jpg"))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Failed to caption image: {e}", discord.Color.red()))


async def setup(bot: commands.Bot):
    await bot.add_cog(ImageFilters(bot))
