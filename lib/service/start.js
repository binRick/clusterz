! function () {
  
  'use strict';

  var DB = require('../db');

  function startService (cb) {
    if ( ! this.ready ) {

      this.emit('message', 'service not ready - delaying start', this.file);

      return this.once('ready', function () {
        this.start(cb);
      }.bind(this));
      
    }

    this.emit('message', 'starting service', this.file);

    var service = this;

    var domain = require('domain').create();
    
    domain.on('error', function (error) {
      cb(error);
    });
    
    domain.run(function () {

      service.background(domain.intercept(function () {

        new DB(service.options.db, {
          listener: service
        }).insert(service, domain.bind(cb));

      }))
    });

    return this;
  }

  module.exports = startService;

} ();
