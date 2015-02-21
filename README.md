clusterz
=======

Serve your Node scripts as clustered services with no-downtime reload

# Install

    npm install -g co2-git/clusterz

# Terminal

```bash
clusterz start    server.js   # start server.js as a aservice
clusterz status   server.js   # status from server.js as a service
clusterz stop     server.js   # stop server.js as a service
clusterz reload   server.js   # reload server.js as a service
```

```js
var Factory = require('server-factory');

var factory = new Factory('server.js');

factory
  
  .opened(function (answer) {
    if ( ! answer ) {
      factory.open({ hire: 4 });
    }
  });

new ServerGrid('server.js', { cells: 4 })

  .draw()

new Grid()

  .hire()

  .dismiss()

new ServerGrid('server.js')

  .start({

  })

require('clusterz')('server.js')

  .start({ workers: 4 })

```

# Plumbing

We keep a small hash table of running services via a file located in `path.join(os.tmpdir(), 'clusters.db.js')`.
