import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import { lokiConnector } from '../loki'

export default class AutoclearCommand extends Command {
  public constructor () {
    super('autoclear', {
      aliases: ['autoclear', 'autodelete', 'autopurge'],
      args: [
        {
          id: 'switcher',
          prompt: {
            start: 'Enable or disable?'
          }
        },
        {
          id: 'interval',
          prompt: {
            retry: 'Invalid option - try again.',
            start: 'Enter how often the channel should be cleared in minutes (minimum 30)'
          },
          type: 'integer'
        },
        {
          id: 'channel',
          prompt: {
            retry: 'Invalid channel - try again.',
            start: 'Which channel?'
          },
          type: 'channel'
        }
      ],
      channel: 'guild',
      clientPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES'],
      cooldown: 5000,
      description: { about: 'Toggles autoclear for specified channel', usage: '<enable/disable> <channel>' },
      ratelimit: 1,
      userPermissions: ['MANAGE_GUILD']
    })
  }

  public async exec (message: Message, { switcher, interval, channel }: { switcher: string, interval: number, channel: TextChannel }): Promise<void> {
    const guildsConnector = lokiConnector.addCollection('autoclear')
    if (message.guild === null) {
      await message.channel.send('Something went wrong... `Details: message.guild is undefined`')
      return
    }

    switch (switcher.toLowerCase()) {
      case 'enable':
        if (guildsConnector.findOne({ channel: channel.id }) !== null) {
          await message.channel.send('This channel already has autoclear enabled on it, disable it if you want to change the interval.')
          break
        }
        const addSuccess = guildsConnector.insertOne({ guild: message.guild.id, channel: channel.id, interval: interval * 60000, lastRan: Date.now() })
        if (typeof addSuccess === 'undefined') {
          await message.channel.send('An error occured when saving settings - try again.')
          return
        }
        await message.channel.send(`Successfully set <#${channel.id}> to autoclear.`)
        break

      case 'disable':
        if (guildsConnector.findOne({ channel: channel.id }) === null) {
          await message.channel.send('This channel does not have autoclear set up.')
          break
        }
        guildsConnector.findAndRemove({ channel: channel.id })
        await message.channel.send(`Autoclear unset for <#${channel.id}>.`)
        break

      default:
        await message.channel.send(`I can only \`disable\` or \`enable\` autoclear on a channel, not \`${switcher}\` it.`)
    }
  }
}
