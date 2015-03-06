clusterz
=======

Run load-balanced services in JavaScript.

# About

`clusterz` helps you run your JavaScript files as services via a cluster of multi-thread proccesses. The cluster acts as a load balancer and acts as a single point of failure.

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

`clusterz` keeps a small database of running clusters in a file located in OS tmp dir. This database can be queried to retrieve information about clusters,

```js
// Create a new link to database

var db = require('clusterz').db.new();

// Get status of all clusters running the file server.js

db.ls('server.js', function (error, services) {
    // error.should.not.be.an.Error
    // services.should.be.an.Array
    
    // Print clusters pid and number of forks
    services.forEach(function (service) {
        console.log(service.pid, service.forks.length);
    });
    
    // Add a new worker
    services.forEach(function (service) {
        service.fork();
    });
    
    // Reload each service
    services.forEach(function (service) {
        service.reload();
    });
});
```

# Service

```js
var service = require('clusterz').service.new();

// Start service
service.start('server.js');

// Reload service every 5 minutes
setInterval(function () {
    service.reload();
}, 1000 * 60 * 5);
```