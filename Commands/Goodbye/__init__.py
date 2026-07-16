import sys
sys.dont_write_bytecode = True

from .goodbyelistener import GoodbyeListener

async def setup(bot):
    await bot.add_cog(GoodbyeListener(bot))
