import { CommandInteraction } from 'discord.js'
import db from '../database'

export = {
  name: 'autoclear',
  channels: ['GUILD_TEXT'],
  permissions: ['MANAGE_GUILD'],
  async exec (i: CommandInteraction): Promise<void> {
    if (!i.guildId) throw Error('<CommandInteraction>.guildId is null')
    const action = i.options.getString('action', true)
    const targetChannel = i.options.getChannel('targetchannel', true)
    switch (action.toLowerCase()) {
      case 'disable':
        await db.query('DELETE FROM channels WHERE channel = $1 AND guild = $2 AND is_insta = false;', [targetChannel.id, i.guildId])
        await i.reply({ content: `<#${targetChannel.id}> will no longer autoclear.` })
        break

      case 'enable':
        if (targetChannel.type !== 'GUILD_TEXT') {
          await i.reply({ content: 'Only text channels are supported for autoclear.' })
          return
        }
        if ((await db.query('SELECT * FROM channels WHERE channel = $1 AND guild = $2;', [targetChannel.id, i.guildId])).rowCount > 0) {
          await i.reply({ content: 'This channel either already has autoclear set up or is configured to instaclear.' })
          break
        }
        const interval = i.options.getInteger('interval')
        if (typeof interval !== 'number' || interval < 30) {
          await i.reply({ content: 'Interval must be 30 minutes or more' })
          break
        }
        await db.query('INSERT INTO channels (guild, channel, interval, last_ran, is_insta) VALUES ($1, $2, $3, $4, false);', [i.guildId, targetChannel.id, interval, Date.now()])
        await i.reply({ content: `<#${targetChannel.id}> is now set to autoclear.` })
        break

      default:
        await i.reply({ content: `Possible actions are \`disable\` and \`enable\`, not \`${action}\`.` })
    }
  }
}
