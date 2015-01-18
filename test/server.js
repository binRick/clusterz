#!/usr/bin/env node

! function () {

  'use strict';

  console.log('hello');
  console.log('hello');
  console.log('hello');

  require('http')
    .createServer(function (req, res) {
      res.end('hello');
    })
    .listen(3044);

}();