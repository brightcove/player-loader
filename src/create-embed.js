import document from 'global/document';
import urls from './urls';

import {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_IFRAME_HORIZONTAL_PLAYLIST,
  DEFAULT_MAX_WIDTH,
  EMBED_TAG_NAME_VIDEOJS,
  EMBED_TYPE_IFRAME,
  REF_NODE_INSERT_PREPEND,
  REF_NODE_INSERT_BEFORE,
  REF_NODE_INSERT_AFTER,
  REF_NODE_INSERT_REPLACE,
  JSON_ALLOWED_ATTRS
} from './constants';

/**
 * Is this value an element?
 *
 * @param  {Element} el
 *         A maybe element.
 *
 * @return {boolean}
 *         Whether or not the value is a element.
 */
const isEl = (el) => Boolean(el && el.nodeType === 1);

/**
 * Is this value an element with a parent node?
 *
 * @param  {Element} el
 *         A maybe element.
 *
 * @return {boolean}
 *         Whether or not the value is a element with a parent node.
 */
const isElInDom = (el) => Boolean(isEl(el) && el.parentNode);

/**
 * Creates an iframe embed code.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @return {Element}
 *         The DOM element that will ultimately be passed to the `bc()` function.
 */
const createIframeEmbed = (params) => {
  const el = document.createElement('iframe');

  el.setAttribute('allow', 'autoplay;encrypted-media;fullscreen');
  el.setAttribute('allowfullscreen', 'allowfullscreen');
  el.src = urls.getUrl(params);

  return el;
};

/**
 * Creates an in-page embed code.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @return {Element}
 *         The DOM element that will ultimately be passed to the `bc()` function.
 */
const createInPageEmbed = (params) => {
  const {embedOptions} = params;

  // We DO NOT include the data-account, data-player, or data-embed attributes
  // here because we will be manually initializing the player.
  const paramsToAttrs = {
    adConfigId: 'data-ad-config-id',
    applicationId: 'data-application-id',
    catalogSearch: 'data-catalog-search',
    catalogSequence: 'data-catalog-sequence',
    deliveryConfigId: 'data-delivery-config-id',
    playlistId: 'data-playlist-id',
    playlistVideoId: 'data-playlist-video-id',
    poster: 'poster',
    videoId: 'data-video-id'
  };

  const tagName = embedOptions && embedOptions.tagName || EMBED_TAG_NAME_VIDEOJS;
  const el = document.createElement(tagName);

  Object.keys(paramsToAttrs)
    .filter(key => params[key])
    .forEach(key => {
      let value;

      // If it's not a string, such as with a catalog search or sequence, we
      // try to encode it as JSON.
      if (typeof params[key] !== 'string' && JSON_ALLOWED_ATTRS.indexOf(key) !== -1) {
        try {
          value = JSON.stringify(params[key]);

        // If it fails, don't set anything.
        } catch (x) {
          return;
        }
      } else {
        value = String(params[key]).trim();
      }

      el.setAttribute(paramsToAttrs[key], value);
    });

  el.setAttribute('controls', 'controls');
  el.classList.add('video-js');

  return el;
};

/**
 * Wraps an element in responsive intrinsic ratio elements.
 *
 * @private
 * @param  {string} embedType
 *         The type of the embed.
 *
 * @param  {Object} embedOptions
 *         Embed options from the params.
 *
 * @param  {Element} el
 *         The DOM element.
 *
 * @return {Element}
 *         A new element (if needed).
 */
const wrapResponsive = (embedType, embedOptions, el) => {
  if (!embedOptions.responsive) {
    return el;
  }

  el.style.position = 'absolute';
  el.style.top = '0px';
  el.style.right = '0px';
  el.style.bottom = '0px';
  el.style.left = '0px';
  el.style.width = '100%';
  el.style.height = '100%';

  const responsive = Object.assign({
    aspectRatio: DEFAULT_ASPECT_RATIO,
    iframeHorizontalPlaylist: DEFAULT_IFRAME_HORIZONTAL_PLAYLIST,
    maxWidth: DEFAULT_MAX_WIDTH
  }, embedOptions.responsive);

  // This value is validate at a higher level, so we can trust that it's in the
  // correct format.
  const aspectRatio = responsive.aspectRatio.split(':').map(Number);
  const inner = document.createElement('div');
  let paddingTop = (aspectRatio[1] / aspectRatio[0] * 100);

  // For iframes with a horizontal playlist, the playlist takes up 20% of the
  // vertical space (if shown); so, adjust the vertical size of the embed to
  // avoid black bars.
  if (embedType === EMBED_TYPE_IFRAME && responsive.iframeHorizontalPlaylist) {
    paddingTop *= 1.25;
  }

  inner.style.paddingTop = paddingTop + '%';
  inner.appendChild(el);

  const outer = document.createElement('div');

  outer.style.position = 'relative';
  outer.style.display = 'block';
  outer.style.maxWidth = responsive.maxWidth;
  outer.appendChild(inner);

  return outer;
};

/**
 * Wraps an element in a Picture-in-Picture plugin container.
 *
 * @private
 * @param  {Object} embedOptions
 *         Embed options from the params.
 *
 * @param  {Element} el
 *         The DOM element.
 *
 * @return {Element}
 *         A new element (if needed).
 */
const wrapPip = (embedOptions, el) => {
  if (!embedOptions.pip) {
    return el;
  }

  const pip = document.createElement('div');

  pip.classList.add('vjs-pip-container');
  pip.appendChild(el);

  return pip;
};

/**
 * Wraps a bare embed element with necessary parent elements, depending on
 * embed options given in params.
 *
 * @private
 * @param  {string} embedType
 *         The type of the embed.
 *
 * @param  {Object} embedOptions
 *         Embed options from the params.
 *
 * @param  {Element} embed
 *         The embed DOM element.
 *
 * @return {Element}
 *         A new element (if needed) or the embed itself.
 */
const wrapEmbed = (embedType, embedOptions, embed) => {
  if (!embedOptions) {
    return embed;
  }

  return wrapPip(embedOptions, wrapResponsive(embedType, embedOptions, embed));
};

/**
 * Inserts a previously-created embed element into the page based on params.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {Element} embed
 *         The embed DOM element.
 *
 * @return {Element}
 *         The embed DOM element.
 */
const insertEmbed = (params, embed) => {
  const {refNode, refNodeInsert} = params;
  const refNodeParent = refNode.parentNode;

  // Wrap the embed, if needed, in container elements to support various
  // plugins.
  const wrapped = wrapEmbed(params.embedType, params.embedOptions, embed);

  // Decide where to insert the wrapped embed.
  if (refNodeInsert === REF_NODE_INSERT_BEFORE) {
    refNodeParent.insertBefore(wrapped, refNode);
  } else if (refNodeInsert === REF_NODE_INSERT_AFTER) {
    refNodeParent.insertBefore(wrapped, refNode.nextElementSibling || null);
  } else if (refNodeInsert === REF_NODE_INSERT_REPLACE) {
    refNodeParent.replaceChild(wrapped, refNode);
  } else if (refNodeInsert === REF_NODE_INSERT_PREPEND) {
    refNode.insertBefore(wrapped, refNode.firstChild || null);

  // Append is the default.
  } else {
    refNode.appendChild(wrapped);
  }

  // If the playlist embed option is provided, we need to add a playlist element
  // immediately after the embed. This has to happen after the embed is inserted
  // into the DOM (above).
  if (params.embedOptions && params.embedOptions.playlist) {
    const playlistTagName = params.embedOptions.playlist.legacy ? 'ul' : 'div';
    const playlist = document.createElement(playlistTagName);

    playlist.classList.add('vjs-playlist');
    embed.parentNode.insertBefore(playlist, embed.nextElementSibling || null);
  }

  // Clean up internal reference to the refNode to avoid potential memory
  // leaks in case the params get persisted somewhere. We won't need it beyond
  // this point.
  params.refNode = null;

  // Return the original embed element that can be passed to `bc()`.
  return embed;
};

/**
 * Handles `onEmbedCreated` callback invocation.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {Element} embed
 *         The embed DOM element.
 *
 * @return {Element}
 *         A possibly-new DOM element.
 */
const onEmbedCreated = (params, embed) => {
  if (typeof params.onEmbedCreated !== 'function') {
    return embed;
  }

  const result = params.onEmbedCreated(embed);

  if (isEl(result)) {
    return result;
  }

  return embed;
};

/**
 * Creates an embed code of the appropriate type, runs any customizations
 * necessary, and inserts it into the DOM.
 *
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @return {Element}
 *         The DOM element that will ultimately be passed to the `bc()`
 *         function. Even when customized or wrapped, the return value will be
 *         the target element.
 */
const createEmbed = (params) => {
  const embed = (params.embedType === EMBED_TYPE_IFRAME) ?
    createIframeEmbed(params) :
    createInPageEmbed(params);

  return insertEmbed(params, onEmbedCreated(params, embed));
};

export default createEmbed;
export {isEl, isElInDom};
