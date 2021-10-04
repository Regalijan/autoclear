import { Client } from 'pg'

const db = new Client({
  host: process.env.DBH ?? 'postgres',
  password: process.env.DBPASS,
  user: process.env.DBU ?? 'postgres',
  database: process.env.DBN ?? 'autoclear',
  port: 5432
})

export default db
