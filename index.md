# Autoclear

## Quick start

So you have your beautiful server and this wonderful bot you just found, what now? Set up channels of course.

## Commands
- `/about` - About me, beep boop
- `/autoclear <enable|disable> <#channel> <minutes?>` - Enables or disables autoclearing on the specified channel every n minutes (minimum 30)
- `/channels` - Displays all channels with autoclearing enabled
- `/clear <amount> <#channel?>` - Clears `amount` messages from `#channel` (or the current channel if none specified, max 100 per command)
- `/debug` - Displays some goodies that may or may not have a use
- `/help` - Finds information for the given command
- `/ping` - Pong
- `/resetstatus`** - Resets status of all shards
- `/setglobalstatus <activity> <activitytype?>`** - Sets the status message globally (across all shards), `activitytype` requires an integer.

** Owner only

## FAQ
- "I still see messages in a channel even though I set it to clear" - Run `/clear` on the channel to catch the remainders, any new messages should be picked up. This occurs when the bot has recently restarted.

- ~~"The bot isn't responding" - Make sure the bot has permission to send messages in the channel you are running commands.~~ Autoclear now uses slash commands, you may need to reinvite the bot if you don't see them.

- "Messages aren't being deleted" - Make sure the bot has the manage messages permission so that it can delete messages.

- "Is there a premium version" - Not at the moment.

## Self hosting guide
Here be dragons, make sure you know what you are doing!

### Install required tools
1. Clone the repo
2. Install NodeJS 16.6.0 or later (Support for earlier versions was dropped in Discord.js v13)
3. Install PostgreSQL 13
4. `npm install`

### ENV variables
- `DBH` - Database host, if on the same machine `localhost` will suffice
- `DBPASS` - Database password, UNIX sockets have not been tested with this bot
- `DBU` - Database username
- `DBN` - Database name, this will need to be the same as the database you create later
- `BTKN` - Bot token

Now create a file named `.env` and add all of the values

### Get ready
1. Create a new database user with the appropriate permissions
2. Create a dedicated user account for the bot to run under
3. Keep the bot alive somehow, whether it be a process manager or a systemd service
4. Create a database and import the template
5. `npx tsc` in the project root
6. Deploy your slash commands with `node dist/InteractionsDeploy.js {YOUR_BOT_ID}`

## I need help
There is no dedicated server for autoclear, but I am usually [available](https://discord.com/invite/cYakVbr)

## Privacy Policy
Please see the [privacy policy page](https://autoclear.wolftallemo.com/privacy)

## Terms of Service
Please see the [terms of service page](https://autoclear.wolftallemo.com/terms)
