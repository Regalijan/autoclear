import { ShardingManager } from 'discord.js'
import { join } from 'path'
import dotenv from 'dotenv'
import { Client as DBClient } from 'pg'

dotenv.config()
if (typeof process.env.BTKN === 'undefined') {
  throw Error('BOT TOKEN MISSING! WAS IT SET IN THE ENVIRONMENT?')
}

const shardingManager = new ShardingManager(join(__dirname, 'DiscordClient.js'), {
  token: process.env.BTKN,
  totalShards: 'auto'
})

shardingManager.on('shardCreate', function (shard) {
  console.log(`Launching shard ${shard.id + 1} of ${shardingManager.totalShards}`)
})

;(async function () {
  try {
    const db = new DBClient({
      host: process.env.DBH ?? 'postgres',
      password: process.env.DBPASS,
      user: process.env.DBU ?? 'postgres',
      port: 5432
    }) // Temporary client for main process to create the database if it does not exist
    await db.connect()
    await db.query('CREATE DATABASE $1;', [process.env.DBN ?? 'autoclear']).catch(() => {})
    await db.query('CREATE TABLE IF NOT EXISTS channels (channel text NOT NULL, guild NOT NULL, interval bigint, last_ran bigint, is_insta boolean NOT NULL);')
    await db.end().catch(() => {})
  } catch {}
  await shardingManager.spawn()
})
