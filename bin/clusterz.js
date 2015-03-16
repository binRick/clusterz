#!/usr/bin/env node

! function () {

  'use strict';

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

        console.log(services);
      });
      break;

    case 'start':

      var file = process.argv[3];

      if ( ! file ) {
        throw new Error('Missing file name');
      }

      new Service(file)
        .start(function () {
          console.log('start', arguments);
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
