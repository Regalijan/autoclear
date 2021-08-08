import { config as dotenv } from 'dotenv'
import https from 'https'

dotenv()

if (!process.argv[2]) throw Error('Please specify the application id with "node InteractionsDeploy.js {ApplicationID}"')

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
        name: 'targetChannel',
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
        name: 'targetChannel',
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
        name: 'channelId',
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
        name: 'targetChannel',
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
        name: 'allShards',
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
        name: 'activityType',
        description: 'The activity type int',
        type: 4
      }
    ]
  }
])

const req = https.request({
  hostname: 'discord.com',
  port: 443,
  path: `/api/v9/applications/${process.argv[2]}/commands`,
  method: 'POST',
  headers: {
    authorization: `Bot ${process.env.BKTN}`,
    'content-length': commandData.length
  }
}, function (res) {
  res.on('data', function (data): void {
    console.log(data)
  })
})

req.on('error', function (error): void {
  console.log(error)
})

req.write(commandData)
req.end()