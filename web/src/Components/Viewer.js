import React, { useContext, useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import classNames from 'classnames'
import axios from 'axios'
import AppStateContext from './appStateContext'
import { Icon } from './Icon'
import { splitAndCompact } from './utils'

const useDrawer = () => {
  const [isVisible, setIsVisible] = useState(false)

  const openDrawer = () => setIsVisible(true)
  const closeDrawer = () => setIsVisible(false)
  const toggleDrawer = () => setIsVisible(!isVisible)

  return { isVisible, openDrawer, closeDrawer, toggleDrawer }
}

const usePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlayer = () => setIsPlaying(!isPlaying)
  const stopPlayer = () => setIsPlaying(false)

  return { isPlaying, togglePlayer, stopPlayer }
}

const ImageViewer = ({ photo, prevPhoto, nextPhoto }) => {
  const { url, hash, tags, topics } = photo

  const [isZoomed, setIsZoomed] = useState(false)

  useEffect(() => {
    setIsZoomed(false)
  }, [photo])

  const handleClick = e => {
    e.stopPropagation()
    setIsZoomed(!isZoomed)
  }

  const classes = classNames({
    'mh-100': !isZoomed,
    'mw-100': !isZoomed
  })

  return (
    <div className={'p-relative h-100 d-flex align-items-start justify-content-center'}>
      <div className="Viewer-Mover Viewer-Mover-Left" onClick={prevPhoto}>
        <i className="fa fa-chevron-left fa-2x" />
      </div>
      <img
        src={url}
        data-hash={hash}
        data-tags={tags.join(' ')}
        data-topics={topics.join(' ')}
        onClick={handleClick}
        className={classes}
        alt=""
      />
      <div className="Viewer-Mover Viewer-Mover-Right" onClick={nextPhoto}>
        <i className="fa fa-chevron-right fa-2x" />
      </div>
    </div>
  )
}

const ImageForm = ({ photo }) => {
  const { appDispatch } = useContext(AppStateContext)

  const [topicInput, setTopicInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (photo) {
      setTopicInput(photo.topics.join(', '))
      setTagInput(photo.tags.join(', '))
    }
  }, [photo])

  const handleSubmit = e => {
    e.preventDefault()

    const payload = {
      photo: {
        hash: photo.hash,
        topics: splitAndCompact(topicInput, ','),
        tags: splitAndCompact(tagInput, ',')
      }
    }

    axios.put('/api/photos', payload).then(res => {
      appDispatch({ type: 'updatePhoto', payload: payload.photo })
    })
  }

  const handleDelete = e => {
    e.preventDefault()

    axios.delete(`/api/photos/${photo.hash}`).then(() => {
      appDispatch({ type: 'removePhotoByHash', payload: photo.hash })
    })
  }

  return (
    <Form className="ml-2 mr-2">
      <Form.Group>
        <Form.Control size="sm" type="text" placeholder="Hash" value={photo.hash} onChange={e => () => {}} />
      </Form.Group>
      <Form.Group>
        <Form.Control
          size="sm"
          type="text"
          placeholder="Topics"
          value={topicInput}
          onChange={e => setTopicInput(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Form.Control
          size="sm"
          type="text"
          placeholder="Tags"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Button size="sm" variant="dark" type="submit" onClick={handleSubmit}>
          Save
        </Button>
        <Button size="sm" variant="link" type="submit" onClick={handleDelete}>
          Delete
        </Button>
      </Form.Group>
    </Form>
  )
}

const ViewerHeader = ({ toggleDrawer, togglePlayer, isPlaying, close }) => {
  return (
    <header className="App-Header">
      <div>
        <Icon name="fas fa-info fa-fw" onClick={toggleDrawer} text="Details" />
        {isPlaying ? (
          <Icon name="fas fa-stop fa-fw" onClick={togglePlayer} text="Stop Autoplay" />
        ) : (
          <Icon name="fas fa-play fa-fw" onClick={togglePlayer} text="Start Autoplay" />
        )}
      </div>
      <div className="ml-auto">
        <Icon name="fas fa-times fa-fw" onClick={close} text="Close" />
      </div>
    </header>
  )
}

const Viewer = ({ photo, nextPhoto, prevPhoto }) => {
  const { appDispatch } = useContext(AppStateContext)

  const { isVisible, toggleDrawer, closeDrawer } = useDrawer()
  const { isPlaying, togglePlayer, stopPlayer } = usePlayer()

  const closeViewer = () => {
    closeDrawer()
    stopPlayer()
    appDispatch({ type: 'openGallery' })
  }

  useEffect(() => {
    let interval = null

    if (isPlaying) {
      interval = setInterval(() => {
        nextPhoto()
      }, 15000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying, nextPhoto])

  if (!photo) {
    return <React.Fragment />
  }

  const drawerClasses = classNames({
    'h-100': true,
    'col-3': isVisible,
    'd-none': !isVisible
  })

  return (
    <div className="App-Container">
      <div className="App-Header-Container">
        <ViewerHeader toggleDrawer={toggleDrawer} togglePlayer={togglePlayer} isPlaying={isPlaying} close={closeViewer} />
      </div>
      <div className="App-Body-Container">
        <div className={drawerClasses}>
          <ImageForm photo={photo} />
        </div>
        <div className="col h-100">
          <ImageViewer photo={photo} prevPhoto={prevPhoto} nextPhoto={nextPhoto} />
        </div>
      </div>
    </div>
  )
}

export default Viewer
