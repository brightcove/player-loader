import QUnit from 'qunit';
import * as cache from '../src/cache';

QUnit.module('cache', function(hooks) {

  hooks.afterEach(function() {
    cache.clear();
  });

  QUnit.test('key', function(assert) {
    assert.strictEqual(cache.key({}), '*_undefined_undefined');
    assert.strictEqual(cache.key({playerId: '1', embedId: '2'}), '*_1_2');
    assert.strictEqual(cache.key({accountId: '0', playerId: '1', embedId: '2'}), '0_1_2');
  });

  QUnit.test('store/has/get', function(assert) {
    const a = {};
    const b = {playerId: '1', embedId: '2'};
    const c = {accountId: '0', playerId: '1', embedId: '2'};

    assert.notOk(cache.has(a));
    cache.store(a);
    assert.ok(cache.has(a));
    assert.strictEqual(cache.get(a), '');

    assert.notOk(cache.has(b));
    cache.store(b);
    assert.ok(cache.has(b));
    assert.strictEqual(cache.get(b), '');

    assert.notOk(cache.has(c));
    cache.store(c);
    assert.ok(cache.has(c));
    assert.strictEqual(cache.get(c), 'https://players.brightcove.net/0/1_2/index.min.js');
  });

  QUnit.test('clear', function(assert) {
    const a = {playerId: '1', embedId: '2'};
    const b = {accountId: '0', playerId: '1', embedId: '2'};

    cache.store(a);
    cache.store(b);
    cache.clear();

    assert.notOk(cache.has(a));
    assert.notOk(cache.has(b));
  });

  QUnit.test('forEach', function(assert) {
    const a = {playerId: '1', embedId: '2'};
    const b = {accountId: '0', playerId: '1', embedId: '2'};
    const iterations = [];

    cache.store(a);
    cache.store(b);
    cache.forEach((value, key) => {
      iterations.push([value, key]);
    });

    assert.deepEqual(iterations, [
      ['', '*_1_2'],
      ['https://players.brightcove.net/0/1_2/index.min.js', '0_1_2']
    ]);
  });
});
