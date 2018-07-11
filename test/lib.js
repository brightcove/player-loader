import window from 'global/window';

/**
 * Get known global object keys.
 *
 * @return {Array}
 *         An array of global variables that were added during testing.
 */
const getGlobals = () =>
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
 * Used to reset the global environment as the players we load will alter it.
 */
const resetGlobalEnv = () => {

  // Dispose any remaining players from the `videojs` global.
  disposeAll(window.videojs);

  // There may be other `videojs` instances lurking in the bowels of the `bc`
  // global. This should eliminate any of those.
  if (window.bc) {
    Object.keys(window.bc)
      .filter(k => (/^[A-Za-z0-9]+_[A-Za-z0-9]+$/).test(k))
      .forEach(k => disposeAll(window.bc[k].videojs));
  }

  // Delete any global object keys that were created.
  getGlobals().forEach(k => {
    delete window[k];
  });
};

export {getGlobals, disposeAll, resetGlobalEnv};
