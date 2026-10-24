import time
import asyncio
from datetime import datetime, timezone
import discord
from discord.ext import commands, tasks
from Components.Systems.Roles._storage import load_join_roles
from Components.Database.mongodb import get_db


class JoinRoleListener(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self._activity_Write_cache: dict[tuple[int, int], float] = {}
        self.role_automations_loop.start()

    def cog_unload(self):
        self.role_automations_loop.cancel()

    def _get_server_tag(self, guild: discord.Guild) -> str | None:
        if hasattr(guild, 'clan') and getattr(guild, 'clan'):
            return getattr(guild.clan, 'tag', None)
        return None

    def _can_manage_role(self, guild: discord.Guild, role: discord.Role | None) -> bool:
        if not role or role.is_default() or role.managed:
            return False
        if not guild.me or not guild.me.guild_permissions.manage_roles:
            return False
        return guild.me.top_role > role

    async def _execute_custom_rules(self, member: discord.Member, trigger_type: str, config: dict | None = None):
        if member.bot:
            return
        if config is None:
            config = load_join_roles(member.guild.id)

        rules = config.get("custom_rules", [])
        if not rules:
            return

        to_add = []
        to_remove = []

        for rule in rules:
            if not isinstance(rule, dict) or not rule.get("enabled", True):
                continue
            if rule.get("trigger") != trigger_type:
                continue

            cond_role_id = rule.get("condition_role_id")
            if cond_role_id and str(cond_role_id).isdigit():
                c_role = member.guild.get_role(int(cond_role_id))
                if c_role and c_role not in member.roles:
                    continue

            action = rule.get("action", "add_role")
            role_id = rule.get("role_id")

            if action == "send_dm":
                dm_msg = (rule.get("dm_message") or "").strip()
                if dm_msg:
                    formatted = (
                        dm_msg.replace("{user}", member.mention)
                        .replace("{username}", member.name)
                        .replace("{server}", member.guild.name)
                        .replace("{memberCount}", str(member.guild.member_count or 0))
                    )
                    try:
                        await member.send(formatted)
                    except Exception:
                        pass
                continue

            if not role_id or not str(role_id).isdigit():
                continue

            target_role = member.guild.get_role(int(role_id))
            if not self._can_manage_role(member.guild, target_role):
                continue

            if action == "add_role":
                if target_role not in member.roles and target_role not in to_add:
                    to_add.append(target_role)
            elif action == "remove_role":
                if target_role in member.roles and target_role not in to_remove:
                    to_remove.append(target_role)

        if to_add:
            try:
                await member.add_roles(*to_add, reason=f"Custom Role Rule ({trigger_type})")
            except Exception:
                pass
        if to_remove:
            try:
                await member.remove_roles(*to_remove, reason=f"Custom Role Rule ({trigger_type})")
            except Exception:
                pass

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        config = load_join_roles(member.guild.id)
        roles_to_add = []

        # 1. Auto Roles / Join Roles
        if member.bot:
            if config.get("enabled", False) and config.get("bot_roles_enabled", False):
                role_ids = config.get("bot_roles", [])
                for rid in role_ids:
                    role = member.guild.get_role(int(rid))
                    if self._can_manage_role(member.guild, role) and role not in roles_to_add:
                        roles_to_add.append(role)
        else:
            user_roles = config.get("user_roles", [])
            if user_roles and (config.get("user_roles_enabled", True) or config.get("enabled", True)):
                for rid in user_roles:
                    if str(rid).isdigit():
                        role = member.guild.get_role(int(rid))
                        if self._can_manage_role(member.guild, role) and role not in roles_to_add:
                            roles_to_add.append(role)

            if config.get("enabled", False) and config.get("tag_roles_enabled", False) and config.get("tag_role"):
                tag_role = member.guild.get_role(int(config.get("tag_role")))
                if self._can_manage_role(member.guild, tag_role):
                    server_tag = self._get_server_tag(member.guild)
                    if server_tag:
                        server_tag_lower = server_tag.lower()
                        if server_tag_lower in member.display_name.lower() or server_tag_lower in member.name.lower():
                            if tag_role not in roles_to_add:
                                roles_to_add.append(tag_role)

        # 2. Sticky Roles
        sticky_cfg = config.get("sticky_roles", {})
        if not member.bot and sticky_cfg.get("enabled", False):
            try:
                db = get_db()
                record = db["StickyRoles"].find_one({
                    "guild_id": str(member.guild.id),
                    "user_id": str(member.id)
                })
                if record and record.get("roles"):
                    restore_all = sticky_cfg.get("restore_all", True)
                    allowed_roles = [int(r) for r in sticky_cfg.get("roles", []) if str(r).isdigit()]
                    for rid in record["roles"]:
                        if not restore_all and rid not in allowed_roles:
                            continue
                        role = member.guild.get_role(int(rid))
                        if self._can_manage_role(member.guild, role) and role not in roles_to_add:
                            roles_to_add.append(role)
            except Exception:
                pass

        if roles_to_add:
            try:
                await member.add_roles(*roles_to_add, reason="Automatic AutoRole / StickyRole assignment")
            except Exception:
                pass

        # 3. Custom Rules (member_join)
        await self._execute_custom_rules(member, "member_join", config)

    @commands.Cog.listener()
    async def on_member_remove(self, member: discord.Member):
        if member.bot:
            return

        config = load_join_roles(member.guild.id)
        sticky_cfg = config.get("sticky_roles", {})
        if not sticky_cfg.get("enabled", False):
            return

        try:
            valid_role_ids = [
                r.id for r in member.roles
                if self._can_manage_role(member.guild, r)
            ]
            if valid_role_ids:
                db = get_db()
                db["StickyRoles"].replace_one(
                    {"guild_id": str(member.guild.id), "user_id": str(member.id)},
                    {"guild_id": str(member.guild.id), "user_id": str(member.id), "roles": valid_role_ids},
                    upsert=True
                )
        except Exception:
            pass

    @commands.Cog.listener()
    async def on_member_update(self, before: discord.Member, after: discord.Member):
        if before.bot:
            return

        config = load_join_roles(after.guild.id)

        # 1. Booster Role
        booster_cfg = config.get("booster_role", {})
        was_boosting = before.premium_since is not None
        is_boosting = after.premium_since is not None

        if booster_cfg.get("enabled", False) and booster_cfg.get("role_id"):
            b_role = after.guild.get_role(int(booster_cfg["role_id"]))
            if self._can_manage_role(after.guild, b_role):
                if not was_boosting and is_boosting:
                    if b_role not in after.roles:
                        try:
                            await after.add_roles(b_role, reason="Orbit Booster Role assigned")
                        except Exception:
                            pass
                elif was_boosting and not is_boosting:
                    if b_role in after.roles:
                        try:
                            await after.remove_roles(b_role, reason="Orbit Booster Role removed (no longer boosting)")
                        except Exception:
                            pass

        # 2. Custom Rules on boost / verify / role change
        if not was_boosting and is_boosting:
            await self._execute_custom_rules(after, "member_boost", config)

        if before.pending and not after.pending:
            await self._execute_custom_rules(after, "member_verify", config)

        if set(before.roles) != set(after.roles):
            added_roles = set(after.roles) - set(before.roles)
            if added_roles:
                await self._execute_custom_rules(after, "has_role", config)
                # Also trigger member_verify if the added role matches server's verification role
                try:
                    from Components.Systems.Verification._storage import load_verify_config
                    v_cfg = load_verify_config(after.guild.id)
                    v_role_id = v_cfg.get("role_id")
                    if v_role_id and any(r.id == int(v_role_id) for r in added_roles):
                        await self._execute_custom_rules(after, "member_verify", config)
                except Exception:
                    pass

        # 3. Tag Roles
        if before.display_name == after.display_name and before.name == after.name:
            return

        if not config.get("enabled", False) or not config.get("tag_roles_enabled", False):
            return

        tag_role_id = config.get("tag_role")
        if not tag_role_id:
            return

        tag_role = after.guild.get_role(int(tag_role_id))
        if not self._can_manage_role(after.guild, tag_role):
            return

        server_tag = self._get_server_tag(after.guild)
        if not server_tag:
            return

        server_tag_lower = server_tag.lower()
        has_tag_now = server_tag_lower in after.display_name.lower() or server_tag_lower in after.name.lower()
        had_tag_before = server_tag_lower in before.display_name.lower() or server_tag_lower in before.name.lower()

        if has_tag_now and not had_tag_before:
            if tag_role not in after.roles:
                try:
                    await after.add_roles(tag_role, reason="Auto Tag Role Assignment (Name updated)")
                except Exception:
                    pass
        elif had_tag_before and not has_tag_now:
            if tag_role in after.roles:
                try:
                    await after.remove_roles(tag_role, reason="Auto Tag Role Removal (Tag removed)")
                except Exception:
                    pass

    @commands.Cog.listener()
    async def on_message(self, message: discord.Message):
        if not message.guild or message.author.bot or not isinstance(message.author, discord.Member):
            return

        member = message.author
        guild = message.guild
        config = load_join_roles(guild.id)

        # 1. Activity Roles - track member activity & grant active roles immediately
        activity_rules = config.get("activity_roles", [])
        if activity_rules:
            now_ts = time.time()
            cache_key = (guild.id, member.id)
            last_saved = self._activity_Write_cache.get(cache_key, 0.0)
            if now_ts - last_saved > 300:  # Throttle DB writes to once every 5 mins per member
                self._activity_Write_cache[cache_key] = now_ts
                try:
                    db = get_db()
                    db["MemberActivity"].update_one(
                        {"guild_id": str(guild.id), "user_id": str(member.id)},
                        {"$set": {"last_active": now_ts}},
                        upsert=True
                    )
                except Exception:
                    pass

            act_roles_to_add = []
            for rule in activity_rules:
                rid = rule.get("role_id")
                if rid and str(rid).isdigit():
                    role = guild.get_role(int(rid))
                    if self._can_manage_role(guild, role) and role not in member.roles and role not in act_roles_to_add:
                        act_roles_to_add.append(role)
            if act_roles_to_add:
                try:
                    await member.add_roles(*act_roles_to_add, reason="Activity Role (Member active)")
                except Exception:
                    pass

        # 2. Tenure Roles - check on message if member qualifies
        tenure_rules = config.get("tenure_roles", [])
        if tenure_rules and member.joined_at:
            now_dt = datetime.now(timezone.utc)
            days_in_server = (now_dt - member.joined_at).total_seconds() / 86400.0
            tenure_to_add = []
            for rule in tenure_rules:
                rid = rule.get("role_id")
                req_days = int(rule.get("days", 7))
                if rid and str(rid).isdigit() and days_in_server >= req_days:
                    role = guild.get_role(int(rid))
                    if self._can_manage_role(guild, role) and role not in member.roles and role not in tenure_to_add:
                        tenure_to_add.append(role)
            if tenure_to_add:
                try:
                    await member.add_roles(*tenure_to_add, reason="Tenure Role (Days in server reached)")
                except Exception:
                    pass

        # 3. Custom Rules (message_sent)
        if config.get("custom_rules"):
            await self._execute_custom_rules(member, "message_sent", config)

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if not payload.guild_id or (self.bot.user and payload.user_id == self.bot.user.id):
            return
        guild = self.bot.get_guild(payload.guild_id)
        if not guild:
            return
        member = payload.member or guild.get_member(payload.user_id)
        if not member or member.bot:
            return
        config = load_join_roles(guild.id)
        if config.get("custom_rules"):
            await self._execute_custom_rules(member, "reaction_add", config)

    @tasks.loop(minutes=30)
    async def role_automations_loop(self):
        now_dt = datetime.now(timezone.utc)
        now_ts = time.time()
        db = get_db()

        for guild in list(self.bot.guilds):
            try:
                config = await asyncio.to_thread(load_join_roles, guild.id)
                tenure_rules = config.get("tenure_roles", [])
                activity_rules = config.get("activity_roles", [])
                booster_cfg = config.get("booster_role", {})

                if not tenure_rules and not activity_rules and not booster_cfg.get("enabled"):
                    await asyncio.sleep(0.01)
                    continue

                # Load activity map if needed
                activity_map = {}
                if activity_rules:
                    def _fetch_act():
                        m = {}
                        cursor = db["MemberActivity"].find({"guild_id": str(guild.id)})
                        for doc in cursor:
                            uid = doc.get("user_id")
                            if uid and str(uid).isdigit():
                                m[int(uid)] = float(doc.get("last_active", 0))
                        return m
                    activity_map = await asyncio.to_thread(_fetch_act)

                for member in list(guild.members):
                    if member.bot:
                        continue

                    to_add = []
                    to_remove = []

                    # Check Booster Role
                    if booster_cfg.get("enabled") and booster_cfg.get("role_id"):
                        b_role = guild.get_role(int(booster_cfg["role_id"]))
                        if self._can_manage_role(guild, b_role):
                            is_boosting = member.premium_since is not None
                            if is_boosting and b_role not in member.roles:
                                to_add.append(b_role)
                            elif not is_boosting and b_role in member.roles:
                                to_remove.append(b_role)

                    # Check Tenure Roles
                    if tenure_rules and member.joined_at:
                        days_in_server = (now_dt - member.joined_at).total_seconds() / 86400.0
                        for rule in tenure_rules:
                            rid = rule.get("role_id")
                            req_days = int(rule.get("days", 7))
                            if rid and str(rid).isdigit() and days_in_server >= req_days:
                                role = guild.get_role(int(rid))
                                if self._can_manage_role(guild, role) and role not in member.roles and role not in to_add:
                                    to_add.append(role)

                    # Check Activity Roles
                    if activity_rules:
                        last_act = activity_map.get(member.id, 0.0)
                        for rule in activity_rules:
                            rid = rule.get("role_id")
                            req_days = int(rule.get("days", 7))
                            if rid and str(rid).isdigit():
                                role = guild.get_role(int(rid))
                                if not self._can_manage_role(guild, role):
                                    continue
                                is_active_recently = last_act > 0 and ((now_ts - last_act) <= (req_days * 86400.0))
                                if is_active_recently and role not in member.roles and role not in to_add:
                                    to_add.append(role)
                                elif not is_active_recently and role in member.roles and role not in to_remove:
                                    to_remove.append(role)

                    if to_add:
                        try:
                            await member.add_roles(*to_add, reason="Role Automations Periodic Sync")
                        except Exception:
                            pass
                    if to_remove:
                        try:
                            await member.remove_roles(*to_remove, reason="Role Automations Periodic Sync")
                        except Exception:
                            pass
            except Exception:
                pass
            await asyncio.sleep(0.05)

    @role_automations_loop.before_loop
    async def before_role_automations_loop(self):
        await self.bot.wait_until_ready()


async def setup(bot: commands.Bot):
    await bot.add_cog(JoinRoleListener(bot))
