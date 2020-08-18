import document from 'global/document';
import QUnit from 'qunit';
import createEmbed from '../src/create-embed';

QUnit.module('create-embed', function(hooks) {

  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
  });

  hooks.afterEach(function() {
    this.fixture = null;
  });

  QUnit.module('in-page');

  QUnit.test('creates an in-page embed by default', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append'
    });

    assert.strictEqual(embed.nodeName, 'VIDEO-JS', 'created an in-page embed');
    assert.strictEqual(embed.parentNode, this.fixture, 'appended it to the fixture');
    assert.ok(embed.hasAttribute('controls'), 'has controls attribute');
    assert.ok(embed.classList.contains('video-js'), 'has video-js class');
    assert.notOk(embed.hasAttribute('data-account'), 'we never include data-account because we want to init players ourselves');
    assert.notOk(embed.hasAttribute('data-player'), 'we never include data-player because we want to init players ourselves');
    assert.notOk(embed.hasAttribute('data-embed'), 'we never include data-embed because we want to init players ourselves');
  });

  QUnit.test('populates certain attributes from params', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      adConfigId: 'ad-conf-id',
      applicationId: 'app-id',
      catalogSearch: 'cat-search',
      catalogSequence: 'cat-seq',
      deliveryConfigId: 'conf-id',
      playlistId: 'pl-id',
      playlistVideoId: 'pl-v-id',
      poster: 'pstr',
      videoId: 'v-id'
    });

    assert.strictEqual(embed.getAttribute('data-ad-config-id'), 'ad-conf-id', 'has correct data-ad-config-id attribute');
    assert.strictEqual(embed.getAttribute('data-application-id'), 'app-id', 'has correct data-application-id attribute');
    assert.strictEqual(embed.getAttribute('data-catalog-search'), 'cat-search', 'has correct data-catalog-search attribute');
    assert.strictEqual(embed.getAttribute('data-catalog-sequence'), 'cat-seq', 'has correct data-catalog-sequence attribute');
    assert.strictEqual(embed.getAttribute('data-delivery-config-id'), 'conf-id', 'has correct data-delivery-config-id attribute');
    assert.strictEqual(embed.getAttribute('data-playlist-id'), 'pl-id', 'has correct data-playlist-id attribute');
    assert.strictEqual(embed.getAttribute('data-playlist-video-id'), 'pl-v-id', 'has correct data-playlist-video-id attribute');
    assert.strictEqual(embed.getAttribute('poster'), 'pstr', 'has correct data-playlist-video-id attribute');
    assert.strictEqual(embed.getAttribute('data-video-id'), 'v-id', 'has correct data-video-id attribute');
  });

  QUnit.test('JSON-encodes certain attributes', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      catalogSearch: {q: 'cat-search'},
      catalogSequence: [{q: 'cat-seq-1'}, {q: 'cat-seq-2'}]
    });

    assert.strictEqual(embed.getAttribute('data-catalog-search'), '{"q":"cat-search"}', 'has correct data-catalog-search attribute');
    assert.strictEqual(embed.getAttribute('data-catalog-sequence'), '[{"q":"cat-seq-1"},{"q":"cat-seq-2"}]', 'has correct data-catalog-sequence attribute');
  });

  QUnit.module('iframe');

  QUnit.test('create an iframe embed', function(assert) {
    const embed = createEmbed({
      embedType: 'iframe',
      refNode: this.fixture,
      refNodeInsert: 'append'
    });

    assert.strictEqual(embed.nodeName, 'IFRAME', 'created an iframe embed');
    assert.strictEqual(embed.parentNode, this.fixture, 'appended it to the fixture');
    assert.strictEqual(embed.getAttribute('allow'), 'autoplay;encrypted-media;fullscreen', 'has correct allow attribute');
    assert.ok(embed.hasAttribute('allowfullscreen'), 'has allowfullscreen attribute');
  });

  QUnit.test('populates certain query string parameters from params', function(assert) {
    const embed = createEmbed({
      embedType: 'iframe',
      refNode: this.fixture,
      refNodeInsert: 'append',
      applicationId: 'app-id',
      catalogSearch: 'cat-search',
      catalogSequence: 'cat-seq',
      playlistId: 'pl-id',
      playlistVideoId: 'pl-v-id',
      videoId: 'v-id'
    });

    const src = embed.getAttribute('src');

    assert.ok(src.indexOf('applicationId=app-id') > -1, 'has correct applicationId param');
    assert.ok(src.indexOf('catalogSearch=cat-search') > -1, 'has correct catalogSearch param');
    assert.ok(src.indexOf('catalogSequence=cat-seq') > -1, 'has correct catalogSequence param');
    assert.ok(src.indexOf('playlistId=pl-id') > -1, 'has correct playlistId param');
    assert.ok(src.indexOf('playlistVideoId=pl-v-id') > -1, 'has correct playlistVideoId param');
    assert.ok(src.indexOf('videoId=v-id') > -1, 'has correct videoId param');
  });

  QUnit.test('JSON-encodes certain query string parameters', function(assert) {
    const embed = createEmbed({
      embedType: 'iframe',
      refNode: this.fixture,
      refNodeInsert: 'append',
      catalogSearch: {q: 'cat-search'},
      catalogSequence: [{q: 'cat-seq-1'}, {q: 'cat-seq-2'}]
    });

    const src = embed.getAttribute('src');

    assert.ok(src.indexOf('catalogSearch=%7B%22q%22%3A%22cat-search%22%7D') > -1, 'has correct catalogSearch param');
    assert.ok(src.indexOf('catalogSequence=%5B%7B%22q%22%3A%22cat-seq-1%22%7D%2C%7B%22q%22%3A%22cat-seq-2%22%7D%5D') > -1, 'has correct catalogSequence param');
  });

  QUnit.module('embed insertion', {
    beforeEach() {
      this.p = document.createElement('p');

      // Add a paragraph element so we can verify that the various insertion
      // methods work properly.
      this.fixture.appendChild(this.p);
    },
    afterEach() {
      this.p = null;
    }
  });

  QUnit.test('"append" makes the embed the last child of the refNode', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append'
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the correct parentNode');
    assert.strictEqual(embed, this.fixture.lastChild, 'was appended');
  });

  QUnit.test('"prepend" makes the embed the first child of the refNode', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'prepend'
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the correct parentNode');
    assert.strictEqual(embed, this.fixture.firstChild, 'was prepended');
  });

  QUnit.test('"before" makes the embed the previous sibling of the refNode', function(assert) {
    const embed = createEmbed({
      refNode: this.p,
      refNodeInsert: 'before'
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the correct parentNode');
    assert.strictEqual(embed.nextSibling, this.p, 'was added before p');
  });

  QUnit.test('"after" makes the embed the next sibling of the refNode', function(assert) {
    const embed = createEmbed({
      refNode: this.p,
      refNodeInsert: 'after'
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the correct parentNode');
    assert.strictEqual(embed.previousSibling, this.p, 'was added after p');
  });

  QUnit.test('"replace" makes the embed replace the refNode', function(assert) {
    const embed = createEmbed({
      refNode: this.p,
      refNodeInsert: 'replace'
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the correct parentNode');
    assert.strictEqual(this.p.parentNode, null, 'p was removed');
  });

  QUnit.module('embed options', {
    before() {

      this.isPipContainer = (assert, el) => {
        assert.ok(el.nodeName, 'DIV', 'is a div');
        assert.ok(el.classList.contains('vjs-pip-container'), 'is a pip container');
      };

      this.nextSiblingIsPlaylistContainer = (assert, embed) => {
        assert.strictEqual(embed.nextSibling.nodeName, 'DIV', 'is a div');
        assert.ok(embed.nextSibling.classList.contains('vjs-playlist'), 'is a playlist container');
      };

      this.hasResponsiveStyles = (assert, embed) => {
        assert.strictEqual(embed.style.position, 'absolute', 'embed has the expected style.position');
        assert.strictEqual(embed.style.top, '0px', 'embed has the expected style.top');
        assert.strictEqual(embed.style.right, '0px', 'embed has the expected style.right');
        assert.strictEqual(embed.style.bottom, '0px', 'embed has the expected style.bottom');
        assert.strictEqual(embed.style.left, '0px', 'embed has the expected style.left');
        assert.strictEqual(embed.style.width, '100%', 'embed has the expected style.width');
        assert.strictEqual(embed.style.height, '100%', 'embed has the expected style.height');
      };

      this.isResponsiveContainer = (assert, el, paddingTop = '56.25%', maxWidth = '100%') => {
        assert.strictEqual(el.nodeName, 'DIV', 'is a div');
        assert.strictEqual(el.style.paddingTop, paddingTop, 'has the expected style.paddingTop');
        assert.strictEqual(el.parentNode.nodeName, 'DIV', 'parent is a div');
        assert.strictEqual(el.parentNode.style.position, 'relative', 'parent has the expected style.position');
        assert.strictEqual(el.parentNode.style.display, 'block', 'parent has the expected style.display');
        assert.strictEqual(el.parentNode.style.maxWidth, maxWidth, 'parent has the expected style.maxWidth');
      };
    }
  });

  QUnit.test('pip', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        pip: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.isPipContainer(assert, embed.parentNode);
  });

  QUnit.test('playlists', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        playlist: true
      }
    });

    assert.strictEqual(embed.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.nextSiblingIsPlaylistContainer(assert, embed);
  });

  QUnit.test('responsive', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        responsive: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.hasResponsiveStyles(assert, embed);
    this.isResponsiveContainer(assert, embed.parentNode);
  });

  QUnit.test('responsive custom values', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        responsive: {
          aspectRatio: '4:3',
          maxWidth: '960px'
        }
      }
    });

    assert.strictEqual(embed.parentNode.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.hasResponsiveStyles(assert, embed);
    this.isResponsiveContainer(assert, embed.parentNode, '75%', '960px');
  });

  QUnit.test('pip + playlists', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        pip: true,
        playlist: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.nextSiblingIsPlaylistContainer(assert, embed);
    this.isPipContainer(assert, embed.parentNode);
  });

  QUnit.test('pip + responsive', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        pip: true,
        responsive: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.hasResponsiveStyles(assert, embed);
    this.isResponsiveContainer(assert, embed.parentNode);
    this.isPipContainer(assert, embed.parentNode.parentNode.parentNode);
  });

  QUnit.test('playlists + responsive', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        playlist: true,
        responsive: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.nextSiblingIsPlaylistContainer(assert, embed);
    this.hasResponsiveStyles(assert, embed);
    this.isResponsiveContainer(assert, embed.parentNode);
  });

  QUnit.test('pip + playlists + responsive', function(assert) {
    const embed = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        pip: true,
        playlist: true,
        responsive: true
      }
    });

    assert.strictEqual(embed.parentNode.parentNode.parentNode.parentNode, this.fixture, 'has the expected relationship to the fixture');
    this.nextSiblingIsPlaylistContainer(assert, embed);
    this.hasResponsiveStyles(assert, embed);
    this.isResponsiveContainer(assert, embed.parentNode);
    this.isPipContainer(assert, embed.parentNode.parentNode.parentNode);
  });

  QUnit.test('tagName', function(assert) {
    const embedOne = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append'
    });

    assert.strictEqual(embedOne.tagName, 'VIDEO-JS', 'is a video-js element');

    const embedTwo = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        tagName: 'video-js'
      }
    });

    assert.strictEqual(embedTwo.tagName, 'VIDEO-JS', 'is a video-js element');

    const embedThree = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        tagName: 'video'
      }
    });

    assert.strictEqual(embedThree.tagName, 'VIDEO', 'is a video element');

    const embedFour = createEmbed({
      refNode: this.fixture,
      refNodeInsert: 'append',
      embedOptions: {
        tagName: 'div'
      }
    });

    assert.strictEqual(embedFour.tagName, 'DIV', 'WILL create invalid embeds as it is not a public function');
  });

  QUnit.module('onEmbedCreated');

  QUnit.test('a callback can be provided to customize the embed', function(assert) {
    const embed = createEmbed({
      onEmbedCreated(el) {
        el.id = 'derp';
      },
      refNode: this.fixture,
      refNodeInsert: 'append'
    });

    assert.strictEqual(embed.nodeName, 'VIDEO-JS', 'the embed is the correct element');
    assert.strictEqual(embed.id, 'derp', 'the embed has the correct ID');
  });

});
