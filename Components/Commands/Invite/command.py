import discord
from discord.ext import commands
from .invites import InvitesCommand
from .inviter import InviterCommand
from .invitedlist import InvitedListCommand
from .exportinvitedlist import ExportInvitedListCommand
from .invitecodes import InviteCodesCommand
from .manage_codes import ManageCodesCommand
from .manage_invites import ManageInvitesCommand
from .leaderboard import LeaderboardCommand

async def setup(bot: commands.Bot):
    await bot.add_cog(InvitesCommand(bot))
    await bot.add_cog(InviterCommand(bot))
    await bot.add_cog(InvitedListCommand(bot))
    await bot.add_cog(ExportInvitedListCommand(bot))
    await bot.add_cog(InviteCodesCommand(bot))
    await bot.add_cog(ManageCodesCommand(bot))
    await bot.add_cog(ManageInvitesCommand(bot))
    await bot.add_cog(LeaderboardCommand(bot))
