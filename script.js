// IIFE, (acronimo di "Immediately Invoked Function Expressions")
// Questo schema viene spesso utilizzato quando si cerca di evitare l'inquinamento dello spazio dei nomi globali, 
// perché tutte le variabili utilizzate all'interno del IIFE (come in qualsiasi altra normale funzione) non sono visibili al di fuori
// del suo campo di applicazione. 
(() => {

  // Verifica se la service worker API è avviabile nel browser dell'utente 
  if ('serviceWorker' in navigator) {

    // in caso positivo al caricamento della pagina "registra" il Service worker e implementa un Promise
    window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope, registration);
    }, (err) => {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
      });
    });
  } else {
    // Questo errore si avvia nel caso di Non supporto dei Serv Work da parte del browser
    alert('No service worker support in this browser');
  }
})();