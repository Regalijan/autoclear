import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { execSync } from "child_process";
import { join } from "path";

export = {
  name: "debug",
  channels: [
    ChannelType.GuildText,
    ChannelType.GuildPublicThread,
    ChannelType.GuildPrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    let gitInfo: Buffer | string;
    try {
      gitInfo = execSync("git rev-parse HEAD", { cwd: join(__dirname, "..") });
      if (gitInfo instanceof Buffer) gitInfo = gitInfo.toString("utf8");
    } catch (e) {
      console.error(e);
      gitInfo = "Failed to retrieve git information";
    }
    let memusage = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
    let memstring = `${memusage} MB`;
    if (memusage > 1024) {
      let gigs = Math.floor(memusage / 1024);
      memusage %= gigs * 1024;
      memstring = `${gigs} GB ${memusage} MB`;
    }
    const embed = new EmbedBuilder({
      author: {
        name: i.client.user?.username ?? "Unknown",
        icon_url: i.client.user?.displayAvatarURL(),
      },
      color: 3756250,
      fields: [
        {
          name: "Owner",
          value: `${
            i.client.application
              ? // @ts-expect-error
                (await i.client.application.fetch()).owner.owner
                ? // @ts-expect-error
                  i.client.application.owner.owner.username
                : // @ts-expect-error
                  i.client.application.owner.username
              : "Unknown"
          }`,
        },
        {
          name: "Repository",
          value: "https://github.com/Wolftallemo/autoclear",
        },
        { name: "Commit", value: gitInfo.toString() },
        { name: "Node Version", value: process.version },
        { name: "Memory Usage", value: memstring },
        { name: "Server ID", value: i.guildId ?? "?" },
      ],
    });
    if (i.client.shard)
      embed.addFields({
        name: "Shard",
        value: `${i.client.shard.ids[0]} / ${i.client.shard.count} Total`,
      });
    await i.reply({ embeds: [embed] });
  },
};
