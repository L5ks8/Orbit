import discord
from discord.ext import commands
from discord import app_commands
from discord.ui import View, Button
from Components.Commands.ModLog._modlog_storage import get_modlogs
from Components.Commands.Warn._storage import load_warnings
from Components.Commands.Ban._storage import load_ban_history
from Components.Commands._utils import MemberOrIDConverter, format_usage, make_embed

class ModLogPaginationView(View):
    def __init__(self, interaction_or_ctx, user_target, logs: list):
        super().__init__(timeout=180)
        self.ctx = interaction_or_ctx
        self.user_target = user_target
        self.logs = logs
        self.current_page = 0
        self.per_page = 5
        self.max_pages = max(1, (len(self.logs) + self.per_page - 1) // self.per_page)
        self.update_buttons()

    def update_buttons(self):
        self.prev_btn.disabled = self.current_page == 0
        self.next_btn.disabled = self.current_page >= self.max_pages - 1

    def generate_embed(self):
        embed = discord.Embed(
            title=f"Actions by: {self.user_target.display_name if hasattr(self.user_target, 'display_name') else str(self.user_target)}",
            color=discord.Color.gold()
        )
        if hasattr(self.user_target, 'avatar') and self.user_target.avatar:
            embed.set_thumbnail(url=self.user_target.avatar.url)

        if not self.logs:
            embed.description = "No moderation history found for this user."
            return embed

        start = self.current_page * self.per_page
        end = start + self.per_page
        page_logs = self.logs[start:end]

        for i, log in enumerate(page_logs, start=start + 1):
            action = log.get('action_type', 'Unknown Action')
            reason = log.get('reason', 'No reason provided')
            ts = log.get('timestamp', 0)
            date_str = f"<t:{int(ts)}:f>" if ts else "Unknown date"
            target_id = log.get('user_id', 'Unknown')
            
            embed.add_field(
                name=f"{i}. {action}",
                value=f"**Date:** {date_str}\n**Target:** <@{target_id}>\n**Reason:** {reason}",
                inline=False
            )
            
        embed.set_footer(text=f"Page {self.current_page + 1} of {self.max_pages} • Total records: {len(self.logs)}")
        return embed

    @discord.ui.button(label="Previous", style=discord.ButtonStyle.primary, custom_id="modlog_prev")
    async def prev_btn(self, interaction: discord.Interaction, button: Button):
        self.current_page -= 1
        self.update_buttons()
        await interaction.response.edit_message(embed=self.generate_embed(), view=self)

    @discord.ui.button(label="Next", style=discord.ButtonStyle.primary, custom_id="modlog_next")
    async def next_btn(self, interaction: discord.Interaction, button: Button):
        self.current_page += 1
        self.update_buttons()
        await interaction.response.edit_message(embed=self.generate_embed(), view=self)


class ModLogCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="modlog", aliases=["modlogs"], description="View the moderation actions performed by an admin/moderator.")
    @app_commands.describe(user="The moderator or admin to check")
    @commands.has_permissions(moderate_members=True)
    async def modlog_cmd(self, ctx: commands.Context, user: discord.Member | discord.User):
        await ctx.defer()
        
        user_target = user
        guild_id = ctx.guild.id
        moderator_id = user_target.id

        # 1. Fetch unified ModLogs by moderator
        from Components.Commands.ModLog._modlog_storage import get_modlogs_by_moderator
        unified_logs = get_modlogs_by_moderator(guild_id, moderator_id)

        # 2. Fetch old warnings by this moderator
        all_warns = load_warnings(guild_id)
        old_warns = []
        for target_uid, warns in all_warns.items():
            for w in warns:
                # Some old storages use "moderator" and some use "moderator_id"
                mod_val = w.get("moderator") or w.get("moderator_id")
                if str(mod_val) == str(moderator_id):
                    w_copy = dict(w)
                    w_copy["target_id"] = target_uid
                    old_warns.append(w_copy)
        
        # 3. Fetch old bans by this moderator
        all_bans = load_ban_history(guild_id)
        old_bans = []
        for target_uid, bans in all_bans.items():
            for b in bans:
                mod_val = b.get("moderator") or b.get("moderator_id")
                if str(mod_val) == str(moderator_id):
                    b_copy = dict(b)
                    b_copy["target_id"] = target_uid
                    old_bans.append(b_copy)

        # Combine all logs
        all_logs = []
        all_logs.extend(unified_logs)
        
        for w in old_warns:
            all_logs.append({
                "action_type": "Warn (Legacy)",
                "reason": w.get("reason", "No reason"),
                "user_id": w.get("target_id", "Unknown"),
                "timestamp": w.get("timestamp", 0)
            })
            
        for b in old_bans:
            all_logs.append({
                "action_type": "Ban/Softban (Legacy)",
                "reason": b.get("reason", "No reason"),
                "user_id": b.get("target_id", "Unknown"),
                "timestamp": b.get("timestamp", 0)
            })

        seen = set()
        unique_logs = []
        for log in all_logs:
            identifier = f"{log.get('timestamp')}-{log.get('reason')}-{log.get('user_id')}"
            if identifier not in seen:
                seen.add(identifier)
                unique_logs.append(log)

        # Sort by timestamp, descending (newest first)
        unique_logs.sort(key=lambda x: x.get("timestamp", 0), reverse=True)

        view = ModLogPaginationView(ctx, user_target, unique_logs)
        embed = view.generate_embed()
        
        if len(unique_logs) <= view.per_page:
            # No need for buttons
            await ctx.send(embed=embed)
        else:
            await ctx.send(embed=embed, view=view)

    @modlog_cmd.error
    async def modlog_cmd_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(embed=make_embed("You need `Moderate Members` permission to view modlogs.", discord.Color.red()), ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument) or isinstance(error, commands.BadArgument):
            await ctx.send(embed=make_embed(format_usage("-modlog", "<@user/ID>"), discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ModLogCommand(bot))
