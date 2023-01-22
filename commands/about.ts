import {
  ChannelType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export = {
  name: "about",
  channels: [
    ChannelType.GuildText,
    ChannelType.GuildPublicThread,
    ChannelType.GuildPrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder({
      author: {
        name: i.client.user?.tag ?? "Unknown",
        iconURL: i.client.user?.displayAvatarURL(),
      },
      color: 3756250,
      fields: [
        {
          name: "Owner",
          value: `${
            i.client.application
              ? // @ts-expect-error
                (await i.client.application.fetch()).owner.name
                ? // @ts-expect-error
                  i.client.application.owner.owner.tag
                : // @ts-expect-error
                  i.client.application.owner.tag
              : "Unknown"
          }`,
        },
        { name: "Library", value: "discord.js" },
        {
          name: "Repository",
          value: "https://github.com/Wolftallemo/autoclear",
        },
      ],
      title: "About",
    });
    await i.reply({ embeds: [embed] });
  },
};
