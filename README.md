# Autoclear
Utility bot for mass-deleting messages and autoclearing channels

This bot was made for Node `15.x` but should work fine on `14.x` (anything lower is not guaranteed to work).

- Create a file in the directory named `.env`
- Set `BTKN` to your bot token
- Set `GLOBALPREFIX` to what the prefix should be for all servers without a custom one.
- Set the database credentials: `DBU: User`, `DBPASS: Password`, `DBN: Database name`, `DBH: Host address`

## Commands
- `ac!ping` This better be obvious
- `ac!help` Should also be obvious
- `ac!clear` Clears `x` number of messages from channel (which are less than two weeks old)
- `ac!autoclear` Configures autoclear on a channel
- `ac!setstatus` Owner only: Change status of the bot (current shard)
- `ac!setglobalstatus` Owner only: Change bot status across all shards
