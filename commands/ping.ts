import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
export default class PingCommand extends Command {
  public constructor () {
    super('ping', {
      aliases: ['ping'],
      cooldown: 2500,
      description: { about: 'Gets bot ping', usage: '' },
      ratelimit: 1
    })
  }

  public async exec (message: Message): Promise<void> {
    await message.channel.send(`:ping_pong: Latency: ${message.client.ws.ping}ms`)
  }
}
