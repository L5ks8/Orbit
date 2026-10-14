import json
import pathlib
import random
import time
import discord
from discord import app_commands
from discord.ext import commands, tasks
from discord.ui import Button
from Components.Commands._utils import (
    make_embed,
    ORBIT_COLOR,
    InteractionContext,
    HAS_V2,
    Container,
    TextDisplay,
    ActionRow,
    LayoutView,
    parse_duration
)
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
        f"**Prize:** {prize}\n",
        f"**Winners:** {winners_count} · **Entries:** {entries_count}\n"
    ]

    if ended:
        win_text = winners_display
        if not win_text:
            picked = entry.get("picked_winners", [])
            win_text = " · ".join(f"<@{u}>" for u in picked) if picked else "No valid entries"
        lines.append(f"**Closed:** <t:{end_ts}:R>\n**Winners:** {win_text}\n")
    else:
        lines.append(f"**Ends:** <t:{end_ts}:R> (<t:{end_ts}:f>)\n")

    if req_role:
        lines.append(f"**Required Role:** <@&{req_role}>\n")
    if author_id:
        lines.append(f"**Hosted by:** <@{author_id}>")

    return "\n".join(lines).strip()

def build_giveaway_embed(entry: dict, ended: bool = False, winners_display: str = None) -> discord.Embed:
    color = resolve_color(entry.get("color", 0x5865F2))
    embed = discord.Embed(
        title="🎉 Giveaway!",
        color=color
    )
    embed.description = build_giveaway_body(entry, ended=ended, winners_display=winners_display)
    embed.set_footer(text="One entry per Discord account. Winners are selected at random.")
    return embed

def build_fallback_kwargs(entry: dict, guild_id: int, ended: bool = False, winners_display: str = None) -> dict:
    embed = build_giveaway_embed(entry, ended=ended, winners_display=winners_display)
    view = PersistentGiveawayView(ended=ended)
    return {"embed": embed, "view": view}

def build_ended_giveaway_kwargs(guild_id: int, entry: dict, winners_display: str) -> dict:
    return build_fallback_kwargs(entry, guild_id, ended=True, winners_display=winners_display)

class PersistentGiveawayView(discord.ui.View):
    def __init__(self, ended: bool = False):
        super().__init__(timeout=None)
        if ended:
            self.clear_items()
            btn_closed = Button(label="Closed", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_closed")
            btn_leave = Button(label="Leave", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_leave_ended")
            self.add_item(btn_closed)
            self.add_item(btn_leave)

    @discord.ui.button(label="Enter", style=discord.ButtonStyle.primary, custom_id="orbit:giveaway_enter")
    async def enter_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_enter(interaction)

    @discord.ui.button(label="Leave", style=discord.ButtonStyle.secondary, custom_id="orbit:giveaway_leave")
    async def leave_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await self.handle_leave(interaction)

    async def handle_enter(self, interaction: discord.Interaction):
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
            embed=make_embed("**You have entered the giveaway!** Good luck!", discord.Color.green()),
            ephemeral=True
        )

        try:
            await update_giveaway_message(interaction.message, interaction.guild.id, entry)
        except Exception as e:
            print(f"[Giveaway] Failed to update message after enter: {e}")

    async def handle_leave(self, interaction: discord.Interaction):
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

def build_giveaway_v2_view(entry: dict, guild_id: int, ended: bool = False, winners_display: str = None):
    if not HAS_V2:
        return None
    view = LayoutView(timeout=None)
    color = resolve_color(entry.get("color", 0x5865F2))
    body_text = build_giveaway_body(entry, ended=ended, winners_display=winners_display)

    if ended:
        btn_closed = Button(label="Closed", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_closed")
        btn_leave = Button(label="Leave", style=discord.ButtonStyle.secondary, disabled=True, custom_id="orbit:giveaway_leave_ended")
        rows = [ActionRow(btn_closed, btn_leave)]
    else:
        btn_enter = Button(label="Enter", style=discord.ButtonStyle.primary, custom_id="orbit:giveaway_enter")
        btn_leave = Button(label="Leave", style=discord.ButtonStyle.secondary, custom_id="orbit:giveaway_leave")
        rows = [ActionRow(btn_enter, btn_leave)]

    container = Container(
        TextDisplay(content=f"# Giveaway!\n\n{body_text}"),
        *rows,
        accent_color=color
    )
    view.add_item(container)
    view.add_item(TextDisplay(content="-# One entry per Discord account. Winners are selected at random."))
    return view

PersistentGiveawayLayout = PersistentGiveawayView

async def send_giveaway_message(target, entry: dict, guild_id: int):
    if HAS_V2:
        try:
            v2_view = build_giveaway_v2_view(entry, guild_id, ended=False)
            if v2_view:
                return await target.send(view=v2_view, allowed_mentions=discord.AllowedMentions.none())
        except Exception as e:
            print(f"[Giveaway] V2 send failed ({e}), falling back to embed.")

    embed = build_giveaway_embed(entry, ended=False)
    view = PersistentGiveawayView(ended=False)
    return await target.send(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())

async def update_giveaway_message(message: discord.Message, guild_id: int, entry: dict, ended: bool = False, winners_display: str = None):
    if HAS_V2:
        try:
            v2_view = build_giveaway_v2_view(entry, guild_id, ended=ended, winners_display=winners_display)
            if v2_view:
                await message.edit(view=v2_view, allowed_mentions=discord.AllowedMentions.none())
                return
        except Exception as e:
            print(f"[Giveaway] V2 update failed ({e}), falling back to embed.")

    embed = build_giveaway_embed(entry, ended=ended, winners_display=winners_display)
    view = PersistentGiveawayView(ended=ended)
    try:
        await message.edit(embed=embed, view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception as e:
        print(f"[Giveaway] Message update failed: {e}")

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

    msg = None
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
                title="🎉 Giveaway Ended!",
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
        self.bot.add_view(PersistentGiveawayView())

    @tasks.loop(seconds=3)
    async def giveaway_check_loop(self):
        try:
            active_list = get_all_active_giveaways()
            now = int(time.time())
            for item in active_list:
                if isinstance(item, (list, tuple)):
                    guild_id, entry = item[0], item[1]
                elif isinstance(item, dict):
                    guild_id = item.get("guild_id")
                    entry = item.get("entry", item)
                else:
                    continue
                if not entry or not isinstance(entry, dict):
                    continue
                if entry.get("end_timestamp", 0) <= now and not entry.get("ended"):
                    await end_giveaway_logic(self.bot, guild_id, entry)
        except Exception as e:
            print(f"[GiveawayLoop] Error: {e}")

    @giveaway_check_loop.before_loop
    async def before_giveaway_check(self):
        await self.bot.wait_until_ready()

    @app_commands.command(name="giveaway", description="Start an interactive giveaway in the current channel.")
    @app_commands.describe(
        prize="What is being given away",
        winners="Number of winners (default 1)",
        duration="Duration format e.g. 10m, 1h, 1d (default 1h)",
        required_role="Role required to enter (optional)"
    )
    @app_commands.default_permissions(manage_guild=True)
    async def giveaway(
        self,
        interaction: discord.Interaction,
        prize: str,
        winners: int = 1,
        duration: str = "1h",
        required_role: discord.Role = None
    ):
        ctx = InteractionContext(interaction)
        if not ctx.guild:
            return await ctx.send(embed=make_embed("Giveaways can only be started inside servers.", discord.Color.red()), ephemeral=True)

        if winners < 1 or winners > 25:
            return await ctx.send(embed=make_embed("Winners must be between 1 and 25.", discord.Color.red()), ephemeral=True)

        secs = parse_duration(duration, default_unit="h")
        if secs is None or secs < 10:
            return await ctx.send(embed=make_embed("Invalid duration format! Examples: `30s`, `10m`, `2h`, `1d`.", discord.Color.red()), ephemeral=True)
        if secs > 86400 * 30:
            return await ctx.send(embed=make_embed("Giveaway duration cannot exceed 30 days.", discord.Color.red()), ephemeral=True)

        end_time = int(time.time()) + secs
        gid = generate_giveaway_id(ctx.guild.id)

        await ctx.defer(ephemeral=True)

        entry = create_giveaway_entry(
            guild_id=ctx.guild.id,
            giveaway_id=gid,
            channel_id=ctx.channel.id,
            prize=prize,
            winners=winners,
            end_timestamp=end_time,
            author_id=ctx.author.id,
            required_role_id=required_role.id if required_role else None,
            color=0x5865F2
        )

        msg = await send_giveaway_message(ctx.channel, entry, ctx.guild.id)
        if msg:
            entry["message_id"] = msg.id
            entry["channel_id"] = msg.channel.id
            update_giveaway_entry(ctx.guild.id, entry)

        await ctx.send(embed=make_embed(f"Giveaway for **{prize}** has been posted successfully!"), ephemeral=True)

    @giveaway.error
    async def giveaway_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You need Manage Server permission to host giveaways.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, (commands.MissingRequiredArgument, app_commands.CommandSignatureMismatch)):
            await ctx.send(embed=make_embed("Usage: `/giveaway <prize> [winners] [duration] [required_role]`", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    bot.add_view(PersistentGiveawayView())
    await bot.add_cog(GiveawayCommand(bot))
