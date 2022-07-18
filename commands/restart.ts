import {
  ChannelType,
  ChatInputCommandInteraction,
  ShardClientUtil,
} from "discord.js";

export = {
  name: "restart",
  channels: [
    ChannelType.GuildText,
    ChannelType.GuildPublicThread,
    ChannelType.GuildPrivateThread,
  ],
  permissions: [],
  async exec(i: ChatInputCommandInteraction): Promise<void> {
    if (i.options.getBoolean("allshards")) {
      await i.reply({ content: "Restarting all shards..." });
      await i.client.shard?.broadcastEval((c) => {
        c.destroy();
        process.exit();
      });
    } else {
      if (i.options.getString("server")) {
        await i.reply({
          content: `Restarting shard ${ShardClientUtil.shardIdForGuildId(
            // @ts-expect-error
            i.options.getString("server"),
            i.client.shard?.count
          )}...`,
        });
        await i.client.shard?.broadcastEval(
          (c) => {
            c.destroy();
            process.exit();
          },
          {
            shard: ShardClientUtil.shardIdForGuildId(
              // @ts-expect-error ?????? Didn't realize checking it beforehand still meant it could be null
              i.options.getString("server"),
              i.client.shard.count
            ),
          }
        );
      } else {
        await i.reply({ content: "Restarting current shard..." });
        i.client.destroy();
        process.exit();
      }
    }
  },
};
