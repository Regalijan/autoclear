import { Inhibitor } from 'discord-akairo'
import { Message } from 'discord.js'

class ClientPermissionsInhibitor extends Inhibitor {
  public constructor () {
    super('clientpermissions', {
      reason: 'missingClientPermissions'
    })
  }

  public async exec (message: Message): Promise<boolean> {
    let user = message.client.user?.id
    if (!user) user = (await message.client.fetchApplication()).id
    if (message.channel.type !== 'dm' && !message.channel.permissionsFor(user)?.has('SEND_MESSAGES')) return false
    return true
  }
}

export default ClientPermissionsInhibitor
