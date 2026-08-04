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
        elif custom_id == "orbit:ticket_panel_dropdown":
            val = interaction.data.get("values", ["General Support"])[0]
            from Commands.Ticket._views import _user_ticket_selections
            _user_ticket_selections[interaction.user.id] = val
            try: await interaction.response.defer()
            except Exception: pass
        elif custom_id == "orbit:ticket_create_btn":
            from Commands.Ticket._storage import is_blacklisted, load_ticket_config
            if interaction.guild and is_blacklisted(interaction.guild.id, interaction.user.id):
                return await interaction.response.send_message("You are blacklisted from opening support tickets on this server.", ephemeral=True)
            
            config = load_ticket_config(interaction.guild.id) if interaction.guild else {}
            slots = config.get("options_slots", [])
            if not isinstance(slots, list) or not slots:
                opts = config.get("options", ["General Support"])
                slots = [{"name": str(o)} for o in opts]
            from Commands.Ticket._views import _user_ticket_selections
            selected_opt = _user_ticket_selections.get(interaction.user.id)
            if not selected_opt and slots:
                if len(slots) == 1:
                    selected_opt = slots[0].get("name", "Support") if isinstance(slots[0], dict) else str(slots[0])
                elif len(slots) > 1:
                    return await interaction.response.send_message("Please choose a category option from the dropdown menu above first!", ephemeral=True)
            if not selected_opt:
                selected_opt = "General Support"
            from Commands.Ticket._views import TicketOpenModal
            modal = TicketOpenModal(category_option=selected_opt)
            await interaction.response.send_modal(modal)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentTicketPanelLayout())
    bot.add_view(TicketControlLayout())
    await bot.add_cog(TicketListenerCog(bot))

