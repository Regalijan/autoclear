import { Listener } from 'discord-akairo'
import { Message } from 'discord.js'
import db from '../database'

export default class MessageListener extends Listener {
  public constructor () {
    super('message', {
      emitter: 'client',
      event: 'message'
    })
  }

  public async exec (message: Message): Promise<void> {
    if (message.channel.type === 'dm') return
    const foundChannelData = await db.query('SELECT * FROM channels WHERE channel = $1 and is_insta = true;', [message.channel.id]).catch(e => console.error(e))
    if (!foundChannelData || foundChannelData.rowCount === 0) return
    if (!message.deletable) return
    await message.delete().catch(e => console.error(e))
  }
}
