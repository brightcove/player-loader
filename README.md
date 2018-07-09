# Brightcove Player Loader

[![Build Status](https://travis-ci.org/brightcove/player-loader.svg?branch=master)](https://travis-ci.org/brightcove/player-loader)

An asynchronous script loader for the Brightcove Player.

## Why?
Each Brightcove Player is constructed for our customers and served via our CDN. This works great for most traditional websites where adding an embed code into a template or CMS is straightforward - especially for non-developers!

However, as the web moves toward ES6 modules and our more technical customers adopt modern build tooling, many users don't want a copy/paste embed code. They want a module they can bundle into their web application without needing to write a lot of integration code to download their players and embed them.

This tool aims to solve that problem by providing our own library that can download any published Brightcove Player and embed it in the DOM.

### Browser Support

This library supports common evergreen browsers - Chrome, Firefox, Edge, Safari - and IE11. Earlier versions of IE are _not_ supported.

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

### Examples
This is a minimal example, using only the required parameters:

```
brightcovePlayerLoader({
  refNode: someElement,
  accountId: '123456789'
});
```

This is a more complete example, using some optional parameters and handling the returned `Promise`:

```
brightcovePlayerLoader({
  refNode: someElement,
  refNodeInsert: 'replace',
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

### On Promises
This library assumes the `Promise` global exists (either natively or via a polyfill). However, you can also explicitly provide a `Promise` implementation via the `Promise` parameter:

```
brightcovePlayerLoader({
  refNode: someElement,
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  Promise: MyCustomPromise
})
  .then(function(player) {
    // The player has been created!
  })
  .catch(function(err) {
    // Player creation failed!
  });
```

In cases where no `Promise` global exists and none is provided, the Brightcove Player Loader will return `undefined`.

In short, we recommend polyfilling or passing in a `Promise` implementation!

#### Promise Resolution
For in-page embeds (the default), the `Promise` will be resolved with the player instance that was created.

For iframe embeds, the `Promise` will be resolved with the `iframe` element immediately after it is injected into the DOM.

#### Promise Rejection
The `Promise` will be rejected due to any of the following conditions:

- Bad parameters.
- Any DOM manipulation error.
- Failed script download.
- Failed player creation.

### Parameters
The following are all the parameters that can be passed to the Brightcove Player Loader function. Required parameters are marked with an asterisk (\*).

Parameters *must* be passed as an object.

#### `accountId`\*
* **REQUIRED**
* *Type:* string | number
* *Default:* `undefined`

A Video Cloud account ID.

#### `applicationId`
* *Type:* string
* *Default:* `undefined`

The [application ID][bc-app-id] to be applied to the generated embed.

#### `embedId`
* *Type:* string
* *Default:* `'default'`

The Brightcove Player [embed ID][bc-embed-id] for the player. The default value is correct for most users.

#### `embedOptions`
* *Type:* Object
* *Default:* `undefined`

Used to provide certain options for embed generation. These include:

##### `embedOptions.pip`
* *Type:* boolean

If `true`, will wrap the embed in a `<div class="vjs-pip-container">` element. This should be used when you need support for [the Brightcove Picture-in-Picture plugin][bc-pip].

##### `embedOptions.playlist`
* *Type:* boolean

If `true`, will add a `<div class="vjs-playlist">` element after the embed. This should be used when you need support for [the Brightcove Playlist UI plugin][bc-playlists].

##### `embedOptions.responsive`
* *Type:* boolean | Object

> **NOTE:** This approach should work for in-page embeds, but it is recommended that you use the Video.js `fluid` and/or `aspectRatio` options instead:
>
> ```js
> options: {
>   aspectRatio: '16:9'
> }
> ```

Used customize the embed code to produce a responsively-sized player using [the "intrinsic ratio" wrapper approach][bc-responsive-iframe].

When `true`, will produce a responsive embed code with a 16:9 aspect ratio that will fill its container.

An object can be provided to customize this with the following sub-properties:

- `aspectRatio`: A string Used to customize the aspect ratio to a value other than 16:9 (e.g., `'4:3'`).
- `maxWidth`: A string used to restrain the maximum width of the player. This should use CSS units, such as pixels (e.g., `'960px'`).

#### `embedType`
* *Type:* string
* *Default:* `'in-page'`

The [embed code type][bc-embed-code-type] to produce. This parameter's value must be one of the following:

* `'in-page'` or `brightcovePlayerLoader.EMBED_TYPE_IN_PAGE`: Also referred to as the advanced embed code, this injects the player directly into the top-level web page.
* `'iframe'` or `brightcovePlayerLoader.EMBED_TYPE_IFRAME`: Also referred to as the basic embed code, this injects the player as an `<iframe>` element.

#### `onEmbedCreated`
* *Type:* Function
* *Default:* `undefined`

A callback used to customize the embed element (either `video-js` element or an `iframe` element) *before* it is inserted into the DOM or customized as a result of `embedOptions` and before the player is downloaded and initialized.

The return value of this function is ignored; the embed element should be mutated.

Potential use-cases are adding/removing attributes or adding child elements, such as sources or tracks.

#### `options`
* *Type:* Object
* *Default:* `undefined`

A [Video.js options object][vjs-options] to pass during the player creation process. These options will take precedence over any settings specified in the Brightcove Player configuration.

> **NOTE:** _Cannot be used with iframe embeds!_

#### `playerId`
* *Type:* string
* *Default:* `'default'`

A Brightcove Player ID.

#### `playlistId`
* *Type:* string | number
* *Default:* `undefined`

A Video Cloud video ID or [reference ID][bc-ref-id].

#### `playlistVideoId`
* *Type:* string | number
* *Default:* `undefined`

A Video Cloud video ID that would be found in the resulting playlist specified by `playlistId`. This parameter is ignored if `playlistId` is missing.

#### `Promise`
* *Type:* Function
* *Default:* `window.Promise`

Used to explicitly provide a `Promise` implementation. If provided, this will be used in lieu of any global `Promise`.

#### `refNode`\*
* **REQUIRED**
* *Type:* Element | string
* *Default:* `undefined`

The DOM element into which the player will be embedded. If not provided as a DOM element, it can be provided as a string, which will be passed to `document.querySelector`.

#### `refNodeInsert`
* *Type:* string
* *Default:* `'append'`

The manner in which the player will be inserted relative to the reference DOM element (specified by `refNode`). This parameter's value must be one of the following:

* `'append'` or `brightcovePlayerLoader.REF_NODE_INSERT_APPEND`: The player will be the last child of the reference node.
* `'prepend'` or `brightcovePlayerLoader.REF_NODE_INSERT_PREPEND`: The player will be the first child of the reference node.
* `'before'` or `brightcovePlayerLoader.REF_NODE_INSERT_BEFORE`: The player will be previous sibling of the reference node.
* `'after'` or `brightcovePlayerLoader.REF_NODE_INSERT_AFTER`: The player will be the next sibling after the reference node.
* `'replace'` or `brightcovePlayerLoader.REF_NODE_INSERT_REPLACE`: The reference node will be removed and replaced by the player.

#### `videoId`
* *Type:* string | number
* *Default:* `undefined`

A Video Cloud video ID or reference ID.

## License
Apache-2.0. Copyright (c) Brightcove, Inc.


[bc-app-id]: https://support.brightcove.com/adding-application-id-player-embed-code
[bc-embed-code-type]: https://support.brightcove.com/choosing-correct-embed-code
[bc-embed-id]: https://support.brightcove.com/guide-embed-apis
[bc-pip]: https://support.brightcove.com/picture-picture-plugin-aka-floating-or-pinned
[bc-playlists]: https://support.brightcove.com/implementing-playlists
[bc-ref-id]: https://support.brightcove.com/using-reference-ids
[bc-responsive-iframe]: https://support.brightcove.com/responsive-sizing-brightcove-player#iframe_example
[vjs-options]: http://docs.videojs.com/tutorial-options.html
