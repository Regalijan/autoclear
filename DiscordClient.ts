import { config as dotenv } from "dotenv";
import db from "./database";
import { readdirSync } from "fs";
import { join } from "path";
import {
  BaseInteraction,
  ChannelType,
  Client,
  Collection,
  CommandInteraction,
  DiscordAPIError,
  DMChannel,
  GatewayIntentBits,
  Guild,
  GuildChannel,
  Message,
  PermissionFlagsBits,
  PermissionResolvable,
  TextBasedChannelTypes,
  TextChannel,
} from "discord.js";

dotenv();

const intCommands: Collection<
  string,
  {
    name: string;
    channels: TextBasedChannelTypes[];
    permissions: PermissionResolvable[];
    exec(interaction: CommandInteraction): Promise<void>;
  }
> = new Collection();

const intFiles = readdirSync(join(__dirname, "commands")).filter((f) =>
  f.endsWith(".js"),
);

for (const file of intFiles) {
  const intCommand = require(`./commands/${file}`);
  intCommands.set(intCommand.name, intCommand);
}

db.connect().catch((e) => {
  console.error(e);
  process.exit();
});

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  presence: {
    activities: [{ type: 5, name: "message eating contest." }],
  },
});

bot.login().catch((e) => {
  console.error(e);
  process.exit();
});

bot.once("clientReady", function (): void {
  console.log(
    `Shard ${bot.shard?.ids[0]} ready with ${bot.guilds.cache.size} guilds.`,
  );
});

if (process.env.ENABLEDEBUG)
  bot.on("debug", function (info: string): void {
    console.log(info);
  });

bot.on("messageCreate", async function (message: Message): Promise<void> {
  if (message.channel.type === ChannelType.DM || !message.deletable) return;
  const searchedChannel = await db
    .query("SELECT is_insta FROM channels WHERE channel = $1;", [
      message.channel.id,
    ])
    .catch((e) => console.error(e));
  if (!searchedChannel?.rowCount || !searchedChannel.rows[0].is_insta) return;
  await message.delete().catch((e) => console.error(e));
});

bot.on(
  "channelDelete",
  async function (channel: DMChannel | GuildChannel): Promise<void> {
    if (channel.type !== ChannelType.GuildText) return;
    const foundChannel = await db
      .query("SELECT channel FROM channels WHERE channel = $1;", [channel.id])
      .catch((e) => console.error(e));
    if (!foundChannel?.rowCount) return; // Return if rowCount is zero or query failed
    await db
      .query("DELETE FROM channels WHERE channel = $1;", [channel.id])
      .catch((e) => console.error(e));
  },
);

bot.on(
  "interactionCreate",
  async function (int: BaseInteraction): Promise<void> {
    if (!int.isChatInputCommand() || !intCommands.has(int.commandName)) return;
    try {
      const command = intCommands.get(int.commandName); // Hacky but whatever, require() is sort of a mess with ts
      if (!command)
        throw Error(
          "Command does not exist but <Collection>.has() returned true",
        );
      if (!int.member?.user?.id)
        throw Error("Interaction has no associated member");
      if (
        !int.channel?.type ||
        (command?.channels.length &&
          !command.channels.includes(int.channel?.type))
      )
        return;
      const commandUser = await int.guild?.members.fetch(int.member.user.id);
      if (!commandUser)
        throw Error(
          "Interaction has a member but member did not exist in guild",
        );
      if (
        command.permissions?.length &&
        !commandUser.permissions.has(command.permissions)
      ) {
        await int.reply("You cannot run this command.");
        return;
      }
      await command.exec(int);
    } catch (e) {
      console.error(e);
      await int
        .reply(
          `Oops! An error occured while running this command;\n\nIf you contact the developer, give them this information:\n${e}`,
        )
        .catch((e) => console.error(e));
    }
  },
);

setInterval(async function (): Promise<void> {
  const staleChannels = await db
    .query("SELECT * FROM channels WHERE is_insta = false AND last_ran < $1;", [
      Date.now() - 1800000,
    ])
    .catch((e) => console.error(e));
  if (typeof staleChannels === "undefined") return;
  for (let i = 0; i < (staleChannels.rowCount ?? 0); i++) {
    if (
      parseInt(staleChannels.rows[i].last_ran) +
        parseInt(staleChannels.rows[i].interval) * 60000 >
      Date.now()
    )
      continue;

    const guild = await bot.guilds
      .fetch(staleChannels.rows[i].guild)
      .catch(async (e) => {
        if (e instanceof DiscordAPIError && e.code === 10004) {
          await db.query("DELETE FROM channels WHERE guild = $1;", [staleChannels.rows[i].guild]);
        } else console.error(e);
      });
    if (typeof guild === "undefined") continue;
    const untypedChannel: any = await guild.channels
      .fetch(staleChannels.rows[i].channel)
      .catch((e: DiscordAPIError) => e);

    if (untypedChannel instanceof DiscordAPIError) {
      if (untypedChannel.code === 10004) await db.query("DELETE FROM channels WHERE guild = $1;", [staleChannels.rows[i].guild])
      else if (untypedChannel.code === 10003) {
        await db.query("DELETE FROM channels WHERE channel = $1;", [staleChannels.rows[i].channel]);
      } else console.error(untypedChannel)
    }
    if (typeof untypedChannel === "undefined") continue;
    const user = bot.application?.id;
    if (!user) return;
    const channel: TextChannel = untypedChannel;
    if (
      !channel
        .permissionsFor(user)
        ?.has([
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ])
    )
      continue;
    if (channel.messages.cache.size === 0) {
      try {
        await channel.messages.fetch();
      } catch (e) {
        console.error(e);
      }
    }
    while (
      channel.messages.cache.filter((msg) => !msg.pinned).size > 0 &&
      typeof channel.lastMessage?.createdTimestamp !== "undefined" &&
      channel.lastMessage.createdTimestamp > Date.now() - 1209600000
    ) {
      const fetchedMsgs = await channel.messages.fetch({ limit: 100 });
      let ids: string[] = [];
      fetchedMsgs.forEach((msg) => {
        if (!msg.pinned && msg.createdTimestamp > Date.now() - 1209600000)
          ids.push(msg.id);
      });
      channel.messages.cache.forEach((msg) => {
        if (
          !ids.includes(msg.id) &&
          !msg.pinned &&
          msg.createdTimestamp > Date.now() - 1209600000
        )
          ids.push(msg.id);
      });

      ids = ids.filter(id => id) // Filter out message ids that are not real snowflakes
 
      if (ids.length > 1) {
        await channel.bulkDelete(ids).catch(console.error);
      } else if (ids.length === 1) {
        await channel.messages.delete(ids[0]);
      }
    }
    await db
      .query("UPDATE channels SET last_ran = $1 WHERE channel = $2;", [
        Date.now(),
        channel.id,
      ])
      .catch((e) => console.error(e));
  }
}, 60000);
