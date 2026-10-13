import discord
from Components.Commands._utils import make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis
from discord.ext import commands
from Components.Commands.Role.role import role_group

async def _do_roleinfo(ctx: InteractionContext, role: discord.Role):
    await ctx.defer()
    created_ts = int(role.created_at.timestamp())
    body = (
        f"# Role Info\n\n"
        f"**Role:** {role.mention} (`{role.id}`)\n"
        f"**Created At:** <t:{created_ts}:F> (<t:{created_ts}:R>)\n"
        f"**Members:** `{len(role.members)}` | **Position:** `{role.position}`\n"
        f"**Hoisted:** `{role.hoist}` | **Mentionable:** `{role.mentionable}` | **Managed:** `{role.managed}`"
    )
    

    embed = discord.Embed(title="Role Info", color=role.color)
    embed.add_field(name="Role", value=f"{role.mention} (`{role.id}`)", inline=False)
    embed.add_field(name="Created At", value=f"<t:{created_ts}:F> (<t:{created_ts}:R>)", inline=False)
    embed.add_field(name="Members", value=f"`{len(role.members)}`", inline=True)
    embed.add_field(name="Position", value=f"`{role.position}`", inline=True)
    embed.add_field(name="Hoisted", value=f"`{role.hoist}`", inline=True)
    embed.add_field(name="Mentionable", value=f"`{role.mentionable}`", inline=True)
    embed.add_field(name="Managed", value=f"`{role.managed}`", inline=True)
    
    await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

@role_group.command(name="info", description="Display information about a role.")
async def role_info_cmd(interaction: discord.Interaction, role: discord.Role):
    ctx = InteractionContext(interaction)
    await _do_roleinfo(ctx, role)

class RoleInfoCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @role_info_cmd.error
    async def role_info_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send(embed=make_embed("Usage: /role info <role>", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    pass
