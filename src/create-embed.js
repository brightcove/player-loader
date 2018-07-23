import document from 'global/document';
import {getParamString, getUrl} from './util';

import {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_MAX_WIDTH,
  EMBED_TYPE_IFRAME,
  REF_NODE_INSERT_PREPEND,
  REF_NODE_INSERT_BEFORE,
  REF_NODE_INSERT_AFTER,
  REF_NODE_INSERT_REPLACE
} from './constants';

/**
 * Is this value a element?
 *
 * @private
 * @param  {Element} el
 *         A maybe element.
 *
 * @return {boolean}
 *         Whether or not the value is a element.
 */
const isEl = (el) => Boolean(el && el.nodeType === 1);

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
  el.src = getUrl(params);

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

  // We DO NOT include the data-account, data-player, or data-embed attributes
  // here because we will be manually initializing the player.
  const paramsToAttrs = {
    applicationId: 'data-application-id',
    catalogSearch: 'data-catalog-search',
    catalogSequence: 'data-catalog-sequence',
    playlistId: 'data-playlist-id',
    playlistVideoId: 'data-playlist-video-id',
    videoId: 'data-video-id'
  };

  const el = document.createElement('video-js');

  Object.keys(paramsToAttrs).forEach(key => {
    if (params[key]) {
      const value = getParamString(params, key);

      if (value === undefined) {
        return;
      }

      el.setAttribute(paramsToAttrs[key], value);
    }
  });

  el.setAttribute('controls', 'controls');
  el.classList.add('video-js');

  return el;
};

/**
 * Wraps an element in responsive intrinsic ratio elements.
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
const wrapResponsive = (embedOptions, el) => {
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
    maxWidth: DEFAULT_MAX_WIDTH
  }, embedOptions.responsive);

  // This value is validate at a higher level, so we can trust that it's in the
  // correct format.
  const aspectRatio = responsive.aspectRatio.split(':').map(Number);
  const inner = document.createElement('div');

  inner.style.paddingTop = (aspectRatio[1] / aspectRatio[0] * 100) + '%';
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
 * @param  {Object} embedOptions
 *         Embed options from the params.
 *
 * @param  {Element} embed
 *         The embed DOM element.
 *
 * @return {Element}
 *         A new element (if needed) or the embed itself.
 */
const wrapEmbed = (embedOptions, embed) => {
  if (!embedOptions) {
    return embed;
  }

  return wrapPip(embedOptions, wrapResponsive(embedOptions, embed));
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
  const {refNodeInsert} = params;
  let {refNode} = params;

  if (typeof refNode === 'string') {
    refNode = document.querySelector(refNode);
  }

  if (!isEl(refNode) || !refNode.parentNode) {
    throw new Error('missing/invalid refNode');
  }

  // Wrap the embed, if needed, in container elements to support various
  // plugins.
  const wrapped = wrapEmbed(params.embedOptions, embed);

  // Decide where to insert the wrapped embed.
  if (refNodeInsert === REF_NODE_INSERT_BEFORE) {
    refNode.parentNode.insertBefore(wrapped, refNode);
  } else if (refNodeInsert === REF_NODE_INSERT_AFTER) {
    refNode.parentNode.insertBefore(wrapped, refNode.nextElementSibling || null);
  } else if (refNodeInsert === REF_NODE_INSERT_REPLACE) {
    refNode.parentNode.replaceChild(wrapped, refNode);
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
    const playlist = document.createElement('div');

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
