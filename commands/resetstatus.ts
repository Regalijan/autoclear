import { CommandInteraction } from 'discord.js'

export = {
  name: 'setstatus',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    const owner = i.client.application?.owner
    if (!owner) {
      await i.reply({ content: 'An error occured when checking your permissions.' })
      return
    }
    // @ts-expect-error
    if (!owner.members?.has(i.user.id) || owner.id !== i.user.id) {
      await i.reply({ content: 'You cannot run this command.' })
      return
    }
    i.client.user?.setPresence({ activities: [{ name: 'message eating contest.', type: 5 }] })
    await i.reply({ content: 'Reset status successfully.' })
  }
}
