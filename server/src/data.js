const fs = require('fs')
const path = require('path')
const stream = require('stream')
const crypto = require('crypto')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const FileType = require('file-type')
const sizeOf = require('image-size')
const got = require('got')
const { promisify } = require('util')
const temp = require('temp').track()

const { ENV, SECRET, DB_PATH, BACKUP_FOLDER_PATH, PHOTO_FOLDER_PATH, PHOTO_URL_PATH, MAX_FILE_SIZE, VALID_MIME_TYPES } = require('./config')

// Helper
const pipeline = promisify(stream.pipeline)

// Setup JSON-based DB
const adapter = new FileSync(DB_PATH)
const db = low(adapter)

// File might not exist, so populate default values
db.defaults({ photos: [] }).write()

// Functions
const getPhotoHash = url => {
  return crypto
    .createHmac('sha256', SECRET)
    .update(url)
    .digest('hex')
}

const getFetchDataFromSrc = src => {
  const pathname = new URL(src).pathname
  const { ext } = path.parse(pathname)

  const hash = getPhotoHash(src)
  const dest = `${PHOTO_FOLDER_PATH}/${hash}${ext || '.jpg'}`
  const url = `${PHOTO_URL_PATH}/${hash}${ext || '.jpg'}`

  return { src, dest, hash, url }
}

const writeDbBackup = photos => {
  const getTimeByFiveMinutes = (minutes = 5, d = new Date()) => {
    const ms = 1000 * 60 * minutes // convert minutes to ms
    const roundedDate = new Date(Math.round(d.getTime() / ms) * ms)

    return roundedDate.getTime()
  }

  const timestamp = getTimeByFiveMinutes()

  fs.writeFileSync(`${BACKUP_FOLDER_PATH}/db.${ENV}.${timestamp}.json`, JSON.stringify(photos, null, 2))
}

const downloadImage = async url => {
  const tempStream = temp.createWriteStream()

  try {
    await pipeline(got.stream(url), tempStream)
  } catch (e) {
    throw new Error('That looks like a bad URL')
  }

  const fileType = await FileType.fromFile(tempStream.path)
  if (!fileType) {
    throw new Error("We cannot determine the type of file you've sent")
  }

  if (!VALID_MIME_TYPES.includes(fileType.mime)) {
    throw new Error('Looks like the file type is not supported')
  }

  const fileStats = fs.statSync(tempStream.path)

  if (fileStats.size > MAX_FILE_SIZE) {
    throw new Error('File is too large')
  }

  let sizeData = null

  try {
    sizeData = sizeOf(tempStream.path)
  } catch (error) {
    throw new Error('Cannot determine image dimensions')
  }

  const hash = getPhotoHash(url)
  const dest = path.join(PHOTO_FOLDER_PATH, `${hash}.${fileType.ext}`)

  fs.copyFileSync(tempStream.path, dest)

  return {
    extension: fileType.ext,
    width: sizeData.width,
    height: sizeData.height
  }
}

const addPhoto = async (src, tags, topics) => {
  const fetchData = getFetchDataFromSrc(src)

  const existingPhoto = db
    .get('photos')
    .find(p => p.hash === fetchData.hash)
    .value()

  if (existingPhoto) {
    return existingPhoto
  }

  let results = null

  if (ENV !== 'test') {
    console.log(`Downloading: \n  src: ${src}\n  hash: ${fetchData.hash}`)
  }
  
  results = await downloadImage(src, fetchData.dest)


  const { extension, width, height } = results

  const photo = {
    src: fetchData.src,
    hash: fetchData.hash,
    extension: extension,
    width: width,
    height: height,
    topics: topics || [],
    tags: tags || []
  }

  db.read()

  db.get('photos')
    .push(photo)
    .write()

  setTimeout(() => {
    db.read()

    const photos = db.getState().photos

    writeDbBackup(photos)
  }, 100)

  return photo
}

const updatePhoto = (hash, tags, topics) => {
  db.read()

  const photo = db
    .get('photos')
    .find(p => p.hash === hash)
    .value()

  if (photo) {
    db.get('photos')
      .find(p => p.hash === hash)
      .assign({ tags, topics })
      .write()
  }
}

const deletePhoto = hash => {
  db.read()

  const photo = db
    .get('photos')
    .find(p => p.hash === hash)
    .value()

  if (!photo) {
    return
  }

  const dest = getFetchDataFromSrc(photo.src).dest

  if (fs.existsSync(dest)) {
    fs.unlinkSync(dest)
  }

  db.get('photos')
    .remove({ hash })
    .write()
}

const getAllPhotos = () => {
  db.read()

  return db.getState().photos
}

module.exports = {
  getAllPhotos,
  addPhoto,
  updatePhoto,
  deletePhoto
}
