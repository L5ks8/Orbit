import discord
from discord.ext import commands, tasks
import time
import asyncio
from Components.Systems.Tickets._views import PersistentTicketPanelLayout, TicketControlLayout, close_ticket_flow
from Components.Systems.Tickets._storage import load_ticket_config

class TicketListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.ticket_auto_close_loop.start()

    def cog_unload(self):
        self.ticket_auto_close_loop.cancel()

    @tasks.loop(minutes=5)
    async def ticket_auto_close_loop(self):
        for guild in list(self.bot.guilds):
            try:
                config = await asyncio.to_thread(load_ticket_config, guild.id)
                if not config.get("enabled", False):
                    await asyncio.sleep(0.01)
                    continue
                
                auto_close_enabled = config.get("auto_close_time_enabled", False)
                if not auto_close_enabled:
                    await asyncio.sleep(0.01)
                    continue
                    
                auto_close_hours = config.get("auto_close_time_hours", 24)
                auto_close_seconds = auto_close_hours * 3600
                
                active_tickets = config.get("active_tickets", {})
                for channel_id_str, ticket_data in list(active_tickets.items()):
                    channel = guild.get_channel(int(channel_id_str))
                    if not channel or not isinstance(channel, discord.TextChannel):
                        continue
                    
                    try:
                        last_message_time = ticket_data.get("created_at", time.time())
                        async for msg in channel.history(limit=1):
                            last_message_time = msg.created_at.timestamp()
                            break
                        
                        if time.time() - last_message_time > auto_close_seconds:
                            await close_ticket_flow(guild, channel, self.bot.user, reason=f"Auto-closed due to {auto_close_hours} hours of inactivity")
                    except discord.Forbidden:
                        pass
                    except Exception as e:
                        print(f"[Tickets] Error in auto-close loop for channel {channel_id_str}: {e}")
            except Exception as e:
                print(f"[Tickets] Error in auto-close loop for guild {guild.id}: {e}")
            await asyncio.sleep(0.05)

    @ticket_auto_close_loop.before_loop
    async def before_ticket_auto_close_loop(self):
        await self.bot.wait_until_ready()

    @ticket_auto_close_loop.error
    async def ticket_auto_close_loop_error(self, error):
        print(f"[Tickets] Internal error in ticket_auto_close_loop: {error}")
        await asyncio.sleep(5)
        if not self.ticket_auto_close_loop.is_running():
            try:
                self.ticket_auto_close_loop.restart()
            except Exception:
                pass

    @commands.Cog.listener()
    async def on_interaction(self, interaction: discord.Interaction):
        if interaction.type != discord.InteractionType.component:
            return
        custom_id = interaction.data.get("custom_id", "")
        if custom_id.startswith("orbit:ticket_opt:"):
            opt_name = custom_id.split("orbit:ticket_opt:", 1)[1]
            from Components.Systems.Tickets._views import TicketOpenModal
            cfg = load_ticket_config(interaction.guild.id) if interaction.guild else {}
            matched_slot = next((s for s in cfg.get("options_slots", []) if isinstance(s, dict) and s.get("name") == opt_name), None)
            modal = TicketOpenModal(category_option=opt_name, slot_config=matched_slot)
            await interaction.response.send_modal(modal)
        elif custom_id == "orbit:ticket_open":
            from Components.Systems.Tickets._views import TicketOpenModal
            cfg = load_ticket_config(interaction.guild.id) if interaction.guild else {}
            slots = cfg.get("options_slots", [])
            first_slot = slots[0] if slots and isinstance(slots[0], dict) else None
            modal = TicketOpenModal(category_option=(first_slot.get("name") if first_slot else "General Support"), slot_config=first_slot)
            await interaction.response.send_modal(modal)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentTicketPanelLayout())
    bot.add_view(TicketControlLayout())
    await bot.add_cog(TicketListenerCog(bot))
