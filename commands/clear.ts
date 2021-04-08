import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'

export default class ClearCommand extends Command {
  public constructor () {
    super('clear', {
      aliases: ['clear', 'purge'],
      args: [
        {
          id: 'amount',
          type: 'integer'
        },
        {
          default: null,
          id: 'channel',
          type: 'textChannel'
        }
      ],
      channel: 'guild',
      clientPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES'],
      cooldown: 10000,
      description: { about: 'Purges channel of x messages', usage: '<amount> <channel>' },
      ratelimit: 2,
      userPermissions: ['MANAGE_MESSAGES']
    })
  }

  public async exec (message: Message, { amount, channel }: { amount: number, channel: TextChannel | null }): Promise<void> {
    let ch = channel
    if (message.channel.type !== 'text') return
    if (ch === null) ch = message.channel
    if (amount > 200) {
      await message.channel.send('Sorry, but the maximum amount of messages per clear is 200.')
      return
    }
    let success = true
    await ch.bulkDelete(amount + 1, true).catch(e => {
      console.error(e)
      success = false
    })
    if (!success) {
      await message.channel.send('An error occured when deleting the messages!')
      return
    }
    await message.channel.send(`${amount} messages deleted!`)
  }
}
