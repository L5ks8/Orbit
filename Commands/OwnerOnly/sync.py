import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class SyncSuccessLayout(LayoutView):
    def __init__(self, target_scope: str, count: int, extra_info: str = ""):
        super().__init__()
        text = f"**Scope:** `{target_scope}`\n**Commands Synced:** `{count}`"
        if extra_info:
            text += f"\n**Details:** {extra_info}"
        self.container = Container(
            TextDisplay(content=f"### Orbit Command Tree Synced"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=text)
        )
        self.add_item(self.container)

        btn_close = Button(label="Close Notice", style=discord.ButtonStyle.secondary)

        async def _close_cb(interaction: discord.Interaction):
            try:
                await interaction.message.delete()
            except Exception:
                pass

        btn_close.callback = _close_cb
        self.add_item(ActionRow(btn_close))


class SyncCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="sync", description="Owner Only: Synchronizes slash commands globally or to a specific server.")
    @commands.is_owner()
    async def sync_cmd(self, ctx: commands.Context, *, option: str = None):
        async with ctx.typing():
            if option and option.lower() in ["here", "local"]:
                if not ctx.guild:
                    return await ctx.send("You must be inside a server to sync locally.")
                self.bot.tree.copy_global_to(guild=ctx.guild)
                synced = await self.bot.tree.sync(guild=ctx.guild)
                view = SyncSuccessLayout(f"Local Server ({ctx.guild.name})", len(synced))
                await ctx.send(view=view)
                return

            if option and option.lower().startswith("clear"):
                parts = option.split()
                if len(parts) > 1 and parts[1].isdigit():
                    guild_obj = discord.Object(id=int(parts[1]))
                    self.bot.tree.clear_commands(guild=guild_obj)
                    await self.bot.tree.sync(guild=guild_obj)
                    view = SyncSuccessLayout(f"Cleared Guild ID {parts[1]}", 0, "Cleared all local guild commands.")
                    await ctx.send(view=view)
                else:
                    if ctx.guild:
                        self.bot.tree.clear_commands(guild=ctx.guild)
                        await self.bot.tree.sync(guild=ctx.guild)
                        view = SyncSuccessLayout(f"Cleared Local Server ({ctx.guild.name})", 0, "Cleared local overrides.")
                        await ctx.send(view=view)
                return

            if option and option.isdigit():
                guild_obj = discord.Object(id=int(option))
                self.bot.tree.copy_global_to(guild=guild_obj)
                synced = await self.bot.tree.sync(guild=guild_obj)
                view = SyncSuccessLayout(f"Specific Guild ID ({option})", len(synced))
                await ctx.send(view=view)
                return

            synced = await self.bot.tree.sync()
            view = SyncSuccessLayout("Global Discord Tree", len(synced), "Updated across all servers.")
            await ctx.send(view=view)

    @sync_cmd.error
    async def sync_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(f"Sync error: {error}")


async def setup(bot: commands.Bot):
    await bot.add_cog(SyncCommand(bot))
