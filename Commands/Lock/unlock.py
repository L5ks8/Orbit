import discord
from discord.ext import commands
from discord.ui import Container, TextDisplay, Separator
from Commands._utils import make_embed



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
            return await ctx.send(embed=make_embed("Please specify a valid text channel.", discord.Color.red()), ephemeral=True)

        overwrite = target_channel.overwrites_for(ctx.guild.default_role)
        if overwrite.send_messages is None or overwrite.send_messages is True:
            return await ctx.send(embed=make_embed("This channel is not currently locked.", discord.Color.red()), ephemeral=True)

        try:
            overwrite.send_messages = None
            if overwrite.is_empty():
                await target_channel.set_permissions(ctx.guild.default_role, overwrite=None, reason=f"Unlocked by {ctx.author} | Reason: {reason}")
            else:
                await target_channel.set_permissions(ctx.guild.default_role, overwrite=overwrite, reason=f"Unlocked by {ctx.author} | Reason: {reason}")
            embed = discord.Embed(title="Channel Unlocked", color=discord.Color.green())
            embed.add_field(name="Channel", value=f"{target_channel.mention} (`{target_channel.id}`)", inline=False)
            embed.add_field(name="Reason", value=reason, inline=False)
            embed.add_field(name="Moderator", value=ctx.author.mention, inline=False)
            embed.add_field(name="Status", value="`@everyone` send messages restored", inline=False)
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except discord.Forbidden:
            await ctx.send(embed=make_embed("I do not have sufficient permissions to unlock this channel.", discord.Color.red()), ephemeral=True)
        except Exception as e:
            await ctx.send(embed=make_embed(f"Error unlocking channel: {e}", discord.Color.red()), ephemeral=True)

    @unlock.error
    async def unlock_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Channels permission to unlock channels.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -unlock [#channel] [reason]", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(UnlockCommand(bot))
