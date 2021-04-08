import Loki from 'lokijs'
export const lokiConnector = new Loki('loki.db', {
  autoload: true,
  autosave: true
})
