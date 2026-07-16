import asyncio
import discord
from discord.ext import commands
from Database.storagehandler import load_jtc_config, load_active_channels, create_active_channel, update_active_channel, remove_active_channel, get_active_channel
from Commands.JoinToCreate._views import build_jtc_container, PersistentJTCControlLayout

class JTCListenerCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_voice_state_update(self, member: discord.Member, before: discord.VoiceState, after: discord.VoiceState):
        if member.bot:
            return

        guild = member.guild
        config = await load_jtc_config(guild.id)
        if not config.get("enabled", False):
            return

        hub_id = config.get("hub_channel_id")

        if after.channel and after.channel.id == hub_id:
            category_id = config.get("category_id")
            category = guild.get_channel(category_id) if category_id else after.channel.category
            if not category and after.channel.category:
                category = after.channel.category

            clean_name = member.display_name[:20]
            channel_name = f"{clean_name}'s Channel"
            default_limit = config.get("default_user_limit", 0)

            overwrites = {
                guild.default_role: discord.PermissionOverwrite(connect=True, view_channel=True),
                member: discord.PermissionOverwrite(connect=True, view_channel=True, manage_channels=True)
            }

            try:
                temp_channel = await guild.create_voice_channel(
                    name=channel_name,
                    category=category,
                    user_limit=default_limit,
                    overwrites=overwrites,
                    reason=f"Join-to-Create temp channel for {member}"
                )
            except Exception as e:
                print(f"Failed to create JTC voice channel: {e}")
                return

            try:
                await member.move_to(temp_channel, reason="Moved into temp voice channel")
            except Exception:
                pass

            data = await create_active_channel(guild.id, temp_channel.id, member.id)
            if default_limit > 0:
                data["limit"] = default_limit

            container = build_jtc_container(data)
            control_view = PersistentJTCControlLayout(container=container, data=data)

            try:
                msg = await temp_channel.send(
                    view=control_view,
                    allowed_mentions=discord.AllowedMentions.none()
                )
                if msg:
                    data["message_id"] = msg.id
                    await update_active_channel(guild.id, temp_channel.id, data)
            except Exception as e:
                print(f"Failed to send JTC control container: {e}")

        if before.channel and before.channel.id != hub_id:
            active = await get_active_channel(guild.id, before.channel.id)
            if active:
                remaining_members = [m for m in before.channel.members if not m.bot]
                if len(remaining_members) == 0:
                    await remove_active_channel(guild.id, before.channel.id)
                    try:
                        await before.channel.delete(reason="Join-to-Create channel empty")
                    except Exception:
                        pass
                else:
                    if active.get("owner_id") == member.id:
                        new_owner = remaining_members[0]
                        active["owner_id"] = new_owner.id
                        await update_active_channel(guild.id, before.channel.id, active)

                        try:
                            await before.channel.set_permissions(
                                new_owner,
                                connect=True,
                                view_channel=True,
                                manage_channels=True,
                                reason=f"New temp voice owner: {new_owner}"
                            )
                        except Exception:
                            pass

                        msg_id = active.get("message_id")
                        if msg_id:
                            try:
                                msg = await before.channel.fetch_message(msg_id)
                                if msg:
                                    updated_container = build_jtc_container(active)
                                    updated_view = PersistentJTCControlLayout(container=updated_container, data=active)
                                    await msg.edit(view=updated_view, allowed_mentions=discord.AllowedMentions.none())
                            except Exception:
                                pass

async def setup(bot: commands.Bot):
    bot.add_view(PersistentJTCControlLayout())
    await bot.add_cog(JTCListenerCog(bot))
