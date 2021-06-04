import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import db from '../database'

export default class ForceDisableCommand extends Command {
  public constructor () {
    super('forcedisable', {
      aliases: ['forcedelete', 'forcedisable'],
      args: [
        {
          id: 'channel',
          prompt: {
            start: 'What is the channel id?',
            timeout: 'Too slow, try again'
          }
        }
      ],
      channel: 'guild',
      cooldown: 5000,
      description: { about: 'Removes a channel by id alone, useful for deleted channels', usage: '<channel>' },
      ratelimit: 1
    })
  }

  public async exec (message: Message, { id }: { id: string }): Promise<void> {
    if (id.length < 17) {
      await message.channel.send('That is not a valid channel id, try again.')
      return
    }
    if (!message.guild) {
      await message.channel.send('An error occured when running the command: `Details: message.guild is null`')
      return
    }
    try {
      await db.query('DELETE FROM channels WHERE guild = $1 AND channel = $2;', [message.guild.id, id])
    } catch (e) {
      console.error(e)
      await message.channel.send('An error occured when running the command: `Details: DELETE call failed`')
      return
    }
    await message.channel.send(`Channel ${id} deleted.`)
  }
}
