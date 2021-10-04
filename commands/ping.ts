import { CommandInteraction } from 'discord.js'

export = {
  name: 'ping',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    await i.reply({ content: `:ping_pong: Latency: ${i.client.ws.ping}ms` })
  }
}
