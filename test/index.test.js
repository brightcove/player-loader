import document from 'global/document';
import window from 'global/window';
import QUnit from 'qunit';
import {getGlobals, resetGlobalEnv} from './lib';
import brightcovePlayerLoader from '../src/';
import {getBaseUrl, setBaseUrl} from '../src/util';

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof brightcovePlayerLoader,
                     'function',
                     'brightcovePlayerLoader is a function');
});

QUnit.module('brightcove-player-loader', function(hooks) {
  const originalBaseUrl = getBaseUrl();

  hooks.before(function() {
    setBaseUrl('http://localhost:9999/test/fixtures/');
  });

  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
  });

  hooks.afterEach(function() {
    resetGlobalEnv();
  });

  hooks.after(function() {
    const globals = getGlobals();

    setBaseUrl(originalBaseUrl);

    /* eslint-disable no-console */
    if (console) {
      console.log(`Leaked ${globals.length} globals`);
      if (globals.length) {
        console.log(globals.join(', '));
      }
    }
    /* eslint-enable no-console */
  });

  QUnit.test('exposes several constant values', function(assert) {
    [
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

  QUnit.test('default/minimal usage', function(assert) {
    const done = assert.async();

    assert.expect(1);

    brightcovePlayerLoader({
      accountId: '1',
      onEmbedCreated(embed) {
        embed.id = 'derp';
      },
      refNode: this.fixture
    })
      .then(player => {
        assert.strictEqual(player, window.videojs.players.derp, 'the expected player was passed through the Promise');
        done();
      })
      .catch(done);
  });

  QUnit.test('iframes resolve with a DOM element', function(assert) {
    const done = assert.async();

    assert.expect(2);

    brightcovePlayerLoader({
      accountId: '1',
      embedType: brightcovePlayerLoader.EMBED_TYPE_IFRAME,
      onEmbedCreated(embed) {
        embed.id = 'derp';
      },
      refNode: this.fixture
    })
      .then(embed => {
        assert.strictEqual(embed.nodeType, 1, 'it is a DOM node');
        assert.strictEqual(embed.parentNode, this.fixture, 'it is in the DOM where we expect it');
        done();
      })
      .catch(done);
  });

  QUnit.module('error states');

  QUnit.test('accountId is required', function(assert) {
    assert.rejects(brightcovePlayerLoader(), new Error('accountId is required'));
  });

  QUnit.test('refNode is required', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1'
    }), new Error('refNode is required'));
  });

  QUnit.test('if refNode is not a string, it must be a DOM node with a parent', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: true
    }), new Error('if refNode is not a string, it must be a DOM node with a parent'));

    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: document.createElement('div')
    }), new Error('if refNode is not a string, it must be a DOM node with a parent'));
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

  QUnit.test('embedOptions.responsive.aspectRatio must be in the "n:n" format', function(assert) {
    assert.rejects(brightcovePlayerLoader({
      accountId: '1',
      refNode: this.fixture,
      embedOptions: {
        responsive: {
          aspectRatio: 'asdf'
        }
      }
    }), new Error('embedOptions.responsive.aspectRatio must be in the "n:n" format'));
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
