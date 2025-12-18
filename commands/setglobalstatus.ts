import { ChannelType, ChatInputCommandInteraction } from "discord.js";

export = {
  name: "setglobalstatus",
  channels: [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    if (!i.client.application) {
      await i.reply({
        content: "An error occured when checking your permissions.",
      });
      return;
    }
    const owner =
      i.client.application.owner ?? (await i.client.application.fetch()).owner;
    if (!owner) {
      await i.reply({
        content: "An error occured when checking your permissions.",
      });
      return;
    }
    // @ts-expect-error
    if (!owner.members?.has(i.user.id) && owner.id !== i.user.id) {
      await i.reply({ content: "You cannot run this command." });
      return;
    }
    let activity = i.options.getInteger("activitytype") ?? 0;
    if (activity > 5 || activity === 4) activity = 0;
    let activityString =
      i.options.getString("activity") ?? "message eating contest.";
    i.client.user?.setPresence({
      activities: [{ name: activityString, type: activity }],
    });
    await i.reply({ content: "Set status successfully." });
  },
};
