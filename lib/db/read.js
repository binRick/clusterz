! function () {
  
  'use strict';

  /**
   *  @function
   *  @return
   *  @arg
   */

  function readDB (cb) {
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

      if ( db.syncing ) {
        db.syncer.on('sync', function () {
          db.read(cb);
        });
      }

      else if ( ! db.sync ) {
        db.syncer = new (require('events').EventEmitter)();

        db.syncing = true;

        db.emit('reading', db.path);

        var contents = '';

        var stream = require('fs').createReadStream(db.path)

        stream

          .on('error', function (error) {

            // db.emit('error', error);

            if ( error.code === 'ENOENT' ) { 

              db.state = 'changed';

              contents = '[]';

              stream.emit('end');

            }

            else {
              cb(error);
            }

          })

          .on('data', function (data) {
            contents += data.toString();
          })

          .on('end', function () {

            var services = JSON.parse(contents);

            db.emit('services found in file', services.length);

            services.forEach(function (service) {
              db.services = db.services.map(function (dbService) {
                if ( service.spawn.pid.toString() ===
                  dbService.spawn.pid.toString() ) {

                  // if ( )

                }

                return dbService;
              });
            });

            db.services = db.services.concat(services);

            db.sync = true;
            db.syncing = false;

            cb();

            db.syncer.emit('sync');
          });
      }

      else {
        cb();
      }
    });
  }

  module.exports = readDB;

} ();
