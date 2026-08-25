import discord
from discord import app_commands
from discord.ext import commands
from Components.Systems.Level._storage import (
    load_level_config, get_user_xp, xp_progress,
    get_leaderboard, get_leaderboard_by, get_user_rank, level_from_xp
)
import io
from Components.Commands._utils import make_embed

# ── Leaderboard category config ──
LB_CATEGORIES = {
    "total_xp": {"label": "Level", "title": "Level Leaderboard", "format": lambda e, g: _lb_level_line(e, g)},
    "message_count": {"label": "Messages", "title": "Messages Leaderboard", "format": lambda e, g: _lb_stat_line(e, g, "message_count")},
    "voice_minutes": {"label": "Voice Hours", "title": "Voice Hours Leaderboard", "format": lambda e, g: _lb_stat_line(e, g, "voice_minutes")},
    "reaction_count": {"label": "Reactions", "title": "Reactions Leaderboard", "format": lambda e, g: _lb_stat_line(e, g, "reaction_count")},
}

def _lb_level_line(entry, guild):
    uid = entry.get("user_id")
    xp = entry.get("total_xp", 0)
    lvl = level_from_xp(xp)
    member = guild.get_member(uid)
    name = member.display_name if member else f"User#{uid}"
    return name, f"Level {lvl}", f"XP {_format_lb_number(xp)}"

def _lb_stat_line(entry, guild, key):
    uid = entry.get("user_id")
    val = entry.get(key, 0)
    member = guild.get_member(uid)
    name = member.display_name if member else f"User#{uid}"
    
    if key == "voice_minutes":
        # Convert minutes to hours
        val = val / 60.0
        val_str = f"{val:.1f}"
    else:
        val_str = _format_lb_number(val)
        
    return name, val_str, ""

def _format_lb_number(n):
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    elif n >= 1_000:
        return f"{n / 1_000:.1f}k"
    return str(n)


class LeaderboardSelect(discord.ui.Select):
    def __init__(self, cog, guild, current_key="total_xp"):
        self.cog = cog
        self.guild = guild
        options = []
        for key, cat in LB_CATEGORIES.items():
            options.append(discord.SelectOption(
                label=cat["label"],
                value=key,
                default=(key == current_key)
            ))
        super().__init__(placeholder="Level", min_values=1, max_values=1, options=options)

    async def callback(self, interaction: discord.Interaction):
        chosen = self.values[0]
        await interaction.response.defer()
        embed, file = await self.cog._build_leaderboard_data(self.guild, chosen)
        if embed is None:
            return await interaction.followup.send(embed=make_embed("No data available.", discord.Color.red()), ephemeral=True)
        view = LeaderboardView(self.cog, self.guild, chosen)
        await interaction.edit_original_response(embed=embed, attachments=[file], view=view)


class LeaderboardView(discord.ui.View):
    def __init__(self, cog, guild, current_key="total_xp"):
        super().__init__(timeout=120)
        self.add_item(LeaderboardSelect(cog, guild, current_key))


class LevelCommandsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    async def _build_leaderboard_data(self, guild, sort_key="total_xp"):
        """Build a leaderboard embed and file for the given sort key. Returns (embed, file) or (None, None)."""
        top = get_leaderboard_by(guild.id, sort_key, 10)
        if not top:
            return None, None

        cat = LB_CATEGORIES.get(sort_key, LB_CATEGORIES["total_xp"])
        
        entries = []
        for i, entry_data in enumerate(top, 1):
            name, stat1, stat2 = cat["format"](entry_data, guild)
            uid = entry_data.get("user_id")
            member = guild.get_member(uid)
            
            avatar_bytes = None
            if member and member.display_avatar:
                try:
                    avatar_bytes = await member.display_avatar.read()
                except Exception:
                    pass
            
            lvl = level_from_xp(entry_data.get("total_xp", 0))
            
            entries.append({
                "name": name,
                "level": lvl,
                "value_label": stat2 if sort_key == "total_xp" else stat1,
                "avatar_bytes": avatar_bytes,
                "rank": i
            })

        from Components.Systems.Level.leaderboard_card import generate_leaderboard_card
        
        img_bytes = generate_leaderboard_card(
            entries=entries,
            sort_key=sort_key
        )
        
        file = discord.File(io.BytesIO(img_bytes), filename="leaderboard.png")
        import os
        base_url = os.environ.get("BASE_URL")
        embed = discord.Embed(
            title=cat["title"],
            description=f"[Want to see more than Top 10?]({base_url}/leaderboard/{guild.id})",
            color=0x2B2D31
        )
        embed.set_image(url="attachment://leaderboard.png")
        
        return embed, file

    @app_commands.command(name="rank", description="View your or another member's rank card.")
    @app_commands.describe(member="The member to check")
    async def rank(self, interaction: discord.Interaction, member: discord.Member = None):
        config = load_level_config(interaction.guild.id)
        if not config.get("enabled", False):
            from Components.Commands._utils import get_module_disabled_embed, ModuleDisabledView, make_embed
            return await interaction.response.send_message(
                embed=get_module_disabled_embed("Leveling"),
                view=ModuleDisabledView(interaction.guild.id, "Leveling"),
                ephemeral=True
            )

        target = member or interaction.user
        data = get_user_xp(interaction.guild.id, target.id)
        total_xp = data.get("total_xp", 0)
        level, current_xp, needed_xp = xp_progress(total_xp)
        rank = get_user_rank(interaction.guild.id, target.id)
        msg_count = data.get("message_count", 0)
        voice_mins = data.get("voice_minutes", 0)
        react_count = data.get("reaction_count", 0)

        # Try to generate rank card image
        try:
            from Components.Systems.Level.rank_card import generate_rank_card
            avatar_bytes = await target.display_avatar.read()
            # Dynamic bar color based on level
            colors = [
                (59, 130, 246),   # 0-9: Blue
                (16, 185, 129),   # 10-19: Green
                (245, 158, 11),   # 20-29: Yellow
                (239, 68, 68),    # 30-39: Red
                (139, 92, 246),   # 40-49: Purple
                (236, 72, 153),   # 50-59: Pink
                (20, 184, 166),   # 60-69: Teal
                (249, 115, 22),   # 70-79: Orange
                (99, 102, 241),   # 80-89: Indigo
                (217, 70, 239)    # 90+: Fuchsia
            ]
            idx = min(level // 10, len(colors) - 1)
            bar_color = colors[idx]

            img_bytes = generate_rank_card(
                username=target.display_name,
                avatar_bytes=avatar_bytes,
                rank=rank,
                level=level,
                current_xp=current_xp,
                needed_xp=needed_xp,
                total_xp=total_xp,
                message_count=msg_count,
                voice_minutes=voice_mins,
                reaction_count=react_count,
                bar_color=bar_color
            )
            file = discord.File(io.BytesIO(img_bytes), filename="rank_card.png")
            await interaction.response.send_message(file=file)
        except Exception:
            # Fallback to embed if image gen fails
            progress = int((current_xp / needed_xp) * 10) if needed_xp > 0 else 10
            bar = "🟦" * progress + "⬛" * (10 - progress)

            embed = discord.Embed(color=0x3B82F6)
            embed.set_author(name=target.display_name, icon_url=target.display_avatar.url)
            embed.add_field(name="Rank", value=f"#{rank}", inline=True)
            embed.add_field(name="Level", value=str(level), inline=True)
            embed.add_field(name="XP", value=f"{current_xp:,} / {needed_xp:,}", inline=True)
            embed.add_field(name="Progress", value=f"{bar}\n📨 {msg_count:,} •  {voice_mins:,}m • 😄 {react_count:,} • Total: {total_xp:,} XP", inline=False)
            embed.set_thumbnail(url=target.display_avatar.url)
            await interaction.response.send_message(embed=embed)

    @app_commands.command(name="leaderboard", description="View the server's XP leaderboard.")
    async def leaderboard(self, interaction: discord.Interaction):
        config = load_level_config(interaction.guild.id)
        if not config.get("enabled", False):
            from Components.Commands._utils import get_module_disabled_embed, ModuleDisabledView, make_embed
            return await interaction.response.send_message(
                embed=get_module_disabled_embed("Leveling"),
                view=ModuleDisabledView(interaction.guild.id, "Leveling"),
                ephemeral=True
            )

        await interaction.response.defer()
        embed, file = await self._build_leaderboard_data(interaction.guild, "total_xp")
        if embed is None:
            return await interaction.followup.send(embed=make_embed("No one has earned XP yet!", discord.Color.red()), ephemeral=True)

        view = LeaderboardView(self, interaction.guild)
        await interaction.followup.send(embed=embed, file=file, view=view)

    @commands.hybrid_group(name="xp", description="Manage member XP")
    async def xp(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send_help(ctx.command)

    @xp.command(name="add", description="Add XP to a member.")
    @app_commands.describe(member="The member to modify", amount="Amount of XP to add")
    @commands.has_permissions(administrator=True)
    async def xp_add(self, ctx: commands.Context, member: discord.Member, amount: int):
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        from Components.Systems.Level._storage import add_xp
        old_level, new_level, new_xp = add_xp(ctx.guild.id, member.id, amount)
        await ctx.send(embed=make_embed(f"Added **{amount:,} XP** to {member.mention}. They now have **{new_xp:,} XP** (Level {new_level}).", discord.Color.green()))

    @xp.command(name="remove", description="Remove XP from a member.")
    @app_commands.describe(member="The member to modify", amount="Amount of XP to remove")
    @commands.has_permissions(administrator=True)
    async def xp_remove(self, ctx: commands.Context, member: discord.Member, amount: int):
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        from Components.Systems.Level._storage import get_user_xp, set_user_xp, level_from_xp
        data = get_user_xp(ctx.guild.id, member.id)
        current_xp = data.get("total_xp", 0)
        new_xp = max(0, current_xp - amount)
        data["total_xp"] = new_xp
        set_user_xp(ctx.guild.id, member.id, data)
        new_level = level_from_xp(new_xp)
        await ctx.send(embed=make_embed(f"Removed **{amount:,} XP** from {member.mention}. They now have **{new_xp:,} XP** (Level {new_level}).", discord.Color.green()))

    @xp.command(name="set", description="Set a member's XP.")
    @app_commands.describe(member="The member to modify", amount="Amount of XP to set")
    @commands.has_permissions(administrator=True)
    async def xp_set(self, ctx: commands.Context, member: discord.Member, amount: int):
        if amount < 0:
            return await ctx.send(embed=make_embed("Amount cannot be negative.", discord.Color.red()), ephemeral=True)
            
        from Components.Systems.Level._storage import get_user_xp, set_user_xp, level_from_xp
        data = get_user_xp(ctx.guild.id, member.id)
        data["total_xp"] = amount
        set_user_xp(ctx.guild.id, member.id, data)
        new_level = level_from_xp(amount)
        await ctx.send(embed=make_embed(f"Set {member.mention}'s XP to **{amount:,} XP** (Level {new_level})."))

    @xp.command(name="transfer", description="Transfer XP between members.")
    @app_commands.describe(member="The member to transfer XP to", amount="Amount of XP to transfer")
    async def xp_transfer(self, ctx: commands.Context, member: discord.Member, amount: int):
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
        if member == ctx.author:
            return await ctx.send(embed=make_embed("You cannot transfer XP to yourself.", discord.Color.red()), ephemeral=True)
            
        from Components.Systems.Level._storage import get_user_xp, set_user_xp, add_xp
        data = get_user_xp(ctx.guild.id, ctx.author.id)
        current_xp = data.get("total_xp", 0)
        
        if current_xp < amount:
            return await ctx.send(embed=make_embed(f"You don't have enough XP to transfer {amount:,}. You only have {current_xp:,} XP."), ephemeral=True)
            
        # Deduct from author
        data["total_xp"] = current_xp - amount
        set_user_xp(ctx.guild.id, ctx.author.id, data)
        
        # Add to target
        old_level, new_level, new_xp = add_xp(ctx.guild.id, member.id, amount)
        
        await ctx.send(embed=make_embed(f"Successfully transferred **{amount:,} XP** to {member.mention}!", discord.Color.green()))

    # ─── PREFIX COMMANDS ──────────────────────────────────────────────────────
    @commands.command(name="rank")
    async def rank_prefix(self, ctx: commands.Context, member: discord.Member = None):
        if not ctx.guild:
            return
        config = load_level_config(ctx.guild.id)
        if not config.get("enabled", False):
            from Components.Commands._utils import get_module_disabled_embed, ModuleDisabledView, make_embed
            return await ctx.send(
                embed=get_module_disabled_embed("Leveling"),
                view=ModuleDisabledView(ctx.guild.id, "Leveling")
            )

        target = member or ctx.author
        data = get_user_xp(ctx.guild.id, target.id)
        total_xp = data.get("total_xp", 0)
        level, current_xp, needed_xp = xp_progress(total_xp)
        rank = get_user_rank(ctx.guild.id, target.id)

        msg_count = data.get("message_count", 0)
        voice_mins = data.get("voice_minutes", 0)
        react_count = data.get("reaction_count", 0)

        try:
            from Components.Systems.Level.rank_card import generate_rank_card
            avatar_bytes = await target.display_avatar.read()
            
            colors = [
                (59, 130, 246),   (16, 185, 129),   (245, 158, 11),
                (239, 68, 68),    (139, 92, 246),   (236, 72, 153),
                (20, 184, 166),   (249, 115, 22),   (99, 102, 241),
                (217, 70, 239)
            ]
            idx = min(level // 10, len(colors) - 1)
            bar_color = colors[idx]

            img_bytes = generate_rank_card(
                username=target.display_name,
                avatar_bytes=avatar_bytes,
                rank=rank,
                level=level,
                current_xp=current_xp,
                needed_xp=needed_xp,
                total_xp=total_xp,
                message_count=msg_count,
                voice_minutes=voice_mins,
                reaction_count=react_count,
                bar_color=bar_color
            )
            file = discord.File(io.BytesIO(img_bytes), filename="rank_card.png")
            await ctx.send(file=file)
        except Exception as e:
            await ctx.send(embed=make_embed("Failed to generate rank card.", discord.Color.red()))

    @commands.command(name="leaderboard", aliases=["lb", "top"])
    async def leaderboard_prefix(self, ctx: commands.Context):
        config = load_level_config(ctx.guild.id)
        if not config.get("enabled", False):
            from Components.Commands._utils import get_module_disabled_embed, ModuleDisabledView
            return await ctx.send(
                embed=get_module_disabled_embed("Leveling"),
                view=ModuleDisabledView(ctx.guild.id, "Leveling")
            )

        embed, file = await self._build_leaderboard_data(ctx.guild, "total_xp")
        if embed is None:
            return await ctx.send(embed=make_embed("No one has earned XP yet!", discord.Color.red()))

        view = LeaderboardView(self, ctx.guild)
        await ctx.send(embed=embed, file=file, view=view)



async def setup(bot: commands.Bot):
    await bot.add_cog(LevelCommandsCog(bot))