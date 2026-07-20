import json
import pathlib
import random
import time
import discord
from discord import app_commands
from discord.ext import commands, tasks
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.Giveaway._storage import (
    generate_giveaway_id,
    create_giveaway_entry,
    get_giveaway,
    get_giveaway_by_message_id,
    update_giveaway_entry,
    get_all_active_giveaways
)

def build_ended_giveaway_kwargs(guild_id: int, entry: dict, winners_display: str) -> dict:
    reqs = []
    if entry.get("required_role_id"):
        reqs.append(f"Role: <@&{entry['required_role_id']}>")
    req_text = f"\n**Requirements:** {' | '.join(reqs)}" if reqs else ""

    btn_ended = Button(label="Giveaway Ended", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_ended")
    
    from Embeds import get_command_embed
    return get_command_embed(
        guild_id, "giveaway", msg_type="ended",
        prize=entry['prize'], winners_display=winners_display,
        end_timestamp=entry['end_timestamp'], author_id=entry['author_id'],
        req_text=req_text, total_entries=len(entry['entries']),
        giveaway_id=entry['giveaway_id'], components=[btn_ended]
    )

class PersistentGiveawayLayout(discord.ui.View):
    def __init__(self, entry: dict = None):
        super().__init__(timeout=None)
        self.entry = entry
        self.build_ui()

    def build_ui(self):
        self.clear_items()
        self.btn_enter = Button(label="Enter Giveaway", style=discord.ButtonStyle.success, custom_id="orbit:giveaway_enter")
        self.btn_enter.callback = self.enter_callback

        if not self.entry:
            self.add_item(self.btn_enter)
            return

        self.add_item(self.btn_enter)

    def get_kwargs(self, guild_id: int):
        if not self.entry:
            return {"content": "Interactive Giveaway", "view": self}

        reqs = []
        if self.entry.get("required_role_id"):
            reqs.append(f"Role: <@&{self.entry['required_role_id']}>")
        req_text = f"\n**Requirements:** {' | '.join(reqs)}" if reqs else ""

        from Embeds import get_command_embed
        return get_command_embed(
            guild_id, "giveaway", msg_type="active",
            prize=self.entry['prize'], winners=self.entry['winners'],
            end_timestamp=self.entry['end_timestamp'], author_id=self.entry['author_id'],
            req_text=req_text, total_entries=len(self.entry['entries']),
            giveaway_id=self.entry['giveaway_id'], components=self.children
        )

    async def enter_callback(self, interaction: discord.Interaction):
        if not interaction.guild:
            return await interaction.response.send_message("Giveaways only work inside servers.", ephemeral=True)

        entry = get_giveaway_by_message_id(interaction.guild.id, interaction.message.id)
        if not entry:
            return await interaction.response.send_message("Could not locate giveaway data for this message.", ephemeral=True)

        if entry.get("ended"):
            return await interaction.response.send_message("This giveaway has already ended.", ephemeral=True)

        uid = interaction.user.id
        if uid in entry["entries"]:
            entry["entries"].remove(uid)
            update_giveaway_entry(interaction.guild.id, entry)
            await interaction.response.send_message("You have left the giveaway.", ephemeral=True)
        else:
            req_role_id = entry.get("required_role_id")
            if req_role_id:
                role = interaction.guild.get_role(req_role_id)
                if role and role not in interaction.user.roles:
                    return await interaction.response.send_message(
                        f"You need the {role.mention} role to enter this giveaway!", ephemeral=True
                    )

            entry["entries"].append(uid)
            update_giveaway_entry(interaction.guild.id, entry)
            await interaction.response.send_message("You have successfully entered the giveaway! Good luck!", ephemeral=True)

        try:
            self.entry = entry
            self.build_ui()
            await interaction.message.edit(**self.get_kwargs(interaction.guild.id))
        except Exception:
            pass

async def end_giveaway_logic(bot: commands.Bot, guild_id: int, entry: dict) -> bool:
    if entry.get("ended"):
        return False

    entry["ended"] = True
    guild = bot.get_guild(guild_id)
    if not guild:
        try:
            guild = await bot.fetch_guild(guild_id)
        except Exception:
            update_giveaway_entry(guild_id, entry)
            return False

    channel = guild.get_channel(entry["channel_id"])
    if not channel:
        try:
            channel = await guild.fetch_channel(entry["channel_id"])
        except Exception:
            update_giveaway_entry(guild_id, entry)
            return False

    valid_entries = []
    for uid in entry["entries"]:
        member = guild.get_member(uid)
        if not member:
            try:
                member = await guild.fetch_member(uid)
            except Exception:
                member = None
        if member and not member.bot:
            req_role_id = entry.get("required_role_id")
            if req_role_id:
                role = guild.get_role(req_role_id)
                if role and role not in member.roles:
                    continue
            valid_entries.append(uid)

    if not valid_entries:
        winners_display = "`No valid entries`"
        picked_winners = []
    else:
        win_count = min(entry["winners"], len(valid_entries))
        picked_winners = random.sample(valid_entries, win_count)
        winners_display = ", ".join(f"<@{u}>" for u in picked_winners)

    entry["picked_winners"] = picked_winners
    update_giveaway_entry(guild_id, entry)

    try:
        msg = await channel.fetch_message(entry["message_id"])
        if msg:
            kwargs = build_ended_giveaway_kwargs(guild_id, entry, winners_display)
            await msg.edit(**kwargs)
    except Exception:
        pass

    try:
        if picked_winners:
            await channel.send(content=f"ðŸŽ‰ **GIVEAWAY ENDED!** ðŸŽ‰\nCongratulations {winners_display}! You won **{entry['prize']}**! ðŸŽŠ (`Giveaway ID: #`{entry['giveaway_id']})")
        else:
            await channel.send(content=f"Giveaway **{entry['prize']}** (`#{entry['giveaway_id']}`) ended with no valid entries. ðŸ˜”")
    except Exception:
        pass

    return True

class GiveawayCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.giveaway_check_loop.start()

    def cog_unload(self):
        self.giveaway_check_loop.cancel()

    async def cog_load(self):
        self.bot.add_view(PersistentGiveawayLayout())

    @tasks.loop(seconds=5)
    async def giveaway_check_loop(self):
        try:
            active = get_all_active_giveaways()
            now = int(time.time())
            for gid, entry in active:
                if now >= entry.get("end_timestamp", 0):
                    await end_giveaway_logic(self.bot, gid, entry)
        except Exception:
            pass

    @giveaway_check_loop.before_loop
    async def before_giveaway_loop(self):
        await self.bot.wait_until_ready()

    @commands.hybrid_command(name="giveaway", description="Starts an interactive giveaway with persistent enter buttons.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(
        prize="The prize being given away (e.g. Discord Nitro)",
        winners="Number of winners to pick when ended (1-20)",
        duration="Giveaway duration in minutes (e.g. 60 for 1 hour)",
        required_role="Optional role required to enter this giveaway"
    )
    async def giveaway(
        self,
        ctx: commands.Context,
        prize: str,
        winners: int = 1,
        duration: int = 60,
        required_role: discord.Role | None = None
    ):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if winners < 1 or winners > 20:
            winners = 1
        if duration < 1 or duration > 46080:
            duration = 60

        gid = generate_giveaway_id(ctx.guild.id)
        end_time = int(time.time()) + (duration * 60)

        entry = create_giveaway_entry(
            guild_id=ctx.guild.id,
            giveaway_id=gid,
            channel_id=ctx.channel.id,
            message_id=0,
            prize=prize,
            winners=winners,
            end_timestamp=end_time,
            author_id=ctx.author.id,
            required_role_id=required_role.id if required_role else None
        )

        view = PersistentGiveawayLayout(entry)
        msg = await ctx.send(**view.get_kwargs(ctx.guild.id), allowed_mentions=discord.AllowedMentions.none())
        if msg:
            entry["message_id"] = msg.id
            entry["channel_id"] = msg.channel.id
            update_giveaway_entry(ctx.guild.id, entry)

    @giveaway.error
    async def giveaway_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Server permission to host giveaways.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: -giveaway \"<prize>\" <winners_count> <duration_minutes> [required_role]", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentGiveawayLayout())
    await bot.add_cog(GiveawayCommand(bot))

