import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import { execSync } from 'child_process'
import { join } from 'path'
import { cpus } from 'os'

export default class DebugCommand extends Command {
  public constructor () {
    super('debug', {
      aliases: ['debug', 'info'],
      description: { about: 'Outputs debug information', usage: '' }
    })
  }

  public async exec (message: Message): Promise<void> {
    let gitInfo: Buffer
    try {
      gitInfo = execSync('git rev-parse HEAD', { cwd: join(__dirname, '..') })
    } catch {
      await message.channel.send('An error occured when fetching information! `Details: git rev-parse HEAD did not execute correctly`')
      return
    }
    const embed = new MessageEmbed()
      .setAuthor(message.client.user?.tag, message.client.user?.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Owner', value: (await message.client.fetchApplication()).owner },
        { name: 'System Architecture', value: process.arch },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' },
        { name: 'Commit', value: gitInfo },
        { name: 'Node Version', value: process.version },
        { name: 'Logical Cores', value: cpus().length },
        { name: 'Processor', value: `${cpus()[0].model} - ${cpus()[0].speed}` }
      )
    await message.channel.send(embed)
  }
}
