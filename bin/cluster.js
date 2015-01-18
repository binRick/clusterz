#!/usr/bin/env node

! function () {

  'use strict';

  var script = process.argv[2];

  var path = require('path');

  if ( ! script ) {
    throw new Error('Missing script');
  }

  var numWorkers = require('os').cpus().length;

  var messages = [];

  function send (msg, fn) {
    console.log(msg);

    messages.push({
      message: msg,
      date: Date.now()
    });
  }

  send.message = function (message) { 
    send(message);
  }

  send.error = function (error) {
    send({ error: {
      name: error.name,
      message: error.message,
      stack: error.stack.split(/\n/)
    } });
  }

  send.message({ script: script, forks: numWorkers });

  var cluster = require('cluster');

  process.on('SIGUSR2', function () {
    for ( var fork in cluster.workers ) {
      cluster.workers[fork]
        
        .on('disconnect', function () {

          // console.log('disconnected', this.process);

          cluster
            .fork()
            .on('listening', function () {

            })
        })
      
        .disconnect();

    }
  });

  cluster.setupMaster({
    exec: script,
    args: []
  });

  cluster
    
    .on('error', function (error) {
      send.error(error);
    })
    
    .on('fork', function () {
      send.message( { forked: script });
    })

    .on('exit', function (error, code) {
      send.message({ exit: script, code: code });
    })
    
    .on('listening', function (fork, service) {

      service.fork = {
        id: fork.id,
        uniqueID: fork.uniqueID,
        workerID: fork.workerID,
        pid: fork.process.pid
      };

      send.message({
        listening: service
      });
    })

    .on('reload', function () {
      require('fs').createWriteStream('/tmp/ohmygod.js')
        .write('oh my god');
    });

  for ( var i = 0; i < numWorkers; i ++ ) { 
    cluster.fork()

      .on('error', function (error) {
        send.message('error');
      })

      .on('message', function (msg) {
        send.message(msg);
      })

      .on('exit', function () {
        send.message('exit');
      });
  }

} ();
