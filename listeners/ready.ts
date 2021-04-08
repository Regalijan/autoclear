import { Listener } from 'discord-akairo'
export default class ReadyListener extends Listener {
  public constructor () {
    super('ready', {
      emitter: 'client',
      event: 'ready'
    })
  }

  public async exec (): Promise<void> {
    console.log('Autoclear ready!')
  }
}
