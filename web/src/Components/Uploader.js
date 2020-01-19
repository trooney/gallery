import React, { useContext, useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import axios from 'axios'
import AppStateContext from './appStateContext'
import { Icon } from './Icon'
import { splitAndCompact } from './utils'

const UploaderForm = ({ clickedItem, clearClickedItem }) => {
  const { appDispatch } = useContext(AppStateContext)

  const [urls, setUrls] = useState('')
  const [topics, setTopics] = useState('')
  const [tags, setTags] = useState('')
  const [requestCounter, setRequestCounter] = useState(0)

  const pushUrl = url => {
    const newUrls = splitAndCompact(urls, '\n')
      .concat(url)
      .join('\n')
    setUrls(newUrls)
  }

  const incrementRequestCounter = () => {
    setRequestCounter(requestCounter + 1)
  }

  const decrementRequestCounter = () => {
    setRequestCounter(requestCounter - 1)
  }

  const handleUrlsChange = e => {
    setUrls(e.target.value)
  }

  const handleTopicsChange = e => {
    setTopics(e.target.value)
  }

  const handleTagsChange = e => {
    setTags(e.target.value)
  }

  const handleDrop = e => {
    e.preventDefault()

    for (var i = 0; i < e.dataTransfer.items.length; i++) {
      const item = e.dataTransfer.items[i]

      if (item.kind === 'string' && item.type === 'text/uri-list') {
        item.getAsString(str => {
          pushUrl(str)
        })
      }
    }
  }

  useEffect(() => {
    function updateItem({ name, item }) {
      if (name === 'topic') setTopics(splitAndCompact(`${topics}, ${item}`, ',').join(', '))
      if (name === 'tag') setTags(splitAndCompact(`${tags}, ${item}`, ',').join(', '))
    }

    if (clickedItem) {
      updateItem(clickedItem)
      clearClickedItem()
    }
  }, [clickedItem, clearClickedItem, tags, topics])

  // HTML5 Drag API requires multiple events to be present
  // even when they're not actually used.
  const handleNothing = e => {
    e.preventDefault()
  }

  const handleSaveClick = e => {
    const allUrls = splitAndCompact(urls, '\n')
    const allTopics = splitAndCompact(topics, ',')
    const allTags = splitAndCompact(tags, ',')

    const requestData = allUrls.map(url => {
      return {
        photo: {
          src: url,
          topics: allTopics,
          tags: allTags
        }
      }
    })

    Promise.all(
      requestData.map(data => {
        incrementRequestCounter()

        return axios.post('/api/photos', data).then(res => {
          appDispatch({ type: 'addPhoto', payload: res.data.photo })
        }).finally(() => {
          decrementRequestCounter()
        })
      })
    )
      .then(res => {
        setUrls('')
      })
      .catch(err => {
        alert("Oops! We've hit an error. Probably a bad file...\nBut this is as much error handling as we're going to do :(")
      })
  }

  return (
    <React.Fragment>
      <Form.Group>
        <Form.Label>URLs (1 per line)</Form.Label>
        <Form.Control
          as="textarea"
          value={urls}
          onChange={handleUrlsChange}
          onDrop={handleDrop}
          onDragOver={handleNothing}
          onDragEnter={handleNothing}
          onDrag={handleNothing}
          rows="6"
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Topics (comma separated)</Form.Label>
        <Form.Control type="search" value={topics} onChange={handleTopicsChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Tags (comma separated)</Form.Label>
        <Form.Control type="search" value={tags} onChange={handleTagsChange} />
      </Form.Group>
      <Form.Group>
        <Button type="save" value="save" variant="secondary" onClick={handleSaveClick}>
          Save{' '}
          {requestCounter > 0 && (
            <span>
              <Icon name="fas fa-spinner fa-spin" />
            </span>
          )}
        </Button>
      </Form.Group>
    </React.Fragment>
  )
}

const UploaderHeader = () => {
  const { appDispatch } = useContext(AppStateContext)

  const handleCloseUploaderClick = () => {
    appDispatch({ type: 'openGallery' })
  }
  return (
    <header className="App-Header">
      <div>
        <strong>Uploader</strong>
      </div>
      <div className="ml-auto">
        <Icon name="fas fa-times fa-fw" onClick={handleCloseUploaderClick} text="Close" />
      </div>
    </header>
  )
}

const Uploader = ({ fetchData, topics, tags }) => {
  const [clickedItem, setClickedItem] = useState(null)

  const handleItemClick = (name, item) => {
    setClickedItem({ name, item })
  }

  const clearClickedItem = () => {
    setClickedItem(null)
  }

  return (
    <div className="App-Container">
      <div className="App-Header-Container">
        <UploaderHeader />
      </div>
      <div className="App-Body-Container">
        <div className="container-fluid px-0">
          <div className="row">
            <div className="pt-2 col-6">
              <UploaderForm fetchData={fetchData} clickedItem={clickedItem} clearClickedItem={clearClickedItem} />
            </div>
            <div className="col-2 offset-1 pt-2">
              <h5>Topics</h5>
              <ul className="list-unstyled list-clickable-items">
                {topics.length === 0 && <li>Lets get started!</li>}
                {topics.sort().map(m => (
                  <li key={m}>
                    <span onClick={e => handleItemClick('topic', m)}>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-2 pt-2">
              <h5>Tags</h5>
              <ul className="list-unstyled list-clickable-items">
                {tags.length === 0 && <li>Lets get started!</li>}
                {tags.sort().map(t => (
                  <li key={t}>
                    <span onClick={e => handleItemClick('tag', t)}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Uploader
