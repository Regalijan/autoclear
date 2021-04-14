import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import db from '../database'

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
      description: { about: 'Toggles autoclear for specified channel', usage: '<enable/disable> <interval> <channel>\nSubstitute any number for interval when disabling.' },
      ratelimit: 1,
      userPermissions: ['MANAGE_GUILD']
    })
  }

  public async exec (message: Message, { switcher, interval, channel }: { switcher: string, interval: number, channel: TextChannel }): Promise<void> {
    if (message.guild === null) {
      await message.channel.send('Something went wrong... `Details: message.guild is undefined`')
      return
    }

    switch (switcher.toLowerCase()) {
      case 'enable':
        if ((await db.query('SELECT * FROM channels WHERE channel = $1;', [channel.id])).rowCount > 0) {
          await message.channel.send('This channel is already set up to autoclear, please disable it before modifying it!')
          return
        }
        const enableSuccess = await db.query('INSERT INTO channels (guild,channel,interval,last_ran) VALUES ($1,$2,$3,$4);', [message.guild.id, channel.id, interval, Date.now()]).catch(e => console.error(e))
        if (typeof enableSuccess === 'undefined') {
          await message.channel.send('An error occured when saving settings - try again.')
          return
        }
        await message.channel.send(`Successfully set <#${channel.id}> to autoclear.`)
        break

      case 'disable':
        await db.query('DELETE FROM channels WHERE channel = $1 AND guild = $2;', [channel.id, message.guild.id])
        await message.channel.send(`<#${channel.id}> will no longer autoclear.`)
        break

      default:
        await message.channel.send(`I can only \`disable\` or \`enable\` autoclear on a channel, not \`${switcher}\` it.`)
    }
  }
}
