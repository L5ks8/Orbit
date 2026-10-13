import discord
from discord.ext import commands
from Components.Commands.Invite._storage import (
    add_fake_invites, remove_fake_invites,
    add_bonus_invites, remove_bonus_invites,
    reset_invites
)
from Components.Commands._utils import format_usage, make_embed, make_v2_card, ORBIT_COLOR, InteractionContext
from Components.emojis import Emojis


class ManageInvitesCommand(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="addfakeinvites", description="Add fake invites to a specific user.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def addfakeinvites(self, interaction: discord.Interaction, user: discord.Member, amount: int):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        add_fake_invites(ctx.guild.id, user.id, amount)
        
        card = make_v2_card(f"# Invites Managed\n\nAdded **{amount}** fake invites for {user.mention}.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Added **{amount}** fake invites for {user.mention}.",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @addfakeinvites.error
    async def addfakeinvites_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @app_commands.command(name="removefakeinvites", description="Remove fake invites from a specific user.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def removefakeinvites(self, interaction: discord.Interaction, user: discord.Member, amount: int):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        remove_fake_invites(ctx.guild.id, user.id, amount)
        
        card = make_v2_card(f"# Invites Managed\n\nRemoved **{amount}** fake invites for {user.mention}.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Removed **{amount}** fake invites for {user.mention}.",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @removefakeinvites.error
    async def removefakeinvites_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @app_commands.command(name="addinvites", description="Add regular invites to a specific user.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def addinvites(self, interaction: discord.Interaction, user: discord.Member, amount: int):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        add_bonus_invites(ctx.guild.id, user.id, amount)
        
        card = make_v2_card(f"# Invites Managed\n\nAdded **{amount}** regular invites for {user.mention}.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Added **{amount}** regular invites for {user.mention}.",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @addinvites.error
    async def addinvites_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @app_commands.command(name="removeinvites", description="Remove regular invites from a specific user.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def removeinvites(self, interaction: discord.Interaction, user: discord.Member, amount: int):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        if amount <= 0:
            return await ctx.send(embed=make_embed("Amount must be greater than 0.", discord.Color.red()), ephemeral=True)
            
        remove_bonus_invites(ctx.guild.id, user.id, amount)
        
        card = make_v2_card(f"# Invites Managed\n\nRemoved **{amount}** regular invites for {user.mention}.", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Invites Managed",
            description=f"Removed **{amount}** regular invites for {user.mention}.",
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @removeinvites.error
    async def removeinvites_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

    @app_commands.command(name="resetinvites", description="Reset the invites for a specific user or for the whole server.")
    @app_commands.default_permissions(manage_guild=True)
    @app_commands.checks.has_permissions(manage_guild=True)
    async def resetinvites(self, interaction: discord.Interaction, user: discord.Member = None):
        ctx = InteractionContext(interaction)
        await ctx.defer()
        
        if user:
            reset_invites(ctx.guild.id, user.id)
            msg = f"Reset all invites for {user.mention}."
        else:
            reset_invites(ctx.guild.id)
            msg = "Reset all invites for the entire server."
            
        card = make_v2_card(f"# Invites Reset\n\n{msg}", color=ORBIT_COLOR)
        if card:
            return await ctx.send(view=card, allowed_mentions=discord.AllowedMentions.none())
        embed = discord.Embed(
            title="Invites Reset",
            description=msg,
            color=ORBIT_COLOR
        )
        await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @resetinvites.error
    async def resetinvites_error(self, interaction: discord.Interaction, error):
        ctx = InteractionContext(interaction)
        if isinstance(error, (app_commands.MissingPermissions, commands.MissingPermissions)):
            await ctx.send(embed=make_embed("You do not have permission to manage invites.", discord.Color.red()), ephemeral=True)
        else:
            await ctx.send(embed=make_embed(f"An error occurred: {error}", discord.Color.red()), ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(ManageInvitesCommand(bot))

