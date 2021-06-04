import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import db from '../database'

export default class ChannelsCommand extends Command {
  public constructor () {
    super('channels', {
      aliases: ['channels', 'list'],
      channel: 'guild',
      cooldown: 10000,
      description: { about: 'Displays all channels where autoclearing is enabled', usage: '' },
      ratelimit: 1
    })
  }

  public async exec (message: Message): Promise<void> {
    const channels = await db.query('SELECT * FROM channels WHERE guild = $1;', [message.guild?.id]).catch(e => console.error(e))
    if (!channels) {
      await message.channel.send('An error occured when searching for channels.')
      return
    }
    if (channels.rowCount === 0) {
      await message.channel.send('No channels were found.')
      return
    }
    const embed = new MessageEmbed()
    embed.setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
    embed.setTitle(`Autoclearing channels for ${message.guild?.name}`)
    let description = ''
    channels.rows.forEach(row => {
      description += `<#${row.channel}> - ${row.interval} minutes\n`
    })
    embed.setDescription(description)
    embed.setTimestamp()
    if (message.member?.displayColor) embed.setColor(message.member.displayColor)
    await message.channel.send(embed)
  }
}
