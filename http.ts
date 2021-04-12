import http from 'http2'
import { lokiConnector } from './loki'
import { ShardingManager } from 'discord.js'
import fetch from 'node-fetch'
import { randomBytes } from 'crypto'

export default function (shardingManager: ShardingManager, port: number) {
  const credStore = lokiConnector.addCollection('tokens')
  credStore.on('error', function (e) {
    console.error(`Loki error: ${e}`)
  })
  async function routeListener (req: http.Http2ServerRequest, res: http.Http2ServerResponse): Promise<void> {
    res.setHeader('content-type', 'application/json; charset=utf-8')
    async function sendNotAuthorized (): Promise<void> {
      const body = JSON.stringify({ error: 'Unauthorized' })
      res.writeHead(401, {
        'content-length': Buffer.byteLength(body)
      })
      res.end(body)
    }

    async function sendNotFound (): Promise<void> {
      const body = JSON.stringify({ error: 'Not found' })
      res.writeHead(404, {
        'content-length': Buffer.byteLength(body)
      })
      res.end(body)
    }

    async function sendMethodNotAllowed (): Promise<void> {
      const body = JSON.stringify({ error: 'Method not allowed' })
      res.writeHead(405, {
        'content-length': Buffer.byteLength(body)
      })
      res.end(body)
    }

    async function sendInternalServerError (): Promise<void> {
      const body = JSON.stringify({ error: 'Internal server error' })
      res.writeHead(500, {
        'content-length': Buffer.byteLength(body)
      })
      res.end(body)
    }

    async function deleteUserData (body: string, status: number): Promise<void> {
      const uData = credStore.findOne({ token: req.headers.authorization })
      if (uData !== null) credStore.remove(uData)
      res.writeHead(status, {
        'content-length': Buffer.byteLength(body)
      })
      res.end(body)
    }

    const userData = credStore.findOne({ token: req.headers.authorization })
    if (!req.url.startsWith('/auth/negotiate?code=')) {
      if (typeof req.headers.authorization === 'undefined' || userData === null) {
        await sendNotAuthorized()
        return
      }
      if (userData.meta.created >= Date.now() + 432000000) {
        credStore.remove(userData)
        await sendNotAuthorized()
        return
      }
    }
    const requestUrl = new URL(req.url, 'http://localhost')
    switch (requestUrl.pathname) {
      case '/user':
        if (req.method !== 'GET') {
          await sendMethodNotAllowed()
          return
        }
        const userBody = JSON.stringify({ user: `${userData.username}#${userData.discriminator}` })
        res.writeHead(200, {
          'content-length': Buffer.byteLength(userBody)
        })
        res.end(userBody)
        break

      case '/user/guilds':
        if (req.method !== 'GET') {
          await sendMethodNotAllowed()
          return
        }

        const userGuildsConnector = lokiConnector.addCollection('userGuilds')

        if (userGuildsConnector.findOne({ user: userData.id }).meta.created >= Date.now() + 300000) {
          userGuildsConnector.remove(userGuildsConnector.findObject({ user: userData.id }))
        }

        if (lokiConnector.addCollection('userGuilds').findOne({ user: userData.id }) === null) {
          const oauthInfo = await fetch('https://discord.com/api/v8/oauth2/@me', {
            headers: {
              authorization: userData.access_token
            }
          }).catch(e => console.error(e))

          if (typeof oauthInfo === 'undefined' || !oauthInfo.ok) {
            await sendInternalServerError()
            return
          }

          const oauthBody = await oauthInfo.json()
          const scopes: string[] = oauthBody.scopes

          if (!scopes.includes('guilds')) {
            res.writeHead(400, {
              'content-length': JSON.stringify({ error: 'Guilds scope not provided' })
            })
            res.end(JSON.stringify({ error: 'Guilds scope not provided' }))
            return
          }

          const userApiGuildsBody = await fetch('https://discord.com/api/v8/users/@me/guilds', {
            headers: {
              authorization: userData.access_token
            }
          }).catch(e => console.error(e))

          if (typeof userApiGuildsBody === 'undefined') {
            await sendInternalServerError()
            return
          }

          if (userApiGuildsBody.status === 401) {
            await deleteUserData(JSON.stringify({ error: 'Credentials expired' }), 400)
            return
          } else if (!userApiGuildsBody.ok) {
            await sendInternalServerError()
            return
          }

          const userApiGuilds = await userApiGuildsBody.json()
          const manageableGuilds: Array<{ icon: string, id: string, name: string, permissions: string }> = []
          const mutualGuilds: Array<{ icon: string, id: string, name: string, permissions: string }> = []
          userApiGuilds.forEach((guild: { icon: string, id: string, name: string, permissions: string }) => {
            if ((parseInt(guild.permissions) & 0x20) === 32) manageableGuilds.push(guild)
          })

          manageableGuilds.forEach(async guild => {
            if (typeof shardingManager.totalShards !== 'number') return
            const shardNum = Number(BigInt(guild) >> 22n) % shardingManager.totalShards
            const inGuild = await shardingManager.broadcastEval(`this.guilds.cache.find(g => g.id === ${guild.id})`, shardNum)
            if (typeof inGuild !== 'undefined') mutualGuilds.push(guild)
          })
        }

        break

      case '/auth/negotiate':
        if (req.method !== 'GET') {
          await sendMethodNotAllowed()
          return
        }
        const code = requestUrl.searchParams.get('code')
        if (code === null) {
          await sendNotAuthorized()
          return
        }
        if (typeof process.env.DISCORDOAUTHSECRET === 'undefined') {
          await sendInternalServerError()
          return
        }
        if (typeof process.env.DISCORDOAUTHCLIENTID === 'undefined') {
          await sendInternalServerError()
          return
        }
        if (typeof process.env.WEBHOSTNAME === 'undefined') {
          await sendInternalServerError()
          return
        }
        const tokenRequestBody = new URLSearchParams(
          {
            client_id: process.env.DISCORDOAUTHCLIENTID,
            client_secret: process.env.DISCORDOAUTHSECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.WEBHOSTNAME}/auth/negotiate`,
            scope: 'identify guilds'
          }
        )
        const oauthTokenResponse = await fetch('https://discord.com/api/v8/oauth2/token', {
          body: tokenRequestBody
        }).catch(e => console.error(e))
        if (typeof oauthTokenResponse === 'undefined' || !oauthTokenResponse.ok) {
          await sendInternalServerError()
          return
        }
        const tokenData = await oauthTokenResponse.json()
        const oauthUserRes = await fetch('https://discord.com/api/v8/users/@me', {
          headers: {
            authorization: tokenData.access_token
          }
        }).catch(e => console.error(e))
        if (typeof oauthUserRes === 'undefined' || !oauthUserRes.ok) {
          await sendInternalServerError()
          return
        }
        const currentOauthUser = await oauthUserRes.json()
        if (credStore.findOne({ id: currentOauthUser.id }) === null) {
          credStore.insertOne(
            {
              id: currentOauthUser.id,
              username: currentOauthUser.username,
              discriminator: currentOauthUser.discriminator,
              avatar: currentOauthUser,
              access_token: tokenData.access_token,
              token: randomBytes(128).toString('hex').toUpperCase()
            }
          )
        }

      default:
        await sendNotFound()
        break
    }
  }

  if (isNaN(port)) throw Error('INVALID PORT GIVEN!')
  const server = http.createServer(routeListener)
  server.listen(port)
}
