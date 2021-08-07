import { CommandInteraction, MessageEmbed } from 'discord.js'
import db from '../database'

export = {
  name: 'channels',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: ['MANAGE_GUILD'],
  async exec (i: CommandInteraction): Promise<void> {
    if (!i.guild) throw Error('<CommandInteraction>.guild is null')
    const channels = await db.query('SELECT * FROM channels WHERE guild = $1;', [i.guild.id])
    if (channels.rowCount === 0) {
      await i.reply('No channels were found.')
      return
    }
    const embed = new MessageEmbed({
      author: {
        name: i.user.tag, icon_url: i.user.displayAvatarURL({ dynamic: true })
      },
      color: 3756250,
      title: `Autoclearing channels for ${i.guild.name}`
    })
    let description = ''
    channels.rows.forEach(row => description += `<#${row.channel}> - ${row.interval} minutes\n`)
    embed.setDescription(description)
    embed.setTimestamp()
    await i.reply({ embeds: [embed] })
  }
}
