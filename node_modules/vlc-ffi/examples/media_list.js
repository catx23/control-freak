var vlc = require('../vlc')([
  '-I', 'dummy',
  '-V', 'dummy',
  '-vvvv', 'dummy',
  '--verbose', '1',
  '--no-video-title-show',
  '--no-disable-screensaver',
  '--no-snapshot-preview'
]);
console.log('version '+vlc.version);
vlc.diagnose();