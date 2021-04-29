import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'

export default class ClearCommand extends Command {
  public constructor () {
    super('clear', {
      aliases: ['clear', 'purge'],
      args: [
        {
          id: 'amount',
          prompt: {
            retry: 'You gave me something that wasn\'t a number!',
            start: 'How many messages should be deleted?'
          },
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
    if (amount > 100) {
      await message.channel.send('Sorry, but the maximum amount of messages per clear is 100.')
      return
    }
    if (ch.type !== 'text') {
      await message.channel.send('I cannot purge from news channels or dms!')
      return
    }
    if (!ch.client.user) {
      await message.channel.send('An error occured when trying to execute this command! `Details: message.client.user is undefined`')
      return
    }
    if (!ch.permissionsFor(ch.client.user)?.has('MANAGE_MESSAGES')) {
      await message.channel.send('I cannot delete messages from this channel as I do not have the manage messages permission.')
      return
    }
    const messages = await ch.messages.fetch({ limit: amount }).catch(e => console.error(e))
    if (typeof messages === 'undefined') {
      await message.channel.send('The messages in the channel could not be fetched!')
      return
    }
    messages.forEach(async msg => {
      if (!msg.deleted && !msg.pinned) await msg.delete({ reason: `Purge requested by ${message.author.tag} (${message.author.id})` })
    })
    await message.channel.send(`${amount} messages deleted!`)
  }
}
