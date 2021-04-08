import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { join } from 'path'
import { lokiConnector } from './loki'

const owner: string = process.env.OWNER ?? '396347223736057866'
if (typeof process.env.BTKN === 'undefined') throw Error('BOT TOKEN MISSING! WAS IT SET IN THE ENVIRONMENT?')
class DiscordClient extends AkairoClient {
  private readonly commandHandler: CommandHandler = new CommandHandler(this, {
    allowMention: true,
    blockBots: true,
    blockClient: true,
    directory: join(__dirname, 'commands'),
    prefix: process.env.BOTPREF ?? 'ac!'
  })

  private readonly listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, 'listeners')
  })

  private setPrefix (prefix: string): void {
    const globalPrefix = lokiConnector.addCollection('globalPrefix')
    globalPrefix.insertOne({ prefix: prefix })
  }

  public constructor () {
    super({
      ownerID: owner
    }, {
      disableMentions: 'everyone',
      shards: 'auto',
      ws: { intents: ['GUILDS', 'GUILD_MESSAGES'] }
    })
    this.commandHandler.useListenerHandler(this.listenerHandler)
    this.listenerHandler.loadAll()
    this.commandHandler.loadAll()
    if (Array.isArray(this.commandHandler.prefix)) this.setPrefix(this.commandHandler.prefix[0])
    else if (typeof this.commandHandler.prefix === 'string') this.setPrefix(this.commandHandler.prefix)
    else this.setPrefix('ac!')
  }
}

const client = new DiscordClient()
client.login(process.env.BTKN).catch(e => {
  console.error(e)
  process.exit()
})

setTimeout(async function (): Promise<void> {
  await client.user?.setPresence({ activity: { type: 'PLAYING', name: 'message eating contest.' } })
}, 10000)

process.on('SIGHUP', function () {
  client.destroy()
  process.exit()
})

process.on('SIGINT', function () {
  client.destroy()
  process.exit()
})

process.on('SIGTERM', function () {
  client.destroy()
  process.exit()
})
