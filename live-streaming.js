var spawn = require('child_process').spawn;

module.exports = function(config) {

  var staticProvider = require('connect').staticProvider(config.mountPoint);
  
  var encoder = spawn(__dirname + "/convertAndSegment.sh", [
    config.bitrate
  ], {
    cwd: config.streamDir,
    customFds: [-1, process.stdout.fd, 2/*process.stderr.fd*/]
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
