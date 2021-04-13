import { Command } from 'discord-akairo'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import db from '../database'

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
    let embedBody: any
    try {
      embedBody = JSON.parse(json)
    } catch {
      await message.channel.send('Invalid JSON provided!')
      return
    }
    const embed = new MessageEmbed(embedBody)
    if (typeof embed === 'undefined') {
      await message.channel.send('An error occured when parsing the body? Do all of the properties exist on a Discord embed?')
      return
    }
    if ((await db.query('SELECT * FROM channels WHERE channel = $1 AND guild = $2;', [channel.id, message.guild?.id])).rowCount === 0) {
      await message.channel.send('Autoclear was not set on this channel, please enable it first!')
      return
    }
    const insertSuccess = await db.query('UPDATE channels SET pinned_message = $1 WHERE channel = $2 AND guild = $3;', [embedBody, channel.id, message.guild?.id]).catch(e => console.error(e))
    if (typeof insertSuccess === 'undefined') {
      await message.channel.send('An error occured when saving settings - try again.')
      return
    }
    await message.channel.send(`Enabled pinned message for <#${channel.id}>.`)
  }
}