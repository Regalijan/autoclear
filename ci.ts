import { readdirSync } from 'fs'
import { join } from 'path'
readdirSync(join(__dirname, 'dist'))
