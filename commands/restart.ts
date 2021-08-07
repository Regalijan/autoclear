import { CommandInteraction, ShardClientUtil } from 'discord.js'

export = {
  name: 'restart',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    if (i.options.getBoolean('allShards')) {
      await i.reply('Restarting all shards...')
      await i.client.shard?.broadcastEval(c => {
        c.destroy()
        process.exit()
      })
    } else {
      if (i.options.getString('server')) {
        // @ts-expect-error
        await i.reply(`Restarting shard ${ShardClientUtil.shardIdForGuildId(i.options.getString('server'), i.client.shard?.count)}...`)
        await i.client.shard?.broadcastEval(c => {
          c.destroy()
          process.exit()
        }, {
          // @ts-expect-error ?????? Didn't realize checking it beforehand still meant it could be null
          shard: ShardClientUtil.shardIdForGuildId(i.options.getString('server'), i.client.shard.count)
        })
      } else {
        await i.reply('Restarting current shard...')
        i.client.destroy()
        process.exit()
      }
    }
  }
}
