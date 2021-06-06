import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import db from '../database'

export default class InstaDeleteCommand extends Command {
  public constructor () {
    super('instadelete', {
      aliases: ['instadelete' ,'jitdelete'],
      args: [
        {
          id: 'switcher',
          prompt: {
            start: 'Do you want to `enable` or `disable` instadelete?',
            timeout: 'Does it really take you this long to find a channel? Try again.'
          }
        },
        {
          id: 'channel',
          prompt: {
            retry: 'Give me something that is a channel.',
            start: 'Which channel?',
            timeout: 'Does it really take you this long to find a channel? Try again and hurry up next time.'
          },
          type: 'textChannel'
        }
      ],
      cooldown: 5000,
      description: { about: 'Toggles instadelete for the specified channel', usage: '<enable/disable> <#channel>' },
      userPermissions: ['MANAGE_GUILD']
    })
  }

  public async exec (message: Message, { switcher, channel }: { switcher: string, channel: TextChannel }): Promise<void> {
    if (!message.guild) {
      await message.channel.send('Something went wrong... `Details: message.guild is null`').catch(e => console.error(e))
      return
    }

    switch (switcher) {
      case 'enable':
        let user = message.client.user?.id
        try {
          if (!user) {
            user = (await message.client.users.fetch((await message.client.fetchApplication()).id)).id
          }
        } catch (e) {
          console.error(e)
          await message.channel.send(`Something went wrong... \`Details: ${e}\``)
          return
        }
        if (!channel.permissionsFor(user)?.has(['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])) {
          await message.channel.send('I cannot enable instadelete on this channel as I do not have the `Read Message History` and `Manage Messages` permissions. Please give me the required permissions before running this command again.')
          return
        }
        try {
          const rowsOfMatchingChannels = await db.query('SELECT * FROM channels WHERE channel = $1;', [channel])
          if (rowsOfMatchingChannels.rowCount > 0) {
            await message.channel.send('Autoclear or instadelete is already enabled on this channel! Please disable them before attempting to enable instadelete.')
            return
          }
          await db.query('INSERT INTO channels (channel, guild, is_insta) VALUES ($1, $2, $3);', [channel, message.guild, false])
        } catch (e) {
          console.error(e)
          await message.channel.send('I could not enable instadelete for that channel. `Details: Locating or creating row failed`')
        }
        await message.channel.send(`Instadelete enabled for <#${channel.id}>`).catch(e => console.error(e))
    }
  }
}