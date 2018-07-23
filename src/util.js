import window from 'global/window';
import {EMBED_TYPE_IFRAME} from './constants';

const {encodeURIComponent} = window;

let BASE_URL = 'https://players.brightcove.net/';

// The parameters that may include JSON.
const jsonAllowedParams = ['catalogSearch', 'catalogSequence'];

// The parameters that may be set as query string parameters for iframes.
const iframeAllowedQueryParams = [
  'applicationId',
  'catalogSearch',
  'catalogSequence',
  'playlistId',
  'playlistVideoId',
  'videoId'
];

/**
 * Gets the value of a parameter and encodes it as a string.
 *
 * For certain keys, JSON is allowed and will be encoded.
 *
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {string} key
 *         The key in the params object.
 *
 * @return {string|undefined}
 *         The encoded value - or `undefined` if none.
 */
const getParamString = (params, key) => {
  if (!params || params[key] === undefined) {
    return;
  }

  // If it's not a string, such as with a catalog search or sequence, we
  // try to encode it as JSON.
  if (typeof params[key] !== 'string' && jsonAllowedParams.indexOf(key) !== -1) {
    try {
      return JSON.stringify(params[key]);
    } catch (x) {

      // If it's not a string and we can't encode as JSON, it's ignored entirely.
      return;
    }
  }

  return String(params[key]).trim() || undefined;
};

/**
 * Gets the value of a parameter, encodes it as a string, and further encodes
 * it as a URI component.
 *
 * For certain keys, JSON is allowed and will be encoded.
 *
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @param  {string} key
 *         The key in the params object.
 *
 * @return {string|undefined}
 *         The encoded value - or `undefined` if none.
 */
const getUrlEncodedParam = (params, key) => {
  const value = getParamString(params, key);

  if (value) {
    return encodeURIComponent(value);
  }
};

/**
 * Gets the URL to a player on CDN.
 *
 * @private
 * @param  {Object} params
 *         A parameters object. See README for details.
 *
 * @return {string}
 *         A URL.
 */
const getUrl = (params) => {
  const iframe = params.embedType === EMBED_TYPE_IFRAME;
  const ext = iframe ? 'html' : 'min.js';

  // In some cases, we need to add query string parameters to an iframe URL.
  // It would be nicer to use a library for this, but that'd add too much
  // weight for what we need.
  const query = !iframe ? '' : iframeAllowedQueryParams.reduce((qs, k) => {
    if (params[k]) {
      const value = getUrlEncodedParam(params, k);

      if (value === undefined) {
        return;
      }

      qs += (qs) ? '&' : '?';
      qs += encodeURIComponent(k) + '=' + getUrlEncodedParam(params, k);
    }

    return qs;
  }, '');

  const account = encodeURIComponent(params.accountId);
  const player = encodeURIComponent(params.playerId);
  const embed = encodeURIComponent(params.embedId);

  return `${BASE_URL}${account}/${player}_${embed}/index.${ext}${query}`;
};

/**
 * Function used to get the base URL - primarily for testing.
 *
 * @private
 * @return {string}
 *         The current base URL.
 */
const getBaseUrl = () => BASE_URL;

/**
 * Function used to set the base URL - primarily for testing.
 *
 * @private
 * @param {string} baseUrl
 *        A new base URL (instead of Brightcove CDN).
 */
const setBaseUrl = (baseUrl) => {
  BASE_URL = baseUrl;
};

export {getParamString, getUrlEncodedParam, getUrl, getBaseUrl, setBaseUrl};
