import document from 'global/document';
import window from 'global/window';

// Tracks previously-downloaded scripts by URL.
const scriptCache = new window.Map();

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
 * Resets global state.
 *
 * This will dispose ALL Video.js players on the page and remove ALL `bc` and
 * `videojs` globals it finds.
 */
const reset = () => {

  // Remove all script elements from the DOM.
  scriptCache.forEach((value, key) => {
    Array.prototype.slice
      .call(document.querySelectorAll(`script[src="${key}"]`))
      .forEach(script => {
        script.parentNode.removeChild(script);
      });
  });

  // Clear the internal cache of scripts that have been downloaded.
  scriptCache.clear();

  // Dispose any remaining players from the `videojs` global.
  disposeAll(window.videojs);

  // There may be other `videojs` instances lurking in the bowels of the
  // `bc` global. This should eliminate any of those.
  if (window.bc) {
    Object.keys(window.bc)
      .filter(k => (/^[A-Za-z0-9]+_[A-Za-z0-9]+$/).test(k))
      .forEach(k => disposeAll(window.bc[k].videojs));
  }

  // Delete any global object keys that were created.
  getGlobalKeys().forEach(k => {
    delete window[k];
  });
};

export {reset, scriptCache};
