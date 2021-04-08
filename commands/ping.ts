import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
export default class PingCommand extends Command {
  public constructor () {
    super('ping', {
      aliases: ['ping'],
      description: { about: 'Gets bot ping', usage: '' }
    })
  }

  public async exec (message: Message): Promise<void> {
    await message.channel.send(`:ping_pong: Latency: ${message.client.ws.ping}ms`)
  }
}
