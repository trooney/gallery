import React, { useContext } from 'react'
import { default as ReactPhotoGallery } from 'react-photo-gallery'

import AppStateContext from './appStateContext'

const GalleryHeader = () => {
  const { appDispatch } = useContext(AppStateContext)

  const handleUploaderClick = () => {
    appDispatch({ type: 'openUploader' })
  }
  const handleQueryChange = e => {
    appDispatch({ type: 'setQuery', payload: e.target.value })
  }

  const handleReshuffleClick = () => {
    appDispatch({ type: 'reshuffle' })
  }

  const handleUnshuffleClick = () => {
    appDispatch({ type: 'unshuffle' })
  }

  return (
    <header className="App-Header">
      <div>
        <strong>Gallery</strong>
      </div>
      <form className="form-inline ml-2">
        <input
          onKeyUp={handleQueryChange}
          onChange={handleQueryChange}
          className="form-control form-control-sm mr-sm-2"
          type="search"
          placeholder="Search"
        />
        <i className="fas fa-level-down-alt fa-fw hover-text cursor-pointer" onClick={handleUnshuffleClick} />
        <i className="fas fa-random fa-fw hover-text cursor-pointer" onClick={handleReshuffleClick} />
      </form>
      <div className="ml-auto">
        <span onClick={handleUploaderClick} className="cursor-pointer">
          <i className="fas fa-cloud-upload-alt"></i>
        </span>
      </div>
    </header>
  )
}

const Gallery = ({ photos }) => {
  const { appDispatch } = useContext(AppStateContext)
  
  const galleryPhotos = photos.map(p => {
    return { src: p.url, width: p.width, height: p.height }
  })

  const handleReactPhotoGalleryClick = (e, { index }) => {
    appDispatch({ type: 'openViewer', payload: index })
  }

  return (
    <div className="App-Container">
      <div className="App-Header-Container">
        <GalleryHeader />
      </div>
      <div className="App-Body-Container">
        {galleryPhotos.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 text-center">
            <h3>Nothing to see here.</h3>
            <p>Click on the cloud icon and paste some links!</p>
          </div>
        ) : (
          <div className="w-100 h-100">
            <ReactPhotoGallery photos={galleryPhotos} onClick={handleReactPhotoGalleryClick} margin={6} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Gallery
