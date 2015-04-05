#!/usr/bin/env node

! function () {

  'use strict';

  require('colors');

  var pkg         =   require('../package.json');
  var DB          =   require('../lib/db');
  var Service     =   require('../lib/service');

  var help = '  ' + pkg.name + ' v' + pkg.version + "\n" +
  '  ' + "\n" +
  '    clusterz ls' + "\n" + 
  '    clusterz ls file=<file>' + "\n" + 
  '    clusterz ls pid=<pid>' + "\n" + 
  '    clusterz start <file>' + "\n" + 
  '    clusterz stop <file>' + "\n" +
  '    clusterz reload <file>';

  switch ( process.argv[2] ) {
    default:
      console.log(help);
      break;

    case 'ls':
      DB.new().ls(function (error, services) {
        if ( error ) {
          throw error;
        }

        services.forEach(function (service) {

          function formatLabel (label) {

            var pad = '';

            for ( var i = label.length; i < 15; i ++ ) {
              pad += ' ';
            }

            return ('  ' + label + pad).yellow.bgWhite;
          }

          function formatValue (value) {
            if ( typeof value === 'number' ) {
              return value.toString().bgGreen;
            }

            if ( typeof value === 'boolean' ) {
              if ( value ) {
                return 'true'.bgGreen;
              }

              return 'false'.bgRed;
            }

            if ( typeof value === 'undefined' ) {
              return 'undefined'.grey;
            }

            if ( value === null ) {
              return 'null'.grey;
            }
          }

          console.log('#'.grey.bgWhite + (' ' + service.file.path + ' ')
            .bold.bgBlue);

          console.log('# '.grey.bgWhite + ' master '.bold.bgCyan);

          console.log('#    '.grey.bgWhite + formatLabel('pid') +
            formatValue(service.spawn.pid));

          console.log('#    '.grey.bgWhite + formatLabel('connected') +
            formatValue(service.spawn.connected));

          console.log('#    '.grey.bgWhite + formatLabel('killed') +
            formatValue(service.spawn.killed));

          console.log('#    '.grey.bgWhite + formatLabel('signal code') +
            formatValue(service.spawn.signalCode));

          console.log('#    '.grey.bgWhite + formatLabel('exit code') +
            formatValue(service.spawn.exitCode));

          console.log('#    '.grey.bgWhite + formatLabel('start time'));

          console.log('#    '.grey.bgWhite + formatLabel('up time'));

          console.log('# '.grey.bgWhite + ' workers '.bold.bgCyan);

          service.workers.forEach(function (worker) {

            console.log('#   '.grey.bgWhite + formatLabel('#') +
              formatValue(worker.id));

            console.log('#   '.grey.bgWhite + formatLabel('pid') +
              formatValue(worker.pid));

            console.log('#   '.grey.bgWhite + formatLabel('listening') +
              formatValue(worker.listening || false));

            if ( worker.listening ) {
              console.log('#   '.grey.bgWhite + formatLabel('ipv') +
                formatValue(worker.address.addressType));

              console.log('#   '.grey.bgWhite + formatLabel('host') +
                formatValue(worker.address.address));

              console.log('#   '.grey.bgWhite + formatLabel('port') +
                formatValue(worker.address.port));
            }

            console.log('#   '.grey.bgWhite + formatLabel('---'));
          });

        });
        
      });
      break;

    case 'start':

      var file = process.argv[3];

      if ( ! file ) {
        throw new Error('Missing file name');
      }

      new Service(file)

        .on('error', function (error) {
          throw error;
        })

        .on('message', function (message, info) {
          console.log(message, typeof info === 'undefined' ? '' : info);
          console.log('-----------------------------');
        })

        .start(function (error, server) {
          if ( error ) {
            throw error;
          }

          console.log('Done!');

          // console.log(JSON.stringify(server, null, 2));
        });

      break;

    case 'reload':

      var file = process.argv[3];

      if ( ! file ) {
        throw new Error('Missing file name');
      }

      new Service(file)
        .reload(function () {
          console.log('reload', arguments);
        });

      break;
  }

} ();
