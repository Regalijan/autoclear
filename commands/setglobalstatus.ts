import { Command } from 'discord-akairo'
import{ Message } from 'discord.js'

export default class SetGlobalStatusCommand extends Command {
  public constructor () {
    super('setglobalstatus', {
      aliases: ['globalstatus','gs','setglobalstatus'],
      args: [
        {
          id: 'status',
          prompt: {
            cancel: 'Command cancelled.',
            start: 'What should the status be?',
            timeout: 'Too slow. Get faster!'
          },
          type: 'string'
        }
      ]
    })
  }

  public async exec (message: Message, { status }: { status: string }): Promise<void> {
    await message.channel.send('Setting status...')
    await message.client.shard?.broadcastEval(`this.user?.setPresence({ activity: { type: 'PLAYING', name: ${status} } })`)
    await message.channel.send('Finished.')
  }
}
