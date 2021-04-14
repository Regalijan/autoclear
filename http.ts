import { randomBytes } from 'crypto'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { ShardingManager } from 'discord.js'
import cors from 'cors'
import db from './database'
import express from 'express'
import fetch from 'node-fetch'

const rateLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60
})

const rlMiddleware = function (req: express.Request, res: express.Response, next: express.NextFunction) {
  rateLimiter.consume(req.ip).then(function () {
    next()
  }).catch(function () {
    res.status(429).json({ error: 'Too many requests! Maximum is 30 requests per minute.' })
  })
}

export default async function (port: number, shardManager: ShardingManager) {
 const app = express()
 if (typeof process.env.USECF !== 'undefined') {
   app.set('trust proxy', [
    '173.245.48.0/20',
    '103.21.244.0/22',
    '103.22.200.0/22',
    '103.31.4.0/22',
    '141.101.64.0/18',
    '108.162.192.0/18',
    '190.93.240.0/20',
    '188.114.96.0/20',
    '197.234.240.0/22',
    '198.41.128.0/17',
    '162.158.0.0/15',
    '172.64.0.0/13',
    '131.0.72.0/22',
    '104.16.0.0/13',
    '104.24.0.0/14',
    '2400:cb00::/32',
    '2606:4700::/32',
    '2803:f800::/32',
    '2405:b500::/32',
    '2405:8100::/32',
    '2a06:98c0::/29',
    '2c0f:f248::/32'
   ])
   app.use(rlMiddleware)
   app.use(cors({ origin: process.env.CORSORIGIN, optionsSuccessStatus: 200 }))

   app.get('/api/auth/negotiate', async function (req: express.Request, res: express.Response) {
     if (typeof req.query.code === 'undefined') {
       res.status(400).json({ error: 'Missing code' })
       return
     }

     if (typeof req.query.error !== 'undefined') {
       res.status(400).json({ error: req.query.error.toString().replace(/\+/g, ' ') })
       return
     }

     const clientid = await shardManager.broadcastEval('this.user.id', Math.round(Math.random() * shardManager.shards.size - 1))
     const params = new URLSearchParams([
       ['client_id', clientid],
       ['client_secret', process.env.OAS],
       ['grant_type', 'authorization_code'],
       ['code', req.query.code],
       ['redirect_uri', process.env.OAREDIR]
     ])
     const oauthRequest = await fetch('https://discord.com/api/v8/oauth2/token', {
      method: 'POST',
      body: params,
     })
     if (!oauthRequest.ok) {
       res.status(500).json({ error: 'Could not redeem code' })
       return
     }
     const oauthBody = await oauthRequest.json()
     const currentUserRequest = await fetch('https://discord.com/api/v8/users/@me', {
       headers: {
         accept: 'application/json',
         authorization: `Bearer ${oauthBody.access_token}`
       }
     })
     if (!currentUserRequest.ok) {
       res.status(500).json({ error: 'Failed to fetch OAuth2 user' })
       return
     }
     const currentUserBody = await currentUserRequest.json()
     const userGuildsRequest = await fetch('https://discord.com/api/v8/users/@me/guilds', {
       headers: {
         accept: 'application/json',
         authorization: `Bearer ${oauthBody.access_token}`
       }
     })
     if (!userGuildsRequest.ok) {
       res.status(500).json({ error: 'Failed to fetch guilds' })
       return
     }
     const userGuildsBody = await userGuildsRequest.json()
     const userToken = randomBytes(32).toString('hex')
     if ((await db.query('SELECT * FROM auth WHERE uid = $1;', [currentUserBody.id])).rowCount === 0) {
       const createEntry = await db.query('INSERT INTO auth (uid,username,discriminator,access_token,refresh_token,access_expires,guilds,created,site_token) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);', [
         currentUserBody.id,
         currentUserBody.username,
         currentUserBody.discriminator,
         oauthBody.access_token,
         oauthBody.refresh_token,
         oauthBody.expires_in * 1000 + Date.now(),
         JSON.stringify(userGuildsBody),
         Date.now(),
         userToken
      ]).catch(e => console.error(e))
      if (typeof createEntry === 'undefined') {
        res.status(500).json({ error: 'Failed to write to database' })
        return
      }
     } else {
       const updateEntry = await db.query('UPDATE auth SET username = $1, discriminator = $2, access_token = $3, refresh_token = $4, access_expires = $5, guilds = $6, created = $7, site_token = $8 WHERE uid = $9;', [
        currentUserBody.username,
        currentUserBody.discriminator,
        oauthBody.access_token,
        oauthBody.refresh_token,
        oauthBody.expires_in * 1000 + Date.now(),
        JSON.stringify(userGuildsBody),
        Date.now(),
        userToken,
        currentUserBody.id
       ]).catch(e => console.error(e))
      if (typeof updateEntry === 'undefined') {
        res.status(500).json({ error: 'Update call failed' })
        return
      }
     }
     res.redirect('/')
   })

 }
 app.listen(port)
}