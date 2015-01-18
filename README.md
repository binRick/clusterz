clusterz
=======

Serve your Node scripts as clustered services with no-downtime reload

# Install

    npm install -g co2-git/clusterz

# Terminal

```bash
clusterz server.js ~start
clusterz server.js ~status
clusterz server.js ~stop
clusterz server.js ~reload
clusterz server.js ~signal
```

```js

require('clusterz')('server.js')
  
  .start()
  
  .status()

  .reload()

  .stop()
  
  .on('start', Function)
  
  .on('status', Function)
  
  .on('reload', Function);
```

