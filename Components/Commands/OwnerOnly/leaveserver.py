import discord
from discord.ext import commands
from Components.Commands.OwnerOnly._monitor import record_command
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR
from Components.emojis import Emojis

class LeaveServerCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="leaveserver", hidden=True)
    @commands.is_owner()
    async def leaveserver_cmd(self, ctx: commands.Context, target_guild_id: int):
        record_command("leaveserver", str(ctx.author))
        guild = self.bot.get_guild(target_guild_id)
        if not guild:
            return await ctx.send(embed=make_embed(f"I am not in a server with ID `{target_guild_id}`."), ephemeral=True)
        
        try:
            await guild.leave()
            desc = f"Successfully left server: **{guild.name}** (`{guild.id}`)."
            card = make_v2_card(f"# {Emojis.VERIFICATION} Server Left\n\n{desc}", color=discord.Color.green())
            if card:
                return await ctx.send(view=card)
            await ctx.send(embed=make_embed(desc, discord.Color.green()))
        except Exception as e:
            await ctx.send(embed=make_embed(f"Failed to leave server: {e}", discord.Color.red()))

async def setup(bot: commands.Bot):
    await bot.add_cog(LeaveServerCommand(bot))
