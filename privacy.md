## Privacy Policy

### What is stored by autoclear?
The following information is stored for purposes directly related to providing the service:
- Channel IDs: These are stored as part of the core service (automatically deleting messages in the channels)
- Server IDs: These are stored for the purposes of verifying that the bot has permission to delete messages from channels
- Timestamps: These are stored to identify channels that have been recently cleared and/or need to be cleared
- User profile information: These are stored for the purposes of ratelimiting and permission checking
- User provided information: The only information in this category that we explicitly store is a numerical value of how often a channel should be purged

#### Information not relating to the provided service
The following extra information is collected for caching purposes by [discord.js](https://www.npmjs.com/package/discord.js) and is never written to disk:
- Role information
- Emojis
- Message information (such as author, content, reactions, etc.)
- Extra user profile information which was not specified in the previous section, this includes public flags, assigned roles, etc.
- Any extra information not specified here that is available as a result of a server manager modifying the bot's permissions

### How long is information retained?
- Data collected directly related to the service: Until it is manually deleted, whether it be by the developer or a server manager (except in the case of user IDs, which are cleared after a ratelimit expires)
- Extra data collected by discord.js: There is no single time frame as such data can be cleared out at any point for performance reasons, but it is never written to disk and will not survive a service restart

TL;DR: We don't permanently store anything that could possibly identify a specific user

### How do I delete my information
We do not store anything identifying specific users on disk, so you can't because there's nowhere to delete it from.

If you want information regarding your server deleted, you may contact the [bot owner](https://discord.com/users/396347223736057866) (you must be the server owner)

This privacy statement only applies to the publicly hosted version and not any self hosted copy that may exist.
