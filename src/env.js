import document from 'global/document';
import window from 'global/window';
import playerScriptCache from './player-script-cache';

const REGEX_PLAYER_EMBED = /^([A-Za-z0-9]+)_([A-Za-z0-9]+)$/;

/**
 * Gets an array of current per-player/per-embed `bc` globals that are
 * attached to the `bc` global (e.g. `bc.abc123xyz_default`).
 *
 * If `bc` is not defined, returns an empty array.
 *
 * @private
 * @return {string[]}
 *         An array of keys.
 */
const getBcGlobalKeys = () =>
  window.bc ? Object.keys(window.bc).filter(k => REGEX_PLAYER_EMBED.test(k)) : [];

/**
 * Gets known global object keys that Brightcove Players may create.
 *
 * @private
 * @return {string[]}
 *         An array of global variables that were added during testing.
 */
const getGlobalKeys = () =>
  Object.keys(window).filter(k => (/^videojs/i).test(k) || (/^(bc)$/).test(k));

/**
 * Dispose all players from a copy of Video.js.
 *
 * @param  {Function} videojs
 *         A copy of Video.js.
 */
const disposeAll = (videojs) => {
  if (!videojs) {
    return;
  }
  Object.keys(videojs.players).forEach(k => {
    const p = videojs.players[k];

    if (p) {
      p.dispose();
    }
  });
};

/**
 * Resets environment state.
 *
 * This will dispose ALL Video.js players on the page and remove ALL `bc` and
 * `videojs` globals it finds.
 */
const reset = () => {

  // Remove all script elements from the DOM.
  playerScriptCache.forEach((value, key) => {

    // If no script URL is associated, skip it.
    if (!value) {
      return;
    }

    // Find all script elements and remove them.
    Array.prototype.slice
      .call(document.querySelectorAll(`script[src="${value}"]`))
      .forEach(el => el.parentNode.removeChild(el));
  });

  // Clear the internal cache that have been downloaded.
  playerScriptCache.clear();

  // Dispose any remaining players from the `videojs` global.
  disposeAll(window.videojs);

  // There may be other `videojs` instances lurking in the bowels of the
  // `bc` global. This should eliminate any of those.
  getBcGlobalKeys().forEach(k => disposeAll(window.bc[k].videojs));

  // Delete any global object keys that were created.
  getGlobalKeys().forEach(k => {
    delete window[k];
  });
};

/**
 * At runtime, populate the cache with pre-detected players. This allows
 * people who have bundled their player or included a script tag before this
 * runs to not have to re-download players.
 */
const detectPlayers = () => {
  getBcGlobalKeys().forEach(k => {
    const matches = k.match(REGEX_PLAYER_EMBED);
    const props = {playerId: matches[1], embedId: matches[2]};

    if (!playerScriptCache.has(props)) {
      playerScriptCache.store(props);
    }
  });
};

export default {detectPlayers, reset};
