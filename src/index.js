import document from 'global/document';
import window from 'global/window';
import {version as VERSION} from '../package.json';
import createEmbed from './create-embed';
import {reset, scriptCache} from './state';
import {getBaseUrl, getUrl, setBaseUrl} from './util';

import {
  DEFAULTS,
  EMBED_TYPE_IN_PAGE,
  EMBED_TYPE_IFRAME,
  REF_NODE_INSERT_APPEND,
  REF_NODE_INSERT_PREPEND,
  REF_NODE_INSERT_BEFORE,
  REF_NODE_INSERT_AFTER,
  REF_NODE_INSERT_REPLACE
} from './constants';

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

  } else if (!refNode) {
    throw new Error('refNode is required');

  } else if (typeof refNode !== 'string' &&
             (refNode.nodeType !== 1 || !refNode.parentNode)) {
    throw new Error('if refNode is not a string, it must be a DOM node with a parent');

  } else if (!isValidEmbedType(embedType)) {
    throw new Error('embedType is missing or invalid');

  } else if (embedType === EMBED_TYPE_IFRAME && options) {
    throw new Error('cannot use options with an iframe embed');

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
 * Initializes a player and returns it.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {Element} embed
 *         An element that will be passed to the `bc()` function.
 *
 * @return {Object}
 *         A success object whose `ref` is a player.
 */
const initPlayer = (params, embed) => {
  const {playerId, embedId} = params;
  const bc = window.bc[`${playerId}_${embedId}`] || window.bc;

  if (!bc) {
    return new Error(`missing bc function for ${playerId}`);
  }

  return {
    type: EMBED_TYPE_IN_PAGE,
    ref: bc(embed, params.options)
  };
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
  checkParams(params);

  const refNode = params.refNode;
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

  const src = getUrl(params);

  // If we've already downloaded this script, we should have the proper `bc`
  // global and can bypass the script creation process.
  if (scriptCache.has(src)) {
    resolve(initPlayer(params, embed));
    return;
  }

  const script = document.createElement('script');

  script.onload = () => {
    scriptCache.add(src);
    resolve(initPlayer(params, embed));
  };

  script.onerror = () => {
    reject(new Error('player script could not be downloaded'));
  };

  script.async = true;
  script.charset = 'utf-8';
  script.src = src;

  refNode.appendChild(script);
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
expose('getBaseUrl', () => getBaseUrl());

/**
 * Set the base URL for players. By default, this will be the Brightcove CDN,
 * but can be overridden with this function.
 *
 * @param {string} baseUrl
 *        A new base URL (instead of Brightcove CDN).
 */
expose('setBaseUrl', (baseUrl) => {
  setBaseUrl(baseUrl);
});

/**
 * Get the URL for players. see the docs for getUrl in utils
 */
expose('getUrl', (options) => getUrl(options));

/**
 * Completely resets global state.
 *
 * This will dispose ALL Video.js players on the page and remove ALL `bc` and
 * `videojs` globals it finds.
 */
expose('reset', reset);

// Define some read-only constants on the exported function.
[
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
