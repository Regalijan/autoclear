import { ChannelType, ChatInputCommandInteraction } from "discord.js";

export = {
  name: "ping",
  channels: [
    ChannelType.GuildText,
    ChannelType.GuildPublicThread,
    ChannelType.GuildPrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: `:ping_pong: Latency: ${i.client.ws.ping}ms` });
  },
};
