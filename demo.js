$(function() {

  window.players = {};

  var refNodeRoot = $('#ref-node-root');
  var form = $('#embed-it');

  var paramFields = {
    accountId: $('#account-id'),
    applicationId: $('#app-id'),
    embedId: $('#embed-id'),
    embedType: $('#embed-type'),
    playerId: $('#player-id'),
    mediaType: $('#media-type'),
    mediaValue: $('#media-value'),
    options: $('#vjs-options')
  };

  var embedOptionsFields = {
    aspectRatio: $('#eo-resp-ar'),
    maxWidth: $('#eo-resp-mw'),
    pip: $('#eo-pip'),
    playlist: $('#eo-playlist'),
    responsive: $('#eo-resp'),
    tagName: $('#eo-tag-name'),
    unminified: $('#eo-unmin')
  };

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

    // Normalize responsive embed wrapper
    if (params.embedOptions.responsive) {
      if (params.embedOptions.maxWidth || params.embedOptions.aspectRatio !== '16:9') {
        params.embedOptions.responsive = {
          aspectRatio: params.embedOptions.aspectRatio
        };

        if (params.embedOptions.maxWidth) {
          params.embedOptions.responsive.maxWidth = params.embedOptions.maxWidth;
        }
      }
    }

    delete params.embedOptions.aspectRatio;
    delete params.embedOptions.maxWidth;

    return params;
  }

  function readParams() {
    var params = parseFields(paramFields);

    params.embedOptions = parseFields(embedOptionsFields);

    normalizeParams(params);

    return params;
  }

  var defaults = readParams();

  delete defaults.accountId;
  console.log('defaults...', defaults);

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

  var submitCount = 0;

  form.on('submit', function(e) {
    e.preventDefault();

    var params = removeDefaults(readParams());

    submitCount++;

    var refNode = $('<div class="list-group-item"></div>');

    refNode.append([
      '<p>',
        '<a class="btn btn-secondary btn-remove-player" href="#">Remove</a>',
        ' ',
        '<a class="btn btn-secondary btn-toggle-params" href="#" aria-expanded="false" aria-controls="toggle-params-' + submitCount + '" data-toggle="collapse" data-target="#toggle-params-' + submitCount + '">Params</a>',
      '</p>',
      '<div id="toggle-params-' + submitCount + '" class="collapse">',
        '<pre class="alert alert-secondary"><code>',
          JSON.stringify(params, null, 2),
        '</code></pre>',
      '</div>'
    ].join(''));

    refNodeRoot.append(refNode);

    params.refNode = refNode.get(0);

    console.log('params...', params);

    brightcovePlayerLoader(params).then(function(success) {
      if (success.type !== brightcovePlayerLoader.EMBED_TYPE_IN_PAGE) {
        return;
      }

      var player = success.ref;

      window.players[(params.playerId || 'default') + '_' + submitCount] = player;
      refNode.find('.btn-remove-player').data({player});

      // When an in-page player is disposed, we need to clean up its
      // surrounding DOM elements. This needs to wait a tick, because
      // the player will remove its own DOM element first.
      player.on('dispose', function() {
        var listGroupItem = $(player.el()).closest('.list-group-item');

        delete window.players[ + submitCount];

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
      console.log('reset global state...');
    }
  });
});
