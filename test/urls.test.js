import QUnit from 'qunit';
import urls from '../src/urls';

QUnit.module('urls');

QUnit.test('getUrl for in-page embed', function(assert) {
  const url = urls.getUrl({
    accountId: '1',
    playerId: '2',
    embedId: '3'
  });

  assert.strictEqual(url, 'https://players.brightcove.net/1/2_3/index.min.js', 'the URL is correct');
});

QUnit.test('getUrl for iframe embed', function(assert) {
  const url = urls.getUrl({
    accountId: '1',
    playerId: '2',
    embedId: '3',
    embedType: 'iframe'
  });

  assert.strictEqual(url, 'https://players.brightcove.net/1/2_3/index.html', 'the URL is correct');
});

QUnit.test('getUrl for iframe embed supports playlistId, playlistVideoId, and videoId as query parameters', function(assert) {
  const url = urls.getUrl({
    accountId: '1',
    playerId: '2',
    embedId: '3',
    embedType: 'iframe',
    playlistId: 'a',
    playlistVideoId: 'b',
    videoId: 'c'
  });

  assert.strictEqual(url, 'https://players.brightcove.net/1/2_3/index.html?playlistId=a&playlistVideoId=b&videoId=c', 'the URL is correct');
});

QUnit.test('getUrl for in-page embed DOES NOT support playlistId, playlistVideoId, and videoId as query parameters', function(assert) {
  const url = urls.getUrl({
    accountId: '1',
    playerId: '2',
    embedId: '3',
    playlistId: 'a',
    playlistVideoId: 'b',
    videoId: 'c'
  });

  assert.strictEqual(url, 'https://players.brightcove.net/1/2_3/index.min.js', 'the URL is correct');
});

QUnit.test('getUrl encodes all possible URL components', function(assert) {
  const url = urls.getUrl({
    accountId: ';',
    playerId: ',',
    embedId: '/',
    embedType: 'iframe',
    playlistId: '?',
    playlistVideoId: ':',
    videoId: '@'
  });

  assert.strictEqual(url, 'https://players.brightcove.net/%3B/%2C_%2F/index.html?playlistId=%3F&playlistVideoId=%3A&videoId=%40', 'the URL is correct');
});

QUnit.test('getUrl uses playerUrl if it exists', function(assert) {
  const url = urls.getUrl({playerUrl: 'something!'});

  assert.strictEqual(url, 'something!', 'the URL is correct');
});
