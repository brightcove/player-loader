import document from 'global/document';
import QUnit from 'qunit';
import sinon from 'sinon';
import brightcovePlayerLoader from '../src/';

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof brightcovePlayerLoader,
                     'function',
                     'brightcovePlayerLoader is a function');
});

QUnit.module('brightcove-player-loader', {

  beforeEach() {
    this.clock = sinon.useFakeTimers();
    this.fixture = document.getElementById('qunit-fixture');
  },

  afterEach() {
    if (this.player) {
      this.player.dispose();
    }
    this.clock.restore();
  }
});
