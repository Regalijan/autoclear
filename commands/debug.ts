import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import { execSync } from 'child_process'
import { join } from 'path'
import { cpus, version } from 'os'

export default class DebugCommand extends Command {
  public constructor () {
    super('debug', {
      aliases: ['debug', 'info'],
      cooldown: 5000,
      description: { about: 'Outputs debug information', usage: '' },
      ratelimit: 1
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

    let memusage = process.memoryUsage().heapUsed / 1024 / 1024
    let memstring = `${memusage} MB`
    if (memusage > 1024) {
      let gigs = Math.floor(memusage / 1024)
      memusage %= gigs * 1024
      memstring = `${gigs} GB ${memusage} MB`
    }
    const embed = new MessageEmbed()
      .setAuthor(message.client.user?.tag, message.client.user?.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Owner', value: (await message.client.fetchApplication()).owner },
        { name: 'Operating System', value: version() },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' },
        { name: 'Commit', value: gitInfo },
        { name: 'Node Version', value: process.version },
        { name: 'Logical Cores', value: cpus().length },
        { name: 'Processor', value: `${cpus()[0].model} - ${cpus()[0].speed}` },
        { name: 'Memory Usage', value: memstring }
      )
    if (message.member?.displayColor) embed.setColor(message.member.displayColor)
    await message.channel.send(embed)
  }
}
