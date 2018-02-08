var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/img/srilanka.jpg',
  '/img/petra.jpg',
  '/styles/style.css',
  '/scripts/app.js',
  'https://fonts.googleapis.com/css?family=Roboto:100'
];

self.addEventListener('install', (event) => {
  
  event.waitUntil(
    
    // indichiamo un nome alla sezione di cache e dopo abbiamo una promise
    caches.open(CACHE_NAME)
      .then(function(cache) {

        // con addAll aggiungiamo un array delle risorse che vogliamo inserire in cache, risorse considerate fondamentali per il funzionamento della App Shell
        return cache.addAll(urlsToCache);
      })
  );
});




// STEP 3 -------- Iniziare da qui ----------------------------
// AGGIORNAMENTO dati previsione meteo -----------------------------------------------------

var dataCacheName = 'weatherData-v1';

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys().then( function(cacheNames) {
      return Promise.all( cacheNames.map( function(cacheName, i) {
          
        // Verifichiamo inoltre che non sia uguale all'oggetto Meteo già memorizzato
          if(cacheName !== CACHE_NAME && key !== dataCacheName){
            return caches.delete(cacheName[i]);
          }

        })
      );
    })
  );
});


self.addEventListener('fetch', function(e) {

    // Dove prelevare i dati del meteo
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

    // Se la richiesta URL fornisce dataUrl, la nostra app richiederà dati meteo aggiornati, quindi li recupera dalla rete e li salverà in cache.
      console.log('0 [Service Worker] Fetch', e.request.url);
    if (e.request.url.indexOf(dataUrl) > -1) {
      console.log('1 [Service Worker] Fetch', e.request.url);

      // Adatto per il Contenuto che si aggiorna frequentemente.
      // L'idea è di mostrare prima i dati memorizzati nella cache, quindi aggiornare la pagina quando / se i dati di rete arrivano.
      
      /*
      e.respondWith(
        caches.open(dataCacheName).then(function(cache){
        
        // Necessaria la clonazione, poiché tale richiesta può essere consumata 1 sola volta, qui ci serve 2 volte sia per richiederla alla cache sia alla rete
        var url = e.request.clone();
        
        return fetch(url).then(function(res){
          // if not a valid response send the error
          if(!res || res.status !== 200 || res.type !== 'basic'){
              return res;
        }

        // Necessaria anche qui la clonazione per lo stesso motivo della richiesta
        var response = res.clone();

          cache.put(e.request.url, response);
          return response;
          console.log("requestBackend3", event.request, response);
        });

      })
    );

*/

e.respondWith(
  caches.open(dataCacheName).then(function(cache) {
      return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
      });
  })
);
  } else {
    console.log('2 [Service Worker] Fetch', e.request.url);
    
    // Questo ti dà il comportamento "Solo cache" per le cose nella cache e il comportamento "Solo rete" per tutto ciò che non è memorizzato nella cache

    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});