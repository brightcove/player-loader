import brightcovePlayerUrl from '@brightcove/player-url';
import {EMBED_TYPE_IFRAME} from './constants';

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

  if (params.playerUrl) {
    return params.playerUrl;
  }

  const {accountId, playerId, embedId, embedOptions} = params;
  const iframe = params.embedType === EMBED_TYPE_IFRAME;

  return brightcovePlayerUrl({
    accountId,
    playerId,
    embedId,
    iframe,
    base: BASE_URL,

    // The unminified embed option is the exact reverse of the minified option
    // here.
    minified: embedOptions ? !embedOptions.unminified : true,

    // Pass the entire params object as query params. This is safe because
    // @brightcove/player-url only accepts a whitelist of parameters. Anything
    // else will be ignored.
    queryParams: params
  });
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

export default {
  getUrl,
  getBaseUrl,
  setBaseUrl
};
