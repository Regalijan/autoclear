import { ChannelType, ChatInputCommandInteraction } from "discord.js";

export = {
  name: "help",
  channels: [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({
      content: "Documentation can be seen at https://autoclear.wolftallemo.com",
    });
  },
};
