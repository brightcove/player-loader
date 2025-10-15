/* global globalThis window self document */

const getGlobal = () => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  return {};
};

const getWindow = () => {
  if (typeof window !== 'undefined') {
    return window;
  }

  const globalObject = getGlobal();

  if (globalObject.window && globalObject.window.window === globalObject.window) {
    return globalObject.window;
  }

  return globalObject;
};

const getDocument = () => {
  if (typeof document !== 'undefined') {
    return document;
  }

  const win = getWindow();

  if (win && win.document) {
    return win.document;
  }

  throw new Error('document is not available in this environment');
};

export {
  getDocument,
  getGlobal,
  getWindow
};
