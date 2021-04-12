import { ShardingManager } from 'discord.js'
import { join } from 'path'
import WebServer from './http'
import dotenv from 'dotenv'
import { lokiConnector } from './loki'
import { strictEqual } from 'assert'

dotenv.config()
if (typeof process.env.BTKN === 'undefined') {
  throw Error('BOT TOKEN MISSING! WAS IT SET IN THE ENVIRONMENT?')
}

if (typeof process.env.GLOBALPREFIX === 'undefined') {
  throw Error('DEFAULT PREFIX MISSING, SET GLOBALPREFIX IN ENVIRONMENT!')
}

;(function () {
  const gpDoc = lokiConnector.addCollection('globalPrefix')
  const pref = gpDoc.findOne({ prefix: { $type: 'string' } })
  if (pref === null) {
    gpDoc.insertOne({ prefix: process.env.GLOBALPREFIX })
  } else if (pref !== process.env.GLOBALPREFIX) {
    pref.prefix = process.env.GLOBALPREFIX
    gpDoc.update(pref)
  }
  lokiConnector.saveDatabase(function (e) {
    if (e) throw Error(e)
  })
})

const shardingManager = new ShardingManager(join(__dirname, 'DiscordClient.js'), {
  token: process.env.BTKN,
  totalShards: 'auto'
})

shardingManager.on('shardCreate', function (shard) {
  console.log(`Launching shard ${shard.id + 1} of ${shardingManager.totalShards}`)
})

shardingManager.spawn()

if (process.env.WEBPORT && !isNaN(parseInt(process.env.WEBPORT))) WebServer(shardingManager, parseInt(process.env.WEBPORT))
