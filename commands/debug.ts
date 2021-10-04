import { CommandInteraction, MessageEmbed } from 'discord.js'
import { execSync } from 'child_process'
import { join } from 'path'

export = {
  name: 'debug',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    let gitInfo: Buffer | string
    try {
      gitInfo = execSync('git rev-parse HEAD', { cwd: join(__dirname, '..') })
      if (gitInfo instanceof Buffer) gitInfo = gitInfo.toString('utf8')
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
        // @ts-expect-error
        { name: 'Owner', value: `${i.client.application ? ((await i.client.application.fetch()).owner.owner ? i.client.application.owner.owner.tag : i.client.application.owner.tag) : 'Unknown'}` },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' },
        { name: 'Commit', value: gitInfo.toString() },
        { name: 'Node Version', value: process.version },
        { name: 'Memory Usage', value: memstring },
        { name: 'Server ID', value: i.guildId ?? '?'}
      ]
    })
    if (i.client.shard) embed.addField('Shard', `${i.client.shard.ids[0]} / ${i.client.shard.count} Total`)
    await i.reply({ embeds: [embed] })
  }
}
