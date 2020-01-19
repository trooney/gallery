const path = require('path')

if (![undefined, 'development', 'production', 'test'].includes(process.env.NODE_ENV)) {
  console.error(`Fatal Error: NODE_ENV '${process.env.NODE_ENV}' not supported. Leave blank, or use development, production, demo, or test.`)
  process.exit(1)
}

const DEFAULT_PORT = 5000
const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_SECRET = 'mysecretthing'

const ENV = process.env.NODE_ENV || 'development'
const HOST = process.env.HOST || DEFAULT_HOST
const PORT = process.env.PORT || DEFAULT_PORT
const SECRET = process.env.SECRET || DEFAULT_SECRET

const ROOT = __dirname
const DB_PATH = path.join(ROOT, `/../data/${ENV}/db.json`)
const BACKUP_FOLDER_PATH = path.join(ROOT, `/../tmp`)
const PHOTO_FOLDER_PATH = path.join(ROOT, `/../data/${ENV}/photos`)
const PHOTO_URL_PATH = '/photos'

const CLIENT_BUILD_PATH = path.join(ROOT, '/../public')
const CLIENT_INDEX_PATH = path.join(CLIENT_BUILD_PATH, 'index.html')

const MAX_FILE_SIZE = 5242880
const VALID_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif'
]

module.exports = {
  ENV,
  HOST,
  PORT,
  SECRET,
  DB_PATH,
  BACKUP_FOLDER_PATH,
  PHOTO_FOLDER_PATH,
  PHOTO_URL_PATH,
  CLIENT_BUILD_PATH,
  CLIENT_INDEX_PATH,
  MAX_FILE_SIZE,
  VALID_MIME_TYPES
}