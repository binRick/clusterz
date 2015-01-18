#!/usr/bin/env node

! function () {

  'use strict';

  var help = '  clusterz v0.0.0' + "\n" +
  '  clusterz <file> ~start' + "\n" + 
  '  clusterz <file> ~status' + "\n" + 
  '  clusterz <file> ~stop' + "\n" +
  '  clusterz <file> ~reload';

  if ( ! process.argv[2] ) {
    console.log(help);
    return process.exit();
  }

  var file = process.argv[2];

  var clus = require('../lib/clusterz')(file);

  var method = process.argv[3] || 'status';

  method = method.replace(/^~/, '');

  clus[method](function (error, status) {
    console.log('error', error);
    console.log('status', status);
  });

} ();
