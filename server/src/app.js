const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const { ENV, HOST, PORT, CLIENT_BUILD_PATH, CLIENT_INDEX_PATH, PHOTO_FOLDER_PATH, PHOTO_URL_PATH } = require('./config')
const { getAllPhotos, addPhoto, updatePhoto, deletePhoto } = require('./data')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(PHOTO_URL_PATH, express.static(PHOTO_FOLDER_PATH))
app.use(express.static(CLIENT_BUILD_PATH))

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  return res.status(err.status || 500).render('500')
})

const transformDbRecordToApiRecord = photo => {
  return {
    hash: photo.hash,
    url: `photos/${photo.hash}.${photo.extension}`,
    width: photo.width,
    height: photo.height,
    topics: photo.topics || [],
    tags: photo.tags || []
  }
}

app.get('/api/photos', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  const photos = getAllPhotos().map(transformDbRecordToApiRecord)

  const allTopics = photos.map(p => p.topics).flat()
  const topics = [...new Set(allTopics)].sort((a, b) => a.localeCompare(b))

  const allTags = photos.map(p => p.tags).flat()
  const tags = [...new Set(allTags)].sort((a, b) => a.localeCompare(b))

  res.json({ topics, tags, photos })
})

app.post('/api/photos', async (req, res) => {
  try {
    const { src, tags, topics } = req.body.photo  
    const result = await addPhoto(src, tags, topics)
    const photo = transformDbRecordToApiRecord(result)
    res.send({ photo })
  } catch (e) {
    res.status(500).send({ error: e.message })
  }
})

app.put('/api/photos', (req, res) => {
  const { hash, tags, topics } = req.body.photo
  updatePhoto(hash, tags, topics)
  res.send({})
})

app.delete('/api/photos/:photoHash', (req, res) => {
  const hash = req.params.photoHash
  deletePhoto(hash)
  res.send({})
})

// Handle all remaining API requests
app.all('/api/*', (req, res) => {
  const path = req.originalUrl
  const method = req.method
  res.json({ message: `Cannot ${method} ${path}` })
})

// All remaining requests are from HTML5 push state routing
app.get('*', function(_request, response) {
  if (fs.existsSync(CLIENT_INDEX_PATH)) {
    response.sendFile(CLIENT_INDEX_PATH)
  } else {
    response.send('Fatal Error: Either run webpack development server or execute the build command.')
  }
})

app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT} in ${ENV} mode.`))

module.exports = app
