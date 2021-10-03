import { config as dotenv } from 'dotenv'
import fetch from 'node-fetch'

dotenv()

const commandData = JSON.stringify([
  {
    name: 'about',
    description: 'Displays information about the bot'
  },
  {
    name: 'autoclear',
    description: 'Disables or enables autoclear for a channel',
    options: [
      {
        name: 'action',
        description: 'Disable or Enable',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Disable',
            value: 'disable'
          },
          {
            name: 'Enable',
            value: 'enable'
          }
        ]
      },
      {
        name: 'targetchannel',
        description: 'The selected channel to act on',
        type: 7,
        required: true
      },
      {
        name: 'interval',
        description: 'How often a channel should be cleared (enable only)',
        type: 4
      }
    ]
  },
  {
    name: 'channels',
    description: 'Displays all channels which are enabled.'
  },
  {
    name: 'clear',
    description: 'Purges channel of n messages',
    options: [
      {
        name: 'amount',
        description: 'The number of messages to delete',
        type: 4
      },
      {
        name: 'targetchannel',
        description: 'The channel to purge',
        type: 7
      }
    ]
  },
  {
    name: 'debug',
    description: 'Displays debug information'
  },
  {
    name: 'forcedisable',
    description: 'Forcefully disables a channel from autoclear (meant for deleted channels)',
    options: [
      {
        name: 'channelid',
        description: 'The id of the channel',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'help',
    description: 'Displays help link'
  },
  {
    name: 'instadelete',
    description: 'Toggles instadelete for a channel',
    options: [
      {
        name: 'targetchannel',
        description: 'The channel to toggle',
        type: 7,
        required: true
      },
      {
        name: 'action',
        description: 'The action to take',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Disable',
            value: 'disable'
          },
          {
            name: 'Enable',
            value: 'enable'
          }
        ]
      }
    ]
  },
  {
    name: 'ping',
    description: 'Pong'
  },
  {
    name: 'restart',
    description: 'Restarts the bot',
    options: [
      {
        name: 'allshards',
        description: 'Whether to restart all shards',
        type: 5
      },
      {
        name: 'server',
        description: 'The server ID used to calculate the shard',
        type: 3
      }
    ]
  },
  {
    name: 'resetstatus',
    description: 'Resets status of all shards'
  },
  {
    name: 'setglobalstatus',
    description: 'Sets the status of all shards',
    options: [
      {
        name: 'activity',
        description: 'The activity status',
        type: 3,
        required: true
      },
      {
        name: 'activitytype',
        description: 'The activity type int',
        type: 4
      }
    ]
  }
])

;(async function () {
  const meRequest = await fetch('https://discord.com/api/v9/users/@me', {
    headers: {
      accept: 'application/json',
      authorization: `Bot ${process.env.BTKN}`,
      'user-agent': `DiscordBot (https://github.com/discordjs/discord.js#readme, Node.js/${process.version}) +APPLICATION COMMANDS DEPLOY SCRIPT - https://github.com/Wolftallemo/autoclear/blob/main/InteractionsDeploy.ts`
    }
  })

  const meData: any = await meRequest.json() // node-fetch typings are a bit broken
  if (!meData.id) return
  await fetch(`https://discord.com/api/v9/applications/${meData.id}/commands`, {
    headers: {
      accept: 'application/json',
      authorization: `Bot ${process.env.BTKN}`,
      'content-length': commandData.length.toString(),
      'content-type': 'application/json'
    },
    method: 'PUT'
  })
}())
