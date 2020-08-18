$(function() {

  window.players = {};

  var currentPageUrl = window.location.href.split('?')[0];
  var embedCount;
  var defaults;
  var refNodeRoot = $('#ref-node-root');
  var form = $('#embed-it');

  var paramFields = {
    accountId: $('#account-id'),
    adConfigId: $('#ad-config-id'),
    applicationId: $('#app-id'),
    deliveryConfigId: $('#delivery-config-id'),
    embedId: $('#embed-id'),
    embedType: $('#embed-type'),
    playerId: $('#player-id'),
    mediaType: $('#media-type'),
    mediaValue: $('#media-value'),
    options: $('#vjs-options'),
    poster: $('#poster-value')
  };

  var allowedParams = {
    accountId: 1,
    adConfigId: 1,
    applicationId: 1,
    catalogSearch: 1,
    catalogSequence: 1,
    deliveryConfigId: 1,
    embedId: 1,
    embedOptions: {
      pip: 1,
      playlist: {
        legacy: 1
      },
      responsive: {
        aspectRatio: 1,
        iframeHorizontalPlaylist: 1,
        maxWidth: 1
      },
      tagName: 1,
      unminified: 1
    },
    embedType: 1,
    playerId: 1,
    playlistId: 1,
    poster: 1,
    videoId: 1
  };

  var embedOptionsFields = {
    aspectRatio: $('#eo-resp-ar'),
    iframeHorizontalPlaylist: $('#eo-resp-ihp'),
    maxWidth: $('#eo-resp-mw'),
    pip: $('#eo-pip'),
    playlist: $('#eo-playlist'),
    responsive: $('#eo-resp'),
    tagName: $('#eo-tag-name'),
    unminified: $('#eo-unmin')
  };

  function isObj(v) {
    return Object.prototype.toString.call(v) === '[object Object]';
  }

  function parseFields(fields) {
    return Object.keys(fields).reduce(function(accum, key) {
      var field = fields[key];

      if (field.is(':checkbox')) {
        accum[key] = field.is(':checked');
      } else {
        accum[key] = (field.val() || field.attr('placeholder') || '').trim();
      }

      return accum;
    }, {});
  }

  function normalizeParams(params) {

    // Normalize media type/value
    if (params.mediaType && params.mediaValue) {
      try {
        params[params.mediaType] = JSON.parse(params.mediaValue);
      } catch (x) {
        params[params.mediaType] = params.mediaValue;
      }
    }

    delete params.mediaType;
    delete params.mediaValue;

    // Normalize Video.js options
    if (params.options) {
      try {
        params.options = JSON.parse(params.options);
      } catch (x) {
        console.warn('Ignoring invalid JSON in Video.js options!');
        console.error(x);
      }
    }

    if (!params.options || typeof params.options !== 'object') {
      delete params.options;
    }

    // Normalize embedOptions
    var eo = params.embedOptions;

    if (eo.playlist === 'on') {
      eo.playlist = true;
    } else if (eo.playlist === 'legacy') {
      eo.playlist = {legacy: true};
    } else {
      eo.playlist = false;
    }

    if (eo.responsive) {
      if (eo.iframeHorizontalPlaylist || eo.maxWidth || eo.aspectRatio !== '16:9') {
        eo.responsive = {
          aspectRatio: eo.aspectRatio
        };

        if (eo.iframeHorizontalPlaylist && params.embedType === 'iframe') {
          eo.responsive.iframeHorizontalPlaylist = true;
        }

        if (eo.maxWidth) {
          eo.responsive.maxWidth = eo.maxWidth;
        }
      }
    }

    delete eo.aspectRatio;
    delete eo.iframeHorizontalPlaylist;
    delete eo.maxWidth;

    return params;
  }

  function filterParams(params, allowed) {
    allowed = allowed || allowedParams;

    Object.keys(params).forEach(function(key) {
      if (!allowed.hasOwnProperty(key)) {
        delete params[key];
      } else if (isObj(params[key]) && isObj(allowed[key])) {
        params[key] = filterParams(params[key], allowed[key]);
      }
    });

    return params;
  }

  function readParams() {
    var params = parseFields(paramFields);

    params.embedOptions = parseFields(embedOptionsFields);

    normalizeParams(params);

    return params;
  }

  function removeDefaults(params, customDefaults) {
    customDefaults = customDefaults || defaults;

    Object.keys(customDefaults).forEach(function(key) {
      if (customDefaults.hasOwnProperty(key) && params[key] === customDefaults[key]) {
        delete params[key];
      }
    });

    if (params.embedOptions && customDefaults.embedOptions) {
      removeDefaults(params.embedOptions, customDefaults.embedOptions);
      if (!Object.keys(params.embedOptions).length) {
        delete params.embedOptions;
      }
    }

    return params;
  }

  function createEmbed(params) {
    var refNode = $('<div class="list-group-item"></div>');

    embedCount += 1;

    refNode.append([
      '<p>',
        '<a class="btn btn-secondary btn-remove-player" href="#">Remove</a>',
        ' ',
        '<a class="btn btn-secondary btn-toggle-params" href="#" aria-expanded="false" aria-controls="toggle-params-' + embedCount + '" data-toggle="collapse" data-target="#toggle-params-' + embedCount + '">Params</a>',
        ' ',
        '<a class="btn btn-secondary btn-toggle-share" href="#" aria-expanded="false" aria-controls="toggle-share-' + embedCount + '" data-toggle="collapse" data-target="#toggle-share-' + embedCount + '">Share</a>',
      '</p>',
      '<div id="toggle-params-' + embedCount + '" class="collapse">',
        '<pre class="alert alert-secondary"><code>',
          JSON.stringify(params, null, 2),
        '</code></pre>',
      '</div>',
      '<div id="toggle-share-' + embedCount + '" class="collapse">',
        '<div class="alert alert-secondary">',
          '<p>Copy the following URL to share this page with this embed!</p>',
          '<code>',
            currentPageUrl, '?params=', window.encodeURIComponent(JSON.stringify(params)),
          '</code>',
        '</div>',
      '</div>'
    ].join(''));

    refNodeRoot.append(refNode);

    params.refNode = refNode.get(0);

    console.log('creating embed with params', params);

    brightcovePlayerLoader(params).then(function(success) {
      if (success.type !== brightcovePlayerLoader.EMBED_TYPE_IN_PAGE) {
        return;
      }

      var player = success.ref;

      window.players[(params.playerId || 'default') + '_' + embedCount] = player;
      refNode.find('.btn-remove-player').data({player});

      // When an in-page player is disposed, we need to clean up its
      // surrounding DOM elements. This needs to wait a tick, because
      // the player will remove its own DOM element first.
      player.on('dispose', function() {
        var listGroupItem = $(player.el()).closest('.list-group-item');

        delete window.players[ + embedCount];

        window.setTimeout(function() {
          if (listGroupItem.length) {
            listGroupItem.remove();
          }
        }, 1);
      });

      var bc = window.bc;
      var major = bc && bc.VERSION ? Number(bc.VERSION.split('.')[0]) : 0;

      if (major < 6) {
        $(player.el()).before('<div class="alert alert-warning" role="alert">This player appears to be an unsupported version! Brightcove Player Loader supports v6.0.0 and higher for in-page embeds.</div>');
      }
    }, function(err) {
      refNode.append('<div class="alert alert-danger" role="alert">' + err + '</div>');
    });
  }

  embedCount = 0;
  defaults = readParams();

  delete defaults.accountId;
  console.log('defaults', defaults);

  try {
    createEmbed(filterParams(JSON.parse(Qs.parse(window.location.search.substring(1)).params)));
  } catch (x) {}

  form.on('submit', function(e) {
    e.preventDefault();
    createEmbed(removeDefaults(readParams()));
  });

  refNodeRoot.on('click', '.btn-remove-player', function(e) {
    var btn = $(this);

    e.preventDefault();

    // In-page players need to be disposed, iframe players can simply be
    // removed from the DOM.
    if (btn.data('player')) {
      btn.data('player').dispose();
    } else {
      btn.closest('.list-group-item').remove();
    }

    // If there are no more players on the page, go ahead and reset the
    // global environment.
    if (!Object.keys(window.players).length) {
      brightcovePlayerLoader.reset();
      console.log('reset global state');
    }
  });
});
