clusterz
=======

Serve your Node scripts as clustered services with zero-second downtime.

# Install

    npm install -g co2-git/clusterz

# Terminal

```bash
clusterz start server.js    # start server.js as a aservice
clusterz status server.js   # status from server.js as a service
clusterz stop server.js     # stop server.js as a service
clusterz reload server.js   # reload server.js as a service
```

```js

require('clusterz')('server.js')
  
  .start(Function)
  
  .status(Function)

  .reload(Function)

  .stop(Function);
```

