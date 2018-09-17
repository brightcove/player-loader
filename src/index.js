import document from 'global/document';
import window from 'global/window';
import {version as VERSION} from '../package.json';
import createEmbed from './create-embed';
import {isElInDom} from './create-embed';
import env from './env';
import playerScriptCache from './player-script-cache';
import urls from './urls';

import {
  DEFAULTS,
  EMBED_TAG_NAME_VIDEO,
  EMBED_TAG_NAME_VIDEOJS,
  EMBED_TYPE_IN_PAGE,
  EMBED_TYPE_IFRAME,
  REF_NODE_INSERT_APPEND,
  REF_NODE_INSERT_PREPEND,
  REF_NODE_INSERT_BEFORE,
  REF_NODE_INSERT_AFTER,
  REF_NODE_INSERT_REPLACE
} from './constants';

// Look through the page for any pre-existing players.
env.detectPlayers();

/**
 * Is this value a function?
 *
 * @private
 * @param  {Function} fn
 *         A maybe function.
 *
 * @return {boolean}
 *         Whether or not the value is a function.
 */
const isFn = (fn) => typeof fn === 'function';

/**
 * Checks whether an embedType parameter is valid.
 *
 * @private
 * @param  {string} embedType
 *         The value to test.
 *
 * @return {boolean}
 *         Whether the value is valid.
 */
const isValidEmbedType = (embedType) =>
  embedType === EMBED_TYPE_IN_PAGE ||
  embedType === EMBED_TYPE_IFRAME;

/**
 * Checks whether an embedOptions.tagName parameter is valid.
 *
 * @private
 * @param  {string} tagName
 *         The value to test.
 *
 * @return {boolean}
 *         Whether the value is valid.
 */
const isValidTagName = (tagName) =>
  tagName === EMBED_TAG_NAME_VIDEOJS ||
  tagName === EMBED_TAG_NAME_VIDEO;

/**
 * Checks whether a refNodeInsert parameter is valid.
 *
 * @private
 * @param  {string} refNodeInsert
 *         The value to test.
 *
 * @return {boolean}
 *         Whether the value is valid.
 */
const isValidRootInsert = (refNodeInsert) =>
  refNodeInsert === REF_NODE_INSERT_APPEND ||
  refNodeInsert === REF_NODE_INSERT_PREPEND ||
  refNodeInsert === REF_NODE_INSERT_BEFORE ||
  refNodeInsert === REF_NODE_INSERT_AFTER ||
  refNodeInsert === REF_NODE_INSERT_REPLACE;

/**
 * Checks parameters and throws an error on validation problems.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @throws {Error} If accountId is missing.
 * @throws {Error} If refNode is missing or invalid.
 * @throws {Error} If embedType is missing or invalid.
 * @throws {Error} If attempting to use an iframe embed with options.
 * @throws {Error} If attempting to use embedOptions.responsiveIframe with a
 *                 non-iframe embed.
 * @throws {Error} If refNodeInsert is missing or invalid.
 */
const checkParams = (params) => {
  const {
    accountId,
    embedOptions,
    embedType,
    options,
    refNode,
    refNodeInsert
  } = params;

  if (!accountId) {
    throw new Error('accountId is required');

  } else if (!isElInDom(refNode)) {
    throw new Error('refNode must resolve to a node attached to the DOM');

  } else if (!isValidEmbedType(embedType)) {
    throw new Error('embedType is missing or invalid');

  } else if (embedType === EMBED_TYPE_IFRAME && options) {
    throw new Error('cannot use options with an iframe embed');

  } else if (embedOptions && embedOptions.tagName !== undefined && !isValidTagName(embedOptions.tagName)) {
    throw new Error(`embedOptions.tagName is invalid (value: "${embedOptions.tagName}")`);

  } else if (embedOptions &&
             embedOptions.responsive &&
             embedOptions.responsive.aspectRatio &&
             !(/^\d+\:\d+$/).test(embedOptions.responsive.aspectRatio)) {
    throw new Error(`embedOptions.responsive.aspectRatio must be in the "n:n" format (value: "${embedOptions.responsive.aspectRatio}")`);

  } else if (!isValidRootInsert(refNodeInsert)) {
    throw new Error('refNodeInsert is missing or invalid');
  }
};

/**
 * Normalizes a `refNode` param to an element - or `null`.
 *
 * @private
 * @param  {Element|string} refNode
 *         The value of a `refNode` param.
 *
 * @return {Element|null}
 *         A DOM element or `null` if the `refNode` was given as a string and
 *         did not match an element.
 */
const resolveRefNode = (refNode) => {
  if (isElInDom(refNode)) {
    return refNode;
  }

  if (typeof refNode === 'string') {
    return document.querySelector(refNode);
  }

  return null;
};

/**
 * Initializes a player and returns it.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {Element} embed
 *         An element that will be passed to the `bc()` function.
 *
 * @param  {Function} resolve
 *         A function to call if a player is successfully initialized.
 *
 * @param  {Function} reject
 *         A function to call if a player fails to be initialized.
 *
 * @return {Object}
 *         A success object whose `ref` is a player.
 */
const initPlayer = (params, embed, resolve, reject) => {
  const {embedId, playerId} = params;
  const bc = window.bc[`${playerId}_${embedId}`] || window.bc;

  if (!bc) {
    return reject(new Error(`missing bc function for ${playerId}`));
  }

  playerScriptCache.store(params);

  let player;

  try {
    player = bc(embed, params.options);

    // Add a PLAYER_LOADER property to bcinfo to indicate this player was
    // loaded via that mechanism.
    if (player.bcinfo) {
      player.bcinfo.PLAYER_LOADER = true;
    }
  } catch (x) {
    let message = 'Could not initialize the Brightcove Player.';

    // Update the rejection message based on known conditions that can cause it.
    if (params.embedOptions.tagName === EMBED_TAG_NAME_VIDEOJS) {
      message += ' You are attempting to embed using a "video-js" element.' +
        ' Please ensure that your Player is v6.11.0 or newer in order to' +
        ' support this embed type. Alternatively, pass `"video"` for' +
        ' `embedOptions.tagName`.';
    }

    return reject(new Error(message));
  }

  resolve({
    type: EMBED_TYPE_IN_PAGE,
    ref: player
  });
};

/**
 * Loads a player from CDN and embeds it.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {Function} resolve
 *         A function to call if a player is successfully initialized.
 *
 * @param  {Function} reject
 *         A function to call if a player fails to be initialized.
 */
const loadPlayer = (params, resolve, reject) => {
  params.refNode = resolveRefNode(params.refNode);

  checkParams(params);

  const {refNode, refNodeInsert} = params;

  // Store a reference to the refNode parent. When we use the replace method,
  // we'll need it as the location to store the script element.
  const refNodeParent = refNode.parentNode;
  const embed = createEmbed(params);

  // If this is an iframe, all we need to do is create the embed code and
  // inject it. Because there is no reliable way to hook into an iframe from
  // the parent page, we simply resolve immediately upon creating the embed.
  if (params.embedType === EMBED_TYPE_IFRAME) {
    resolve({
      type: EMBED_TYPE_IFRAME,
      ref: embed
    });
    return;
  }

  // If we've already downloaded this script or detected a matching global, we
  // should have the proper `bc` global and can bypass the script creation
  // process.
  if (playerScriptCache.has(params)) {
    return initPlayer(params, embed, resolve, reject);
  }

  const script = document.createElement('script');

  script.onload = () => initPlayer(params, embed, resolve, reject);

  script.onerror = () => {
    reject(new Error('player script could not be downloaded'));
  };

  script.async = true;
  script.charset = 'utf-8';
  script.src = urls.getUrl(params);

  if (refNodeInsert === REF_NODE_INSERT_REPLACE) {
    refNodeParent.appendChild(script);
  } else {
    refNode.appendChild(script);
  }
};

/**
 * A function for asynchronously loading a Brightcove Player into a web page.
 *
 * @param  {Object} parameters
 *         A parameters object. See README for details.
 *
 * @return {Promise|undefined}
 *         A Promise, if possible.
 */
const brightcovePlayerLoader = (parameters) => {
  const params = Object.assign({}, DEFAULTS, parameters);
  const {Promise, onSuccess, onFailure} = params;

  // When Promise is not available or any success/failure callback is given,
  // do not attempt to use Promises.
  if (!isFn(Promise) || isFn(onSuccess) || isFn(onFailure)) {
    return loadPlayer(
      params,
      isFn(onSuccess) ? onSuccess : () => {},
      isFn(onFailure) ? onFailure : (err) => {
        throw err;
      }
    );
  }

  // Promises are supported, use 'em.
  return new Promise((resolve, reject) => loadPlayer(params, resolve, reject));
};

/**
 * Expose a non-writable, non-configurable property on the
 * `brightcovePlayerLoader` function.
 *
 * @private
 * @param  {string} key
 *         The property key.
 *
 * @param  {string|Function} value
 *         The value.
 */
const expose = (key, value) => {
  Object.defineProperty(brightcovePlayerLoader, key, {
    configurable: false,
    enumerable: true,
    value,
    writable: false
  });
};

/**
 * Get the base URL for players. By default, this will be the Brightcove CDN.
 *
 * @return {string}
 *         The current base URL.
 */
expose('getBaseUrl', () => urls.getBaseUrl());

/**
 * Set the base URL for players. By default, this will be the Brightcove CDN,
 * but can be overridden with this function.
 *
 * @param {string} baseUrl
 *        A new base URL (instead of Brightcove CDN).
 */
expose('setBaseUrl', (baseUrl) => {
  urls.setBaseUrl(baseUrl);
});

/**
 * Get the URL for a player.
 */
expose('getUrl', (options) => urls.getUrl(options));

/**
 * Completely resets global state.
 *
 * This will dispose ALL Video.js players on the page and remove ALL `bc` and
 * `videojs` globals it finds.
 */
expose('reset', () => env.reset());

// Define some read-only constants on the exported function.
[
  ['EMBED_TAG_NAME_VIDEO', EMBED_TAG_NAME_VIDEO],
  ['EMBED_TAG_NAME_VIDEOJS', EMBED_TAG_NAME_VIDEOJS],
  ['EMBED_TYPE_IN_PAGE', EMBED_TYPE_IN_PAGE],
  ['EMBED_TYPE_IFRAME', EMBED_TYPE_IFRAME],
  ['REF_NODE_INSERT_APPEND', REF_NODE_INSERT_APPEND],
  ['REF_NODE_INSERT_PREPEND', REF_NODE_INSERT_PREPEND],
  ['REF_NODE_INSERT_BEFORE', REF_NODE_INSERT_BEFORE],
  ['REF_NODE_INSERT_AFTER', REF_NODE_INSERT_AFTER],
  ['REF_NODE_INSERT_REPLACE', REF_NODE_INSERT_REPLACE],
  ['VERSION', VERSION]
].forEach(arr => {
  expose(arr[0], arr[1]);
});

export default brightcovePlayerLoader;
