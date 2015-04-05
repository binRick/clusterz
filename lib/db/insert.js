! function () {
  
  'use strict';

  /**
   *  @function
   *  @return
   *  @arg
   */

  function insertIntoDB (service, cb) {
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
      if ( typeof cb === 'function' ) {
        cb(error);
      }
      else {
        throw error;
      }
    });
    
    domain.run(function () {

      var format = {
        stamp           :   Date.now(),
        file            :   {
          inode         :   service.inode,
          path          :   service.file
        },
        spawn:          {
          connected     :   service.spawn.connected,
          signalCode    :   service.spawn.signalCode,
          exitCode      :   service.spawn.exitCode,
          killed        :   service.spawn.killed,
          pid           :   service.spawn.pid,
          startTime     :   Date.now()
        },
        workers: [],
        errors: []
      };

      db.emit('inserting', format);
      
      db.read(domain.intercept(function () {
        db.services.push(format);

        db.state = 'changed';

        db.write(function () {});

        cb(null, format);  
      }));

    });
  }

  module.exports = insertIntoDB;

} ();
