import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button

class ReloadSuccessLayout(LayoutView):
    def __init__(self, target_name: str, success_count: int, error_msg: str = ""):
        super().__init__()
        status_text = f"**Status:** Successfully reloaded `{success_count}` extension(s)." if not error_msg else f"**Status:** Failed (`{error_msg}`)"
        self.container = Container(
            TextDisplay(content=f"### Orbit Extension Reloader\n**Target:** `{target_name}`"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=status_text)
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


class ReloadCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="reload", description="Owner Only: Hot-reloads one or all command extensions.")
    @commands.is_owner()
    async def reload_cmd(self, ctx: commands.Context, *, module: str):
        module = module.strip()
        if module.lower() == "all":
            reloaded = 0
            errors = []
            for ext_name in list(self.bot.extensions.keys()):
                try:
                    await self.bot.reload_extension(ext_name)
                    reloaded += 1
                except Exception as e:
                    errors.append(f"{ext_name}: {e}")

            error_text = f"Errors in {len(errors)} module(s)" if errors else ""
            view = ReloadSuccessLayout("All Extensions", reloaded, error_text)
            await ctx.send(view=view)
            if errors:
                for err_chunk in errors[:5]:
                    await ctx.send(f"`{err_chunk}`")
            return

        target_ext = module if module.startswith("Commands.") else f"Commands.{module}"
        try:
            await self.bot.reload_extension(target_ext)
            view = ReloadSuccessLayout(target_ext, 1)
            await ctx.send(view=view)
        except commands.ExtensionNotLoaded:
            try:
                await self.bot.load_extension(target_ext)
                view = ReloadSuccessLayout(f"{target_ext} (Loaded New)", 1)
                await ctx.send(view=view)
            except Exception as e2:
                view = ReloadSuccessLayout(target_ext, 0, str(e2))
                await ctx.send(view=view)
        except Exception as e:
            view = ReloadSuccessLayout(target_ext, 0, str(e))
            await ctx.send(view=view)

    @reload_cmd.error
    async def reload_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.NotOwner):
            pass
        else:
            await ctx.send(f"Reload error: {error}")


async def setup(bot: commands.Bot):
    await bot.add_cog(ReloadCommand(bot))
