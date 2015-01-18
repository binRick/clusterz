! function () {

  'use strict';

  function Clusterz (file) {
    this.file = file;

    var self = this;

    require('fs').stat(this.file, function (error, stat) {
      if ( error ) {
        throw error;
      }

      self.inode = stat.ino;
    });
  }

  Clusterz.prototype.exists = function (cb) {

    var self = this;

    this.parse(function (error, files) {
      if ( error ) {
        return cb(error);
      }

      var exists = files.filter(function (file) {
        return file.inode === self.inode;
      });

      if ( exists.length ) {
        self._exists = exists[0];
      }

      if ( exists.length > 1 ) {
        throw new Error(
          'Found ' + exists.length + ' duplicate entries for ' + self.file);
      }

      cb();
    });

    return this;
  };

  Clusterz.prototype.start = function (cb) {

    var self = this;

    this.exists(function (error) {
      if ( error ) {
        cb(error);
      }

      if ( self._exists ) {
        console.log('exists');
      }
      else {
        console.log('new');
        self.write(cb);
      }
    });

    return this;
  };

  Clusterz.prototype.write = require('./add-to-list');

  Clusterz.prototype.parse = require('./parse');

  module.exports = function (file) {
    return new Clusterz(file);
  };

} ();
