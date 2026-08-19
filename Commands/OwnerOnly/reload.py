import discord
from discord.ext import commands

class ReloadCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="reload", hidden=True)
    @commands.is_owner()
    async def reload_cmd(self, ctx: commands.Context, module: str):
        try:
            try:
                await self.bot.reload_extension(module)
                await ctx.send(f"✅ Successfully reloaded `{module}`")
            except commands.ExtensionNotLoaded:
                await self.bot.load_extension(module)
                await ctx.send(f"✅ Successfully loaded `{module}`")
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            await ctx.send(f"❌ Failed to load/reload `{module}`:\n```py\n{tb[:1900]}\n```")

async def setup(bot: commands.Bot):
    await bot.add_cog(ReloadCommand(bot))
