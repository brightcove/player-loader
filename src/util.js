import window from 'global/window';
import {EMBED_TYPE_IFRAME} from './constants';

const {encodeURIComponent} = window;

let BASE_URL = 'https://players.brightcove.net/';

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
  let qs = '';

  // In some cases, we need to add query string parameters to an iframe URL.
  // It would be nicer to use a library for this, but that'd add too much
  // weight for what we need.
  if (iframe) {
    [
      'playlistId',
      'playlistVideoId',
      'videoId'
    ].forEach(k => {
      if (params[k]) {
        qs += (qs) ? '&' : '?';
        qs += encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }
    });
  }

  const account = encodeURIComponent(params.accountId);
  const player = encodeURIComponent(params.playerId);
  const embed = encodeURIComponent(params.embedId);

  return `${BASE_URL}${account}/${player}_${embed}/index.${ext}${qs}`;
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

export {getUrl, getBaseUrl, setBaseUrl};
