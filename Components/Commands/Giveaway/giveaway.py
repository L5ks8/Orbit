import json
import pathlib
import random
import time
import discord
from discord import app_commands
from discord.ext import commands, tasks
from discord.ui import LayoutView, Container, TextDisplay, ActionRow, Button
from Components.Commands._utils import make_embed, ORBIT_COLOR
from Components.emojis import Emojis
from Components.Commands.Giveaway._storage import (
    generate_giveaway_id,
    create_giveaway_entry,
    get_giveaway,
    get_giveaway_by_message_id,
    update_giveaway_entry,
    get_all_active_giveaways
)

def resolve_color(color_val) -> discord.Color:
    if isinstance(color_val, discord.Color):
        return color_val
    if isinstance(color_val, int):
        return discord.Color(color_val)
    if isinstance(color_val, str) and color_val:
        c_str = color_val.strip().lstrip("#")
        try:
            return discord.Color(int(c_str, 16))
        except Exception:
            pass
    return discord.Color(0x5865F2)

def build_giveaway_body(entry: dict, ended: bool = False, winners_display: str = None) -> str:
    prize = entry.get("prize", "Prize")
    winners_count = entry.get("winners", 1)
    entries_count = len(entry.get("entries", []))
    end_ts = entry.get("end_timestamp", int(time.time()))
    req_role = entry.get("required_role_id")
    author_id = entry.get("author_id")

    lines = [
        f"# Giveaway!\n",
        f"**Prize**\n{prize}\n",
        f"**Winners** {winners_count} · **Entries** {entries_count}\n"
    ]

    if ended:
        win_text = winners_display
        if not win_text:
            picked = entry.get("picked_winners", [])
            win_text = " · ".join(f"<@{u}>" for u in picked) if picked else "No valid entries"
        lines.append(f"**Closed** <t:{end_ts}:R>\n**Winners**\n{win_text}\n")
    else:
        lines.append(f"**Ends** <t:{end_ts}:R> (<t:{end_ts}:f>)\n")

    if req_role:
        lines.append(f"**Required Role** <@&{req_role}>\n")
    if author_id:
        lines.append(f"**Hosted by** <@{author_id}>")

    return "\n".join(lines).strip()

def build_fallback_kwargs(entry: dict, guild_id: int, ended: bool = False, winners_display: str = None) -> dict:
    color = resolve_color(entry.get("color", 0x5865F2))
    embed = discord.Embed(
        title="Giveaway!",
        color=color
    )
    body_text = build_giveaway_body(entry, ended=ended, winners_display=winners_display)
    clean_body = body_text.replace(f"# Giveaway!\n", "").replace("# Giveaway!\n", "").strip()
    embed.description = clean_body
    embed.set_footer(text="One entry per Discord account. Winners are selected at random.")

    view = discord.ui.View(timeout=None)
    if ended:
        view.add_item(Button(label="Closed", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_closed"))
        view.add_item(Button(label="Leave", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_leave_ended"))
    else:
        view.add_item(Button(label="Enter", style=discord.ButtonStyle.primary, custom_id="orbit:giveaway_enter"))
        view.add_item(Button(label="Leave", style=discord.ButtonStyle.secondary, custom_id="orbit:giveaway_leave"))

    return {"embed": embed, "view": view}

def build_ended_giveaway_kwargs(guild_id: int, entry: dict, winners_display: str) -> dict:
    return build_fallback_kwargs(entry, guild_id, ended=True, winners_display=winners_display)

class PersistentGiveawayLayout(discord.ui.LayoutView):
    def __init__(self, entry: dict = None, guild_id: int = None, ended: bool = False, winners_display: str = None):
        super().__init__(timeout=None)
        self.entry = entry
        self.guild_id = guild_id
        self.ended = ended or (entry.get("ended", False) if entry else False)
        self.winners_display = winners_display
        self.build_ui()

    def build_ui(self):
        self.clear_items()

        if self.ended:
            self.btn_primary = Button(
                label="Closed",
                style=discord.ButtonStyle.secondary,
                disabled=True,
                custom_id="orbit:giveaway_closed"
            )
            self.btn_secondary = Button(
                label="Leave",
                style=discord.ButtonStyle.secondary,
                disabled=True,
                custom_id="orbit:giveaway_leave_ended"
            )
        else:
            self.btn_primary = Button(
                label="Enter",
                style=discord.ButtonStyle.primary,
                custom_id="orbit:giveaway_enter"
            )
            self.btn_secondary = Button(
                label="Leave",
                style=discord.ButtonStyle.secondary,
                custom_id="orbit:giveaway_leave"
            )
            self.btn_primary.callback = self.enter_callback
            self.btn_secondary.callback = self.leave_callback

        if not self.entry:
            stub_container = Container(
                TextDisplay(content="### Giveaway!"),
                ActionRow(self.btn_primary, self.btn_secondary),
                accent_color=discord.Color(0x5865F2)
            )
            self.add_item(stub_container)
            self.add_item(TextDisplay(content="-# One entry per Discord account. Winners are selected at random."))
            return

        body_text = build_giveaway_body(self.entry, ended=self.ended, winners_display=self.winners_display)
        color_val = resolve_color(self.entry.get("color", 0x5865F2))

        container = Container(
            TextDisplay(content=body_text),
            ActionRow(self.btn_primary, self.btn_secondary),
            accent_color=color_val
        )
        self.add_item(container)
        self.add_item(TextDisplay(content="-# One entry per Discord account. Winners are selected at random."))

    def get_kwargs(self, guild_id: int = None):
        return {"view": self}

    async def enter_callback(self, interaction: discord.Interaction):
        if not interaction.guild:
            return await interaction.response.send_message(
                embed=make_embed("Giveaways only work inside servers.", discord.Color.red()),
                ephemeral=True
            )

        entry = get_giveaway_by_message_id(interaction.guild.id, interaction.message.id)
        if not entry:
            return await interaction.response.send_message(
                embed=make_embed("Could not locate giveaway data for this message.", discord.Color.red()),
                ephemeral=True
            )

        if entry.get("ended"):
            return await interaction.response.send_message(
                embed=make_embed("This giveaway has already ended.", discord.Color.red()),
                ephemeral=True
            )

        uid = interaction.user.id
        if uid in entry.get("entries", []):
            return await interaction.response.send_message(
                embed=make_embed("You have already entered this giveaway! Click **Leave** if you want to withdraw your entry.", discord.Color.yellow()),
                ephemeral=True
            )

        req_role_id = entry.get("required_role_id")
        if req_role_id:
            role = interaction.guild.get_role(req_role_id)
            if role and role not in interaction.user.roles:
                return await interaction.response.send_message(
                    embed=make_embed(f"You need the {role.mention} role to enter this giveaway!", discord.Color.red()),
                    ephemeral=True
                )

        entry["entries"].append(uid)
        update_giveaway_entry(interaction.guild.id, entry)

        await interaction.response.send_message(
            embed=make_embed(f"**You have entered the giveaway!** Good luck!", discord.Color.green()),
            ephemeral=True
        )

        try:
            await update_giveaway_message(interaction.message, interaction.guild.id, entry)
        except Exception as e:
            print(f"[Giveaway] Failed to update message after enter: {e}")

    async def leave_callback(self, interaction: discord.Interaction):
        if not interaction.guild:
            return await interaction.response.send_message(
                embed=make_embed("Giveaways only work inside servers.", discord.Color.red()),
                ephemeral=True
            )

        entry = get_giveaway_by_message_id(interaction.guild.id, interaction.message.id)
        if not entry:
            return await interaction.response.send_message(
                embed=make_embed("Could not locate giveaway data for this message.", discord.Color.red()),
                ephemeral=True
            )

        if entry.get("ended"):
            return await interaction.response.send_message(
                embed=make_embed("This giveaway has already ended.", discord.Color.red()),
                ephemeral=True
            )

        uid = interaction.user.id
        if uid not in entry.get("entries", []):
            return await interaction.response.send_message(
                embed=make_embed("You are not currently entered in this giveaway.", discord.Color.yellow()),
                ephemeral=True
            )

        entry["entries"].remove(uid)
        update_giveaway_entry(interaction.guild.id, entry)

        await interaction.response.send_message(
            embed=make_embed("You have withdrawn your entry from the giveaway.", discord.Color.dark_grey()),
            ephemeral=True
        )

        try:
            await update_giveaway_message(interaction.message, interaction.guild.id, entry)
        except Exception as e:
            print(f"[Giveaway] Failed to update message after leave: {e}")

async def send_giveaway_message(target, entry: dict, guild_id: int):
    view = PersistentGiveawayLayout(entry=entry, guild_id=guild_id)
    try:
        return await target.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception as e:
        print(f"[Giveaway] LayoutView send failed ({e}), falling back to embed.")
        kwargs = build_fallback_kwargs(entry, guild_id, ended=False)
        return await target.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())

async def update_giveaway_message(message: discord.Message, guild_id: int, entry: dict, ended: bool = False, winners_display: str = None):
    view = PersistentGiveawayLayout(entry=entry, guild_id=guild_id, ended=ended, winners_display=winners_display)
    try:
        await message.edit(view=view, allowed_mentions=discord.AllowedMentions.none())
        return
    except Exception as e:
        print(f"[Giveaway] LayoutView update error ({e}), trying embed fallback.")
    try:
        kwargs = build_fallback_kwargs(entry, guild_id, ended=ended, winners_display=winners_display)
        await message.edit(**kwargs)
    except Exception as e:
        print(f"[Giveaway] Message update fallback failed: {e}")

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
    for uid in entry.get("entries", []):
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
        winners_display = "No valid entries"
        picked_winners = []
    else:
        win_count = min(entry["winners"], len(valid_entries))
        picked_winners = random.sample(valid_entries, win_count)
        winners_display = " · ".join(f"<@{u}>" for u in picked_winners)

    entry["picked_winners"] = picked_winners
    update_giveaway_entry(guild_id, entry)

    try:
        msg = await channel.fetch_message(entry["message_id"])
        if msg:
            await update_giveaway_message(msg, guild_id, entry, ended=True, winners_display=winners_display)
    except Exception:
        pass

    try:
        color = resolve_color(entry.get("color", 0x5865F2))
        jump_url = msg.jump_url if msg else None
        if picked_winners:
            desc = f"Congratulations {winners_display}! You won **{entry['prize']}**!"
            if jump_url:
                desc += f"\n\n[Jump to Giveaway]({jump_url})"
            embed = discord.Embed(
                title="Giveaway Ended!",
                description=desc,
                color=color
            )
            embed.add_field(name="Prize", value=str(entry['prize']), inline=True)
            embed.add_field(name="Winner(s)", value=winners_display, inline=True)
            embed.set_footer(text=f"Giveaway ID: #{entry['giveaway_id']}")
            await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions(users=True))
        else:
            desc = f"Giveaway for **{entry['prize']}** ended with no valid entries."
            if jump_url:
                desc += f"\n\n[Jump to Giveaway]({jump_url})"
            embed = discord.Embed(
                title="Giveaway Ended",
                description=desc,
                color=discord.Color.dark_gray()
            )
            embed.set_footer(text=f"Giveaway ID: #{entry['giveaway_id']}")
            await channel.send(embed=embed)
    except Exception as e:
        print(f"[Giveaway] Failed to send winner announcement embed: {e}")

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

    @commands.hybrid_command(name="giveaway", description="Starts an interactive giveaway with persistent enter and leave buttons.")
    @commands.has_permissions(manage_guild=True)
    @app_commands.describe(
        prize="The prize being given away (e.g. 2x Volt Quarterly)",
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
            return await ctx.send(embed=make_embed("This command must be run inside a server.", discord.Color.red()), ephemeral=True)

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
            required_role_id=required_role.id if required_role else None,
            color=0x5865F2
        )

        msg = await send_giveaway_message(ctx, entry, ctx.guild.id)
        if msg:
            entry["message_id"] = msg.id
            entry["channel_id"] = msg.channel.id
            update_giveaway_entry(ctx.guild.id, entry)

    @giveaway.error
    async def giveaway_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need Manage Server permission to host giveaways.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: `/giveaway <prize> [winners_count] [duration_minutes] [required_role]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentGiveawayLayout())
    await bot.add_cog(GiveawayCommand(bot))
