! function () {
  
  'use strict';

  /**
   *  @function
   *  @return
   *  @arg
   */

  function writeToDatabase (cb) {
    var db = this;

    if ( typeof cb !== 'function' ) {
      cb = function (error) {
        if ( error ) {
          db.emitter.emit('error', error);
        }
      }
    }

    db.emit('pulse', { state: db.state, services: db.services.length });

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {
      
      if ( db.state === 'changed' ) {
        db.state = 'changing';

        db.emit('writing to ' + db.path, db.services.length);

        var stream = require('fs')

          .createWriteStream(db.path)

          .on('error', cb)

          .on('finish', function () {
            db.state = 'unchanged';
            db.emit('written');
            if ( ! db.watch ) {
              db.watch = require('fs').watch(db.path)

              .on('change', function () {
                db.emit('unsync');
                db.emitter.emit('unsync');
              });
            }
            setTimeout(db.write.bind(db), 1000).unref();
          });

        stream.write(JSON.stringify(db.services, null, 2), domain.bind(cb));

        stream.end();
      }

      else {
        setTimeout(db.write.bind(db), 1000).unref();
      }

    });
  }

  module.exports = writeToDatabase;

} ();
