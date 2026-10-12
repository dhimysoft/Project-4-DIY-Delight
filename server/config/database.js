import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load the server/.env file relative to this module so it works when the app is
// started from the repo root (for example: node server/config/reset.js)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const rawHost = process.env.PGHOST || '127.0.0.1'
const rawUser = process.env.PGUSER || process.env.USER || 'postgres'
const rawDatabase = process.env.PGDATABASE || rawUser
const rawPort = Number(process.env.PGPORT || 5432)

// Render's Postgres requires SSL; a local Postgres usually does not.
// When the host is local or a Unix socket, leave SSL off.
const isLocal =
  !process.env.PGHOST ||
  ['localhost', '127.0.0.1', '::1', '/var/run/postgresql'].includes(rawHost) ||
  rawHost.startsWith('/')

const config = {
  user: rawUser,
  password: process.env.PGPASSWORD || undefined,
  host: rawHost,
  port: rawPort,
  database: rawDatabase,
  ssl: isLocal ? false : {
    rejectUnauthorized: false
  }
}

export const pool = new pg.Pool(config)
