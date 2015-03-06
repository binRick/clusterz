! function () {
  
  'use strict';

  var should = require('should');

  var DB = require('./db');

  /**
   *  @function
   *  @arg {String} file
   */

  function Service (file) {
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

  require('util').inherits(Service, require('events').EventEmitter);

  Service.prototype.start = function (cb) {
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

  Service.prototype.background = function (cb) {

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

  Service.prototype.reload = function (cb) {
    if ( ! this.ready ) {
      return this.once('ready', function () {
        this.reload(cb);
      }.bind(this));
    }

    if ( typeof cb !== 'function' ) {
      return self.emit('error', new Error('Status called without callback function'));
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
