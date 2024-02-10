import {shuffle as d3Shuffle} from 'd3-array';

export const splitAndCompact = (str, sep) => {
  return str
    .split(sep)
    .map(str => str.trim())
    .filter(str => str.length > 0);
};

export const unique = (...items) => {
  return [...new Set(items.flat())];
};

export const shuffle = d3Shuffle;

export const sortPhotos = photos => {
  const sortKey = photo => {
    let parts = [];

    if (photo.tags.length > 0) {
      parts = parts.concat(1);
      parts = parts.concat(photo.tags);
    }

    if (photo.topics.length > 0) {
      parts = parts.concat(photo.topics);
    }

    return parts.join('');
  };

  return photos.sort((a, b) => {
    let left = sortKey(a);
    let right = sortKey(b);

    return left.localeCompare(right);
  });
};
