import discord
from discord.ext import commands

class Snipe(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        # Snipes are stored in RAM: dict mapping channel_id to a list of messages or a single message
        self.deleted_messages = {}
        self.edited_messages = {}

    @commands.Cog.listener()
    async def on_message_delete(self, message: discord.Message):
        if message.author.bot:
            return
        
        # Store the last deleted message for the channel
        self.deleted_messages[message.channel.id] = {
            "content": message.content,
            "author": message.author,
            "created_at": message.created_at,
            "attachments": [att.url for att in message.attachments]
        }

    @commands.Cog.listener()
    async def on_message_edit(self, before: discord.Message, after: discord.Message):
        if before.author.bot:
            return
        if before.content == after.content:
            return
        
        self.edited_messages[before.channel.id] = {
            "before_content": before.content,
            "after_content": after.content,
            "author": before.author,
            "created_at": discord.utils.utcnow()
        }

    @commands.hybrid_command(name="snipe", description="Shows the last deleted message in this channel.")
    async def snipe(self, ctx: commands.Context):
        data = self.deleted_messages.get(ctx.channel.id)
        if not data:
            return await ctx.send(embed=discord.Embed(description="No deleted messages found.", color=discord.Color.red()), ephemeral=True)

        embed = discord.Embed(description=data["content"] or "*No text*", color=0x2B2D31, timestamp=data["created_at"])
        embed.set_author(name=data["author"], icon_url=data["author"].display_avatar.url)
        embed.set_footer(text="Sniped")
        
        if data["attachments"]:
            embed.set_image(url=data["attachments"][0])

        await ctx.send(embed=embed)

    @commands.hybrid_command(name="editsnipe", description="Shows the original version of the last edited message.")
    async def editsnipe(self, ctx: commands.Context):
        data = self.edited_messages.get(ctx.channel.id)
        if not data:
            return await ctx.send(embed=discord.Embed(description="No edited messages found.", color=discord.Color.red()), ephemeral=True)

        embed = discord.Embed(color=0x2B2D31, timestamp=data["created_at"])
        embed.set_author(name=data["author"], icon_url=data["author"].display_avatar.url)
        embed.add_field(name="Before", value=data["before_content"][:1024] or "*No text*", inline=False)
        embed.add_field(name="After", value=data["after_content"][:1024] or "*No text*", inline=False)
        embed.set_footer(text="Edit Sniped")

        await ctx.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(Snipe(bot))
