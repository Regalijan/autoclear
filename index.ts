import { ShardingManager } from "discord.js";
import { join } from "path";
import dotenv from "dotenv";
import { Client as DBClient } from "pg";

dotenv.config();
if (typeof process.env.BTKN === "undefined") {
  throw Error("BOT TOKEN MISSING! WAS IT SET IN THE ENVIRONMENT?");
}

const shardingManager = new ShardingManager(
  join(__dirname, "DiscordClient.js"),
  {
    token: process.env.BTKN,
    totalShards: "auto",
  },
);

shardingManager.on("shardCreate", function (shard) {
  console.log(
    `Launching shard ${shard.id + 1} of ${shardingManager.totalShards}`,
  );
});
(async () => {
  try {
    let db = new DBClient({
      host: process.env.DBH ?? "postgres",
      password: process.env.DBPASS,
      user: process.env.DBU ?? "postgres",
      port: 5432,
    }); // Temporary client for main process to create the database if it does not exist
    await db.connect();
    await db
      .query(`CREATE DATABASE ${process.env.DBN ?? "autoclear"};`)
      .catch(() => {}); // Is this bad? Yes, but apparently parameterization doesn't work for database creation calls (low risk since there shouldn't be any user input).
    await db.end().catch(() => {});
    db = new DBClient({
      host: process.env.DBH ?? "postgres",
      password: process.env.DBPASS,
      user: process.env.DBU ?? "postgres",
      database: process.env.DBN ?? "autoclear",
      port: 5432,
    }); // Initialize a new client to switch to the new database
    await db.connect();
    await db.query(
      "CREATE TABLE IF NOT EXISTS channels (channel text NOT NULL, guild text NOT NULL, interval bigint, last_ran bigint, is_insta boolean NOT NULL);",
    );
  } catch {}
  await shardingManager.spawn();
})();
