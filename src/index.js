import document from 'global/document';
import window from 'global/window';
import {version as VERSION} from '../package.json';
import createEmbed from './create-embed';
import {getUrl} from './util';

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

// Tracks previously-downloaded scripts by URL.
const downloadedScripts = {};

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
 * Downloads a player.
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

  let err;

  if (!accountId) {
    err = 'accountId is required';
  } else if (!refNode) {
    err = 'refNode is required';
  } else if (typeof refNode !== 'string' &&
             (refNode.nodeType !== 1 || !refNode.parentNode)) {
    err = 'if refNode is not a string, it must be a DOM node with a parent';
  } else if (!isValidEmbedType(embedType)) {
    err = 'embedType is missing or invalid';
  } else if (embedType === EMBED_TYPE_IFRAME && options) {
    err = 'cannot use options with an iframe embed';
  } else if (embedOptions &&
             embedOptions.responsive &&
             embedOptions.responsive.aspectRatio &&
             !(/^\d+\:\d+$/).test(embedOptions.responsive.aspectRatio)) {
    err = 'embedOptions.responsive.aspectRatio must be in the "n:n" format';
  } else if (!isValidRootInsert(refNodeInsert)) {
    err = 'refNodeInsert is missing or invalid';
  }

  if (err) {
    throw new Error(err);
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
 *         A Video.js player.
 */
const initPlayer = (params, embed) => {
  const {playerId, embedId} = params;
  const bc = window.bc[`${playerId}_${embedId}`] || window.bc;

  if (!bc) {
    return new Error(`missing bc function for ${playerId}`);
  }

  return bc(embed, params.options);
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

  const embed = createEmbed(params);

  // If this is an iframe, all we need to do is create the embed code and
  // inject it. Because there is no reliable way to hook into an iframe from
  // the parent page, we simply resolve immediately upon creating the embed.
  if (params.embedType === EMBED_TYPE_IFRAME) {
    resolve(embed);
    return;
  }

  const src = getUrl(params);

  // If we've already downloaded this script, we should have the proper `bc`
  // global and can bypass the script creation process.
  if (downloadedScripts[src]) {
    resolve(initPlayer(params, embed));
    return;
  }

  const script = document.createElement('script');

  script.onload = () => {
    downloadedScripts[src] = 1;
    resolve(initPlayer(params, embed));
  };

  script.onerror = () => {
    reject(new Error('player script could not be downloaded'));
  };

  script.async = true;
  script.charset = 'utf-8';
  script.src = src;

  document.head.appendChild(script);
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

  if (typeof params.Promise === 'function') {
    return new params.Promise((resolve, reject) => {
      loadPlayer(params, resolve, reject);
    });
  }

  loadPlayer(params, () => {}, (err) => {
    throw err;
  });
};

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
  Object.defineProperty(brightcovePlayerLoader, arr[0], {
    configurable: false,
    enumerable: true,
    value: arr[1],
    writable: false
  });
});

export default brightcovePlayerLoader;
