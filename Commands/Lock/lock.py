import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator

class LockSuccessLayout(LayoutView):
    def __init__(self, channel: discord.TextChannel, reason: str, author: discord.Member):
        super().__init__()
        self.container = Container(
            TextDisplay(content=f"### Channel Locked\n**Channel:** {channel.mention} (`{channel.id}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Reason:** {reason}\n**Moderator:** {author.mention}\n**Status:** `@everyone` send messages disabled")
        )
        self.add_item(self.container)

class LockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="lock", description="Locks a text channel so regular members cannot send messages.")
    @commands.has_permissions(manage_channels=True)
    @commands.bot_has_permissions(manage_channels=True)
    async def lock(self, ctx: commands.Context, channel: discord.TextChannel = None, *, reason: str = "No reason provided"):
        await ctx.defer()
        target_channel = channel or ctx.channel
        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send("Please specify a valid text channel.", ephemeral=True)

        overwrite = target_channel.overwrites_for(ctx.guild.default_role)
        if overwrite.send_messages is False:
            return await ctx.send("This channel is already locked.", ephemeral=True)

        try:
            overwrite.send_messages = False
            await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Locked by {ctx.author} | Reason: {reason}")
            view = LockSuccessLayout(target_channel, reason, ctx.author)
            await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to lock this channel.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error locking channel: {e}", ephemeral=True)

    @lock.error
    async def lock_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to lock channels.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -lock [#channel] [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(LockCommand(bot))

