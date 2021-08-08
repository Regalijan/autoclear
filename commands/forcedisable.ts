import { CommandInteraction } from 'discord.js'
import db from '../database'

export = {
  name: 'forcedisable',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: ['MANAGE_GUILD'],
  async exec (i: CommandInteraction): Promise<void> {
    const chnlId = i.options.getString('channelid')
    if (!chnlId) {
      await i.reply('You did not supply a channel id.')
      return
    }
    if (!i.guildId) throw Error('<CommandInteraction>.guildId is null')
    await db.query('DELETE FROM channels WHERE channel = $1 AND guild = $2;', [chnlId, i.guildId])
    i.reply(`Channel ${chnlId} deleted.`)
  }
}
