import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import { lokiConnector } from '../loki'

export default class HelpCommand extends Command {
  public constructor () {
    super('help', {
      aliases: ['help', 'support'],
      args: [
        {
          id: 'command',
          prompt: {
            retry: 'I could not find that command - try again.',
            start: 'Which command?',
            timeout: 'Too slow.'
          },
          type: 'commandAlias'
        }
      ],
      description: { about: 'Shows help panel for a command', usage: '<command>' }
    })
  }

  public async exec (message: Message, { command }: { command: Command }): Promise<void> {
    if (typeof command.description === 'undefined') {
      await message.channel.send('No help information was found for that command!')
      return
    }
    const globalPrefix = lokiConnector.addCollection('globalPrefix')
    const prefixData = globalPrefix.findOne({ prefix: { $type: 'string' } })
    const prefixString: string = `${prefixData.prefix}`
    const usage: string = command.description.usage ?? ''
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .setColor(message.member?.displayColor ?? 3756250)
      .setTitle('Command Help')
      .setDescription(`Syntax: ${prefixString ?? 'ac!'}${command.aliases[0]} ${usage}`)
    if (command.aliases.length > 1) {
      const aliases = command.aliases.toString().replace(/\[|\]/g, '').replace(',', ', ')
      embed.addField('Aliases', aliases)
    }
    await message.channel.send(embed)
  }
}
