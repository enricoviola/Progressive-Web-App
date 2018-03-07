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
  
  // il metodo "event.waitUntil" assicura che il Service Worker non si installi finché il codice sotto non sia efficacemente avviato.
  event.waitUntil(
    
    // indichiamo un nome alla sezione di cache e dopo abbiamo una promise
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');

        // con addAll aggiungiamo un array delle risorse che vogliamo inserire in cache, risorse considerate fondamentali per il 
        // funzionamento della App Shell (l'HTML della pagina viene inclusa nella lista di default)
        // in caso di fallimento nel caricamento di anche solo 1 file della lista indicata, tutto il processo d'installazione fallisce
        // Ogni browser ha un limite di quota di cache a disposizione. "localStorage" funziona in modo simile al servizio di cache del
        // Service Worker, ma è sincrono, quindi non consentito nei Serv Work (lo è invece l'uso di "IndexedDB" se specificatamente richiesto).
        return cache.addAll(urlsToCache);
      })
  );
});
// se il Promise ha esito negativo, l'installazione fallisce e il Worker non farà nulla, pronto per un'altra eventuale successiva installazione



// Dopo l'installazione, i Service Workers risultano attivi.

// Un evento FETCH si attiva ogni volta che viene recuperata qualsiasi risorsa che potrebbe essere controllata/recuperata dal Service Worker,
// cioé i documenti all'interno dello Scope (scope di esecuzione del Serv Wor) e qualsiasi risorsa a cui fa riferimento in tali documenti
// (ad esempio se index.html effettua una richiesta per incorporare un'immagine, allora passa attraverso il suo Service Worker).

// Per prima cosa apriamo la cache e abbiniamo la richiesta con quelle presenti nella cache. Se corrisponde, ossia troviamo la stessa risorsa in
// cache, restituiamo i dati dalla cache. Se invece la richiesta non corrisponde, reindirizziamo la richiesta al server. Appena ricevuti apriamo 
// la cache e salviamo i dati qui utilizzando cache.put () in modo che sia possibile accedervi direttamente dalla cache nei tentativi successivi.


self.addEventListener('fetch', function(event) {
  console.log("refresh", event.request.url);

  // il metodo "respondWith()" dirotta la "HTTP Response" trattandola coi metodi interni
  event.respondWith(

    // "caches.match()" questo metodo esamina la richiesta e prova a cercare la stessa equivalente nella cache del service worker.
    // La corrispondenza viene eseguita tramite url e vari header, proprio come con le normali richieste HTTP.
    // Se trova una risposta corrispondente, restituisce quel valore dalla cache.
    // Altrimenti restituisce il risultato della chiamata a "fetch" che effettuerà una richiesta alla rete, restituendone i dati.
    
    caches.match(event.request)
      .then(function(response) {
        // Cache trovata, ritorna la risorsa dalla cache 
        if (response !== undefined) {
          return response;
        } else {
        // Cache non trovata, la richiedo dalla rete
          requestBackend(event);
        }
      })
    );
});

function requestBackend(event){
  console.log("requestBackend", event);

  // Necessaria la clonazione, poiché tale richiesta può essere consumata 1 sola volta, qui ci serve 2 volte sia per richiederla alla cache sia alla rete
  var url = event.request.clone();

  // effettuiamo una richiesta alla rete che restituirà in caso i dati
  return fetch(url).then(function(res){
      if(!res || res.status !== 200 || res.type !== 'basic'){
        // verifica se la "response" é valida, se lo status è 200 e se è di tipi "basic" (indica se quest'ultima è stata effettuata dalla nostra origine
        // ciò significa che le richieste a risorse di terzi non vengono memorizzate nella cache)
          return res;
      }

      // Se passiamo il check, cloniamo la risposta (la clonazione è necessaria per lo stesso motico della richiesta)
      var response = res.clone();

      // la nostra volontà è quella di salvare la risorsa che abbiamo appena preso dalla rete per salvarla nella cache, in modo da ritrovarla in futuro
      // apriamo la nostra cache con "open", e aggiungiamo la risorsa scaricata alla cache con "put". Il clone viene inserito nella cache e 
      // la risposta originaria viene restituita al browser per essere inviata alla pagina che l'ha richiesta.
      caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, response);
          console.log("requestBackend2", event.request, response);
      });

      return res;

  }).catch(function() {
    // in caso la risorsa non viene neanche recuperata online, la richiesta fallisce e mostriamo un messaggio di errore (e possibile scegliere
    // anche altre specifiche soluzioni, come l'utilizzo di fallback solutions)
    console.log("risorsa non trovata né online né in cache");
  })
}



/*
Arriva un momento dove il Service Worker và aggiornato. Per far ciò, innanzitutto aggiorniamo il "service-worker.js"
*/

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

  // la promise passata dentro "waitUntil()" blocca altri eventi fino al suo completamento
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

