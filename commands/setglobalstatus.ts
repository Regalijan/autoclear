import { CommandInteraction } from 'discord.js'

export = {
  name: 'setglobalstatus',
  channels: ['GUILD_TEXT', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
  permissions: [],
  async exec (i: CommandInteraction): Promise<void> {
    if (!i.client.application) {
      await i.reply('An error occured when checking your permissions.')
      return
    } 
    const owner = i.client.application.owner ?? (await i.client.application.fetch()).owner
    if (!owner) {
      await i.reply('An error occured when checking your permissions.')
      return
    }
    // @ts-expect-error
    if (!owner.members?.has(i.user.id) && owner.id !== i.user.id) {
      await i.reply('You cannot run this command.')
      return
    }
    let activity = i.options.getInteger('activitytype') ?? 0
    if (activity > 5 || activity === 4) activity = 0
    await i.client.shard?.broadcastEval(c => c.user?.setPresence({ activities: [{ name: `${i.options.getString('activity')}`, type: activity }] }))
    await i.reply('Set status successfully.')
  }
}
