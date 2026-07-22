import asyncio
import discord
from discord import app_commands
from discord.ext import commands
from Commands._utils import MemberOrIDConverter, format_usage
from Commands.Log._storage import log_event

class DMCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="dm",
        aliases=["directmessage", "pm"],
        description="Send a direct message to a user, User ID, or all members of a role (`-dm <target> <message>`)."
    )
    @app_commands.describe(
        target="Role mention/ID, Member mention, or User ID",
        message="The message content to send via DM"
    )
    @commands.has_permissions(manage_messages=True)
    async def dm_cmd(self, ctx: commands.Context, target: str = None, *, message: str = None):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if not target:
            return await ctx.send(format_usage("-dm", "<@member/ID/@role>", "<message>"), ephemeral=True)

        if not message:
            return await ctx.send("Please provide a message to send. Usage: `-dm <@member/ID/@role> <message>`", ephemeral=True)

        await ctx.defer()

        target_str = target.strip()
        full_input = f"{target_str} {message}".strip()
        matched_role: discord.Role | None = None

        # 1. Try role lookup by ID or role mention (<@&123456789>)
        cleaned_role_id = target_str.strip("<@&> ")
        if cleaned_role_id.isdigit():
            matched_role = ctx.guild.get_role(int(cleaned_role_id))

        # 2. Try role lookup by exact or partial role name (handling spaces in role names)
        if not matched_role:
            # Check target string first
            for r in ctx.guild.roles:
                if r.name.lower() in (target_str.lower(), target_str.lstrip("@").lower()):
                    matched_role = r
                    break

            # If multi-word role name like "@Meow gang Hello world", check prefix match in full_input
            if not matched_role:
                for r in ctx.guild.roles:
                    r_name_lower = r.name.lower()
                    r_mention_lower = f"@{r_name_lower}"
                    if full_input.lower().startswith(r_name_lower):
                        matched_role = r
                        message = full_input[len(r.name):].strip()
                        break
                    elif full_input.lower().startswith(r_mention_lower):
                        matched_role = r
                        message = full_input[len(r_mention_lower):].strip()
                        break

        # If matched a role: Mass Role DM
        if matched_role:
            if not message:
                return await ctx.send("Please provide a message to send to the role members. Usage: `-dm @role <message>`", ephemeral=True)

            target_members = [m for m in matched_role.members if not m.bot]
            if not target_members:
                return await ctx.send(f"No non-bot members found with role {matched_role.mention}.", ephemeral=True)

            status_msg = await ctx.send(f"⏳ Sending DM to **{len(target_members)}** members with role {matched_role.mention}...")

            success_count = 0
            failed_count = 0

            dm_embed = discord.Embed(
                title=f"📩 Announcement from {ctx.guild.name}",
                description=message,
                color=matched_role.color if matched_role.color != discord.Color.default() else discord.Color.blue()
            )
            dm_embed.set_footer(text=f"Sent by {ctx.author.display_name} • Role: @{matched_role.name}")
            if ctx.guild.icon:
                dm_embed.set_thumbnail(url=ctx.guild.icon.url)

            for member in target_members:
                try:
                    await member.send(embed=dm_embed)
                    success_count += 1
                except Exception:
                    failed_count += 1
                await asyncio.sleep(0.35)

            summary_embed = discord.Embed(
                title="📬 Mass Role DM Delivered",
                color=discord.Color.green()
            )
            summary_embed.add_field(name="Target Role", value=matched_role.mention, inline=True)
            summary_embed.add_field(name="Total Members", value=str(len(target_members)), inline=True)
            summary_embed.add_field(name="Successfully Sent", value=f"✅ `{success_count}`", inline=True)
            summary_embed.add_field(name="Failed (DMs Closed)", value=f"❌ `{failed_count}`", inline=True)

            await status_msg.edit(content=None, embed=summary_embed)

            await log_event(
                ctx.guild,
                "moderation_action",
                "Mass Role DM Sent (`-dm`)",
                f"**Role:** {matched_role.mention} (`{matched_role.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Delivered:** `{success_count}` | **Failed:** `{failed_count}`\n**Message:** {message[:500]}"
            )
            return

        # 3. Try User / Member lookup by mention or ID
        try:
            user_target = await MemberOrIDConverter().convert(ctx, target_str)
        except Exception:
            return await ctx.send(f"Could not find role, member, or user ID for `{target_str}`. Usage: `-dm <@member|ID|@role> <message>`", ephemeral=True)

        dm_embed = discord.Embed(
            title=f"📩 Message from {ctx.guild.name}",
            description=message,
            color=discord.Color.blue()
        )
        dm_embed.set_footer(text=f"Sent by {ctx.author.display_name}")
        if ctx.guild.icon:
            dm_embed.set_thumbnail(url=ctx.guild.icon.url)

        try:
            await user_target.send(embed=dm_embed)
        except Exception:
            return await ctx.send(f"❌ Failed to send DM to **{user_target}** (`{user_target.id}`). Their DMs may be closed.", ephemeral=True)

        embed = discord.Embed(
            title="✅ Direct Message Sent",
            description=f"Direct message successfully delivered to **{user_target.mention}** (`{user_target.id}`).",
            color=discord.Color.green()
        )
        embed.add_field(name="Message Content", value=message[:1024], inline=False)
        await ctx.send(embed=embed)

        await log_event(
            ctx.guild,
            "moderation_action",
            "Direct Message Sent (`-dm`)",
            f"**Target:** {user_target.mention} (`{user_target.id}`)\n**Moderator:** {ctx.author.mention} (`{ctx.author.id}`)\n**Message:** {message[:500]}"
        )

    @dm_cmd.error
    async def dm_cmd_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need `Manage Messages` permission to use the `-dm` command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-dm", "<@member/ID/@role>", "<message>"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"Error: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DMCommand(bot))
