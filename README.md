# Brightcove Player Loader
An asynchronous script loader for the Brightcove Player.

## Why?
Each Brightcove Player is constructed for our customers and served via our CDN. This works great for most traditional websites where adding an embed code into a template or CMS is straightforward - especially for non-developers!

However, as the web moves toward ES6 modules and our more technical customers adopt modern build tooling, many users don't want a copy/paste embed code. They want a module they can bundle into their web application without needing to write a lot of integration code to download their players and embed them.

This tool aims to solve that problem by providing our own library that can download any published Brightcove Player and embed it in the DOM.

## Installation
```sh
npm install --save @brightcove/player-loader
```

## Inclusion
To include the Brightcove Player Loader on your website or web application, use any of the following methods.

### ES6 Modules (e.g. Rollup, Webpack)
This is the most modern use-case.

```js
import brightcovePlayerLoader from '@brightcove/player-loader';

brightcovePlayerLoader();
```


### CommonJS (e.g. Browserify)
When using with CommonJS or Browserify, install `@brightcove/player-loader` via npm and `require` the library as you would any other module:

```js
var brightcovePlayerLoader = require('@brightcove/player-loader');

brightcovePlayerLoader();
```

### AMD (e.g. RequireJS)
> **NOTE:** Use either `dist/brightcove-player-loader.js` or `dist/brightcove-player-loader.min.js`. In either case, the global variable `brightcovePlayerLoader` will be created.

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the library as you normally would:

```js
require(['@brightcove/player-loader'], function(brightcovePlayerLoader) {
  brightcovePlayerLoader();
});
```

### `<script>` Tag
> **NOTE:** Use either `dist/brightcove-player-loader.js` or `dist/brightcove-player-loader.min.js`. In either case, the global variable `brightcovePlayerLoader` will be created.

This is the simplest case. Get the script in whatever way you prefer and include it:

```html
<script src="//path/to/@brightcove/brightcove-player-loader.min.js"></script>
<script>
  brightcovePlayerLoader();
</script>
```

## Usage
The Brightcove Player Loader exposes a single function. This function takes an parameters object which describes the player it should load and returns a `Promise` which resolves when the player is loaded and created and rejects if anything fails.

### Parameters
The following are all the parameters that can be passed to the Brightcove Player Loader function. Required parameters are marked with an asterisk (\*).

Parameters *must* be passed as an object.

#### `accountId`\*
* **REQUIRED**
* *Type:* String|Number
* *Default:* `undefined`

A Video Cloud account ID.

#### `applicationId`
* *Type:* String
* *Default:* `undefined`

The [application ID][bc-app-id] to be applied to the generated embed.

#### `embedId`
* *Type:* String
* *Default:* `'default'`

The Brightcove Player [embed ID][bc-embed-id] for the player. The default value is correct for most users.

#### `embedType`
* *Type:* String
* *Default:* `'in-page'`

The [embed code type][bc-embed-code-type] to produce. This parameter's value must be one of the following:

* `'in-page'`: Also referred to as the advanced embed code, this injects the player directly into the top-level web page.
* `'iframe'`: Also referred to as the basic embed code, this injects the player as an `<iframe>` element.

#### `options`
* *Type:* Object
* *Default:* `undefined`

A [Video.js options object][vjs-options] to pass during the player creation process. These options will take precedence over any settings specified in the Brightcove Player configuration.

**NOTE:** _Cannot be used with `embedType: 'iframe'`!_

#### `playerId`\*
* **REQUIRED**
* *Type:* string
* *Default:* `undefined`

A Brightcove Player ID.

#### `playlistId`
* *Type:* string|number
* *Default:* `undefined`

A Video Cloud video ID or [reference ID][bc-ref-id].

#### `playlistVideoId`
* *Type:* string|number
* *Default:* `undefined`

A Video Cloud video ID that would be found in the resulting playlist specified by `playlistId`. This parameter is ignored if `playlistId` is missing.

#### `Promise`
* *Type:* Function
* *Default:* `window.Promise`

Used to explicitly provide a `Promise` implementation. If provided, this will be used in lieu of any global `Promise`.

#### `rootEl`\*
* **REQUIRED**
* *Type:* Element|string
* *Default:* `undefined`

The DOM element into which the player will be embedded. If not provided as a DOM element, it can be provided as a string, which will be passed to `document.querySelector`.

#### `rootInsert`
* *Type:* string
* *Default:* `'append'`

The manner in which the player will be inserted relative to the root DOM element (specified by `rootEl`). This parameter's value must be one of the following:

* `'append'`: The player will be the last child of the root.
* `'prepend'`: The player will be the first child of the root.
* `'before'`: The player will be previous sibling of the root.
* `'after'`: The player will be the next sibling after the root.
* `'replace'`: The root element will be removed and replaced by the player.

#### `videoId`
* *Type:* string|number
* *Default:* `undefined`

A Video Cloud video ID or reference ID.

### Examples
This is a minimal example, using only the required parameters:

```
brightcovePlayerLoader({
  rootEl: someElement,
  accountId: '123456789',
  playerId: 'AbCDeFgHi'
});
```

This is a more complete example, using some optional parameters and handling the returned `Promise`:

```
brightcovePlayerLoader({
  rootEl: someElement,
  rootMethod: 'replace',
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  videoId: '987654321'
})
  .then(function(player) {
    // The player has been created!
  })
  .catch(function() {
    // Player creation failed!
  });
```

### Errors
This library will throw errors when invalid parameters are given.

A failed script download or player creation will result in a rejected `Promise` or an error thrown when `Promise` is not defined.

### On Promises
This library assumes the `Promise` global exists (either natively or via a polyfill). However, you can also explicitly provide a `Promise` implementation via the `Promise` parameter:

```
brightcovePlayerLoader({
  rootEl: someElement,
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  Promise: MyCustomPromise
})
  .then(function(player) {
    // The player has been created!
  })
  .catch(function() {
    // Player creation failed!
  });
```

In cases where no `Promise` global exists and none is provided, the Brightcove Player Loader will return `undefined`.

#### Promises and iframe Embeds
When using the `embedType: 'iframe'` parameter, the returned `Promise` (if any) will be _immediately_ resolved.

## License
Apache-2.0. Copyright (c) Brightcove, Inc.


[bc-app-id]: https://support.brightcove.com/adding-application-id-player-embed-code
[bc-embed-code-type]: https://support.brightcove.com/choosing-correct-embed-code
[bc-embed-id]: https://support.brightcove.com/guide-embed-apis
[bc-ref-id]: https://support.brightcove.com/using-reference-ids
[vjs-options]: http://docs.videojs.com/tutorial-options.html
