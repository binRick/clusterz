! function () {
  
  'use strict';

  var tmp = require('path').join(require('os').tmpdir(), 'clusterz.json');

  var should = require('should');

  function DB (dbpath) {
    this.path = dbpath || tmp;
  }

  module.exports = DB;

  DB.prototype.read = function (cb) {

    var self = this;

    var contents = '';

    require('fs')
      
      .createReadStream(self.path)

      .on('error', function (error) {

        if ( error.code === 'ENOENT' ) { 

          self.reset(function (error) {

            if ( error ) {
              return cb(error);
            }

            self.read(cb);

          });

        }

        else {
          cb(error);
        }

      })

      .on('data', function (data) {
        contents += data.toString();
      })

      .on('end', function () {
        cb(null, JSON.parse(contents));
      });
  
  };

  DB.prototype.write = function (services, cb) {

    var self = this;

    try {
      services.should.be.an.Array;
      cb.should.be.a.Function;
    }

    catch ( error ) {
      return cb(error);
    }

    require('fs')

      .createWriteStream(self.path)

      .on('error', cb)

      .write(JSON.stringify(services, null, 2), function (error) {

        if ( error ) {
          return cb(error);
        }

        cb();

      });
  };

  DB.prototype.find = function (inode, cb) {

    if ( ! cb &&  typeof inode === 'function' ) {
      cb = inode;
      inode = '';
    }

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

    this.read(function (error, contents) {
      
      if ( error ) {
        return cb(error);
      }

      if ( inode ) {
        contents = contents.filter(function (s) {
          return s[field] === inode;
        });
      }

      cb(null, contents);

    });

  };

  DB.prototype.insert = function (service, cb) {

    var self = this;

    try {
      service.should.be.an.Object;
      service.should.have.property('inode').which.is.a.Number;
      cb.should.be.a.Function;
    }

    catch ( error ) {
      return cb(error);
    }

    var pack = {
      file: {
        inode: service.inode,
        path: service.file
      },
      spawn: {
        connected: service.spawn.connected,
        signalCode: service.spawn.signalCode,
        exitCode: service.spawn.exitCode,
        killed: service.spawn.killed,
        pid: service.spawn.pid,
        startTime: Date.now()
      }
    };

    this.read(function (error, services) {

      if ( error ) {
        return cb(error);
      }

      services.push(pack);

      self.write(services, function (error) {

        cb(error, pack);

      });

    });

  };

  DB.prototype.reset = function (cb) {

    try {
      cb.should.be.a.Function;
    }

    catch ( error ) {
      return cb(error);
    }

    this.write([], cb);

  };

} ();
