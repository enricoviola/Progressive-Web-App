(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then((registration) => {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration, registration.scope);
    }, (err) => {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
      });
    });
  } else {
    alert('No service worker support in this browser');
  }
})();