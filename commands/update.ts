import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { exec as cpExec } from 'child_process'
import { join } from 'path'

export default class UpdateCommand extends Command {
  public constructor () {
    super('update', {
      aliases: ['update', 'gitpull'],
      description: { about: '`git pull`', usage: '' }
    })
  }

  public async exec (message: Message): Promise<void> {
    cpExec('git pull', { cwd: join(__dirname, '..') }, async function (error, stdout, stderr) {
      if (error) {
        console.error(error)
        await message.channel.send(`An error occured when pulling from the repo`)
        return
      }
      await message.channel.send(stdout)
      if (/(Already up to date\.)/gim.test(stdout)) return
      else if (/Updating/.test(stdout)) await message.client.shard?.respawnAll()
    })
  }
}
