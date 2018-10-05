import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import brightcovePlayerLoader from '../src/';
import urls from '../src/urls';

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(
    typeof brightcovePlayerLoader,
    'function',
    'brightcovePlayerLoader is a function'
  );
});

QUnit.module('brightcove-player-loader', function(hooks) {
  const originalBaseUrl = urls.getBaseUrl();

  hooks.before(function() {
    urls.setBaseUrl(`${window.location.origin}/vendor/`);
  });

  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
  });

  hooks.afterEach(function() {
    brightcovePlayerLoader.reset();
  });

  hooks.after(function() {
    urls.setBaseUrl(originalBaseUrl);
  });

  QUnit.test('exposes several constant values', function(assert) {
    [
      'EMBED_TAG_NAME_VIDEO',
      'EMBED_TAG_NAME_VIDEOJS',
      'EMBED_TYPE_IN_PAGE',
      'EMBED_TYPE_IFRAME',
      'REF_NODE_INSERT_APPEND',
      'REF_NODE_INSERT_PREPEND',
      'REF_NODE_INSERT_BEFORE',
      'REF_NODE_INSERT_AFTER',
      'REF_NODE_INSERT_REPLACE',
      'VERSION'
    ].forEach(k => {
      assert.ok(brightcovePlayerLoader.hasOwnProperty(k), `${k} exists`);
    });
  });

  QUnit.test('exposes several methods', function(assert) {
    [
      'getBaseUrl',
      'setBaseUrl',
      'reset'
    ].forEach(k => {
      assert.strictEqual(typeof brightcovePlayerLoader[k], 'function', `${k} is a function`);
    });
  });

  QUnit.test('default/minimal usage', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    })
      .then(success => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IN_PAGE, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref, window.videojs.players.derp, 'the expected player was passed through the Promise');
        done();
      })
      .catch(done);
  });

  QUnit.test('usage inpage & playerUrl', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      playerUrl: `${window.location.origin}/vendor/1/default_default/index.min.js`,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    }).then(success => {
      assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IN_PAGE, 'the expected embed type was passed through the Promise');
      assert.strictEqual(success.ref, window.videojs.players.derp, 'the expected player was passed through the Promise');
      done();
    }).catch(done);
  });

  QUnit.test('usage iframe & playerUrl', function(assert) {
    const done = assert.async();

    assert.expect(3);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedType: brightcovePlayerLoader.EMBED_TYPE_IFRAME,
      playerUrl: `${window.location.origin}/vendor/1/default_default/index.html`,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    }).then(success => {
      assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IFRAME, 'the expected embed type was passed through the Promise');
      assert.strictEqual(success.ref.nodeType, 1, 'it is a DOM node');
      assert.strictEqual(success.ref.parentNode, this.fixture, 'it is in the DOM where we expect it');
      done();
    }).catch(done);
  });

  QUnit.test('default/minimal usage - with refNode as string', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: '#qunit-fixture',
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    })
      .then(success => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IN_PAGE, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref, window.videojs.players.derp, 'the expected player was passed through the Promise');
        done();
      })
      .catch(done);
  });

  QUnit.test('default/minimal usage - with refNodeInsert as "replace"', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: '#qunit-fixture',
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    })
      .then(success => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IN_PAGE, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref, window.videojs.players.derp, 'the expected player was passed through the Promise');
        done();
      })
      .catch(done);
  });

  QUnit.test('default/minimal usage - with callbacks instead of Promises', function(assert) {
    const done = assert.async();

    assert.expect(3);

    const result = brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      },
      onFailure: () => {
        done();
      },
      onSuccess: (success) => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IN_PAGE, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref, window.videojs.players.derp, 'the expected player was passed through the Promise');
        assert.strictEqual(result, undefined, 'no Promise was returned');
        done();
      }
    });
  });

  QUnit.test('iframes resolve with a DOM element', function(assert) {
    const done = assert.async();

    assert.expect(3);

    brightcovePlayerLoader({
      accountId: '1',
      embedType: brightcovePlayerLoader.EMBED_TYPE_IFRAME,
      refNode: this.fixture,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      }
    })
      .then(success => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IFRAME, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref.nodeType, 1, 'it is a DOM node');
        assert.strictEqual(success.ref.parentNode, this.fixture, 'it is in the DOM where we expect it');
        done();
      })
      .catch(done);
  });

  QUnit.test('iframes resolve with a DOM element - with callbacks instead of Promises', function(assert) {
    const done = assert.async();

    assert.expect(4);

    const result = brightcovePlayerLoader({
      accountId: '1',
      embedType: brightcovePlayerLoader.EMBED_TYPE_IFRAME,
      refNode: this.fixture,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      },
      onFailure: () => {
        done();
      },
      onSuccess: (success) => {
        assert.strictEqual(success.type, brightcovePlayerLoader.EMBED_TYPE_IFRAME, 'the expected embed type was passed through the Promise');
        assert.strictEqual(success.ref.nodeType, 1, 'it is a DOM node');
        assert.strictEqual(success.ref.parentNode, this.fixture, 'it is in the DOM where we expect it');
        assert.strictEqual(result, undefined, 'no Promise was returned');
        done();
      }
    });
  });

  QUnit.test('does not re-download scripts it already has', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture
    })

      // When the first player download is completed, immediately embed the
      // same player again.
      .then(success => brightcovePlayerLoader({
        accountId: '1',
        refNode: this.fixture
      }))
      .then(success => {
        assert.strictEqual(this.fixture.querySelectorAll('script').length, 1, 'only one script was created');
        assert.strictEqual(this.fixture.querySelectorAll('.video-js').length, 2, 'but there are two players');
        done();
      })
      .catch(done);
  });

  QUnit.test('brightcovePlayerLoader.reset', function(assert) {
    const done = assert.async();
    let firstPlayer;

    assert.expect(14);

    brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture
    })
      .then(success => {
        firstPlayer = success.ref;

        return brightcovePlayerLoader({
          accountId: '1',
          playerId: '2',
          embedId: '3',
          refNode: this.fixture
        });
      })
      .then(success => {
        const a = firstPlayer;
        const b = success.ref;

        firstPlayer = null;

        assert.ok(window.bc, 'bc exists');
        assert.ok(window.videojs, 'videojs exists');
        assert.ok(window.bc.videojs, 'bc.videojs exists');
        assert.ok(window.bc.default_default, 'bc.default_default exists');
        assert.ok(window.bc.default_default.videojs, 'bc.default_default.videojs exists');
        assert.ok(window.bc['2_3'], 'bc.2_3 exists');
        assert.ok(window.bc['2_3'].videojs, 'bc.2_3.videojs exists');

        assert.strictEqual(a.el().parentNode, this.fixture, 'player A is in the DOM');
        assert.strictEqual(b.el().parentNode, this.fixture, 'player B is in the DOM');

        brightcovePlayerLoader.reset();

        assert.notOk(window.bc, 'bc is gone');
        assert.notOk(window.videojs, 'videojs is gone');

        assert.strictEqual(a.el(), null, 'player A is disposed');
        assert.strictEqual(b.el(), null, 'player B is disposed');
        assert.notOk(this.fixture.hasChildNodes(), 'no more players or scripts in the fixture');

        done();
      })
      .catch(done);
  });

  QUnit.module('error states');

  QUnit.test('accountId is required', function(assert) {
    assert.rejects(brightcovePlayerLoader(), new Error('accountId is required'));
  });

  QUnit.test('refNode must resolve to a node attached to the DOM', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1'
    }), new Error('refNode must resolve to a node attached to the DOM'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: true
    }), new Error('refNode must resolve to a node attached to the DOM'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: document.createElement('div')
    }), new Error('refNode must resolve to a node attached to the DOM'));
  });

  QUnit.test('embedType is missing or invalid', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedType: ''
    }), new Error('embedType is missing or invalid'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedType: 'asdf'
    }), new Error('embedType is missing or invalid'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedType: null
    }), new Error('embedType is missing or invalid'));
  });

  QUnit.test('cannot use options with an iframe embed', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedType: brightcovePlayerLoader.EMBED_TYPE_IFRAME,
      options: {}
    }), new Error('cannot use options with an iframe embed'));
  });

  QUnit.test('embedOptions.tagName is invalid', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedOptions: {
        tagName: 'doh'
      }
    }), new Error('embedOptions.tagName is invalid (value: "doh")'));
  });

  QUnit.test('embedOptions.responsive.aspectRatio must be in the "n:n" format', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedOptions: {
        responsive: {
          aspectRatio: 'asdf'
        }
      }
    }), new Error('embedOptions.responsive.aspectRatio must be in the "n:n" format (value: "asdf")'));
  });

  QUnit.test('refNodeInsert is missing or invalid', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      refNodeInsert: ''
    }), new Error('refNodeInsert is missing or invalid'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      refNodeInsert: 'asdf'
    }), new Error('refNodeInsert is missing or invalid'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      refNodeInsert: null
    }), new Error('refNodeInsert is missing or invalid'));
  });
});
