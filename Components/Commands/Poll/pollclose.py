import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Poll._storage import get_poll_entry, close_poll_entry
from Components.Commands._utils import make_embed


class PollCloseCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="pollclose",
        aliases=["poll_close"],
        description="Closes an active poll using its unique Poll ID (e.g. P-123456)."
    )
    @app_commands.describe(
        poll_id="The unique ID of the poll displayed in its header (e.g. P-123456 or 123456)"
    )
    async def pollclose(self, ctx: commands.Context, poll_id: str):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        poll_data = get_poll_entry(ctx.guild.id, poll_id)
        if not poll_data:
            return await ctx.send(embed=make_embed(f"Could not find an active poll with ID `{poll_id}` on this server.", discord.Color.red()), ephemeral=True)

        if poll_data.get("closed"):
            return await ctx.send(embed=make_embed(f"Poll `{poll_id}` is already closed.", discord.Color.red()), ephemeral=True)

        clean_pid = poll_id.strip().upper()
        if not clean_pid.startswith("P-"):
            clean_pid = f"P-{clean_pid}"

        try:
            channel = ctx.guild.get_channel(poll_data["channel_id"])
            if not channel:
                channel = await ctx.guild.fetch_channel(poll_data["channel_id"])
            
            if channel:
                msg = await channel.fetch_message(poll_data["message_id"])
                if msg:
                    embed = discord.Embed(
                        title="Community Poll Closed",
                        description=f"**Question:** {poll_data['question']}\n\n**Status:** Voting session has ended. Results locked.\n**Closed By:** {ctx.author.mention}",
                        color=discord.Color.red()
                    )
                    embed.set_footer(text=f"Poll ID: {clean_pid}")
                    await msg.edit(embed=embed, view=None)
        except Exception:
            pass

        close_poll_entry(ctx.guild.id, clean_pid)
        await ctx.send(embed=make_embed(f"Successfully closed Poll `{clean_pid}` (`{poll_data['question']}`). No further votes can be submitted.", discord.Color.red()))

    @pollclose.error
    async def pollclose_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: -pollclose <P-123456>", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PollCloseCommand(bot))
