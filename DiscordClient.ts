import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { join } from 'path'
import dotenv from 'dotenv'
import { lokiConnector } from './loki'
import { TextChannel } from 'discord.js'

dotenv.config()

class DiscordClient extends AkairoClient {
  private readonly commandHandler: CommandHandler = new CommandHandler(this, {
    allowMention: true,
    blockBots: true,
    blockClient: true,
    directory: join(__dirname, 'commands'),
    prefix: process.env.GLOBALPREFIX
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

setTimeout(async function (): Promise<void> {
  await bot.user?.setPresence({ activity: { type: 'PLAYING', name: 'message eating contest.' } })
  return
}, 10000)

setInterval(async function (): Promise<void> {
  const autoclearCol = lokiConnector.addCollection('autoclear')
  const autoclearData = autoclearCol.find({ lastRan: { $gt: Date.now() + 1800000 }})
  for (let i = 0; i < autoclearData.length; i++) {
    const guild = bot.guilds.cache.find(g => g.id === autoclearData[i].guild)
    if (typeof guild === 'undefined') continue
    const cachedChannel = guild.channels.cache.find(c => c.id === autoclearData[i].channel)
    if (typeof cachedChannel === 'undefined') continue
    if (typeof cachedChannel.permissionOverwrites.find(p => p.deny.has('MANAGE_MESSAGES')) !== 'undefined') continue
    if (!guild.me?.hasPermission('MANAGE_MESSAGES') && typeof cachedChannel.permissionOverwrites.find(p => p.allow.has('MANAGE_MESSAGES')) === 'undefined') continue
    if (cachedChannel.type !== 'text') continue
    const nonTypedChannel: any = cachedChannel
    const channel: TextChannel = nonTypedChannel
    await channel.bulkDelete(500, true)
    autoclearData[i].lastRan = Date.now()
    autoclearCol.update(autoclearData[i])
    const embed = lokiConnector.addCollection('topMessages').findOne({ channel: channel.id })
    if (embed === null) return
    await channel.send(embed)
  }
}, 60000)
