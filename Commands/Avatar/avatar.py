import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator, ActionRow, Button



class AvatarCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="avatar", description="Displays a user's high-resolution global and server avatars.")
    async def avatar(self, ctx: commands.Context, user: discord.Member = None):
        await ctx.defer()
        target = user or ctx.author
        if not isinstance(target, discord.Member):
            return await ctx.send("Please specify a valid member.", ephemeral=True)

        global_url = target.avatar.with_size(4096).url if target.avatar else target.display_avatar.with_size(4096).url
        guild_url = target.guild_avatar.with_size(4096).url if target.guild_avatar else None

        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id if ctx.guild else 0, "avatar", msg_type="default", target=target, global_url=global_url, guild_url=guild_url)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

async def setup(bot: commands.Bot):
    await bot.add_cog(AvatarCommand(bot))

