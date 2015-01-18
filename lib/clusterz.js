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

  Clusterz.prototype.background = function (cb) {


    this.spawn = require('child_process')
      .spawn(require('path').join(__dirname, '../bin/cluster.js'),
        [this.file], {
          // stdio: 'ignore',
          detached: true
        });

    this.spawn.unref();

    this.spawn.on('error', cb);

    this.spawn.on('exit', function (code) {
      cb(new Error('Got code: ' + code));
    });

    this.spawn.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    this.pid = this.spawn.pid;

    cb();
  };

  Clusterz.prototype.start = function (cb) {

    var self = this;

    this.exists(function (error) {
      if ( error ) {
        cb(error);
      }

      if ( self._exists ) {
        return cb(new Error('File already started: ' + self.file));
      }

      else {
        self.background(function (error) {
          if ( error ) {
            return cb(error);
          }

          self.write(function (error) {
            cb(error, self);
          });
        });
      }
    });

    return this;
  };

  Clusterz.prototype.stop = function (cb) {
    var self = this;

    this.exists(function (error) {
      if ( error ) {
        cb(error);
      }

      if ( ! self._exists ) {
        return cb(new Error('File not started: ' + self.file));
      }

      else {

        self.parse(function (error, files) {
          if ( error ) {
            return cb(error);
          }

          files = files.filter(function (file) {
            if ( file.inode === self.inode ) {
              self.pid = file.pid;
            }

            else {
              return true;
            }
          });

          self.signal('SIGTERM', function (error) {
            if ( error ) {
              return cb(error);
            }

            self.overwrite(files, cb);
          })
        });
      }
    });
  };

  Clusterz.prototype.signal = function (signal, cb) {

    try {
      process.kill(this.pid, signal);
      cb();
    }

    catch ( error ) {
      cb(new Error('No such pid: ' + this.pid));
    }

    return this;
  };

  Clusterz.prototype.reload = function (cb) {

    var self = this;

    this.exists(function (error) {
      if ( error ) {
        return cb(error);
      }

      if ( ! self._exists ) {
        return cb(new Error('No suche file: ' + self.file));
      }

      self.pid = self._exists.pid;

      self.signal('SIGUSR2', cb);
    });
  };

  Clusterz.prototype.status = function (cb) {

    var self = this;

    this.exists(function (error) {
      if ( error ) {
        cb(error);
      }

      if ( ! self._exists ) {
        return cb(new Error('No such file: ' + self.inode));
      }

      console.log(self._exists);
    });

    return this;
  };

  Clusterz.prototype.write = require('./write');
  Clusterz.prototype.overwrite = require('./overwrite');

  Clusterz.prototype.parse = require('./parse');

  module.exports = function (file) {
    return new Clusterz(file);
  };

} ();
