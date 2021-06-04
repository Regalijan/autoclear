import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { join } from 'path'
import dotenv from 'dotenv'
import db from './database'
import { Message, TextChannel } from 'discord.js'

dotenv.config()

class DiscordClient extends AkairoClient {
  private readonly commandHandler: CommandHandler = new CommandHandler(this, {
    allowMention: true,
    blockBots: true,
    blockClient: true,
    directory: join(__dirname, 'commands'),
    prefix: async function (message: Message): Promise<string[]> {
      const prefixes: string[] = []
      if (process.env.GLOBALPREFIX) prefixes.push(process.env.GLOBALPREFIX)
      if (prefixes.length === 0) prefixes.push('ac!')
      if (!message.guild) return prefixes
      const data = await db.query('SELECT * FROM settings WHERE guild = $1;', [message.guild.id]).catch(e => console.error(e))
      if (data && data.rowCount > 0 && data.rows[0].prefix) prefixes.push(data.rows[0].prefix)
      return prefixes
    }
  })

  private readonly listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, 'listeners')
  })

  public constructor () {
    super({
      ownerID: process.env.BOTOWNER ?? '396347223736057866'
    }, {
      disableMentions: 'everyone',
      ws: { intents: ['GUILDS', 'GUILD_MESSAGES'] }
    })
    this.commandHandler.useListenerHandler(this.listenerHandler)
    this.listenerHandler.loadAll()
    this.commandHandler.loadAll()
  }
}

const bot = new DiscordClient()
bot.login(process.env.BTKN).catch(e => {
  console.error(e)
  process.exit()
})

bot.once('ready', function () {
  console.log(`Shard ${bot.shard?.ids[0]} ready with ${bot.guilds.cache.size} guilds.`)
})

db.connect().catch(e => {
  console.error(e)
  process.exit()
})

setTimeout(async function (): Promise<void> {
  await bot.user?.setPresence({ activity: { type: 'PLAYING', name: 'message eating contest.' } })
  return
}, 10000)

setInterval(async function (): Promise<void>  {
  const staleChannels = await db.query('SELECT * FROM channels WHERE last_ran < $1;', [Date.now() - 1800000]).catch(e => console.error(e))
  if (typeof staleChannels === 'undefined') return
  for (let i = 0; i < staleChannels.rowCount; i++) {
    if (staleChannels.rows[i].last_ran + staleChannels.rows[i].interval < Date.now()) continue
    const guild = bot.guilds.cache.find(g => g.id === staleChannels.rows[i].guild)
    if (typeof guild === 'undefined') continue
    const untypedChannel: any = guild.channels.cache.find(c => c.id === staleChannels.rows[i].channel)
    if (typeof untypedChannel === 'undefined') continue
    const channel: TextChannel = untypedChannel
    if (channel.permissionOverwrites.find(p => p.deny.has('MANAGE_MESSAGES'))) continue
    if (!guild.me?.hasPermission('MANAGE_MESSAGES') && !channel.permissionOverwrites.find(p => p.allow.has('MANAGE_MESSAGES'))) continue
    if ((!guild.me?.hasPermission('READ_MESSAGE_HISTORY') || channel.permissionOverwrites.find(p => p.deny.has('READ_MESSAGE_HISTORY'))) && !channel.permissionOverwrites.find(p => p.allow.has('READ_MESSAGE_HISTORY'))) continue
    while (channel.messages.cache.filter(msg => !msg.pinned).size > 0 && typeof channel.lastMessage?.createdTimestamp !== 'undefined' && channel.lastMessage.createdTimestamp > Date.now() - 1209600000) {
      const fetchedMsgs = await channel.messages.fetch({ limit: 100 })
      const ids: string[] = []
      fetchedMsgs.forEach(async msg => {
        if (!msg.pinned && !msg.deleted && msg.createdTimestamp > Date.now() - 1209600000) ids.push(msg.id)
      })
      channel.messages.cache.forEach(msg => {
        if (!ids.includes(msg.id) && !msg.pinned && !msg.deleted && msg.createdTimestamp > Date.now() - 1209600000) ids.push(msg.id)
      })
      await channel.bulkDelete(ids)
    }
    await db.query('UPDATE channels SET last_ran = $1 WHERE channel = $2;', [Date.now(), channel.id]).catch(e => console.error(e))
  }
}, 60000)
