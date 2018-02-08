// IIFE, (acronimo di "Immediately Invoked Function Expressions")
// Questo schema viene spesso utilizzato quando si cerca di evitare l'inquinamento dello spazio dei nomi globali, perché tutte le variabili utilizzate all'interno del IIFE (come in qualsiasi altra normale funzione) non sono visibili al di fuori del suo campo di applicazione. 
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


  var statement = 'select * from weather.forecast where woeid=' + '2459115'; // NY
  var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' + statement;
  
  var initialWeatherForecast = {
      created: '2016-07-22T01:00:00Z',
      channel: {
        title: "Yahoo! Weather - New York, NY, US",
        lastBuildDate: 'Mon, 05 Feb 2018 11:51 AM EST',
        astronomy: {
          sunrise: "5:43 am",
          sunset: "8:21 pm"
        },
        item: {
          condition: {
            text: "Windy",
            date: "Thu, 21 Jul 2016 09:00 PM EDT",
            temp: 56,
            code: 24
          },
          forecast: [
            {code: 44, high: 86, low: 70},
            {code: 44, high: 94, low: 73},
            {code: 4, high: 95, low: 78},
            {code: 24, high: 75, low: 89},
            {code: 24, high: 89, low: 77},
            {code: 44, high: 92, low: 79},
            {code: 44, high: 89, low: 77}
          ]
        },
        atmosphere: {
          humidity: 56
        },
        wind: {
          speed: 25,
          direction: 195
        }
      }
    };


  if ('caches' in window) {
    /*
     * Check if the service worker has already cached this city's weather
     * data. If the service worker has the data, then display the cached
     * data while the app fetches the latest data.
     */
      caches.match(url).then(function(response) {
          if (response) {
              response.json().then(function updateFromCache(json) {
                  var results = json.query.results;
                  results.label = results.channel.title;
                  results.created = json.query.created;
                  console.log("Dentro Cache", results.label, results.created);
                  updateForecastCard(results);
              });
          }
      });
  }


  // Fetch the latest data.
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        var response = JSON.parse(request.response);
        var results = response.query.results;
        results.label = results.channel.title;
        results.created = response.query.created;
        updateForecastCard(results);
      }
    } else {
      // Return the initial weather forecast since no data is available.
      updateForecastCard(initialWeatherForecast);
    }
  };
  request.open('GET', url);
  request.send();

  function updateForecastCard(data) {
    var dataLastUpdated = new Date(data.created);    
    var lastBuildDate = data.channel.lastBuildDate;
    var title = data.channel.title;
    var sunrise = data.channel.astronomy.sunrise;
    var sunset = data.channel.astronomy.sunset;
    var current = data.channel.item.condition;
    var humidity = data.channel.atmosphere.humidity;
    var wind = data.channel.wind;

    console.log("Meteo", lastBuildDate, title, current, humidity, wind);
  }

})();