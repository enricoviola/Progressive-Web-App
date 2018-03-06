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
  
  // il metodo "event.waitUntil" avvia una promise e la usa per sapere quanto tempo richiede l'installazione e se ha avuto successo o meno
  event.waitUntil(
    
    // indichiamo un nome alla sezione di cache e dopo abbiamo una promise
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');

        // con addAll aggiungiamo un array delle risorse che vogliamo inserire in cache, risorse considerate fondamentali per il 
        // funzionamento della App Shell (l'HTML della pagina viene inclusa nella lista di default)
        // in caso di fallimento nel caricamento di anche solo 1 file della lista indicata, tutto il processo d'installazione fallisce
        return cache.addAll(urlsToCache);
      })
  );
});



// Dopo l'installazione, i Service Workers risultano attivi. Andiamo ad aggiornare il service workers per ogni pagina differente

// Un evento FETCH si attiva ogni volta che viene recuperata qualsiasi risorsa che potrebbe essere controllata dal Service Worker,
// cioé i documenti all'interno dello Scope (scope di esecuzione del Serv Wor) specificato e qualsiasi risorsa a cui fa riferimento in tali documenti
// (ad esempio se index.html effettua una richiesta per incorporare un'immagine, allora passa attraverso il suo Service Worker.)

// Per prima cosa apriamo la cache e abbiniamo la richiesta con quelle presenti nella cache. Se corrispondono, restituiamo i dati dalla cache.
// Se la richiesta non corrisponde, reindirizziamo la richiesta al server.
// Quando i dati vengono ricevuti correttamente dal server, restituiamo tali dati.
// Quindi apriamo la cache e salviamo i dati qui utilizzando cache.put () in modo che sia possibile accedervi direttamente dalla cache nei tentativi successivi.


self.addEventListener('fetch', function(event) {
  console.log("refresh", event.request.url);

  event.respondWith(

    // "caches.match()" questo metodo esamina la richiesta e prova a cercare la stessa equivalente nella cache del service worker.
    // La corrispondenza viene eseguita tramite url e vari header, proprio come con le normali richieste HTTP.
    // Se trova una risposta corrispondente, restituisce quel valore dalla cache.
    // Altrimenti restituisce il risultato della chiamata a "fetch" che effettuerà una richiesta alla rete, restituendone i dati.
    
    caches.match(event.request).then(function(response) {
        // Cache trovata, ritorna la risorsa dalla cache
        if (response) {
          return response;
        }

        // Cache non trovata, la richiedo dalla rete
        requestBackend(event);

      })
    );
});

function requestBackend(event){
  console.log("requestBackend", event);

  // Necessaria la clonazione, poiché tale richiesta può essere consumata 1 sola volta, qui ci serve 2 volte sia per richiederla alla cache sia alla rete
  var url = event.request.clone();
  return fetch(url).then(function(res){
      // if not a valid response send the error
      // la richiesta basic indica se quest'ultima è stata effettuata dal nostro origine, non da componenti terzi (third party assets)
      if(!res || res.status !== 200 || res.type !== 'basic'){
          return res;
      }

      // Necessaria anche qui la clonazione per lo stesso motivo della richiesta
      var response = res.clone();

      caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, response);
          console.log("requestBackend2", event.request, response);
      });

      return res;
  })
}


// L'evento "activate" viene usato soprattutto per liberarsi della vecchia cache (oltre ad altro), per liberare spazio soprattutto tenendo conto
// che ogni browser ha un limite alla quantità di memoria cache che ogni singolo service worker può usare (in caso il Browser gestirà direttamente
// da sé l'ottimizzazione dello spazio)

// In caso di aggiornamento della cache, ogni volta che i files vengono modificati:
// 1) Aggiorniamo l'elenco dei dati da inserire in cache (CACHE_NAME) perché se il browser rileva eventuali modifiche nel Service Worker,
// li scaricherà nuovamente. L'evento di installazione nel nuovo service worker verrà generato ma entrerà nella fase di 'attesa' in quanto
// la pagina sarà ancora controllata dal vecchio Service Worker. 
// 2) Quando tutte le istanze del tuo sito Web sono chiuse, il nuovo Service Worker prenderà il controllo al posto del precedente.
// Si intende qui che nel caso di più finestre aperte nel nostro browser, finché Tutte non verranno ricaricate, il nuovo Service Worker rimarrà in attesa
// 3) A questo punto verrà attivato l'evento di installazione e qui sarà necessario eseguire una gestione della cache.

self.addEventListener('activate', function(event) {

  event.waitUntil(
    caches.keys().then( function(cacheNames) {
      return Promise.all( cacheNames.map( function(cacheName, i) {
          
          if(cacheName !== CACHE_NAME){
            return caches.delete(cacheName[i]);
          }

        })
      );
    })
  );
});

