import discord
from discord import app_commands
from discord.ext import commands
import aiohttp
from io import BytesIO
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter
import random

class ImageFilters(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.session = aiohttp.ClientSession()

    def cog_unload(self):
        self.bot.loop.create_task(self.session.close())

    async def get_avatar_bytes(self, user: discord.Member | discord.User):
        url = user.display_avatar.replace(size=512, format="png").url
        async with self.session.get(url) as resp:
            return await resp.read()

    @commands.hybrid_command(name="jail", description="Put a user behind bars.")
    async def jail(self, ctx: commands.Context, user: discord.Member = None):
        user = user or ctx.author
        await ctx.defer()

        try:
            avatar_bytes = await self.get_avatar_bytes(user)
            avatar = Image.open(BytesIO(avatar_bytes)).convert("RGBA")
            
            import os
            jail_img_path = os.path.join(os.path.dirname(__file__), "..", "..", "Website", "frontend", "public", "img", "jailbars.png")
            if os.path.exists(jail_img_path):
                jail_overlay = Image.open(jail_img_path).convert("RGBA")
                jail_overlay = jail_overlay.resize(avatar.size)
                avatar.paste(jail_overlay, (0, 0), jail_overlay)
            else:
                # Create a jail bars overlay programmatically fallback
                jail_overlay = Image.new("RGBA", avatar.size, (0, 0, 0, 0))
                draw = ImageDraw.Draw(jail_overlay)
                width, height = avatar.size
                bar_width = width // 15
                for x in range(bar_width, width, bar_width * 3):
                    draw.rectangle([x, 0, x + bar_width, height], fill=(50, 50, 50, 200))
                
                # Horizontal bars
                draw.rectangle([0, height//3, width, height//3 + bar_width], fill=(50, 50, 50, 200))
                draw.rectangle([0, 2*height//3, width, 2*height//3 + bar_width], fill=(50, 50, 50, 200))
    
                avatar.paste(jail_overlay, (0, 0), jail_overlay)
            
            buffer = BytesIO()
            avatar.save(buffer, "PNG")
            buffer.seek(0)
            
            await ctx.send(file=discord.File(fp=buffer, filename="jail.png"))
        except Exception as e:
            await ctx.send(f"Error: {e}")

    @commands.hybrid_command(name="wasted", description="GTA Wasted effect.")
    async def wasted(self, ctx: commands.Context, user: discord.Member = None):
        user = user or ctx.author
        await ctx.defer()

        try:
            avatar_bytes = await self.get_avatar_bytes(user)
            avatar = Image.open(BytesIO(avatar_bytes)).convert("RGBA")
            
            # Grayscale and darken
            avatar = ImageOps.grayscale(avatar).convert("RGBA")
            enhancer = ImageEnhance.Brightness(avatar)
            avatar = enhancer.enhance(0.5)

            # Draw "WASTED" banner overlay
            width, height = avatar.size
            
            import os
            wasted_img_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "Assets", "fun", "wasted_text.png")
            if os.path.exists(wasted_img_path):
                overlay = Image.open(wasted_img_path).convert("RGBA")
                # Resize the overlay to fit the avatar width
                o_width, o_height = overlay.size
                new_height = int(o_height * (width / o_width))
                overlay = overlay.resize((width, new_height))
                
                # Draw a dark bar behind it
                draw = ImageDraw.Draw(avatar)
                bar_height = height // 4
                bar_y = (height - bar_height) // 2
                draw.rectangle([0, bar_y, width, bar_y + bar_height], fill=(0, 0, 0, 150))
                
                # Paste the wasted text on top
                paste_y = (height - new_height) // 2
                avatar.paste(overlay, (0, paste_y), overlay)
            else:
                draw = ImageDraw.Draw(avatar)
                banner_height = height // 4
                banner_y = (height - banner_height) // 2
                draw.rectangle([0, banner_y, width, banner_y + banner_height], fill=(0, 0, 0, 150))
                text = "W A S T E D"
                draw.text((width//2 - 40, banner_y + banner_height//2 - 10), text, fill=(255, 0, 0, 255))

            buffer = BytesIO()
            avatar.save(buffer, "PNG")
            buffer.seek(0)
            
            await ctx.send(file=discord.File(fp=buffer, filename="wasted.png"))
        except Exception as e:
            await ctx.send(f"Error: {e}")

    @commands.hybrid_command(name="triggered", description="Shaking red GIF.")
    async def triggered(self, ctx: commands.Context, user: discord.Member = None):
        user = user or ctx.author
        await ctx.defer()

        try:
            avatar_bytes = await self.get_avatar_bytes(user)
            avatar = Image.open(BytesIO(avatar_bytes)).convert("RGBA")
            
            # Apply red tint
            red_layer = Image.new("RGBA", avatar.size, (255, 0, 0, 100))
            avatar = Image.alpha_composite(avatar, red_layer)

            # Generate frames
            frames = []
            for _ in range(10):
                # Random offset
                x_offset = random.randint(-10, 10)
                y_offset = random.randint(-10, 10)
                
                # Create a blank image to paste the shifted avatar
                frame = Image.new("RGBA", avatar.size, (0, 0, 0, 255))
                frame.paste(avatar, (x_offset, y_offset), avatar)
                frames.append(frame.convert("RGB"))

            buffer = BytesIO()
            frames[0].save(buffer, format="GIF", save_all=True, append_images=frames[1:], duration=20, loop=0)
            buffer.seek(0)
            
            await ctx.send(file=discord.File(fp=buffer, filename="triggered.gif"))
        except Exception as e:
            await ctx.send(f"Error: {e}")

    @commands.hybrid_command(name="rip", description="Put a user on a tombstone.")
    async def rip(self, ctx: commands.Context, user: discord.Member = None):
        user = user or ctx.author
        await ctx.defer()

        try:
            avatar_bytes = await self.get_avatar_bytes(user)
            avatar = Image.open(BytesIO(avatar_bytes)).convert("RGBA")
            
            # Grayscale the avatar
            avatar = ImageOps.grayscale(avatar).convert("RGBA")
            
            import os
            rip_img_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "Assets", "fun", "rip_tombstone.png")
            if os.path.exists(rip_img_path):
                tombstone = Image.open(rip_img_path).convert("RGBA")
                # Resize avatar to fit under RIP
                av_size = 200
                avatar = avatar.resize((av_size, av_size))
                # Paste avatar centered, below the RIP text
                # tombstone is 500x602. Center x is 250.
                paste_x = (500 - av_size) // 2
                paste_y = 300
                tombstone.paste(avatar, (paste_x, paste_y), avatar)
            else:
                width, height = avatar.size
                tombstone = Image.new("RGBA", (width + 40, height + 80), (0, 0, 0, 0))
                draw = ImageDraw.Draw(tombstone)
                draw.rounded_rectangle([0, 0, width + 40, height + 80], radius=40, fill=(100, 100, 100, 255))
                draw.text(((width + 40)//2 - 15, 10), "R.I.P", fill=(0, 0, 0, 255))
                tombstone.paste(avatar, (20, 40), avatar)

            buffer = BytesIO()
            tombstone.save(buffer, "PNG")
            buffer.seek(0)
            
            await ctx.send(file=discord.File(fp=buffer, filename="rip.png"))
        except Exception as e:
            await ctx.send(f"Error: {e}")

async def setup(bot: commands.Bot):
    await bot.add_cog(ImageFilters(bot))
