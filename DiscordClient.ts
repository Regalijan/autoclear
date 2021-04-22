import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { join } from 'path'
import dotenv from 'dotenv'
import db from './database'
import { MessageEmbed, TextChannel } from 'discord.js'

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

db.connect().catch(e => {
  console.error(e)
  process.exit()
})

setTimeout(async function (): Promise<void> {
  await bot.user?.setPresence({ activity: { type: 'PLAYING', name: 'message eating contest.' } })
  return
}, 10000)

setInterval(async function (): Promise<void>  {
  const staleChannels = await db.query('SELECT * FROM channels WHERE (last_ran + 1800000) < $1;', [Date.now()]).catch(e => console.error(e))
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
    while (channel.messages.cache.size > 0 && typeof channel.lastMessage?.createdTimestamp !== 'undefined' && channel.lastMessage.createdTimestamp > Date.now() - 1209600000) await channel.bulkDelete(100, true).catch(() => {})
    await db.query('UPDATE channels SET last_ran = $1 WHERE channel = $2;', [Date.now(), channel.id]).catch(e => console.error(e))
    const pinnedMessage = await db.query('SELECT * FROM pinned_messages WHERE channel = $1;', [channel.id])
    if (pinnedMessage.rowCount === 0) return
    const embedData = pinnedMessage.rows[0]
    if (!embedData.embed) {
      await channel.send(embedData.description)
      continue
    }
    const embed = new MessageEmbed()
      .setDescription(embedData.description)
    if (embedData.author_name) embed.setAuthor(embedData.author_name, embedData.author_icon, embedData.author_url)
    if (embedData.color) embed.setColor(embedData.color)
    if (embedData.footer) embed.setFooter(embedData.footer, embedData.footer_icon)
    if (embedData.image) embed.setImage(embedData.image)
    if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail)
    if (embedData.url) embed.setURL(embedData.url)
    if (embedData.fields) embedData.fields.forEach(function (field: { name: string, value: string, inline: boolean | undefined } ) {
      embed.addField(field.name, field.value, field.inline)
    })
    await channel.send(embed)
  }
}, 60000)
