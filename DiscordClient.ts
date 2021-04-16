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
    while (channel.messages.cache.size > 0 && typeof channel.lastMessage?.createdTimestamp !== 'undefined' && channel.lastMessage.createdTimestamp > Date.now() - 1209600000) await channel.bulkDelete(100, true)
    await db.query('UPDATE channels SET last_ran = $1 WHERE channel = $2;', [Date.now(), channel.id]).catch(e => console.error(e))
    if (typeof staleChannels.rows[i].pinned_message !== 'undefined') {
      const embedData = JSON.parse(staleChannels.rows[i].pinned_message)
      const embed = new MessageEmbed()
        .setDescription(embedData.description?.toString() ?? '\u200B')
      if (embedData.author?.name) embed.setAuthor(embedData.author.name.toString(), embedData.author.icon_url.toString(), embedData.author.url.toString())
      if (embedData.title) embed.setTitle(embedData.title.toString())
      if (Array.isArray(embedData.fields)) try {
          embedData.fields.forEach(function (field: { name: string, value: string, inline: boolean | undefined }) {
          if (field.name && field.value) embed.addField(field.name, field.value, field.inline)
        })
      } catch {}
      if (embedData.image?.url) embed.setImage(embedData.image.url.toString())
      if (embedData.footer?.text) embed.setFooter(embedData.footer.text.toString(), embedData.footer.icon_url?.toString())
      if (embedData.thumbnail?.url) embed.setThumbnail(embedData.thumbnail.url.toString())
      if (embedData.color) try {
        embed.setColor(parseInt(embedData.color))
      } catch {}
      await channel.send(embed)
    }
  }
}, 60000)
