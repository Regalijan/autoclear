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
~~Here be dragons, make sure you know what you are doing!~~ Autoclear is now dockerized, which should make self-hosting much easier.

### Install required tools
1. Clone the repo
2. Install [Docker](https://docs.docker.com/get-docker/)

#### Special Instructions for Linux
1. Head to the [releases section](https://github.com/docker/compose/releases/latest) of the Docker Compose repository.
2. Download the correct binary for your system - this will probably be x86_64 but you can always check with `uname -m`.
3. Move the binary to one of the directories listed [here](https://github.com/docker/compose#where-to-get-docker-compose) - MAKE SURE THE DIRECTORY EXISTS BEFORE MOVING THE FILE!
4. Allow execution of the binary `sudo chmod +x name_of_binary`.
5. Reload shell if `docker compose` does not work.

### ENV variables
Only the bot token is required when running in Docker.

- `DBH` - Database host, if on the same machine `localhost` will suffice
- `DBPASS` - Database password, UNIX sockets have not been tested with this bot
- `DBU` - Database username
- `DBN` - Database name, this will need to be the same as the database you create later
- `BTKN` - Bot token (required)

Now create a file named `.env` and add all of the values

### Get ready
1. In the project root, start the bot with `docker compose up -d` (take note of the missing hypen).
2. That's it.

## Development Setup
1. Install [Node.js](https://nodejs.org) (16.6.0+ required)
2. Install [PostgreSQL 14](https://www.postgresql.org)
3. Create database and load the template in.
4. Install the required dependencies with `npm install`
5. Create `.env` and fill in the file using the variable table above.
6. Compile the project with `npx tsc`
7. Start the bot with `node dist`

## I need help
There is no dedicated server for autoclear, but I am usually [available](https://discord.com/invite/cYakVbr)

## Privacy Policy
Please see the [privacy policy page](https://autoclear.wolftallemo.com/privacy)

## Terms of Service
Please see the [terms of service page](https://autoclear.wolftallemo.com/terms)
