var fs = require('fs');
var spawn = require('child_process').spawn;

// Stdin is expecting raw PCM data of the format:
var SAMPLE_SIZE = 16;   // 16-bit samples, Little-Endian, Signed
var CHANNELS = 2;       // 2 channels (left and right)
var SAMPLE_RATE = 44100;// 44,100 Hz sample rate.

// If we're getting raw PCM data as expected, calculate the number of bytes
// that need to be read for `1 Second` of audio data.
var BLOCK_ALIGN = SAMPLE_SIZE / 8 * CHANNELS; // Number of 'Bytes per Sample'
var BYTES_PER_SECOND = SAMPLE_RATE * BLOCK_ALIGN;

// Each TS segment will be 10 seconds long
var SEGMENT_LENGTH = 10; // in seconds
var BYTES_PER_TEN_SECONDS = BYTES_PER_SECOND * SEGMENT_LENGTH;

var SegmenterOnNewSegment = /segmenter: ([^,]+), ([^,]+)/;

module.exports = function(config) {

  var staticProvider = require('connect').staticProvider(config.mountPoint);
  var currentSegment = 0;
  
  var encoder = spawn(__dirname + "/convertAndSegment.sh", [
    config.bitrate
  ], {
    cwd: config.streamDir,
    customFds: [-1, process.stdout.fd, process.stdout.fd ]
  });

  config.pcmStream.on('data', function onData(chunk) {
    encoder.stdin.write(chunk);
  });

  // The stack/connect handler. Should take care of serving the static TS and m3u8 files...
  return function(req, res, next) {
    next();
  }
}

function pad(num, length) {
  var str = String(num);
  while(str.length < length) {
    str = '0' + str;
  }
  return str;
}
