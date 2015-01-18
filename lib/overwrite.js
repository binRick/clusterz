! function () {

  'use strict';

  var list = require('path').join(process.env.HOME, '.config/clusterz.txt');

  function overwrite (files, cb) {
  	var self = this;

    if ( Array.isArray(files) ) {
      files = files.map(function (file) {
          return file.pid + ' ' + file.inode;
        })
        .join("\n");
    }

    var s = require('fs').createWriteStream(list)

      .on('error', cb)

      .on('finish', function () {
        cb();
      });

    s.write(files);

    s.end();
  }

  module.exports = overwrite;

} ();
