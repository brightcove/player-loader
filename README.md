# Brightcove Player Loader


[![Build Status](https://travis-ci.org/brightcove/player-loader.svg?branch=master)](https://travis-ci.org/brightcove/player-loader)
[![Greenkeeper badge](https://badges.greenkeeper.io/brightcove/player-loader.svg)](https://greenkeeper.io/)

[![NPM](https://nodeico.herokuapp.com/@brightcove/player-loader.svg)](https://npmjs.com/package/@brightcove/player-loader)

An asynchronous script loader for the Brightcove Player.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [License](#license)
- [Why do I need this library?](#why-do-i-need-this-library)
  - [Brightcove Player Support](#brightcove-player-support)
  - [Browser Support](#browser-support)
- [Installation](#installation)
- [Inclusion](#inclusion)
  - [ES6 Modules (e.g. Rollup, Webpack)](#es6-modules-eg-rollup-webpack)
  - [CommonJS (e.g. Browserify)](#commonjs-eg-browserify)
  - [AMD (e.g. RequireJS)](#amd-eg-requirejs)
  - [`<script>` Tag](#script-tag)
- [Usage](#usage)
  - [Examples](#examples)
  - [Pre-Existing Players](#pre-existing-players)
  - [Avoiding Downloads](#avoiding-downloads)
  - [Use of Promises or Callbacks](#use-of-promises-or-callbacks)
    - [Success](#success)
    - [Failure](#failure)
  - [Cleaning Up](#cleaning-up)
  - [Parameters](#parameters)
    - [`accountId`\*](#accountid%5C)
    - [`adConfigId`](#adconfigid)
    - [`applicationId`](#applicationid)
    - [`catalogSearch`](#catalogsearch)
    - [`catalogSequence`](#catalogsequence)
    - [`deliveryConfigId`](#deliveryconfigid)
    - [`embedId`](#embedid)
    - [`embedOptions`](#embedoptions)
      - [`embedOptions.pip`](#embedoptionspip)
      - [`embedOptions.playlist`](#embedoptionsplaylist)
      - [`embedOptions.responsive`](#embedoptionsresponsive)
      - [`embedOptions.tagName`](#embedoptionstagname)
      - [`embedOptions.unminified`](#embedoptionsunminified)
    - [`embedType`](#embedtype)
    - [`onEmbedCreated`](#onembedcreated)
    - [`onFailure`](#onfailure)
    - [`onSuccess`](#onsuccess)
    - [`options`](#options)
    - [`playerUrl`](#playerurl)
    - [`playerId`](#playerid)
    - [`playlistId`](#playlistid)
    - [`playlistVideoId`](#playlistvideoid)
    - [`poster`](#poster)
    - [`Promise`](#promise)
    - [`refNode`\*](#refnode%5C)
    - [`refNodeInsert`](#refnodeinsert)
    - [`videoId`](#videoid)
  - [Constants](#constants)
  - [Base URL](#base-url)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## License
Apache-2.0. Copyright (c) Brightcove, Inc.

While this library, Brightcove Player Loader, has an open-source license and is free-to-use, the [Brightcove Player](https://www.brightcove.com/en/player) is not open-source or free-to-use; it is governed by the proprietary Brightcove Software License and is Copyright (c) Brightcove, Inc.

Similarly, all files in `vendor/` do not fall under the Apache-2.0 license. Rather, they are governed by the proprietary Brightcove Software License and are Copyright (c) Brightcove, Inc.

## Why do I need this library?
Each Brightcove Player is constructed for our customers and served via our CDN. This works great for most traditional websites where adding an embed code into a template or CMS is straightforward - especially for non-developers!

However, as the web moves toward ES modules and our more technical customers adopt modern build tooling, many users don't want a copy/paste embed code. They want a module they can bundle into their web application without needing to write a lot of integration code to download their players and embed them.

This tool aims to solve that problem by providing our own library that can download any published Brightcove Player and embed it in the DOM.

### Brightcove Player Support
Currently, this library supports Brightcove Players v6.0.0 and higher.

It _may_ work for v5.x players in some configurations, but this is not a supported use-case.

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
> Note: If you want to use this with React, we have an official react component called [@brightcove/react-player-loader](https://www.npmjs.com/package/@brightcove/react-player-loader)

The Brightcove Player Loader exposes a single function. This function takes an parameters object which describes the player it should load and returns a `Promise` which resolves when the player is loaded and created and rejects if anything fails.

### Examples
This is a minimal example, using only the required parameters, which will load a Video Cloud account's default player:

```js
brightcovePlayerLoader({
  refNode: someElement,
  accountId: '123456789'
});
```

This is a more complete example, using some optional parameters and handling the returned `Promise`:

```js
brightcovePlayerLoader({
  refNode: someElement,
  refNodeInsert: 'replace',
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  embedId: 'default',
  videoId: '987654321'
})
  .then(function(success) {
    // The player has been created!
  })
  .catch(function(error) {
    // Player creation failed!
  });
```

### Pre-Existing Players
This library will attempt to detect pre-existing players on the page. In other words, if this library runs after a Brightcove Player script was included earlier in the DOM, it will detect it and prevent additional downloads of the same player. For example:

```
<div id="player-container"></div>
<script src="https://players.brightcove.net/123456789/default_default/index.min.js"></script>
<script src="path/to/brightcove-player-loader.js"></script>
<script>

  // This will create a player in #player-container, but will not download
  // the player script a second time!
  brightcovePlayerLoader({
    refNode: '#player-container',
    accountId: '123456789'
  });
</script>
```

However, there is a limitation to this behavior. Players from separate accounts on the same page are not guaranteed to be properly detected. _This is considered an unsupported use-case._

### Avoiding Downloads
When used with [the related webpack plugin][webpack-plugin], you can take advantage of the Player Loader's embed creation capabilities while avoiding an additional, asynchronous request by bundling your Brightcove Player into your webpack bundle.

Simply configure both libraries simultaneously and your player(s) should be bundled and no longer download asynchronously.

### Use of Promises or Callbacks
By default, this library will look for a global `Promise`. However, you can explicitly provide a `Promise` implementation via the `Promise` parameter:

```js
brightcovePlayerLoader({
  refNode: someElement,
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  Promise: MyCustomPromise
})
  .then(function(success) {
    // The player has been created!
  })
  .catch(function(error) {
    // Player creation failed!
  });
```

Promises are not required for this library to work, but they are recommended. The only major browser that does not support `Promise` natively is IE11. We recommend polyfilling the `window.Promise` constructor if it does not exist.

In cases where no `Promise` global exists and none is provided, the Brightcove Player Loader will return `undefined`. There are callbacks available, which can be used instead of `Promise` - passing them will prevent a `Promise` from being returned:

```js
brightcovePlayerLoader({
  refNode: someElement,
  accountId: '123456789',
  onSuccess: function(success) {
    // The player has been created!
  },
  onFailure: function(error) {
    // Player creation failed!
  }
});
```

> **NOTE:** Providing these callbacks means opting-out of promises entirely. No `Promise` object will be returned!

#### Success
For resolved `Promise`s or `onSuccess` callbacks, a single argument will be passed. This "success object" can have the following properties:

Property | Description
---------|------------
`type`   | Either `'in-page'` or `'iframe'`, describing the type of embed that was created.
`ref`    | The type of value assigned to this property will vary by the `type`. For `'in-page'` embeds, it will be a [Video.js Player object][vjs-player] and for `'iframe'` embeds, it will be the `<iframe>` DOM element.

#### Failure
For rejected `Promise`s or `onFailure` callbacks, a single argument will be passed. This will be a native `Error` object with a `message` describing what went wrong.

### Cleaning Up
The Brightcove Player will create global variables and add elements to the DOM. This library exposes a `reset()` function, which can reset that state. Calling it will have the following effects:

- It will remove _all_ `script` tags created by this library and clear its internal record of which files have been loaded.
- It will dispose _all_ Brightcove or Video.js players on the page.
- It will remove _all_ `bc` and `videojs` properties from the global namespace.

```js
brightcovePlayerLoader({
  refNode: someElement,
  refNodeInsert: 'replace',
  accountId: '123456789',
  playerId: 'AbCDeFgHi',
  embedId: 'default',
  videoId: '987654321'
})
  .then(function(success) {

    /*
      At this point:
      - at least one video player will be in the DOM.
      - at least one script created by this library will be in the DOM.
      - window.bc will exist.
      - window.videojs will exist.
     */

     brightcovePlayerLoader.reset();

    /*
      At this point:
      - no video players will be in the DOM.
      - no scripts created by this library will be in the DOM.
      - window.bc will not exist.
      - window.videojs will not exist.
     */
  });
```

This `reset()` function can be useful in long-lived web pages, such as in single page applications and similar. It is left to implementers to determine whether or not they need to merely dispose their players or completely reset the Brightcove-provided functions.

### Parameters
The following are all the parameters that can be passed to the Brightcove Player Loader function. Required parameters are marked with an asterisk (\*).

Parameters *must* be passed as an object.

#### `accountId`\*
* **REQUIRED**
* *Type:* `string` | `number`

A Video Cloud account ID.

#### `adConfigId`
* *Type:* `string`

The [Video Cloud SSAI Ad Config ID][bc-ad-conf-id] to be applied to the generated embed.

#### `applicationId`
* *Type:* `string`

The [application ID][bc-app-id] to be applied to the generated embed.

#### `catalogSearch`
* *Type:* `string` | `Object`

> **NOTE:** Only supported for Brightcove Player versions 6.18.0 and newer.

A Video Cloud Catalog search to perform. This can be a simple string search or a  object that matches [the Catalog `getSearch` method][bc-search].

If a non-string value is given that is not serializable as JSON, this parameter will be ignored.

For example, this:

```js
brightcovePlayerLoader({
  // ...
  catalogSearch: 'some search term'
});
```

...or:

```js
brightcovePlayerLoader({
  // ...
  catalogSearch: {
    q: 'some search term',
    limit: 10
  }
});
```

#### `catalogSequence`
* *Type:* `Array` | `Object`

> **NOTE:** Only supported for Brightcove Player versions 6.18.0 and newer.

A Video Cloud Catalog sequence to perform. See [the Catalog `getLazySequence` method documentation][bc-sequence] for more.

If a non-string value is given that is not serializable as JSON, this parameter will be ignored.

For example, this:

```js
brightcovePlayerLoader({
  // ...
  catalogSequence: [{
    type: 'search',
    id: {
      q: 'some search term',
      limit: 10
    }
  }, {
    type: 'video',
    id: '1234567890'
  }, {
    type: 'playlist',
    id: '0987654321'
  }]
});
```

#### `deliveryConfigId`
* *Type:* `string`

The Dynamic Delivery Rules Config ID to be applied to the generated embed.

#### `embedId`
* *Type:* `string`
* *Default:* `'default'`

The Brightcove Player [embed ID][bc-embed-id] for the player. The default value is correct for most users.

#### `embedOptions`
* *Type:* `Object`

Used to provide certain options for embed generation. These include:

##### `embedOptions.pip`
* *Type:* `boolean`
* *Default:* `false`

If `true`, will wrap the embed in a `<div class="vjs-pip-container">` element. This should be used when you need support for [the Brightcove Picture-in-Picture plugin][bc-pip].

##### `embedOptions.playlist`
* *Type:* `boolean` | `Object`
* *Default:* `false`

For in-page embeds, if `true`, will add a `<div class="vjs-playlist">` element after the embed. This should be used when you need support for [the Brightcove Playlist UI plugin][bc-playlists].

Also for in-page embeds, our legacy playlist UI plugin used a `<ul>` element instead of a `<div>`. You can pass an object with `legacy: true` here to use a `<ul>`.

For iframe embeds, this parameter will be ignored.

##### `embedOptions.responsive`
* *Type:* `boolean` | `Object`
* *Default:* `false`

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

- `aspectRatio`: A string can be used to customize the aspect ratio to a value other than 16:9 (e.g., `'4:3'` or `'16:10'`). Any aspect ratio can be used - not just those supported by Video.js.
- `iframeHorizontalPlaylist`: For iframe players configured with a horizontal playlist, set to `true` to adjust the sizing of the responsive wrapper element to accommodate the additional height. This option is ignored for in-page players as they are styled independently from their associated playlist.
- `maxWidth`: A string used to restrain the maximum width of the player. This should use CSS units, such as pixels (e.g., `'960px'`).

##### `embedOptions.tagName`
* *Type:* `string`
* *Default:* `'video-js'`

Used to customize the embed element's tag name. This parameter's value must be one of:

- `'video-js'` or `brightcovePlayerLoader.EMBED_TAG_NAME_VIDEOJS`: This value is the default and is supported only by Brightcove Player v6.11.0 and higher.
- `'video'` or `brightcovePlayerLoader.EMBED_TAG_NAME_VIDEO`: This value may be used when support for Brightcove Player versions earlier than v6.11.0.

This option is only supported when `embedType` is `'in-page'`; it is ignored  when `embedType` is `'iframe'`.

##### `embedOptions.unminified`
* *Type:* `boolean`
* *Default:* `false`

If `true`, will use the un-minified version of the player. This can be useful for debugging purposes, but comes at a cost of a larger player download. _Not recommended for production!_

#### `embedType`
* *Type:* `string`
* *Default:* `'in-page'`

The [embed code type][bc-embed-code-type] to produce. This parameter's value must be one of the following:

* `'in-page'` or `brightcovePlayerLoader.EMBED_TYPE_IN_PAGE`: Also referred to as the advanced embed code, this injects the player directly into the top-level web page.
* `'iframe'` or `brightcovePlayerLoader.EMBED_TYPE_IFRAME`: Also referred to as the basic embed code, this injects the player as an `<iframe>` element.

#### `onEmbedCreated`
* *Type:* `Function(Element)`

A callback used to customize the embed element (either `video-js` element or an `iframe` element) *before* it is inserted into the DOM or customized as a result of `embedOptions` and before the player is downloaded and initialized.

The embed element may be mutated or, if this callback returns an element, that element will be used as the embed element.

Potential use-cases are adding/removing attributes or adding child elements, such as sources or tracks.

#### `onFailure`
* *Type:* `Function(Error)`

A callback function which allows handling of failures when `Promise` is not available or not desired. Passing this function will _prevent_ a `Promise` from being returned.

It gets a single `Error` object as an argument. The return value of this function is ignored.

#### `onSuccess`
* *Type:* `Function(Object)`

A callback function which allows handling of successes when `Promise` is not available or not desired. Passing this function will _prevent_ a `Promise` from being returned.

It gets a single "success object" as an argument. The return value of this function is ignored.

#### `options`
* *Type:* `Object`

A [Video.js options object][vjs-options] to pass during the player creation process. These options will take precedence over any settings specified in the Brightcove Player configuration.

> **NOTE:** _Cannot be used with iframe embeds!_

#### `playerUrl`
* *Type:* `string`

If you host the player that you are trying to load yourself, and you don't want to load the player from brightcove, pass the url for the player here.
> Note: iframes should resolve to an HTML page and other embeds should point to a JavaScript file.

#### `playerId`
* *Type:* `string`
* *Default:* `'default'`

A Brightcove Player ID.

#### `playlistId`
* *Type:* `string` | `number`

A Video Cloud video ID or [reference ID][bc-ref-id].

#### `playlistVideoId`
* *Type:* `string` | `number`

A Video Cloud video ID that would be found in the resulting playlist specified by `playlistId`. This parameter is ignored if `playlistId` is missing.

#### `poster`
* *Type:* `string`

A URL to a poster image to override that returned by the Playback API.

This option is only supported when `embedType` is `'in-page'`; it is ignored  when `embedType` is `'iframe'`.

#### `Promise`
* *Type:* `Function(Function)`
* *Default:* `window.Promise`

Used to explicitly provide a `Promise` implementation. If provided, this will be used in lieu of any global `Promise`.

#### `refNode`\*
* **REQUIRED**
* *Type:* `Element` | `string`

The DOM element into which the player will be embedded. If not provided as a DOM element, it can be provided as a string, which will be passed to `document.querySelector`.

#### `refNodeInsert`
* *Type:* `string`
* *Default:* `'append'`

The manner in which the player will be inserted relative to the reference DOM element (specified by `refNode`). This parameter's value must be one of the following:

* `'append'` or `brightcovePlayerLoader.REF_NODE_INSERT_APPEND`: The player will be the last child of the reference node.
* `'prepend'` or `brightcovePlayerLoader.REF_NODE_INSERT_PREPEND`: The player will be the first child of the reference node.
* `'before'` or `brightcovePlayerLoader.REF_NODE_INSERT_BEFORE`: The player will be previous sibling of the reference node.
* `'after'` or `brightcovePlayerLoader.REF_NODE_INSERT_AFTER`: The player will be the next sibling after the reference node.
* `'replace'` or `brightcovePlayerLoader.REF_NODE_INSERT_REPLACE`: The reference node will be removed and replaced by the player.

#### `videoId`
* *Type:* `string` | `number`

A Video Cloud video ID or reference ID.

### Constants
The library exposes several constants attached to the main library function, `brightcovePlayerLoader`. Most can be used for parameter values and are mentioned under the relevant headings, but collected here for reference as well:

Constant                  | Relevant Parameter
--------------------------|-------------------
`EMBED_TAG_NAME_VIDEO`    | `embedOptions.tagName`
`EMBED_TAG_NAME_VIDEOJS`  | `embedOptions.tagName`
`EMBED_TYPE_IN_PAGE`      | `embedType`
`EMBED_TYPE_IFRAME`       | `embedType`
`REF_NODE_INSERT_APPEND`  | `refNodeInsert`
`REF_NODE_INSERT_PREPEND` | `refNodeInsert`
`REF_NODE_INSERT_BEFORE`  | `refNodeInsert`
`REF_NODE_INSERT_AFTER`   | `refNodeInsert`
`REF_NODE_INSERT_REPLACE` | `refNodeInsert`
`VERSION`                 | n/a

### Base URL
By default, the base URL used is the Brightcove CDN. However, for some non-production cases and testing, you may want to override the base URL. This can be achieved via a call to the `setBaseUrl` function:

```js
brightcovePlayerLoader.setBaseUrl('https://localhost:9999/');
```

[bc-ad-conf-id]: https://support.brightcove.com/video-cloud-ssai-ad-config-api
[bc-app-id]: https://support.brightcove.com/adding-application-id-player-embed-code
[bc-embed-code-type]: https://support.brightcove.com/choosing-correct-embed-code
[bc-embed-id]: https://support.brightcove.com/guide-embed-apis
[bc-pip]: https://support.brightcove.com/picture-picture-plugin-aka-floating-or-pinned
[bc-playlists]: https://support.brightcove.com/implementing-playlists
[bc-search]: https://support.brightcove.com/player-catalog#getSearch_method
[bc-sequence]: https://support.brightcove.com/player-catalog#getSequence_method
[bc-ref-id]: https://support.brightcove.com/using-reference-ids
[bc-responsive-iframe]: https://support.brightcove.com/responsive-sizing-brightcove-player#iframe_example
[vjs-options]: http://docs.videojs.com/tutorial-options.html
[vjs-player]: http://docs.videojs.com/player
[webpack-plugin]: https://github.com/brightcove/player-loader-webpack-plugin
