#!/usr/bin/env node

! function () {

  'use strict';

  var test = 0;

  require('http')
    .createServer(function (req, res) {
      res.end('hello ' + test + "\n");
    })
    .listen(3044);

}();