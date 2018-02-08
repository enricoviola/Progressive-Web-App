//Per verificare l'installazione e attivazione dei Service Workers su DevTool, andare su <code>Application -> Clear Storage -> Clear Site Data</code> perché una volta installati la prima volta gli eventi <code>install</code> e <code>activate</code> non vengono più catturati

self.addEventListener('install', (event) => {
    console.log('service worker installed', event);
});

self.addEventListener('activate', (event) => {
  console.log('service worker activated', event);
});
