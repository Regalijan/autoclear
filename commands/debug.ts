import { CommandInteraction, MessageEmbed, ShardClientUtil } from 'discord.js'
import { execSync } from 'child_process'
import { join } from 'path'
import { cpus, version } from 'os'

export = {
  name: 'debug',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    let gitInfo: Buffer | string
    try {
      gitInfo = execSync('git rev-parse HEAD', { cwd: join(__dirname, '..') })
    } catch (e) {
      console.error(e)
      gitInfo = 'Failed to retrieve git information'
    }
    let memusage = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024)
    let memstring = `${memusage} MB`
    if (memusage > 1024) {
      let gigs = Math.floor(memusage / 1024)
      memusage %= gigs * 1024
      memstring = `${gigs} GB ${memusage} MB`
    }
    const embed = new MessageEmbed({
      author: {
        name: i.client.user?.tag,
        icon_url: i.client.user?.displayAvatarURL({ dynamic: true })
      },
      color: 3756250,
      fields: [
        { name: 'Owner', value: (await i.client.application?.fetch()).owner?.toString() ?? '?' },
        { name: 'Operating System', value: version() },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' },
        { name: 'Commit', value: gitInfo.toString() },
        { name: 'Node Version', value: process.version },
        { name: 'Logical Cores', value: `${cpus().length}` },
        { name: 'Processor', value: `${cpus()[0].model} - ${cpus()[0].speed} MHz` },
        { name: 'Memory Usage', value: memstring },
        { name: 'Server ID', value: i.guildId ?? '?'}
      ]
    })
    if (i.client.shard) embed.addField('Shard', `${i.client.shard.ids[0]} / ${i.client.shard.count}`)
    await i.reply({ embeds: [embed] })
  }
}
