clusterz
========

Load-balanced zero-second-downtime daemonizer in JavaScript.

# About

`clusterz` helps you run your JavaScript files as services via a cluster of multi-thread proccesses. The cluster acts as a load balancer and as a single point of failure.

# Cluster module

`clusterz` is standing on the shoulders of Node [cluster module](http://nodejs.org/api/cluster.html).

# Install

    npm install -g co2-git/clusterz

# Command line

```bash
clusterz ls   # View all clusters
clusterz ls server.js # View all clusters using server.js
clusterz start server.js   # Start a new cluster using server.js
clusterz reload server.js  # Send reload signal to clusters using server.js
```

# Database

`clusterz` keeps a small database of clusters in a file. This database is updated live by the cluster masters.

```js
// Create a new link to database

var db = require('clusterz').db.new();

// Get status of all clusters running the file server.js

db.ls('server.js', function onServices (error, services) {
    // error.should.not.be.an.Error
    // services.should.be.an.Array
    
    // Print clusters pid and number of forks
    services.forEach(function logEachService (service) {
        console.log(service.pid, service.forks.length);
    });
    
    // Add a new worker
    services.forEach(function forkEachService (service) {
        service.fork();
    });
    
    // Reload each service
    services.forEach(function reloadEachService (service) {
        service.reload();
    });
});
```

# Service

Service is the broad term we use to designate a cluster. Service has methods such as `start()`, `stop()`, `reload()`, etc.

```js
var service = require('clusterz').service.new();

// Catch errors

service.on('error', function onServiceError (error) {});

// Start service
service.start('server.js');

// Reload service every 5 minutes
setInterval(function reloadService () {
    service.reload();
}, 1000 * 60 * 5);
```