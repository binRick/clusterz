! function () {
  
  'use strict';

  var DB = require('../db');

  function background (cb) {
    var service = this;

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      service.emit('message', 'launching new background process');

      service.spawn = require('child_process')
        .spawn(require('path').join(__dirname, '../../bin/cluster.js'),
          [service.file, service.options.path || ''], {
            stdio: 'ignore',
            detached: true
          });

      service.emit('message', 'new background process pid', service.spawn.pid);

      service.spawn.unref();

      service.spawn.on('error', cb);

      service.spawn.on('exit', function (code) {

        service.emit('message', 'got exit', code);

        console.log('spawn', service.spawn)

        var update = {};

        if ( typeof code === 'number' ) {
          update.exitCode = code;
        }

        else if ( typeof code === 'string' ) {
          update.signalCode = code;
        }

        // new DB().update(service.spawn.pid, update);

        setTimeout(function () {
          new DB(service.options.db, {
              listener: service
            }).update(service.spawn.pid, update, domain.bind(cb));
        }, 1000);
      });

      service.pid = service.spawn.pid;

      cb();
    });

  }

  module.exports = background;

} ();
