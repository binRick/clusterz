! function () {
  
  'use strict';

  /**
   *  @function
   *  @return
   *  @arg
   */

  function updateDB (pid, options, cb) {
    var db = this;

    if ( typeof cb !== 'function' ) {
      cb = function (error) {
        if ( error ) {
          db.emitter.emit('error', error);
        }
      }
    }

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {

      db.emit('updating', { pid: pid, options: options });
      
      db.read(domain.intercept(function () {

        var found = false;
        var changed = false;

        db.services = db.services.map(function (service, index) {

          if ( service.spawn.pid.toString() === pid.toString() ) {

            found = index;

            for ( var i in options ) {

              if ( i === 'exitCode' ) {
                service.spawn.exitCode = options.exitCode;
                changed = index;
              }

              else if ( i === 'signalCode' ) {
                service.spawn.signalCode = options.signalCode;
                changed = index;
              }

              else if ( i === 'fork' ) {
                service.workers.push(options.fork);
                changed = index;
              }

              else if ( i === 'error' ) {
                service.errors.push(error);
                changed = index;
              }

              else if ( i === 'exit' ) {
               
              }

              else if ( i === 'connected' ) {
                service.spawn.connected = true;
                changed = index;
              }

              else if ( i === 'listening' ) {
                service.workers = service.workers.map(function (worker) {
                  if ( worker.id === options.listening.worker ) {
                    worker.listening = true;
                    worker.address = options.listening.address;
                  }

                  return worker;
                });
                changed = index;
              }

            }
          }

          db.emit('update results', {
            found: found === index,
            changed: changed === index,
            options: options,
            service: service
          });

          return service;
        });

        if ( found === false ) {
          db.emit('pid not found', pid);
        }

        if ( changed !== false ) {
          db.state = 'changed';
          db.write(function () {});
        }

      }));

    });
  }

  module.exports = updateDB;

} ();
