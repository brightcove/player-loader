# Brightcove Player Loader

An asynchronous script loader for the Brightcove Player.

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

## License

Apache-2.0. Copyright (c) Brightcove, Inc.


[videojs]: http://videojs.com/
