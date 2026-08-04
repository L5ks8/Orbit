import asyncio
import discord
from discord import app_commands
from discord.ext import commands
from Commands._utils import MemberOrIDConverter, format_usage
from Commands.Log._storage import log_event

class ComposeDMModal(discord.ui.Modal, title="Compose Anonymous DM"):
    message_input = discord.ui.TextInput(
        label="Message Content",
        style=discord.TextStyle.paragraph,
        placeholder="Type your message here... You can use formatting like **bold**.",
        required=True,
        max_length=2000
    )

    def __init__(self, target_type, target_obj, context_msg, guild, author, original_message=""):
        super().__init__()
        self.target_type = target_type  # 'role' or 'user'
        self.target_obj = target_obj
        self.context_msg = context_msg  # the message containing the compose button (if any)
        self.guild = guild
        self.author = author
        if original_message:
            self.message_input.default = original_message[:2000]

    async def on_submit(self, interaction: discord.Interaction):
        message = self.message_input.value.strip()

        if self.context_msg:
            try:
                await self.context_msg.edit(content="⏳ Sending DM...", view=None, embed=None)
            except Exception:
                pass
        
        await interaction.response.defer(ephemeral=True)

        if self.target_type == 'role':
            matched_role = self.target_obj
            target_members = [m for m in matched_role.members if not m.bot]
            if not target_members:
                return await interaction.followup.send(f"No non-bot members found with role {matched_role.mention}.", ephemeral=True)

            success_count = 0
            failed_count = 0

            for member in target_members:
                try:
                    await member.send(content=message)
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

            await interaction.followup.send(embed=summary_embed, ephemeral=True)

            await log_event(
                self.guild,
                "moderation_action",
                "Mass Role DM Sent (`-dm`)",
                f"**Role:** {matched_role.mention} (`{matched_role.id}`)\n**Moderator:** {self.author.mention} (`{self.author.id}`)\n**Delivered:** `{success_count}` | **Failed:** `{failed_count}`\n**Message:** {message[:500]}"
            )

        elif self.target_type == 'user':
            user_target = self.target_obj
            try:
                await user_target.send(content=message)
            except Exception:
                return await interaction.followup.send(f"❌ Failed to send DM to **{user_target}** (`{user_target.id}`). Their DMs may be closed.", ephemeral=True)

            embed = discord.Embed(
                title="✅ Direct Message Sent",
                description=f"Direct message successfully delivered to **{user_target.mention}** (`{user_target.id}`).",
                color=discord.Color.green()
            )
            embed.add_field(name="Message Content", value=message[:1024], inline=False)
            await interaction.followup.send(embed=embed, ephemeral=True)

            await log_event(
                self.guild,
                "moderation_action",
                "Direct Message Sent (`-dm`)",
                f"**Target:** {user_target.mention} (`{user_target.id}`)\n**Moderator:** {self.author.mention} (`{self.author.id}`)\n**Message:** {message[:500]}"
            )

class ComposeDMView(discord.ui.View):
    def __init__(self, target_type, target_obj, guild, author, original_message=""):
        super().__init__(timeout=300)
        self.target_type = target_type
        self.target_obj = target_obj
        self.guild = guild
        self.author = author
        self.original_message = original_message

    @discord.ui.button(label="Compose DM", style=discord.ButtonStyle.primary, emoji="✍️")
    async def compose_btn(self, interaction: discord.Interaction, button: discord.ui.Button):
        if interaction.user.id != self.author.id:
            return await interaction.response.send_message("Only the command executor can use this.", ephemeral=True)
        modal = ComposeDMModal(
            target_type=self.target_type,
            target_obj=self.target_obj,
            context_msg=interaction.message,
            guild=self.guild,
            author=self.author,
            original_message=self.original_message
        )
        await interaction.response.send_modal(modal)


class DMCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(
        name="dm",
        aliases=["directmessage", "pm"],
        description="Send an anonymous direct message to a user or role."
    )
    @app_commands.describe(
        target="Role mention/ID, Member mention, or User ID",
        message="Optional text to pre-fill the compose modal."
    )
    @commands.has_permissions(manage_messages=True)
    async def dm_cmd(self, ctx: commands.Context, target: str = None, *, message: str = None):
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if not target:
            return await ctx.send(format_usage("-dm", "<@member/ID/@role>", "[optional message]"), ephemeral=True)

        target_str = target.strip()
        full_input = f"{target_str} {message}" if message else target_str
        matched_role: discord.Role | None = None
        user_target = None
        target_type = None
        target_obj = None
        extracted_message = message or ""

        # 1. Try role lookup by ID or role mention
        cleaned_role_id = target_str.strip("<@&> ")
        if cleaned_role_id.isdigit():
            matched_role = ctx.guild.get_role(int(cleaned_role_id))

        # 2. Try role lookup by exact or partial role name
        if not matched_role:
            for r in ctx.guild.roles:
                if r.name.lower() in (target_str.lower(), target_str.lstrip("@").lower()):
                    matched_role = r
                    break

            if not matched_role:
                for r in ctx.guild.roles:
                    r_name_lower = r.name.lower()
                    r_mention_lower = f"@{r_name_lower}"
                    if full_input.lower().startswith(r_name_lower):
                        matched_role = r
                        extracted_message = full_input[len(r.name):].strip()
                        break
                    elif full_input.lower().startswith(r_mention_lower):
                        matched_role = r
                        extracted_message = full_input[len(r_mention_lower):].strip()
                        break

        if matched_role:
            target_type = 'role'
            target_obj = matched_role
        else:
            try:
                user_target = await MemberOrIDConverter().convert(ctx, target_str)
                target_type = 'user'
                target_obj = user_target
            except Exception:
                return await ctx.send(f"Could not find role, member, or user ID for `{target_str}`.", ephemeral=True)

        target_display = target_obj.mention if hasattr(target_obj, 'mention') else str(target_obj)
        embed = discord.Embed(
            title="✍️ Compose Anonymous DM",
            description=f"Target: {target_display}\n\nClick the button below to open the composition window where you can properly format your anonymous message.",
            color=discord.Color.blue()
        )

        view = ComposeDMView(
            target_type=target_type,
            target_obj=target_obj,
            guild=ctx.guild,
            author=ctx.author,
            original_message=extracted_message
        )

        if ctx.interaction:
            # If slash command, we can technically open the modal right away, but to keep behavior consistent:
            await ctx.send(embed=embed, view=view, ephemeral=True)
        else:
            await ctx.send(embed=embed, view=view)

    @dm_cmd.error
    async def dm_cmd_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need `Manage Messages` permission to use the `-dm` command.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(format_usage("-dm", "<@member/ID/@role>", "[optional message]"), ephemeral=True)
        elif isinstance(error, commands.BadArgument):
            await ctx.send(f"Error: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(DMCommand(bot))
