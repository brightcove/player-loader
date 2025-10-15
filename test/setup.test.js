import QUnit from 'qunit';
import {getWindow} from '../src/utils/environment';

// Global test setup to prevent page reloads during tests
QUnit.begin(() => {
  // Prevent page reloads during tests
  const window = getWindow();

  window.onbeforeunload = () => 'Preventing reload during tests';
});

QUnit.done(() => {
  // Clean up the onbeforeunload handler
  const window = getWindow();

  window.onbeforeunload = null;
});
