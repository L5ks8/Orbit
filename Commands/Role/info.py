import discord
from discord.ext import commands
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.Role.role import role_group

class RoleInfoLayout(LayoutView):
    def __init__(self, role: discord.Role):
        super().__init__()
        color_hex = str(role.color) if role.color.value != 0 else "#000000 (Default)"
        created_ts = int(role.created_at.timestamp())
        
        info_content = (
            f"**ID:** `{role.id}`\n"
            f"**Color:** `{color_hex}`\n"
            f"**Position:** `{role.position}`\n"
            f"**Members:** `{len(role.members)} users`\n"
            f"**Hoisted (Displayed separately):** `{role.hoist}`\n"
            f"**Mentionable:** `{role.mentionable}`\n"
            f"**Created:** <t:{created_ts}:F> (<t:{created_ts}:R>)"
        )

        self.container = Container(
            TextDisplay(content=f"### Role Information\n**Role:** {role.mention} (`{role.name}`)"),
            Separator(spacing=discord.SeparatorSpacing.small),
            TextDisplay(content=info_content)
        )
        self.add_item(self.container)

async def _do_roleinfo(ctx: commands.Context, role: discord.Role):
    await ctx.defer()
    view = RoleInfoLayout(role)
    await ctx.send(view=view, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="info", aliases=["roleinfo"], description="Display information about a role.")
async def role_info_cmd(ctx: commands.Context, role: discord.Role):
    await _do_roleinfo(ctx, role)

class RoleInfoCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_info_cmd.error
    async def role_info_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Usage: `-role info <@role/name/ID>`", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)

class RoleInfoFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_info", aliases=["roleinfo"], hidden=True)
    async def roleinfo_prefix(self, ctx: commands.Context, role: discord.Role):
        await _do_roleinfo(ctx, role)

async def setup(bot: commands.Bot):
    from Commands.Role.role import role_group
    if "role" not in bot.all_commands:
        bot.add_command(role_group)
    await bot.add_cog(RoleInfoCog(bot))
    await bot.add_cog(RoleInfoFallback(bot))

