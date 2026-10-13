import discord
from discord.ext import commands
from .ticket import ticket_group, render_group, TicketCog

async def setup(bot: commands.Bot):
    bot.tree.add_command(ticket_group)
    bot.tree.add_command(render_group)
    await bot.add_cog(TicketCog(bot))
