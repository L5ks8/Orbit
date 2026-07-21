import discord
from discord.ext import commands

@commands.hybrid_group(name="role", invoke_without_command=True, description="Server role management commands.")
@commands.has_permissions(manage_roles=True)
async def role_group(ctx: commands.Context):
    if ctx.invoked_subcommand is None:
        if ctx.prefix and ctx.message:
            content = ctx.message.content[len(ctx.prefix) + len(ctx.invoked_with):].strip()
            if content:
                parts = content.split(" ", 1)
                if len(parts) == 2:
                    user_str, role_query = parts
                    try:
                        target = await commands.MemberConverter().convert(ctx, user_str)
                    except commands.MemberNotFound:
                        return await ctx.send(f"Member '{user_str}' not found.", ephemeral=True)
                    
                    role_query_lower = role_query.lower()
                    found_role = None
                    for r in ctx.guild.roles:
                        if r.name.lower() == role_query_lower:
                            found_role = r
                            break
                    if not found_role:
                        for r in ctx.guild.roles:
                            if role_query_lower in r.name.lower():
                                found_role = r
                                break
                                
                    if not found_role:
                        return await ctx.send(f"Role `{role_query}` not found on this server.", ephemeral=True)
                        
                    from Commands.Role.add import _do_addrole
                    return await _do_addrole(ctx, target, found_role, "Added via quick -role command")

        await ctx.send("Please use `/role add`, `/role remove`, `/role info`, `/role all`, `/role rall`, `/role create`, or `/role settings`.", ephemeral=True)

async def setup(bot: commands.Bot):
    if "role" not in bot.all_commands:
        bot.add_command(role_group)

