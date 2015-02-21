! function () {

  'use strict';

  var should = require('should');

  var DB = require('./db');

  module.exports = Clusterz;

  Clusterz.Factory = function (file) {
    return new Clusterz(file);
  };

  /**
   *  @class Clusterz
   *  @arg {String} file
   */

  function Clusterz (file) {
    
    this.file = require('path').resolve(file);

    var self = this;

    this.on('error', function (error) {
      if ( this._events.error.length === 1 ) {
        throw error;
      }
    });

    this.ready = false;

    this.on('ready', function () {
      self.ready = true;
    });

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      self.emit('error', error);
    });
    
    domain.run(function () {
      process.nextTick(function () {

        self.file.should.be.a.String;

        require('fs').stat(self.file, domain.intercept(function (stat) {
          self.inode = stat.ino;
          self.emit('ready');
        }));

      });
    });

  }

  require('util').inherits(Clusterz, require('events').EventEmitter);

  /**
   *
   */

  Clusterz.prototype.status = function (cb) {

    if ( typeof cb !== 'function' ) {
      return self.emit('error', new Error('Status called without callback function'));
    }

    var self = this;

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      new DB().find(self.inode, domain.bind(cb));
    });

    return this;
  };

  /**
   *
   */

  Clusterz.prototype.start = function (cb) {

    if ( ! this.ready ) {
      return this.once('ready', function () {
        this.start(cb);
      }.bind(this));
    }

    if ( typeof cb !== 'function' ) {
      return self.emit('error', new Error('Status called without callback function'));
    }

    var self = this;

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      self.background(domain.intercept(function () {
        new DB().insert(self, domain.bind(cb))  
      }))
    });

    return this;
  };

  /**
   *
   */

  Clusterz.prototype.background = function (cb) {

    this.spawn = require('child_process')
      .spawn(require('path').join(__dirname, '../bin/cluster.js'),
        [this.file], {
          stdio: 'ignore',
          detached: true
        });

    this.spawn.unref();

    this.spawn.on('error', cb);

    this.spawn.on('exit', function (code) {
      cb(new Error('Got code: ' + code));
    });

    this.pid = this.spawn.pid;

    cb();
  };

  /**
   *  @example  new Clusterz(String file).start();
   */

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

  /**
   *
   */

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

  /**
   *
   */

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

} ();
