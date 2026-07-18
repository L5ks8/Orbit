import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Voice.voice import voice_group

class MoveSuccessLayout(LayoutView):
    def __init__(self, target: discord.Member, channel: discord.VoiceChannel, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### User Moved\n**Target:** {target.mention} (`{target.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Destination:** {channel.mention}\n**Reason:** {reason}\n**Moderator:** {author.mention}")
        )
        self.add_item(self.container)

async def _do_vc_move(ctx: commands.Context, target: discord.Member, channel: discord.VoiceChannel, reason: str):
    await ctx.defer()
    if not target.voice or not target.voice.channel:
        return await ctx.send("This user is not currently in any voice channel.", ephemeral=True)
    if target.voice.channel.id == channel.id:
        return await ctx.send("The user is already in that voice channel.", ephemeral=True)

    try:
        await target.edit(voice_channel=channel, reason=f"Moved by {ctx.author} | Reason: {reason}")
        view = MoveSuccessLayout(target, channel, reason, ctx.author)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have permissions to move members into that channel.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error moving user: {e}", ephemeral=True)

@voice_group.command(name="move", description="Move a member into another voice channel.")
@commands.has_permissions(move_members=True)
@commands.bot_has_permissions(move_members=True)
async def vc_move_cmd(ctx: commands.Context, target: discord.Member, channel: discord.VoiceChannel, *, reason: str = "No reason provided"):
    await _do_vc_move(ctx, target, channel, reason)

class MoveCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @vc_move_cmd.error
    async def move_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Move Members permission to move users.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-voice move <@member> <#channel> [reason]`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class MovePrefixFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="vc_move", aliases=["vcmove"], hidden=True)
    @commands.has_permissions(move_members=True)
    async def vc_move_prefix(self, ctx: commands.Context, target: discord.Member, channel: discord.VoiceChannel, *, reason: str = "No reason provided"):
        await _do_vc_move(ctx, target, channel, reason)

async def setup(bot: commands.Bot):
    from Commands.Voice.voice import voice_group
    if "voice" not in bot.all_commands:
        bot.add_command(voice_group)
    await bot.add_cog(MoveCommand(bot))
    await bot.add_cog(MovePrefixFallback(bot))

