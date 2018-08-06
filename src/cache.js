import window from 'global/window';
import {getUrl} from './url';

// Tracks previously-downloaded scripts and/or detected players.
//
// The keys follow the format "accountId_playerId_embedId" where accountId is
// optional and defaults to "*". This happens when we detect pre-existing
// player globals.
const cache = new window.Map();

/**
 * Get the cache key given some properties.
 *
 * @private
 * @param  {object} props
 *         Properties describing the player record to cache.
 *
 * @param  {string} props.playerId
 *         A player ID.
 *
 * @param  {string} props.embedId
 *         An embed ID.
 *
 * @param  {string} [props.accountId="*"]
 *         An optional account ID. This is optional because when we search for
 *         pre-existing players to avoid downloads, we will not necessarily
 *         know the account ID.
 *
 * @return {string}
 *         A key to be used in the script cache.
 */
const key = ({accountId, playerId, embedId}) => `${accountId || '*'}_${playerId}_${embedId}`;

/**
 * Add an entry to the script cache.
 *
 * @private
 * @param  {object} props
 *         Properties describing the player record to cache.
 *
 * @param  {string} props.playerId
 *         A player ID.
 *
 * @param  {string} props.embedId
 *         An embed ID.
 *
 * @param  {string} [props.accountId="*"]
 *         An optional account ID. This is optional because when we search for
 *         pre-existing players to avoid downloads, we will not necessarily
 *         know the account ID. If not given, we assume that no script was
 *         downloaded for this player.
 *
 * @return {string}
 *         A key to be used in the script cache.
 */
const store = (props) => {
  cache.set(key(props), props.accountId ? getUrl(props) : '');
};

/**
 * Checks if the script cache has an entry.
 *
 * @private
 * @param  {object} props
 *         Properties describing the player record to cache.
 *
 * @param  {string} props.playerId
 *         A player ID.
 *
 * @param  {string} props.embedId
 *         An embed ID.
 *
 * @param  {string} [props.accountId="*"]
 *         An optional account ID. This is optional because when we search for
 *         pre-existing players to avoid downloads, we will not necessarily
 *         know the account ID.
 *
 * @return {boolean}
 *         Will be `true` if there is a matching cache entry.
 */
const has = (props) => cache.has(key(props));

/**
 * Gets a cache entry.
 *
 * @private
 * @param  {object} props
 *         Properties describing the player record to cache.
 *
 * @param  {string} props.playerId
 *         A player ID.
 *
 * @param  {string} props.embedId
 *         An embed ID.
 *
 * @param  {string} [props.accountId="*"]
 *         An optional account ID. This is optional because when we search for
 *         pre-existing players to avoid downloads, we will not necessarily
 *         know the account ID.
 *
 * @return {string}
 *
 */
const get = (props) => cache.get(key(props));

/**
 * Clears the cache.
 */
const clear = () => {
  cache.clear();
};

/**
 * Iterates over the cache.
 *
 * @param  {Function} fn
 *         A callback function that will be called with a value and a key
 *         for each item in the cache.
 */
const forEach = (fn) => {
  cache.forEach(fn);
};

export {
  clear,
  forEach,
  get,
  has,
  key,
  store
};
