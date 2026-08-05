import discord
from discord.ext import commands
from Commands._utils import format_usage

from typing import Literal


class ManageCodesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.hybrid_command(name="deleteinvite", description="Delete an invite code in the server.")
    @commands.has_permissions(manage_guild=True)
    async def deleteinvite(self, ctx: commands.Context, code: str):
        await ctx.defer()
        
        try:
            invites = await ctx.guild.invites()
            target_invite = discord.utils.get(invites, code=code)
            
            if not target_invite:
                return await ctx.send("Invite code not found on this server.", ephemeral=True)
                
            await target_invite.delete(reason=f"Deleted by {ctx.author}")
            
            embed = discord.Embed(
                title="Invite Deleted",
                description=f"Successfully deleted the invite code `{code}`.",
                color=discord.Color.green()
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            
        except discord.Forbidden:
            await ctx.send("I do not have permission to manage invites.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"An error occurred: {e}", ephemeral=True)

    @deleteinvite.error
    async def deleteinvite_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


    @commands.hybrid_command(name="purge-invite-codes", description="Purge invite codes from your server based on conditions.")
    @commands.has_permissions(manage_guild=True)
    async def purge_invite_codes(self, ctx: commands.Context, condition: Literal["all", "0_uses", "expired", "temporary"]):
        await ctx.defer()
        
        try:
            invites = await ctx.guild.invites()
            purged = 0
            
            for inv in invites:
                should_delete = False
                
                if condition == "all":
                    should_delete = True
                elif condition == "0_uses" and inv.uses == 0:
                    should_delete = True
                elif condition == "expired" and inv.max_age > 0:
                    import datetime
                    if (inv.created_at + datetime.timedelta(seconds=inv.max_age)) < discord.utils.utcnow():
                        should_delete = True
                elif condition == "temporary" and inv.temporary:
                    should_delete = True
                    
                if should_delete:
                    try:
                        await inv.delete(reason=f"Purged by {ctx.author} (Condition: {condition})")
                        purged += 1
                    except Exception:
                        pass
                        
            embed = discord.Embed(
                title="Invites Purged",
                description=f"Successfully purged **{purged}** invite(s) matching condition `{condition}`.",
                color=discord.Color.green()
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            
        except discord.Forbidden:
            await ctx.send("I do not have permission to manage invites.", ephemeral=True)
        except Exception as e:
            await ctx.send(f"An error occurred: {e}", ephemeral=True)

    @purge_invite_codes.error
    async def purge_invite_codes_error(self, ctx: commands.Context, error):
        if isinstance(error, commands.MissingPermissions):
            await ctx.send("You do not have permission to manage invites.", ephemeral=True)
        else:
            await ctx.send(f"An error occurred: {error}", ephemeral=True)


async def setup(bot: commands.Bot):
    await bot.add_cog(ManageCodesCommand(bot))
