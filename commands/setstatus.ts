import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class SetStatusCommand extends Command {
  public constructor () {
    super('setstatus', {
      aliases: ['setstatus'],
      args: [
        {
          id: 'status',
          prompt: {
            cancel: 'Command cancelled.',
            start: 'What should the status be?',
            timeout: 'Come on! Be faster!'
          },
          type: 'string'
        }
      ],
      cooldown: 30000,
      description: { about: 'Sets status for current shard', usage: '<status>' },
      ownerOnly: true,
      ratelimit: 1
    })
  }

  public async exec (message: Message, { status }: { status: string }): Promise<void> {
    const success = await message.client.user?.setPresence({ activity: { type: 'PLAYING', name: status } }).catch(e => console.error(e))
    if (typeof success === 'undefined') {
      await message.channel.send('Status change failed!')
      return
    }
    await message.channel.send('Status set!')
  }
}
