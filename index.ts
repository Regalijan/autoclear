import { ShardingManager } from 'discord.js'
import { join } from 'path'
import WebServer from './http'
import dotenv from 'dotenv'

dotenv.config()
if (typeof process.env.BTKN === 'undefined') {
  throw Error('BOT TOKEN MISSING! WAS IT SET IN THE ENVIRONMENT?')
}

if (typeof process.env.GLOBALPREFIX === 'undefined') {
  throw Error('DEFAULT PREFIX MISSING, SET GLOBALPREFIX IN ENVIRONMENT!')
}

const shardingManager = new ShardingManager(join(__dirname, 'DiscordClient.js'), {
  token: process.env.BTKN,
  totalShards: 'auto'
})

shardingManager.on('shardCreate', function (shard) {
  console.log(`Launching shard ${shard.id + 1} of ${shardingManager.totalShards}`)
})

shardingManager.spawn()

if (process.env.WEBPORT) WebServer(shardingManager, parseInt(process.env.WEBPORT))
