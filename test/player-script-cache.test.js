import QUnit from 'qunit';
import playerScriptCache from '../src/player-script-cache';

QUnit.module('playerScriptCache', function(hooks) {

  hooks.afterEach(function() {
    playerScriptCache.clear();
  });

  QUnit.test('key', function(assert) {
    assert.strictEqual(playerScriptCache.key({}), '*_undefined_undefined');
    assert.strictEqual(playerScriptCache.key({playerId: '1', embedId: '2'}), '*_1_2');
    assert.strictEqual(playerScriptCache.key({accountId: '0', playerId: '1', embedId: '2'}), '0_1_2');
  });

  QUnit.test('store/has/get', function(assert) {
    const a = {};
    const b = {playerId: '1', embedId: '2'};
    const c = {accountId: '0', playerId: '1', embedId: '2'};

    assert.notOk(playerScriptCache.has(a));
    playerScriptCache.store(a);
    assert.ok(playerScriptCache.has(a));
    assert.strictEqual(playerScriptCache.get(a), '');

    assert.notOk(playerScriptCache.has(b));
    playerScriptCache.store(b);
    assert.ok(playerScriptCache.has(b));
    assert.strictEqual(playerScriptCache.get(b), '');

    assert.notOk(playerScriptCache.has(c));
    playerScriptCache.store(c);
    assert.ok(playerScriptCache.has(c));
    assert.strictEqual(playerScriptCache.get(c), 'https://players.brightcove.net/0/1_2/index.min.js');
  });

  QUnit.test('clear', function(assert) {
    const a = {playerId: '1', embedId: '2'};
    const b = {accountId: '0', playerId: '1', embedId: '2'};

    playerScriptCache.store(a);
    playerScriptCache.store(b);
    playerScriptCache.clear();

    assert.notOk(playerScriptCache.has(a));
    assert.notOk(playerScriptCache.has(b));
  });

  QUnit.test('forEach', function(assert) {
    const a = {playerId: '1', embedId: '2'};
    const b = {accountId: '0', playerId: '1', embedId: '2'};
    const iterations = [];

    playerScriptCache.store(a);
    playerScriptCache.store(b);
    playerScriptCache.forEach((value, key) => {
      iterations.push([value, key]);
    });

    assert.deepEqual(iterations, [
      ['', '*_1_2'],
      ['https://players.brightcove.net/0/1_2/index.min.js', '0_1_2']
    ]);
  });
});
