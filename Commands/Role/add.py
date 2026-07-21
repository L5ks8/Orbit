import discord
from discord.ext import commands

async def _do_addrole(ctx: commands.Context, target: discord.Member, role: discord.Role, reason: str):
    await ctx.defer()
    if role >= ctx.guild.me.top_role:
        return await ctx.send("I cannot assign that role because it is higher than or equal to my highest role.", ephemeral=True)
    if role >= ctx.author.top_role and ctx.author != ctx.guild.owner:
        return await ctx.send("You cannot assign a role higher than or equal to your own top role.", ephemeral=True)
    if role in target.roles:
        return await ctx.send("The user already has that role.", ephemeral=True)

    try:
        await target.add_roles(role, reason=f"Role added by {ctx.author} | Reason: {reason}")
        from Embeds import get_command_embed
        kwargs = get_command_embed(ctx.guild.id, "role", msg_type="add", member_mention=target.mention, member_id=target.id, role_mention=role.mention, role_id=role.id, role_color=role.color, reason=reason, author_mention=ctx.author.mention)
        await ctx.send(**kwargs, allowed_mentions=discord.AllowedMentions.none())
    except discord.Forbidden:
        await ctx.send("I do not have sufficient permissions to add that role.", ephemeral=True)
    except Exception as e:
        await ctx.send(f"Error adding role: {e}", ephemeral=True)

class AddRoleFallback(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.command(name="rl_add", aliases=["addrole"], hidden=True)
    @commands.has_permissions(manage_roles=True)
    @commands.bot_has_permissions(manage_roles=True)
    async def addrole_prefix(self, ctx: commands.Context, target: discord.Member, role: discord.Role, *, reason: str = "No reason provided"):
        await _do_addrole(ctx, target, role, reason)

async def setup(bot: commands.Bot):
    await bot.add_cog(AddRoleFallback(bot))
