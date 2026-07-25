import discord
from discord.ext import commands
from discord import app_commands
from discord.ui import View, Button
from Commands.Log._modlog_storage import get_modlogs
from Commands.Warn._storage import load_warnings
from Commands.Ban._storage import load_ban_history
from Commands._utils import MemberOrIDConverter, format_usage

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
            title=f"Moderation Log: {self.user_target.display_name if hasattr(self.user_target, 'display_name') else str(self.user_target)}",
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
            mod_id = log.get('moderator_id', 'Unknown')
            
            embed.add_field(
                name=f"{i}. {action}",
                value=f"**Date:** {date_str}\n**Moderator:** <@{mod_id}>\n**Reason:** {reason}",
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

    @commands.hybrid_command(name="modlog", aliases=["modlogs"], description="View the complete moderation history for a user.")
    @app_commands.describe(user="The member or user ID to check")
    @commands.has_permissions(moderate_members=True)
    async def modlog_cmd(self, ctx: commands.Context, user: str = None):
        if not user:
            return await ctx.send(format_usage("-modlog", "<@user/ID>"), ephemeral=True)
            
        await ctx.defer()
        
        try:
            user_target = await MemberOrIDConverter().convert(ctx, user)
        except Exception:
            return await ctx.send("Could not find user.", ephemeral=True)

        guild_id = ctx.guild.id
        user_id = user_target.id if hasattr(user_target, 'id') else int(user_target)

        # 1. Fetch unified ModLogs
        unified_logs = get_modlogs(guild_id, user_id)

        # 2. Fetch old warnings
        old_warns = load_warnings(guild_id).get(str(user_id), [])
        
        # 3. Fetch old bans
        old_bans = load_ban_history(guild_id).get(str(user_id), [])

        # Combine all logs
        all_logs = []
        all_logs.extend(unified_logs)
        
        for w in old_warns:
            all_logs.append({
                "action_type": "Warn (Legacy)",
                "reason": w.get("reason", "No reason"),
                "moderator_id": w.get("moderator", "Unknown"),
                "timestamp": w.get("timestamp", 0)
            })
            
        for b in old_bans:
            all_logs.append({
                "action_type": "Ban/Softban (Legacy)",
                "reason": b.get("reason", "No reason"),
                "moderator_id": b.get("moderator", "Unknown"),
                "timestamp": b.get("timestamp", 0)
            })

        # Remove possible exact duplicates if a command logged to both systems just now
        # We can loosely filter by timestamp and reason
        seen = set()
        unique_logs = []
        for log in all_logs:
            identifier = f"{log.get('timestamp')}-{log.get('reason')}"
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
            await ctx.send("You need `Moderate Members` permission to view modlogs.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ModLogCommand(bot))
