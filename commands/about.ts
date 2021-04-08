import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'

export default class AboutCommand extends Command {
  public constructor () {
    super('about', {
      aliases: ['about'],
      channel: 'guild',
      description: { about: 'Shows about panel', usage: '' }
    })
  }

  public async exec (message: Message): Promise<void> {
    const embed = new MessageEmbed()
      .setAuthor(message.client.user?.tag, message.client.user?.displayAvatarURL())
      .setColor(message.member?.displayColor ?? 3756250)
      .setDescription('About')
      .addFields(
        { name: 'Owner', value: (await message.client.fetchApplication()).owner },
        { name: 'Library', value: 'discord.js@12.5.3 + discord-akairo@8.1.0' },
        { name: 'Repository', value: 'https://github.com/Wolftallemo/autoclear' }
      )
    await message.channel.send(embed)
  }
}
