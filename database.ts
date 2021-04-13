import { Client } from 'pg'

const db = new Client({
  host: process.env.DBH,
  password: process.env.DBPASS,
  user: process.env.DBU,
  database: process.env.DBN,
  port: 5432
})

export default db
