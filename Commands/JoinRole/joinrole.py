import discord
from discord import app_commands
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator, ActionRow, Button
from Commands.JoinRole._storage import load_join_roles, add_join_role, remove_join_role, clear_join_roles

class JoinRoleLayout(LayoutView):
    def __init__(self, guild: discord.Guild, action_summary: str, author_id: int):
        super().__init__()
        self.guild = guild
        self.author_id = author_id
        
        role_ids = load_join_roles(guild.id)
        role_mentions = []
        for rid in role_ids:
            role = guild.get_role(rid)
            if role:
                role_mentions.append(role.mention)
            else:
                role_mentions.append(f"`Unknown ID: {rid}`")

        roles_text = "\n".join(f"> • {rm}" for rm in role_mentions) if role_mentions else "`No automatic join roles currently configured.`"
        header_str = f"### 🏷️ Automatic Join Roles: **{guild.name}**\n**Action:** {action_summary} | **Total Configured:** `{len(role_ids)}`"
        
        items = [
            TextDisplay(content=header_str),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=f"**Assigned on Join:**\n{roles_text}")
        ]

        btn_close = Button(label="Close ✖", style=discord.ButtonStyle.secondary)
        
        async def close_cb(interaction: discord.Interaction):
            if interaction.user.id != self.author_id:
                return await interaction.response.send_message("You cannot close this panel.", ephemeral=True)
            try:
                await interaction.message.delete()
            except Exception:
                self.clear_items()
                self.add_item(Container(TextDisplay(content="### Panel closed.")))
                await interaction.response.edit_message(view=self)
                self.stop()

        btn_close.callback = close_cb

        if role_ids:
            btn_clear = Button(label="Clear All 🗑️", style=discord.ButtonStyle.danger)
            
            async def clear_cb(interaction: discord.Interaction):
                if interaction.user.id != self.author_id:
                    return await interaction.response.send_message("You cannot clear these roles.", ephemeral=True)
                cleared = clear_join_roles(self.guild.id)
                self.clear_items()
                self.add_item(Container(TextDisplay(content=f"### 🗑️ Cleared `{cleared}` automatic join roles."), ActionRow(btn_close)))
                await interaction.response.edit_message(view=self)

            btn_clear.callback = clear_cb
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_clear, btn_close)])
        else:
            items.extend([Separator(spacing=discord.SeparatorSpacing.small), ActionRow(btn_close)])

        self.container = Container(*items)
        self.add_item(self.container)

class JoinRoleCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.bot:
            return

        role_ids = load_join_roles(member.guild.id)
        if not role_ids:
            return

        roles_to_add = []
        for rid in role_ids:
            role = member.guild.get_role(rid)
            if role and not role.is_default() and not role.managed:
                if member.guild.me.top_role > role:
                    roles_to_add.append(role)

        if roles_to_add:
            try:
                await member.add_roles(*roles_to_add, reason="Automatic JoinRole assignment upon joining")
            except Exception:
                pass

    @commands.hybrid_group(name="joinrole", description="Configure roles automatically given to new members when they join.")
    @commands.has_permissions(manage_roles=True)
    async def joinrole(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await ctx.send("Please use `-joinrole add <@role>`, `-joinrole remove <@role>`, or `-joinrole list`.", ephemeral=True)

    @joinrole.command(name="add", description="Add a role to be automatically assigned when a new member joins.")
    @commands.has_permissions(manage_roles=True)
    @app_commands.describe(role="The role to automatically give to joining members")
    async def add(self, ctx: commands.Context, role: discord.Role):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        if role.is_default() or role.managed:
            return await ctx.send("You cannot configure `@everyone` or bot integration roles (`managed roles`) as join roles.", ephemeral=True)

        if ctx.guild.me.top_role <= role:
            return await ctx.send(f"I cannot assign {role.mention} because it is higher than or equal to my highest role (`{ctx.guild.me.top_role.name}`).", ephemeral=True)

        added = add_join_role(ctx.guild.id, role.id)
        summary = f"Added {role.mention}" if added else f"{role.mention} is already in the join roles list."
        view = JoinRoleLayout(ctx.guild, summary, ctx.author.id)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @joinrole.command(name="remove", description="Remove a role from the automatic join roles list.")
    @commands.has_permissions(manage_roles=True)
    @app_commands.describe(role="The role to remove from automatic assignment")
    async def remove(self, ctx: commands.Context, role: discord.Role):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        removed = remove_join_role(ctx.guild.id, role.id)
        summary = f"Removed {role.mention}" if removed else f"{role.mention} was not in the join roles list."
        view = JoinRoleLayout(ctx.guild, summary, ctx.author.id)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @joinrole.command(name="list", description="Display all configured automatic join roles for this server.")
    @commands.has_permissions(manage_roles=True)
    async def list_roles(self, ctx: commands.Context):
        await ctx.defer()
        if not ctx.guild:
            return await ctx.send("This command must be run inside a server.", ephemeral=True)

        view = JoinRoleLayout(ctx.guild, "Viewing list", ctx.author.id)
        await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

    @joinrole.error
    @add.error
    @remove.error
    @list_roles.error
    async def joinrole_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You need Manage Roles permission to configure join roles.", ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-joinrole add <@role>` or `-joinrole remove <@role>`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(JoinRoleCommand(bot))
