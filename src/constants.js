import window from 'global/window';

const DEFAULTS = {
  embedId: 'default',
  embedType: 'in-page',
  playerId: 'default',
  Promise: window.Promise,
  refNodeInsert: 'append'
};

const DEFAULT_ASPECT_RATIO = '16:9';
const DEFAULT_IFRAME_HORIZONTAL_PLAYLIST = false;
const DEFAULT_MAX_WIDTH = '100%';

const EMBED_TAG_NAME_VIDEO = 'video';
const EMBED_TAG_NAME_VIDEOJS = 'video-js';

const EMBED_TYPE_IN_PAGE = 'in-page';
const EMBED_TYPE_IFRAME = 'iframe';

const REF_NODE_INSERT_APPEND = 'append';
const REF_NODE_INSERT_PREPEND = 'prepend';
const REF_NODE_INSERT_BEFORE = 'before';
const REF_NODE_INSERT_AFTER = 'after';
const REF_NODE_INSERT_REPLACE = 'replace';

const JSON_ALLOWED_ATTRS = ['catalogSearch', 'catalogSequence'];

export {
  DEFAULTS,
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IFRAME_HORIZONTAL_PLAYLIST,
  DEFAULT_MAX_WIDTH,
  EMBED_TAG_NAME_VIDEO,
  EMBED_TAG_NAME_VIDEOJS,
  EMBED_TYPE_IN_PAGE,
  EMBED_TYPE_IFRAME,
  REF_NODE_INSERT_APPEND,
  REF_NODE_INSERT_PREPEND,
  REF_NODE_INSERT_BEFORE,
  REF_NODE_INSERT_AFTER,
  REF_NODE_INSERT_REPLACE,
  JSON_ALLOWED_ATTRS
};
