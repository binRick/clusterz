#!/usr/bin/env node

! function () {

  'use strict';

  var help = '  clusterz v0.0.0' + "\n" +
  '  clusterz start <file>' + "\n" + 
  '  clusterz status <file>' + "\n" + 
  '  clusterz stop <file>' + "\n" +
  '  clusterz reload <file>';

  if ( ! process.argv[2] || ! process.argv[3] ) {
    console.log(help);
    return process.exit();
  }

  var command = process.argv[2];

  var file = process.argv[3];

  var clus = require('../lib/clusterz')(file);

  clus[command](function (error, response) {
    console.log('error', error);
    console.log('response', response);
  });

} ();
