import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";

export = {
  name: "clear",
  channels: [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ],
  permissions: [PermissionFlagsBits.ManageMessages],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    let amount = i.options.getInteger("amount") ?? 100;
    if (amount > 100 || amount < 0) amount = 100;
    const targetChannel = i.options.getChannel("targetchannel") ?? i.channel;
    if (!targetChannel) throw Error("<CommandInteraction>.channel is null");
    if (!i.client?.application)
      throw Error("<CommandInteraction>.client.application is null");
    if (
      !(await i.guild?.channels.fetch(targetChannel.id))
        ?.permissionsFor(i.client.application?.id)
        ?.has(PermissionFlagsBits.ManageMessages)
    ) {
      await i.reply({
        content:
          "I do not have permissions to delete messages in this channel.",
      });
      return;
    }
    const guildChannel = await i.guild?.channels.fetch(targetChannel.id);
    if (guildChannel?.type !== ChannelType.GuildText) {
      await i.reply({
        content:
          "I cannot clear this channel as bulk deleting is not supported.",
      });
      return;
    }

    await guildChannel.bulkDelete(amount);
    await i.reply({ content: "Channel purged successfully." });
  },
};
