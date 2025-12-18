import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import db from "../database";

export = {
  name: "channels",
  channels: [
    ChannelType.GuildText,
    ChannelType.PublicThread,
    ChannelType.PrivateThread,
  ],
  permissions: [PermissionFlagsBits.ManageGuild],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    if (!i.guild) throw Error("<CommandInteraction>.guild is null");
    const channels = await db.query(
      "SELECT * FROM channels WHERE guild = $1;",
      [i.guild.id],
    );
    if (channels.rowCount === 0) {
      await i.reply({ content: "No channels were found." });
      return;
    }
    const embed = new EmbedBuilder({
      author: {
        name: i.user.username,
        icon_url: i.user.displayAvatarURL(),
      },
      color: 3756250,
      title: `Autoclearing channels for ${i.guild.name}`,
    });
    let description = "";
    channels.rows.forEach(
      (row) => (description += `<#${row.channel}> - ${row.interval} minutes\n`),
    );
    embed.setDescription(description);
    embed.setTimestamp();
    await i.reply({ embeds: [embed] });
  },
};
