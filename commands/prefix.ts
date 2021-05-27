import db from '../database'
import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class PrefixCommand extends Command {
  public constructor () {
    super('prefix', {
      aliases: ['prefix'],
      args: [
        {
          default: null,
          id: 'pref',
          type: 'string'
        }
      ],
      channel: 'guild',
      cooldown: 45000,
      description: { about: 'Sets prefix for the guild', usage: '<prefix>' },
      ratelimit: 1
    })
  }

  public async exec (message: Message, { pref }: { pref: string | null }): Promise<void> {
    if (!message.guild) {
      await message.channel.send('Something fishy happened... `Details: Command executed in dm channel despite command channel type set to guild`')
      return
    }
    const existingPrefix = await db.query('SELECT * FROM settings WHERE guild = $1;', [message.guild.id]).catch(e => console.error(e))
    if (!existingPrefix) {
      await message.channel.send('An error occured when fetching the prefix! `Details: Database call failed`')
      return
    }
    if (!pref) {
      let prefstr = 'The prefix for this server is'
      if (existingPrefix.rowCount === 0) {
        if (Array.isArray(this.prefix) && this.prefix[0]) prefstr += ` ${this.prefix[0]}`
        else if (this.prefix) prefstr += ` ${this.prefix}`
        else prefstr += ` ${process.env.GLOBALPREFIX}`
      }
      if (existingPrefix.rows[0]?.prefix) {
        prefstr += ` ${existingPrefix.rows[0].prefix}`
      }
      await message.channel.send(prefstr)
      return
    }
    if (pref.length > 6) {
      await message.channel.send('The prefix can only be up to 6 characters!')
      return
    }
    if (pref === 'null') {
      const deletePrefSuccess = await db.query('DELETE FROM settings WHERE guild = $1;', [message.guild.id]).catch(e => console.error(e))
      if (!deletePrefSuccess) {
        await message.channel.send('An error occured when removing the prefix `Details: DELETE call failed`')
        return
      }
      await message.channel.send('Prefix reset!')
      return
    }
    if (existingPrefix.rowCount > 0) {
      const updatePrefixSuccess = await db.query('UPDATE settings SET prefix = $1 WHERE guild = $2;', [pref, message.guild.id]).catch(e => console.error(e))
      if (updatePrefixSuccess) {
        await message.channel.send('An error occured when setting the prefix! `Details: UPDATE call failed`')
        return
      }
    } else {
      const setPrefixSuccess = await db.query('INSERT INTO settings (guild, prefix) VALUES ($1,$2);', [message.guild.id, pref]).catch(e => console.error(e))
      if (!setPrefixSuccess) {
        await message.channel.send('An error occured when setting the prefix! `Details: INSERT call failed`')
        return
      }
      await message.channel.send('Prefix set!')
    }
  }
}
