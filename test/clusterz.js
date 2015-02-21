! function () {
  
  'use strict';

  var path = require('path');

  describe('[Function Clusterz', function () {

    var Clusterz;

    before(function () {
      Clusterz = require('../lib/clusterz');
    });

    it ( 'should be a function' , function () {
      Clusterz.should.be.a.Function;
    });

    it ( 'should extend EventEmitter' , function () {
      Clusterz.prototype.should.be.an.instanceof(require('events').EventEmitter);
    });

    it ( 'should have a Factory function' , function () {
      Clusterz.Factory.should.be.a.Function;
    });

    describe ( 'new Clusterz(null)' , function () {

      it ( 'should emit an error' , function (done) {

        new Clusterz().on('error', function (error) {
          error.should.be.an.Error;
          done();
        });

      });

    });

    describe ( 'Clusterz.Factory(null)' , function () {

      it ( 'should emit an error' , function (done) {

        Clusterz.Factory().on('error', function (error) {
          error.should.be.an.Error;
          done();
        });

      });

    });

    describe ( 'new Clusterz("/f/i/l/e/n/o/t/f/o/u/n/d")' , function () {

      it ( 'should emit an error' , function (done) {

        new Clusterz("/f/i/l/e/n/o/t/f/o/u/n/d").on('error', function (error) {
          error.should.be.an.Error;
          error.should.have.property('code').which.is.exactly('ENOENT');
          done();
        });

      });

    });

    describe ( 'Clusterz.Factory("/f/i/l/e/n/o/t/f/o/u/n/d")' , function () {

      it ( 'should emit an error' , function (done) {

        Clusterz.Factory("/f/i/l/e/n/o/t/f/o/u/n/d").on('error', function (error) {
          error.should.be.an.Error;
          error.should.have.property('code').which.is.exactly('ENOENT');
          done();
        });

      });

    });

    describe ( 'new Clusterz(path.join(__dirname, "./server.js"))', function () {

      var clusterz;

      before(function () {
        clusterz = new Clusterz(path.join(__dirname, "./server.js"));
      });

      it ( 'should have a file property which is ' + path.join(__dirname, "./server.js") , function () {
        clusterz.should.have.property('file').which.is.exactly(path.join(__dirname, "./server.js"));
      });

      it ( 'should have an inode which is a number' , function () {
        clusterz.should.have.property('inode').which.is.a.Number;
      });

      describe ( '.status()' , function () {

        var status;

        before(function (done) {
          clusterz
            .status(function (error, services) {
              status = services;
              done()
            });
        });

        it ( 'should be an array' , function () {
          status.should.be.an.Array;
        });

      });


    });

  });

} ();
