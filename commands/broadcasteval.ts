import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class BroadcastEvalCommand extends Command {
  public constructor () {
    super('broadcasteval', {
      aliases: ['bceval', 'broadcasteval'],
      args: [
        {
          id: 'func',
          prompt: {
            start: 'What do you want to execute?',
            timeout: 'Yikes, too slow. Even windows xp is faster than you.'
          }
        }
      ],
      description: { about: 'eeeeevaaaaal', usage: '<code>' },
      ownerOnly: true
    })
  }

  public async exec (message: Message, { func }: { func: string } ): Promise<void> {
    if (!message.client.shard) {
      await message.channel.send('Cannot run `broadcastEval`! Reason: `Client shard is null`')
      return
    }
    message.client.shard.broadcastEval(func).then(async v => {
      await message.channel.send(v)
    }).catch(async e => await message.channel.send(e))
  }
}
