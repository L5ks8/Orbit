import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator



class UnlockCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="unlock", description="Unlocks a text channel so regular members can send messages.")
    @commands.has_permissions(manage_channels=True)
    @commands.bot_has_permissions(manage_channels=True)
    async def unlock(self, ctx: commands.Context, channel: discord.TextChannel = None, *, reason: str = "No reason provided"):
        await ctx.defer()
        target_channel = channel or ctx.channel
        if not isinstance(target_channel, discord.TextChannel):
            return await ctx.send("Please specify a valid text channel.", ephemeral=True)

        overwrite = target_channel.overwrites_for(ctx.guild.default_role)
        if overwrite.send_messages is None or overwrite.send_messages is True:
            return await ctx.send("This channel is not currently locked.", ephemeral=True)

        try:
            overwrite.send_messages = None
            if overwrite.is_empty():
                await target_channel.set_permissions(ctx.guild.default_role, overwrite=None, reason=f"Unlocked by {ctx.author} | Reason: {reason}")
            else:
                await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Unlocked by {ctx.author} | Reason: {reason}")
            from Embeds import get_command_embed
            kwargs = get_command_embed(ctx.guild.id, "unlock", msg_type="success", channel=target_channel, reason=reason, author=ctx.author)
            await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send("I do not have sufficient permissions to unlock this channel.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"Error unlocking channel: {e}", ephemeral=True)

    @unlock.error
    async def unlock_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Channels permission to unlock channels.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -unlock [#channel] [reason]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnlockCommand(bot))

