import { CommandInteraction, MessageEmbed } from 'discord.js'

export = {
  name: 'about',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    const embed = new MessageEmbed({
      author: {
        name: i.client.user?.tag ?? 'Unknown',
        iconURL: i.client.user?.displayAvatarURL({ dynamic: true })
      },
      color: 3756250,
      description: 'About',
      fields: [
        { name: 'Owner', value: (await i.client.application?.fetch()).owner?.toString() ?? 'Unknown'},
        { name: 'Library', value: 'discord.js@13.0.0' },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' }
      ]
    })
    await i.reply({ embeds: [embed] })
  }
}
