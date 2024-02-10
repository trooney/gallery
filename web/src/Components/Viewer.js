import React, {useContext, useState, useEffect, useCallback} from 'react';
import {Form, Button} from 'react-bootstrap';
import classNames from 'classnames';
import axios from 'axios';
import AppStateContext from './appStateContext';
import {Icon} from './Icon';
import {splitAndCompact} from './utils';
import useDimensions from './useDimensions';

const SCALE_FIT = 'fit';
const SCALE_HALF_FILL = 'half-fill';
const SCALE_FILL = 'fill';
const SCALE_DOUBLE_FILL = 'double-fill';

const SCALES = [SCALE_FIT, SCALE_HALF_FILL, SCALE_FILL, SCALE_DOUBLE_FILL];

const useDrawer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const openDrawer = () => setIsVisible(true);
  const closeDrawer = () => setIsVisible(false);
  const toggleDrawer = () => setIsVisible(!isVisible);

  return {isVisible, openDrawer, closeDrawer, toggleDrawer};
};

const usePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayer = () => setIsPlaying(!isPlaying);
  const stopPlayer = () => setIsPlaying(false);

  return {isPlaying, togglePlayer, stopPlayer};
};

const useScaler = photo => {
  const [scale, setScale] = useState(SCALE_FIT);

  // const resetScale = () => setScale(SCALE_FIT);

  const resetScale = useCallback(() => {
    if (photo) {
      setScale(SCALE_FIT);
    }
  }, [photo]);

  // const nextScale = () => {
  //   const newScale = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length];
  //   setScale(newScale);
  // };

  const nextScale = useCallback(() => {
    const newScale = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length];
    setScale(newScale);
  }, [scale]);

  return {currentScale: scale, resetScale, nextScale};
};

const ImageViewer = ({photo, prevPhoto, nextPhoto, currentScale, resetScale, nextScale}) => {
  const [ref, {width: offsetWidth, height: offsetHeight}] = useDimensions();

  const {width, height, url, hash, tags, topics} = photo;

  const scale = currentScale;

  const handleClick = e => {
    e.stopPropagation();
    console.log('ImageViewer.nextScale');
    nextScale();
  };

  const fittedImage = () => {
    let photoAspect = height / width;
    let newWidth = offsetWidth;
    let newHeight = photoAspect * offsetWidth;

    // if overly wide.
    if (photoAspect < 1) {
      newWidth = offsetHeight * (width / height);
      newHeight = offsetHeight;

      if (newWidth > offsetWidth) {
        newWidth = offsetWidth;
        newHeight = offsetWidth * (height / width);
      }
    }

    // if (still) overly tall
    if (photoAspect >= 1) {
      newWidth = (width / height) * offsetHeight;
      newHeight = offsetHeight;
    }

    return {width: newWidth, height: newHeight};
  };

  const basicImage = fittedImage();

  const filledImage = () => {
    let photoAspect = basicImage.height / basicImage.width;
    let newWidth = offsetWidth;
    let newHeight = photoAspect * offsetWidth;

    if (photoAspect < 1) {
      newWidth = (width / height) * offsetHeight;
      newHeight = offsetHeight;
    } else {
      newWidth = offsetWidth;
      newHeight = (height / width) * offsetWidth;
    }

    return {width: newWidth, height: newHeight};
  };

  const normalizedImage = filledImage();

  const deplex = style => {
    return {
      position: 'absolute',
      top: `${style.top || 0}px`,
      left: `${style.left || 0}px`,
      width: `${style.width}px`,
      height: `${style.height}px`,
    };
  };

  const scalerStyles = {
    [SCALE_FIT]: function () {
      let top = (offsetHeight - basicImage.height) / 2;
      let left = (offsetWidth - basicImage.width) / 2;

      return deplex({...basicImage, top, left});
    },
    [SCALE_HALF_FILL]: function () {
      normalizedImage.height =
        (normalizedImage.height - basicImage.height) * 0.5 + basicImage.height;
      normalizedImage.width = (normalizedImage.width - basicImage.width) * 0.5 + basicImage.width;

      let top =
        normalizedImage.height < offsetHeight ? (offsetHeight - normalizedImage.height) / 2 : 0;
      let left = (offsetWidth - normalizedImage.width) / 2;

      return deplex({...normalizedImage, top, left});
    },
    [SCALE_FILL]: function () {
      let top =
        normalizedImage.height < offsetHeight ? (offsetHeight - normalizedImage.height) / 2 : 0;
      let left = (offsetWidth - normalizedImage.width) / 2;

      return deplex({...normalizedImage, top, left});
    },
    [SCALE_DOUBLE_FILL]: function () {
      normalizedImage.height = normalizedImage.height * 1.25;
      normalizedImage.width = normalizedImage.width * 1.25;

      let top =
        normalizedImage.height < offsetHeight ? (offsetHeight - normalizedImage.height) / 2 : 0;
      let left =
        normalizedImage.width < offsetWidth ? (offsetWidth - normalizedImage.width) / 2 : 0;

      return deplex({...normalizedImage, top, left});
    },
  };

  // const oa = offsetWidth * offsetHeight
  // const ia = basicImage.width * basicImage.height

  return (
    <div ref={ref} className={'w-100 h-100'}>
      <div className="Viewer-Mover Viewer-Mover-Left" onClick={prevPhoto}>
        <i className="fa fa-chevron-left fa-2x" />
      </div>
      <div className="Viewer-Image">
        <img
          src={url}
          data-hash={hash}
          data-tags={tags.join(' ')}
          data-topics={topics.join(' ')}
          onClick={handleClick}
          style={scalerStyles[scale]()}
          alt=""
        />
      </div>
      <div className="Viewer-Mover Viewer-Mover-Right" onClick={nextPhoto}>
        <i className="fa fa-chevron-right fa-2x" />
      </div>
      {/* <div className="Viewer-Sizer">
        <div>{scale}</div>
        <div>{Math.round(oa)}, {Math.round(ia)}, {Math.round(oa - ia)}</div>
        <div>{Math.round(Math.sqrt(oa))}, {Math.round(Math.sqrt(ia))}, {Math.round(Math.sqrt(oa) - Math.sqrt(ia))}</div>
      </div> */}
    </div>
  );
};

const ImageForm = ({photo}) => {
  const {appDispatch} = useContext(AppStateContext);

  const [topicInput, setTopicInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (photo) {
      setTopicInput(photo.topics.join(', '));
      setTagInput(photo.tags.join(', '));
    }
  }, [photo]);

  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      photo: {
        hash: photo.hash,
        topics: splitAndCompact(topicInput, ','),
        tags: splitAndCompact(tagInput, ','),
      },
    };

    axios.put('/api/photos', payload).then(res => {
      appDispatch({type: 'updatePhoto', payload: payload.photo});
    });
  };

  const handleDelete = e => {
    e.preventDefault();

    axios.delete(`/api/photos/${photo.hash}`).then(() => {
      appDispatch({type: 'removePhotoByHash', payload: photo.hash});
    });
  };

  return (
    <Form className="ml-2 mr-2">
      <Form.Group>
        <Form.Control
          size="sm"
          type="text"
          placeholder="Hash"
          value={photo.hash}
          onChange={e => () => {}}
        />
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
  );
};

const ViewerHeader = ({toggleDrawer, togglePlayer, isPlaying, close}) => {
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
  );
};

const Viewer = ({photo, nextPhoto, prevPhoto}) => {
  const {appDispatch} = useContext(AppStateContext);

  const {isVisible, toggleDrawer, closeDrawer} = useDrawer();
  const {isPlaying, togglePlayer, stopPlayer} = usePlayer();
  const {currentScale, resetScale, nextScale} = useScaler(photo);

  const closeViewer = () => {
    closeDrawer();
    stopPlayer();
    appDispatch({type: 'openGallery'});
  };

  useEffect(() => {
    let interval = null;

    if (isPlaying) {
      interval = setInterval(() => {
        nextPhoto();
      }, 25000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, nextPhoto]);

  useEffect(() => {
    console.log('ImageViewer.resetScale');
    resetScale();
  }, [resetScale]);

  if (!photo) {
    return <React.Fragment />;
  }

  const drawerClasses = classNames({
    'h-100': true,
    'col-3': isVisible,
    'd-none': !isVisible,
  });

  return (
    <div className="App-Container">
      <div className="App-Header-Container">
        <ViewerHeader
          toggleDrawer={toggleDrawer}
          togglePlayer={togglePlayer}
          isPlaying={isPlaying}
          close={closeViewer}
        />
      </div>
      <div className="App-Body-Container">
        <div className={drawerClasses}>
          <ImageForm photo={photo} />
        </div>
        <div className="col h-100">
          <ImageViewer
            photo={photo}
            prevPhoto={prevPhoto}
            nextPhoto={nextPhoto}
            currentScale={currentScale}
            resetScale={resetScale}
            nextScale={nextScale}
          />
        </div>
      </div>
    </div>
  );
};

export default Viewer;
