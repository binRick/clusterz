clust3r
=======

!! alpha !!

Starts a Node script as a clustered service.

# Install

    npm install -g co2-git/clust3r

# Start

```bash
clust3r server.js ~start
```

```js

require('clust3r')('server.js')
  
  .start()
  
  .status()

  .reload()

  .stop()
  
  .on('start', function () {
    console.log('started');
    })
  
  .on('status', function (status) {
    console.log('status', status);
    })
  
  .on('reload', function (reload) {
    console.log('reload', reload);
    });
```

# Status

```bash
clust3r server.js
```

```js
clust3r('server.js')();
// Or
clust3r('server.js').status();
```

# Abstract

Use it to execute a Node JS script as a daemon (service). It can be clustered too so you can reload your daemon with no downtime.

Stream your JavaScript functions. Put them up a server


# Usage

Terminal:

```bash
serve-this <file> <option>
```

Node:

```js
var service = require('serve-this')(String);

# Story

You have a file, `server.js`, which contains a script meant to be run as a daemon (here, an HTTP server),

```js
// server.js

require('http')
  
  .createServer(function router (req, res) {})
	
  .listen(3000);
```

```bash
# From terminal
serve-this server.js --
  ✔ clustered server.js
    pid: 1000 started: 20:04:30
    workers: 4
```


