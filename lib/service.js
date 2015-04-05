! function () {
  
  'use strict';

  var should = require('should');

  var DB = require('./db');

  /**
   *  @function
   *  @arg {String} file
   */

  function Service (file, options) {

    this.file = require('path').resolve(file);

    this.options = options || {};

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

        if ( self.options.listener ) {
          self.options.listener.emit('message', 'new Service()',
            { file: self.file, options: self.options });
        }

        require('fs').stat(self.file, domain.intercept(function (stat) {
          self.inode = stat.ino;
          self.emit('message', 'file inode', self.inode);
          self.emit('message', 'service object ready');
          self.emit('ready');
        }));

      });
    });
  }

  require('util').inherits(Service, require('events').EventEmitter);

  Service.prototype.error = function(error) {
    this.emit('error', error);
  };

  Service.prototype.start = require('./service/start');


  Service.prototype.background = require('./service/background');

  Service.prototype.reload = function (cb) {
    if ( ! this.ready ) {
      return this.once('ready', function () {
        this.reload(cb);
      }.bind(this));
    }

    if ( typeof cb !== 'function' ) {
      return self.error(new Error('Status called without callback function'));
    }

    console.log('reloading', typeof this.inode)

    var self = this;

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      new DB().ls(self.inode, domain.intercept(function (services) {
        services.forEach(function (service) {
          self.signal(service.spawn.pid, 'SIGUSR2', cb);
        })
      }));
    });

    return this;
  };

  Service.prototype.signal = function (pid, signal, cb) {

    try {
      process.kill(pid, signal);
      cb();
    }

    catch ( error ) {
      cb(new Error('No such pid: ' + pid));
    }

    return this;
  };

  Service.new = function (file) {
    return new Service(file);
  };

  module.exports = Service;

} ();
