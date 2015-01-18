! function () {

  'use strict';

  var list = require('path').join(process.env.HOME, '.config/clusterz.txt');

  function addToList (cb) {
  	var self = this;

    require('fs').createWriteStream(list,
      { flags: 'a+' })

      .write(process.pid.toString() + ' ' + self.inode + "\n");
  }

  module.exports = addToList;

} ();
