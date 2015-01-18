! function () {

  /** Parse list file into [clusterzFile] and cb it */

  'use strict';

  var list = require('path').join(process.env.HOME, '.config/clusterz.txt');

  function parse (cb) {
    var dataList = '';
    var files = [];

    require('fs').createReadStream(list)

      .on('data', function (data) {
        
        dataList += data.toString();
      })

      .on('error', function (error) {
        
        cb(error);
      })

      .on('end', function () {
        
        dataList.split(/\n/).forEach(function (line) {
          
          if ( line ) {

            var bits = line.split(/\s/);

            files.push(new (function clusterzFile () {
              this.pid = bits[0];
              this.inode = +bits[1];
            })());
          }
        });

        cb(null, files);
      });
  }

  module.exports = parse;

} ();
