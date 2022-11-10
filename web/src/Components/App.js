import React, { useReducer, useEffect, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import axios from 'axios'
import Fuse from 'fuse.js'
import AppStateContext from './appStateContext'
import Uploader from './Uploader'
import Gallery from './Gallery'
import Viewer from './Viewer'
import { unique, shuffle, sortPhotos } from './utils'

const ROUTE_GALLERY = 'gallery'
const ROUTE_VIEWER = 'viewer'
const ROUTE_UPLOADER = 'uploader'

const fuse = new Fuse([], {
  threshold: 0.3,
  keys: ['tags', 'topics']
})

const defaultAppState = {
  route: null,
  photos: [],
  topics: [],
  tags: [],
  photoId: null,
  query: '',
  shuffleIndex: 0
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return { ...state, ...action.payload }
    case 'setRoute':
      return { ...state, route: action.payload }
    case 'setTopics':
      return { ...state, topics: action.payload }
    case 'setTags':
      return { ...state, tags: action.payload }
    case 'setPhotoId':
      return { ...state, photoId: action.payload }
    case 'setQuery':
      return { ...state, query: action.payload }
    case 'openUploader':
      return { ...state, route: ROUTE_UPLOADER, photoId: null }
    case 'openGallery':
      return { ...state, route: ROUTE_GALLERY, photoId: null }
    case 'openViewer':
      return { ...state, route: ROUTE_VIEWER, photoId: action.payload }
    case 'addPhoto':
      const photo = action.payload
      const topics = unique(...state.topics, photo.topics)
      const tags = unique(...state.tags, photo.tags)

      return { ...state, topics, tags, photos: [...state.photos, photo] }
    case 'removePhotoByHash':
      const index = [...state.photos].findIndex(p => p.hash !== action.payload)
      const photoId = index % (state.photos.length - 1)

      const photos = [...state.photos].filter(p => p.hash !== action.payload)

      const route = photos.length > 0 ? state.route : ROUTE_GALLERY

      return { ...state, photos, photoId, route }
    case 'updatePhoto':
      const otherPhotos = [...state.photos].filter(p => p.hash !== action.payload.hash)
      const updatingPhoto = state.photos.find(p => p.hash === action.payload.hash)

      if (!updatingPhoto) {
        throw new Error(`Photo ${action.payload.hash} not found`)
      }

      const updatedPhoto = Object.assign({}, updatingPhoto, action.payload)

      return { ...state, photos: [...otherPhotos, updatedPhoto] }
    case 'reshuffle':
      return { ...state, shuffleIndex: state.shuffleIndex + 1 }
    case 'unshuffle':
      return { ...state, shuffleIndex: 0 }
    default:
      throw new Error(`The key '${action.type}' is not a valid action type`)
  }
}

function App() {
  const [appState, appDispatch] = useReducer(appReducer, defaultAppState)

  const fetchData = useCallback(async () => {
    const res = await axios.get('/api/photos')
    appDispatch({ type: 'initialize', payload: res.data })
  }, [])

  const matchingPhotos = useMemo(() => {
    return appState.query ? fuse.search(appState.query) : appState.photos
  }, [appState.photos, appState.query])

  const sortedPhotos = useMemo(() => {
    if (appState.shuffleIndex > 0) {
      return shuffle(matchingPhotos)
    }

    return sortPhotos(matchingPhotos)
  }, [appState.shuffleIndex, matchingPhotos])

  const nextPhoto = useCallback(() => {
    const nextIdx = parseInt(appState.photoId) + 1
    const photoCount = Object.values(matchingPhotos).length
    const idx = nextIdx >= photoCount ? 0 : nextIdx

    appDispatch({ type: 'setPhotoId', payload: idx })
  }, [matchingPhotos, appState.photoId])

  const prevPhoto = useCallback(() => {
    const nextIdx = parseInt(appState.photoId) - 1
    const photoCount = Object.values(matchingPhotos).length

    const idx = nextIdx < 0 ? photoCount - 1 : nextIdx
    appDispatch({ type: 'setPhotoId', payload: idx })
  }, [matchingPhotos, appState.photoId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fuse.setCollection(appState.photos)
  }, [appState.photos])

  useEffect(() => {
    const route = window.location.pathname
      .split('/')
      .filter(part => part)
      .pop()

    switch (route) {
      case ROUTE_UPLOADER:
        appDispatch({ type: 'setRoute', payload: ROUTE_UPLOADER })
        break
      default:
        appDispatch({ type: 'setRoute', payload: ROUTE_GALLERY })
    }
  }, [])

  useEffect(() => {
    const path = ['', appState.route].join('/')
    window.history.pushState({}, '', path)
  }, [appState.route])

  useEffect(() => {
    const onKeyDown = e => {
      if (e.target.tagName !== 'BODY') {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
          nextPhoto()
          break
        case 'ArrowLeft':
          prevPhoto()
          break
        case 'Escape':
          appDispatch({ type: 'openGallery' })
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [nextPhoto, prevPhoto])

  useEffect(() => {
    const onDragEnter = e => {
      if (appState.route === ROUTE_GALLERY && !e.fromElement) {
        appDispatch({ type: 'setRoute', payload: ROUTE_UPLOADER })
      }
    }

    document.addEventListener('dragenter', onDragEnter)

    return () => {
      document.removeEventListener('dragenter', onDragEnter)
    }
  }, [appState.route])

  const commonClasses = classNames('h-100', 'w-100')
  const galleryClasses = classNames(commonClasses, { 'd-none': appState.route !== ROUTE_GALLERY })
  const viewerClasses = classNames(commonClasses, { 'd-none': appState.route !== ROUTE_VIEWER })
  const uploaderClasses = classNames(commonClasses, { 'd-none': appState.route !== ROUTE_UPLOADER })

  return (
    <AppStateContext.Provider value={{ appState, appDispatch }}>
      <div className={galleryClasses}>
        <Gallery photos={sortedPhotos} />
      </div>
      <div className={viewerClasses}>
        <Viewer nextPhoto={nextPhoto} prevPhoto={prevPhoto} photo={sortedPhotos[appState.photoId]} />
      </div>
      <div className={uploaderClasses}>
        <Uploader topics={appState.topics} tags={appState.tags} />
      </div>
    </AppStateContext.Provider>
  )
}

export default App
