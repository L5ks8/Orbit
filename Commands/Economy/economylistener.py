import time
import discord
from discord.ext import commands, tasks
from Commands.Economy._storage import (
    load_economy_config,
    save_economy_config,
    add_user_balance,
    get_economy_leaderboard
)

class EconomyListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self._msg_cooldowns = {}
        self._cmd_cooldowns = {}
        self._react_cooldowns = {}
        self.voice_money_loop.start()
        self.auto_leaderboard_loop.start()

    def cog_unload(self):
        self.voice_money_loop.cancel()
        self.auto_leaderboard_loop.cancel()

    def _check_cooldown(self, cooldowns: dict, guild_id: int, user_id: int, cooldown_seconds: int) -> bool:
        key = (guild_id, user_id)
        now = time.time()
        if key in cooldowns and now - cooldowns[key] < cooldown_seconds:
            return False
        cooldowns[key] = now
        return True

    def _is_blocked(self, config: dict, channel_id: int, member: discord.Member) -> bool:
        ch_mode = config.get("channel_mode", "blacklist")
        blocked_channels = config.get("blocked_channels", [])
        if ch_mode == "blacklist" and str(channel_id) in blocked_channels:
            return True
        if ch_mode == "whitelist" and str(channel_id) not in blocked_channels:
            return True

        ro_mode = config.get("role_mode", "blacklist")
        blocked_roles = config.get("blocked_roles", [])
        member_role_ids = [str(r.id) for r in member.roles]
        if ro_mode == "blacklist":
            if any(rid in blocked_roles for rid in member_role_ids):
                return True
        elif ro_mode == "whitelist":
            if not any(rid in blocked_roles for rid in member_role_ids):
                return True
        return False

    def _get_booster_multiplier(self, config: dict, member: discord.Member, channel_id: int | None = None) -> float:
        total_mult = 1.0
        member_role_ids = set(str(r.id) for r in member.roles)

        role_boosters = config.get("role_boosters", [])
        stack_roles = config.get("role_boosters_stack", True)

        matched_role_mults = []
        for rb in role_boosters:
            if isinstance(rb, dict) and str(rb.get("role_id")) in member_role_ids:
                try:
                    matched_role_mults.append(float(rb.get("multiplier", 1.0)))
                except (ValueError, TypeError):
                    pass

        if matched_role_mults:
            if stack_roles:
                for m in matched_role_mults:
                    total_mult *= m
            else:
                total_mult *= max(matched_role_mults)

        if channel_id:
            channel_boosters = config.get("channel_boosters", [])
            for cb in channel_boosters:
                if isinstance(cb, dict) and str(cb.get("channel_id")) == str(channel_id):
                    try:
                        total_mult *= float(cb.get("multiplier", 1.0))
                    except (ValueError, TypeError):
                        pass

        return total_mult

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot:
            return

        config = load_economy_config(message.guild.id)
        if not config.get("enabled", True) or not config.get("msg_money_enabled", True):
            return

        if self._is_blocked(config, message.channel.id, message.author):
            return

        cd = config.get("msg_money_cooldown", 60)
        if not self._check_cooldown(self._msg_cooldowns, message.guild.id, message.author.id, cd):
            return

        base_amount = config.get("msg_money_amount", 8)
        global_mult = config.get("money_multiplier", 1.0)
        booster_mult = self._get_booster_multiplier(config, message.author, message.channel.id)
        amount = int(base_amount * global_mult * booster_mult)

        if amount > 0:
            add_user_balance(message.guild.id, message.author.id, amount)

    @commands.Cog.listener()
    async def on_command_completion(self, ctx: commands.Context):
        if not ctx.guild or ctx.author.bot:
            return

        config = load_economy_config(ctx.guild.id)
        if not config.get("enabled", True) or not config.get("cmd_money_enabled", True):
            return

        if self._is_blocked(config, ctx.channel.id, ctx.author):
            return

        cd = config.get("cmd_money_cooldown", 60)
        if not self._check_cooldown(self._cmd_cooldowns, ctx.guild.id, ctx.author.id, cd):
            return

        base_amount = config.get("cmd_money_amount", 8)
        global_mult = config.get("money_multiplier", 1.0)
        booster_mult = self._get_booster_multiplier(config, ctx.author, ctx.channel.id)
        amount = int(base_amount * global_mult * booster_mult)

        if amount > 0:
            add_user_balance(ctx.guild.id, ctx.author.id, amount)

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if not payload.guild_id or payload.user_id == self.bot.user.id:
            return

        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return

        member = payload.member
        if not member or member.bot:
            return

        config = load_economy_config(guild.id)
        if not config.get("enabled", True) or not config.get("react_money_enabled", True):
            return

        if self._is_blocked(config, payload.channel_id, member):
            return

        cd = config.get("react_money_cooldown", 300)
        if not self._check_cooldown(self._react_cooldowns, guild.id, member.id, cd):
            return

        base_amount = config.get("react_money_amount", 20)
        global_mult = config.get("money_multiplier", 1.0)
        booster_mult = self._get_booster_multiplier(config, member, payload.channel_id)
        amount = int(base_amount * global_mult * booster_mult)

        if amount > 0:
            add_user_balance(guild.id, member.id, amount)

    @tasks.loop(minutes=1)
    async def voice_money_loop(self):
        try:
            for guild in self.bot.guilds:
                config = load_economy_config(guild.id)
                if not config.get("enabled", True) or not config.get("voice_money_enabled", False):
                    continue

                ignore_muted = config.get("voice_money_ignore_muted", True)
                ignore_solo = config.get("voice_money_ignore_solo", False)
                base_amount = config.get("voice_money_amount", 4)
                global_mult = config.get("money_multiplier", 1.0)

                if base_amount <= 0:
                    continue

                for vc in guild.voice_channels:
                    non_bot_members = [m for m in vc.members if not m.bot]
                    if ignore_solo and len(non_bot_members) < 2:
                        continue

                    for member in non_bot_members:
                        if self._is_blocked(config, vc.id, member):
                            continue
                        if ignore_muted and (member.voice.self_mute or member.voice.self_deaf or member.voice.mute or member.voice.deaf):
                            continue
                        booster_mult = self._get_booster_multiplier(config, member, vc.id)
                        amount = int(base_amount * global_mult * booster_mult)
                        if amount > 0:
                            add_user_balance(guild.id, member.id, amount)
        except Exception:
            pass

    @tasks.loop(hours=1)
    async def auto_leaderboard_loop(self):
        try:
            for guild in self.bot.guilds:
                config = load_economy_config(guild.id)
                if not config.get("enabled", True):
                    continue
                auto_ch_id = config.get("baltop_auto_channel_id")
                if not auto_ch_id:
                    continue

                channel = guild.get_channel(int(auto_ch_id))
                if not channel:
                    continue

                leaderboard_data = get_economy_leaderboard(guild.id, limit=10)
                if not leaderboard_data:
                    continue

                symbol = config.get("currency_symbol", "🪙")
                medals = ["🥇", "🥈", "🥉"]
                lines = []

                for idx, entry in enumerate(leaderboard_data, 1):
                    uid = entry.get("user_id")
                    bal = entry.get("balance", 0)
                    prefix = medals[idx - 1] if idx <= 3 else f"`{idx}.`"
                    member = guild.get_member(uid)
                    display_name = member.display_name if member else f"User ID {uid}"
                    lines.append(f"{prefix} **{display_name}** — {symbol} `{bal:,}`")

                color_hex = config.get("baltop_embed_color", "#5865F2")
                try:
                    embed_color = discord.Color.from_str(color_hex)
                except Exception:
                    embed_color = discord.Color.gold()

                embed = discord.Embed(
                    title=f"🏆 {guild.name} — Money Leaderboard",
                    description="\n".join(lines),
                    color=embed_color
                )
                embed.set_thumbnail(url=guild.icon.url if guild.icon else "")
                embed.set_footer(text="Updated automatically every hour • Use /daily & /work")

                msg_id = config.get("baltop_message_id")
                if msg_id:
                    try:
                        msg = await channel.fetch_message(int(msg_id))
                        await msg.edit(embed=embed)
                        continue
                    except Exception:
                        pass

                new_msg = await channel.send(embed=embed)
                config["baltop_message_id"] = new_msg.id
                save_economy_config(guild.id, config)
        except Exception:
            pass

    @voice_money_loop.before_loop
    async def before_voice_loop(self):
        await self.bot.wait_until_ready()

    @auto_leaderboard_loop.before_loop
    async def before_leaderboard_loop(self):
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot):
    await bot.add_cog(EconomyListenerCog(bot))
