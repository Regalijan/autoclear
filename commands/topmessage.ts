import { Command } from 'discord-akairo'
import { Message, TextChannel } from 'discord.js'
import db from '../database'

export default class TopMessageCommand extends Command {
  public constructor () {
    super('topmessage', {
      aliases: ['topmessage', 'pinned', 'topmsg'],
      args: [
        {
          id: 'channel',
          prompt: {
            cancel: 'Already? Bruh.',
            retry: 'Does the channel exist? It better - try again.',
            start: 'Which channel?',
            timeout: 'Hurry up already.'
          },
          type: 'textChannel'
        },
        {
          id: 'body',
          prompt: {
            cancel: 'Finished *for now*',
            start: 'What is the message body? (JSON for embeds, you can make one at <https://leovoel.github.io/embed-visualizer>)\nIf you need more time, say `cancel` and rerun this command when ready.',
            timeout: 'Too slow.'
          },
          type: 'string'
        }
      ],
      description: { about: 'Sets the pinned message of an autoclearing channel.', usage: '<channel> <body>' }
    })
  }

  public async exec (message: Message, { channel, body }: { channel: TextChannel, body: string }): Promise<void> {
    const storedChannel = await db.query('SELECT * FROM channels WHERE channel = $1;', [channel.id]).catch(e => console.error(e))
    if (typeof storedChannel === 'undefined') {
      await message.channel.send('An error occured. `Details: Find channel call failed`')
      return
    }
    if (storedChannel.rowCount === 0) {
      await message.channel.send('This channel does not have autoclear enabled, please enable it first.')
      return
    }
    const channelTopInfo = await db.query('SELECT * FROM pinned_messages WHERE channel = $1;', [channel.id]).catch(e => console.error(e))
    if (typeof channelTopInfo === 'undefined') {
      await message.channel.send('Database query failed. `Details: typeof channelTopInfo === \'undefined\'`')
      return
    }
    if (channelTopInfo.rowCount > 0) {
      await message.channel.send('A message is already set for this channel! Disable it first.')
      return
    }
    try {
      JSON.parse(body)
    } catch {
      const nonEmbedInsertSuccess = await db.query('INSERT INTO pinned_messages (embed,description,channel) VALUES($1,$2,$3);', [false, body, channel]).catch(e => console.error(e))
      if (typeof nonEmbedInsertSuccess === 'undefined') {
        await message.channel.send('An error occured when setting the message! `Details: nonEmbedInsert call failed`')
        return
      }
      await message.channel.send('Message set!')
      return
    }
    const dBody = JSON.parse(body)
    if (!dBody.embed) {
      await message.channel.send('Embed missing. Try again.')
      return
    }
    const parsedBody = dBody.embed
    const description = parsedBody.description ?? '\u200B'
    const authorName = parsedBody.author?.name
    const authorUrl = parsedBody.author?.url
    const authorIcon = parsedBody.author?.icon_url
    const color = parsedBody.color
    const footer = parsedBody.footer?.text
    const footerIcon = parsedBody.footer?.icon_url
    const image = parsedBody.image?.url
    const thumb = parsedBody.thumbnail?.url
    const title = parsedBody.title
    const url = parsedBody.url
    const fields = parsedBody.fields
    const embedInsertSuccess = await db.query('INSERT INTO pinned_messages (embed,description,author_name,author_icon,author_url,color,footer,footer_icon,image,thumbnail,title,url,fields,channel) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);', [
      true,
      description,
      authorName,
      authorIcon,
      authorUrl,
      color,
      footer,
      footerIcon,
      image,
      thumb,
      title,
      url,
      fields,
      channel.id
    ]).catch(e => console.error(e))
    if (typeof embedInsertSuccess === 'undefined') {
      await message.channel.send('Saving data failed! `Details: embedInsert call failed`')
      return
    }
    await message.channel.send('Message set!')
  }
}
