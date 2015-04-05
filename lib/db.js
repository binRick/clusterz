! function () {
  
  'use strict';

  var tmp = require('path').join(require('os').tmpdir(), 'clusterz.json');

  var should = require('should');

  /** @class
   *  @arg        {String?=tmp} dbpath
  */

  function DB (dbpath, options) {

    var db = this;

    this.path = dbpath || tmp;

    this.options = options || {};

    this.locked = false;
    this.emitter = new (require('events').EventEmitter)();
    this.emitter.on('unsync', function () {
      if ( db.syncing ) {
        return;
      }

      db.sync = false;
      db.syncing = true;
      db.read(function () {});
    });
    this.services = [];
    this.sync = false;

    this.state = 'init';

    this.emit('new db', { path: this.path, options: options });

    setTimeout(this.write.bind(this), 1000).unref();
  }

  module.exports = DB;

  DB.prototype.emit = function(message, info) {
    if ( this.options.listener ) {
      this.options.listener.emit('message', message, info);
    }
  };

  /** @method
   *  @arg        {Function} cb
   *  @return     null
  */

  DB.prototype.read = require('./db/read');

  DB.prototype.write = require('./db/write');

  DB.prototype.ls = function (inode, cb) {

    var db = this;

    if ( ! cb &&  typeof inode === 'function' ) {
      cb = inode;
      inode = '';
    }

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      var field;

      try {
        cb.should.be.a.Function;

        try {
          inode.should.be.a.Number;
          field = 'inode';
        }

        catch ( error ) {
          inode.should.be.a.String;
          field = 'file';
        }
      }

      catch ( error ) {
        return cb(error);
      }

      db.read(domain.intercept(function () {

        var services = db.services;

        if ( inode ) {
          services = services.filter(function (s) {
            return s.file[field] === inode;
          });
        }

        cb(null, services);

      }));
    });

  };

  DB.prototype.insert = require('./db/insert');

  DB.prototype.reset = function (cb) {

    this.services = [];

    this.state = 'changed';

    this.write(cb);

  };

  /** @method
   *  @arg        {Function} cb
   *  @return     null
  */

  DB.prototype.update = require('./db/update');

  DB.new = function (dbpath) {
    return new DB(dbpath);
  };

} ();
