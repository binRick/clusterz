! function () {

  'use strict';

  var list = require('path').join(process.env.HOME, '.config/clusterz.txt');

  function write (cb) {
  	var self = this;

    var stream = require('fs').createWriteStream(list,
      { flags: 'a+' })

      .on('error', cb)

      .on('finish', function () {
        cb();
      });

    stream.write(self.pid.toString() + ' ' + self.inode + "\n")

    stream.end();
  }

  module.exports = write;

} ();
