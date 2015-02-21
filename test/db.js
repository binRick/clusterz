! function () {
  
  'use strict';

  var tmp = require('path').join(require('os').tmpdir(), 'clusterz.json');

  describe('[Function DB]', function () {

    var DB;

    before(function () {
      DB = require('../lib/db');
    });

    it('should be a function', function () {
      DB.should.be.a.Function;
    });

    describe('new DB()', function () {

      var db;

      before(function () {
        db = new DB();
      });

      it('should have a path which is a string', function () {
        db.should.have.property('path').which.is.a.String;
      });

      it('path should be ' + tmp, function () {
        db.path.should.be.exactly(tmp);
      });

      describe('.find()', function () {

        var found;

        before(function (done) {
          db.find(function (error, services) {
            if ( error ) {
              return done(error);
            }
            found = services;
            done();
          });
        });

        it('should return an array', function () {
          found.should.be.an.Array;
        });

      });

    });

    describe('new DB("/tmp/clusterz.test.json")', function () {

      var db;

      before(function () {
        db = new DB('/tmp/clusterz.test.json');
      });

      it('should have a path which is a string', function () {
        db.should.have.property('path').which.is.a.String;
      });

      it('path should be ' + '/tmp/clusterz.test.json', function () {
        db.path.should.be.exactly('/tmp/clusterz.test.json');
      });

      describe('.find()', function () {

        var found;

        before(function (done) {
          db.find(function (error, services) {
            if ( error ) {
              return done(error);
            }
            found = services;
            done();
          });
        });

        it('should return an array', function () {
          found.should.be.an.Array;
        });

      });

      describe('.reset()', function () {

        it('should reset db', function (done) {
          db.reset(function (error) {
            if ( error ) {
              return done(error);
            }
            
            db.find(function (error, found) {
              if ( error ) {
                return done(error);
              }
              found.should.be.an.Array;
              found.length.should.be.exactly(0);
              done();
            });
          });
        });

      });

      describe('.insert({ file: "' + __filename + '" })', function () {

        var inserting = { file: __filename };

        var inserted;

        before(function (done) {

          db.insert(inserting, function (error, service) {

            if ( error ) {
              return done(error);
            }

            inserted = service;

            done();

          });

        });

        it('should be an object', function () {
          inserted.should.be.an.Object;
        });

        it('should be inserted', function (done) {

          db.find(function (error, found) {

            if ( error ) {
              return done(error);
            }

            found.length.should.be.exactly(1);

            found[0].should.eql(inserting);

            done();

          });

        });

      });

      describe('.find("' + __filename + '")', function () {

        var found;

        before(function (done) {
          db.find(__filename, function (error, services) {
            if ( error ) {
              return done(error);
            }
            found = services;
            done();
          });
        });

        it('should return an array', function () {
          found.should.be.an.Array;
        });

        it('array length should be 1', function () {
          found.length.should.be.exactly(1);
        });

        it('file names should match', function () {
          found[0].file.should.be.exactly(__filename);
        });

      });

      describe('.find("/does/not/exist.js")', function () {

        var found;

        before(function (done) {
          db.find("/does/not/exist.js", function (error, services) {
            if ( error ) {
              return done(error);
            }
            found = services;
            done();
          });
        });

        it('should be empty', function () {
          found.length.should.be.exactly(0);
        });

      });

    });

  });

} ();
