import { Command } from 'discord-akairo'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { lokiConnector } from '../loki'

export default class TopMessageCommand extends Command {
  public constructor () {
    super('topmessage', {
      aliases: ['channelpin','topmessage','topmsg'],
      args: [
        {
          id: 'channel',
          prompt: {
            cancel: 'Command cancelled.',
            start: 'Which channel?',
            timeout: 'Too slow.'
          },
          type: 'textChannel'
        },
        {
          id: 'json',
          prompt: {
            cancel: 'Command cancelled.',
            start: 'What is the json of the embed? (If you need help, <https://leovoel.github.io/embed-visualizer> is a great resource)',
            timeout: 'Too slow.'
          },
          type: 'string'
        }
      ],
      channel: 'guild',
      description: { about: 'Sets the pinned message at the top of an autoclearing channel', usage: '<channel> <json>' }
    })
  }

  public async exec (message: Message, { channel, json }: { channel: TextChannel, json: string }): Promise<void> {
    const embedBody = JSON.parse(json).catch(() => {})
    if (typeof embedBody === 'undefined') {
      await message.channel.send('Invalid JSON provided!')
      return
    }
    const embed = new MessageEmbed(embedBody)
    if (typeof embed === 'undefined') {
      await message.channel.send('An error occured when parsing the body? Do all of the properties exist on a Discord embed?')
      return
    }
    const topMessageDoc = lokiConnector.addCollection('topMessages')
    topMessageDoc.insertOne({ guild: message.guild?.id, channel: channel.id, embed: embed })
    await message.channel.send('Embed set!')
  }
}