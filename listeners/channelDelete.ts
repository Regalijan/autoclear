import { Listener } from 'discord-akairo'
import { DMChannel, GuildChannel } from 'discord.js'
import db from '../database'

export default class ChannelDeleteListener extends Listener {
  public constructor () {
    super('channelDelete', {
      emitter: 'client',
      event: 'channelDelete'
    })
  }

  public async exec (channel: DMChannel | GuildChannel): Promise<void> {
    if (channel.type === 'dm') return
    const foundChannel = await db.query('SELECT * FROM channels WHERE channel = $1;', [channel.id]).catch(e => console.error(e))
    if (!foundChannel || foundChannel.rowCount === 0) return
    await db.query('DELETE FROM channels WHERE channel = $1;', [channel.id]).catch(e => console.error(e))
  }
}
