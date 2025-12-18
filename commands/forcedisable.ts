import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import db from "../database";

export = {
  name: "forcedisable",
  channels: [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    const chnlId = i.options.getString("channelid");
    if (!chnlId) {
      await i.reply("You did not supply a channel id.");
      return;
    }
    if (!i.guildId) throw Error("<CommandInteraction>.guildId is null");
    await db.query("DELETE FROM channels WHERE channel = $1 AND guild = $2;", [
      chnlId,
      i.guildId,
    ]);
    i.reply({ content: `Channel ${chnlId} deleted.` });
  },
};
