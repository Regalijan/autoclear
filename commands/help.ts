import { CommandInteraction } from 'discord.js'

export = {
  name: 'help',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    await i.reply({ content: 'Documentation can be seen at https://autoclear.wolftallemo.com' })
  }
}
