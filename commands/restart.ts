import { Command } from 'discord-akairo'
import { Message, ShardClientUtil } from 'discord.js'

export default class RestartCommand extends Command {
  public constructor () {
    super('restart', {
      aliases: ['reboot', 'restart'],
      args: [
        {
          id: 'server',
          default: null
        }
      ],
      cooldown: 120000,
      description: { about: 'Restarts shard', usage: '<serverID?>' },
      ownerOnly: true
    })
  }

  public async exec (message: Message, { server }: { server: string | null }): Promise<void> {
    if (!this.client.shard) {
      await message.channel.send('This command is disabled as bot was started without sharding, did you modify the source code?')
      return
    }

    if (message.channel.type === 'dm' || server === '--all') {
      await message.channel.send('Initiating full restart...').catch(e => console.error(e))
      try {
        await this.client.shard.broadcastEval('this.destroy(); process.exit();')
      } catch (e) {
        console.error(e)
        await message.channel.send(`Failed to send command: ${e}`).catch(e => console.error(e))
      }
      return
    }
  
    let shard: number
    typeof server === 'string' ? shard = ShardClientUtil.shardIDForGuildID(server, this.client.shard.count) : message.guild ? shard = ShardClientUtil.shardIDForGuildID(message.guild.id, this.client.shard.count) : shard = 0
    try {
      await message.channel.send('Sending restart command...')
      await this.client.shard.broadcastEval('this.destroy(); process.exit();', shard)
    } catch (e) {
      console.error(e)
      await message.channel.send(`Failed to send command: ${e}`).catch(e => console.error(e))
    }
  }
}
