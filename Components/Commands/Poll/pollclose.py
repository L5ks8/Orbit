import discord
from discord import app_commands
from discord.ext import commands
from Components.Commands.Poll._storage import get_poll_entry
from Components.Commands.Poll.poll import end_poll_logic
from Components.Commands._utils import make_embed, ORBIT_COLOR, InteractionContext

class PollCloseCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="pollclose",
        description="Closes an active community poll using its unique Poll ID (e.g. P-123456)."
    )
    @app_commands.describe(
        poll_id="The unique ID of the poll (e.g. P-123456 or 123456)"
    )
    async def pollclose(self, interaction: discord.Interaction, poll_id: str):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

        clean_pid = poll_id.strip().upper()
        if not clean_pid.startswith("P-"):
            clean_pid = f"P-{clean_pid}"

        poll_data = get_poll_entry(ctx.guild.id, clean_pid)
        if not poll_data:
            return await ctx.send(embed=make_embed(f"Could not find an active poll with ID `{clean_pid}` on this server.", discord.Color.red()), ephemeral=True)

        if poll_data.get("closed"):
            return await ctx.send(embed=make_embed(f"Poll `{clean_pid}` is already closed.", discord.Color.red()), ephemeral=True)

        # Check permissions: author or Manage Guild
        is_author = poll_data.get("author_id") == ctx.author.id
        has_manage = ctx.author.guild_permissions.manage_guild or ctx.author.guild_permissions.administrator
        if not is_author and not has_manage:
            return await ctx.send(embed=make_embed("You need the `Manage Server` permission or be the creator of this poll to close it.", discord.Color.red()), ephemeral=True)

        await end_poll_logic(self.bot, ctx.guild.id, poll_data, closed_by=ctx.author.id)

        desc = f"Successfully closed Poll `{clean_pid}` (**{poll_data['question']}**). The voting results have been locked."
        await ctx.send(embed=make_embed(desc, ORBIT_COLOR, title="Poll Concluded"))

    @pollclose.error
    async def pollclose_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (commands.MissingRequiredArgument, app_commands.CommandSignatureMismatch)):
            await ctx.send(embed=make_embed("Usage: `/pollclose <poll_id>`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(PollCloseCommand(bot))
