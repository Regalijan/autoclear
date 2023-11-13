import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import db from "../database";

export = {
  name: "instadelete",
  channels: [
    ChannelType.GuildText,
    ChannelType.GuildPublicThread,
    ChannelType.GuildPrivateThread,
  ],
  permissions: [PermissionFlagsBits.ManageGuild],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    if (!i.guildId) throw Error("<CommandInteraction>.guildId is null");
    const channel = i.options.getChannel("targetchannel");
    if (!channel) throw Error("Required argument targetchannel is null");
    if (!["GUILD_TEXT"].includes(channel.type.toString())) {
      await i.reply({
        content: "I cannot run commands on this type of channel.",
        ephemeral: true,
      });
      return;
    }
    const action = i.options.getString("action");
    if (!action) throw Error("Required argument action is null");
    switch (action.toLowerCase()) {
      case "disable":
        await db.query(
          "DELETE FROM channels WHERE channel = $1 AND guild = $2 AND is_insta = true;",
          [channel.id, i.guildId],
        );
        await i.reply({
          content: `Instadelete disabled for <#${channel.id}>.`,
        });
        break;

      case "enable":
        if (!i.member) throw Error("");
        if (
          !(await i.guild?.channels.fetch(channel.id))
            ?.permissionsFor(i.user.id)
            ?.has([
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ])
        ) {
          await i.reply({
            content:
              "I cannot able instadelete on this channel because I do not have the required permissions (manage messages and read message history).",
          });
          return;
        }
        if (
          (
            await db.query("SELECT * FROM channels WHERE channel = $1;", [
              channel.id,
            ])
          ).rowCount ??
          0 > 0
        ) {
          await i.reply({
            content:
              "Autoclear or instadelete is already enabled on this channel!",
          });
          return;
        }
        await db.query(
          "INSERT INTO channels (channel, guild, is_insta) VALUES ($1, $2, true);",
          [channel.id, i.guildId],
        );
        await i.reply({ content: `Instadelete enabled for <#${channel.id}>` });
        break;

      default:
        await i.reply({
          content: `Possible actions are \`disable\` and \`enable\`, not \`${action}\`.`,
        });
    }
  },
};
