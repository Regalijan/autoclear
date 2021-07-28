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
      presence: { activity: { type: 'COMPETING', name: 'message eating contest.' } },
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

if (process.env.ENABLEDEBUG) bot.on('debug', function (info: string): void {
  console.log(info)
})

db.connect().catch(e => {
  console.error(e)
  process.exit()
})

setInterval(async function (): Promise<void>  {
  const staleChannels = await db.query('SELECT * FROM channels WHERE is_insta = false AND last_ran < $1;', [Date.now() - 1800000]).catch(e => console.error(e))
  if (typeof staleChannels === 'undefined') return
  for (let i = 0; i < staleChannels.rowCount; i++) {
    if (staleChannels.rows[i].last_ran + (staleChannels.rows[i].interval * 60000) > Date.now()) continue
    const guild = bot.guilds.cache.find(g => g.id === staleChannels.rows[i].guild)
    if (typeof guild === 'undefined') continue
    const untypedChannel: any = guild.channels.cache.find(c => c.id === staleChannels.rows[i].channel)
    if (typeof untypedChannel === 'undefined') continue
    const user = guild.client.user?.id ?? (await guild.members.fetch((await guild.client.fetchApplication()).id)).id
    const channel: TextChannel = untypedChannel
    if (!channel.permissionsFor(user)?.has(['MANAGE_MESSAGES','READ_MESSAGE_HISTORY'])) continue
    while (channel.messages.cache.filter(msg => !msg.pinned).size > 0 && typeof channel.lastMessage?.createdTimestamp !== 'undefined' && channel.lastMessage.createdTimestamp > Date.now() - 1209600000) {
      const fetchedMsgs = await channel.messages.fetch({ limit: 100 })
      const ids: string[] = []
      fetchedMsgs.forEach(msg => {
        if (!msg.pinned && !msg.deleted && msg.createdTimestamp > Date.now() - 1209600000) ids.push(msg.id)
      })
      channel.messages.cache.forEach(msg => {
        if (!ids.includes(msg.id) && !msg.pinned && !msg.deleted && msg.createdTimestamp > Date.now() - 1209600000) ids.push(msg.id)
      })
      await channel.bulkDelete(ids).catch(e => console.error(e))
    }
    await db.query('UPDATE channels SET last_ran = $1 WHERE channel = $2;', [Date.now(), channel.id]).catch(e => console.error(e))
  }
}, 60000)

process.on('SIGHUP', function () {
  bot.destroy()
  process.exit()
})

process.on('SIGINT', function () {
  bot.destroy()
  process.exit()
})

process.on('SIGTERM', function () {
  bot.destroy()
  process.exit()
})
