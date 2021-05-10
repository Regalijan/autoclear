# Autoclear

## Quick start

So you have your beautiful server and this wonderful bot you just found, what now? Set up channels of course.

## Commands
- `ac!about` - About me, beep boop
- `ac!autoclear <enable|disable> <minutes> <#channel>` - Enables or disables autoclearing on the specified channel every n minutes (minimum 30)
- `ac!channels` - Displays all channels with autoclearing enabled
- `ac!clear <amount> <#channel?>` - Clears `amount` messages from `#channel` (or the current channel if none specified, max 100 per command)
- `ac!debug` - Displays some goodies that may or may not have a use
- `ac!help <command>` - Finds information for the given command
- `ac!ping` - Pong
- `ac!prefix <prefix | null>` - Sets the prefix for the server ("null" clears it)
- `ac!setglobalstatus`** - Sets the status message globally (across all shards)
- `ac!setstatus`** - Sets status for the current shard

** Owner only

## Self hosting guide
Here be dragons, make sure you know what you are doing!

### Install required tools
1. Clone the repo
2. Install NodeJS 16.x (15.x will work but it will be deprecated in the near future, not tested on 14.x but will probably still work)
3. Install PostgreSQL 13
4. `npm install`

### ENV variables
- `DBH` - Database host, if on the same machine `localhost` will suffice
- `DBPASS` - Database password, UNIX sockets have not been tested with this bot
- `DBU` - Database username
- `DBN` - Database name, this will need to be the same as the database you create later
- `BTKN` - Bot token
- `BOTOWNER` - Your user id
- `GLOBALPREFIX` - The prefix which is recognized anywhere the bot is

Now create a file named `.env` and add all of the values

### Get ready
1. Create a new database user with the appropriate permissions
2. Create a dedicated user account for the bot to run under
3. Keep the bot alive somehow, whether it be a process manager or a systemd service
4. Create a database and import the template
5. `npx tsc` in the project root

## I need help
There is no dedicated server for autoclear, but I am usually [available](https://discord.com/invite/cYakVbr)
