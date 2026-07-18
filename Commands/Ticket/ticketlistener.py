import discord
from discord.ext import commands
from Commands.Ticket._views import PersistentTicketPanelLayout, TicketControlLayout

class TicketListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        custom_id = interaction.data.get("custom_id", "")
        if custom_id.startswith("orbit:ticket_opt:"):
            opt_name = custom_id.split("orbit:ticket_opt:", 1)[1]
            from Commands.Ticket._views import TicketOpenModal
            modal = TicketOpenModal(category_option=opt_name)
            await interaction.response.send_modal(modal)
        elif custom_id == "orbit:ticket_open":
            from Commands.Ticket._views import TicketOpenModal
            modal = TicketOpenModal(category_option="General Support")
            await interaction.response.send_modal(modal)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentTicketPanelLayout())
    bot.add_view(TicketControlLayout())
    await bot.add_cog(TicketListenerCog(bot))

