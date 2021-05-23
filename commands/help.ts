import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class HelpCommand extends Command {
  public constructor () {
    super('help', {
      aliases: ['help', 'support'],
      description: { about: 'Shows help link', usage: '' }
    })
  }

  public async exec (message: Message): Promise<void> {
    await message.channel.send('Documentation can be found at https://autoclear.wolftallemo.com')
  }
}
