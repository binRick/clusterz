#!/usr/bin/env node

! function () {

  'use strict';

  var script = process.argv[2];
  var dbpath = process.argv[3];

  var db;

  var domain = require('domain').create();
  
  domain.on('error', function (error) {
    try {
      db.update(process.pid, { error: error });
    }
    catch ( error ) {
      throw error;
    }
  });
  
  domain.run(function () {
    var cluster = require('cluster');

    db = new (require('../lib/db'))(dbpath);

    db.update(process.pid, { connected: process.pid });

    var path = require('path');

    if ( ! script ) {
      db.update(process.pid, { error: new Error('Missing script') });
      return process.exit(1);
    }

    var numWorkers = require('os').cpus().length;

    numWorkers = 2;
    

    cluster._reloaded = 0;

    function fork () {

      return cluster.fork()

        .on('listening', function (worker) {
          
        })

        .on('error', function (error) {
        })

        .on('message', function (msg) {
        })

        .on('exit', function () {
        });
    }

    process.on('SIGUSR2', function () {

      if ( ! cluster.isMaster ) {
        return;
      }

      var reloaded = 0;

      Object.keys(cluster.workers)

        .map(function makeReloadWorkerCallbackable (id) {

          return function reloadWorker (cb) {

            cluster.workers[this.id]
              
              .on('disconnect', function () {
                fork()
                  .on('listening', function () {
                    cb();
                  });
              })

              .disconnect();

            }.bind({ id: id });
          
          })

        .forEach(function forEachReloader (reloader) {
          reloader(function onReloaded (error) {
            if ( error ) {
              return console.log('error', {
                message: error.message,
                name: error.name,
                code: error.code,
                stack: (error.stack || '').split(/\n/)});
            }
            console.log('reloaded')
            reloaded ++;
            if ( reloaded === numWorkers ) {
              cluster._reloaded ++;
            }
          })
        });

    });

    cluster.setupMaster({
      exec: script,
      args: []
    });

    cluster
      
      .on('error', function (error) {
        db.update(process.pid, {
          error       :   {
            stack     :   error.stack,
            when      :   Date.now()
          }
        }, function () {});
      })
      
      .on('fork', function (worker) {
        db.update(process.pid, {
          fork          :     {
            id          :     worker.id,
            pid         :     worker.process.pid,
            uniqueID    :     worker.uniqueID,
            workerID    :     worker.workerID,
            when        :     Date.now()
          }
        }, function () {});
      })

      .on('exit', function (worker, code, signal) {
        // db.update(process.pid, {
        //   exit          :   {
        //     worker      :   worker.id,
        //     code        :   code,
        //     signal      :   signal,
        //     when        :   Date.now()
        //   }
        // }, function () {});
      })
      
      .on('listening', function (worker, address) {
        db.update(process.pid, {
          listening: {
            worker        :     worker.id,
            address       :     address,
            when          :     Date.now()
          }
        });
      })

      .on('reload', function () {
      });

    setTimeout(function () {
      for ( var i = 0; i < numWorkers; i ++ ) { 
        fork();
      }
    });
  });

} ();
