const samplingRate = 5; // Cambia questo valore per regolare il sampling (es. ogni 5 elementi)

// LOADING MAP
// Initialize the map
const map = L.map("map", {
  zoomControl: false, // Disattiva i controlli di zoom +
  // dragging: false,        // Disabilita il trascinamento della mappa
  // scrollWheelZoom: false, // Disattiva lo zoom con la rotella del mouse
  doubleClickZoom: false, // Disattiva lo zoom con doppio click
  boxZoom: false, // Disattiva lo zoom con box
  // touchZoom: false        // Disattiva lo zoom su mobile
  // minZoom: 8.5,
  // maxZoom: 14,
}).setView([43,19],11); // Adjust initial view

// Add a tile layer to the map
L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  {
    attribution:
      "&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors",
  }
).addTo(map);

let imageLayers = [];

const markerCluster = L.markerClusterGroup();

// Funzione per aggiungere un imageOverlay e tenerne traccia
function addImageOverlay(url, bounds, options) {
  // Crea un oggetto Image per verificare se l'immagine esiste
  const img = new Image();
  img.onload = function () {
    // Se l'immagine esiste, aggiungila normalmente
    const layer = L.imageOverlay(url, bounds, options).addTo(map);
    imageLayers.push(layer);
    return layer;
  };
  img.onerror = function () {
    // Se l'immagine non esiste, mostra un overlay con un messaggio
    const errorUrl =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60">
          <rect width="100%" height="100%" fill="transparent"/>
          <text x="50%" y="50%" font-size="10" text-anchor="middle" fill="black" dy=".3em">Immagine non disponibile</text>
        </svg>`
      );
    const layer = L.imageOverlay(errorUrl, bounds).addTo(map);
    imageLayers.push(layer);
    return layer;
  };
  img.src = url;
}

function loadForecastHelper(data) {
  // Rimuovi tutte le immagini precedenti
  imageLayers.forEach((layer) => map.removeLayer(layer));
  imageLayers = [];

  const time = document.getElementById("timeSlider").value;
  const forecastType = document.querySelector(
    'input[name="forecastType"]:checked'
  ).value;

  // Calcola i bounds dinamicamente dai dati
  const lats = data.features.map((f) => f.properties.latitude);
  const lngs = data.features.map((f) => f.properties.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const bounds = [
    [minLat, minLng], // Sud-Ovest
    [maxLat, maxLng], // Nord-Est
  ];

  if (forecastType === "temperature") {
    loadTemperature( time,bounds, data);
  } else if (forecastType === "wind") {
    loadWind( time, bounds, data);
  } else if (forecastType === "rain") {
    loadRain( time, bounds, data);
  }

  // map.setMaxBounds(bounds);
  // const bounds = [
  //   [39.5, 13.5], // Sud-Ovest (latitudine, longitudine)
  //   [41.5, 16.5], // Nord-Est (latitudine, longitudine)
  // ];
  // map.setMaxBounds(bounds);

  // Calcola il centro dei bounds
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  map.setView([centerLat, centerLng]);

  // Impedisci lo scorrimento oltre i limiti
  // map.on("drag", function () {
  //   map.panInsideBounds(bounds, { animate: false });
  // });
}

function loadForecast() {
  const time = document.getElementById("timeSlider").value;
  $.getJSON("json/output_"+time+".geojson", function (data) {
    loadForecastHelper(data);
  }).fail(function () {
    console.error("Errore nel caricamento dei dati JSON");
  });
}

function loadWidgetInfo(typeofData, data) {
  map.on("mousemove", function (e) {
    let { lat, lng } = e.latlng; // Ottieni latitudine e longitudine
    lat = lat.toFixed(2);
    lng = lng.toFixed(2);
    const matchingFeature = data.features.find((feature) => {
      const featureLat = feature.properties.latitude.toFixed(2);
      const featureLng = feature.properties.longitude.toFixed(2);
      return featureLat === lat && featureLng === lng;
    });
    if (matchingFeature) {
      document.getElementById("data").style.visibility = "visible";

      if (typeofData === "temperature") {
        const data = matchingFeature.properties.temperature;
        const info = `Lat: ${lat}, Long: ${lng}, Temperatura: ${data.toFixed(
          2
        )} °C`;
        document.getElementById("data").textContent = info;
      } else if (typeofData === "wind") {
        const data = Math.sqrt(
          matchingFeature.properties.u_values ** 2 +
            matchingFeature.properties.v_values ** 2
        );
        const knots = data * 1.94384; // 1 m/s = 1.94384 knot
        const info = `Lat: ${lat}, Long: ${lng}, Velocità: ${knots.toFixed(2)} kt`;
        document.getElementById("data").textContent = info;
      } else if (typeofData === "rain") {
        // Mostra info pioggia (rain: istantanea, rain_accum: accumulo totale)
        const rain = matchingFeature.properties.rain;
        const rainAccum = matchingFeature.properties.rain_accum;
        const info = `Lat: ${lat}, Long: ${lng}, Pioggia: ${rain.toFixed(2)} mm, Accumulo: ${rainAccum.toFixed(2)} mm`;
        document.getElementById("data").textContent = info;
        document.getElementById("data").style.visibility = "visible";
      }
    } else {
      document.getElementById("data").style.visibility = "hidden";
    }
  });
}

function loadInfo() {
  const dateInput = document.getElementById("update-time");
  $.getJSON("json/datasetinfo.json", function (data) {
    const validDate = data["dataprediction"];
    const validRuntime = data["runtime"];
    const endhour = data["endhour"];

    // Format dataprediction (YYYYMMDD → DD/MM/YYYY)
    const formattedDate = `${validDate.slice(6, 8)}/${validDate.slice(4, 6)}/${validDate.slice(0, 4)}`;
    // Format runtime (YYYYMMDD or YYYYMMDDHH → DD/MM/YYYY [HH:00])
    let formattedRuntime = "-";
    if (typeof validRuntime === "string" && validRuntime.length >= 8) {
      const day = validRuntime.slice(6, 8);
      const month = validRuntime.slice(4, 6);
      const year = validRuntime.slice(0, 4);
      if (validRuntime.length >= 10) {
        const hour = validRuntime.slice(8, 10);
        formattedRuntime = `${day}/${month}/${year} ${hour}:00`;
      } else {
        formattedRuntime = `${day}/${month}/${year}`;
      }
    }

    // Testo minimale e chiaro
    const infoText = `<span class='info-label'>Previsioni:</span> <span class='info-value'>${formattedDate}</span><br>` +
      `<span class='info-label'>Eseguito:</span> <span class='info-value'>${formattedRuntime}</span><br>` +
      `<span class='info-label'>Fine:</span> <span class='info-value'>${endhour || '-'} </span>`;
    dateInput.innerHTML = infoText;
    dateInput.value = infoText;
  }).fail(function () {
    const infoText = "Dati non disponibili";
    dateInput.innerHTML = infoText;
    dateInput.value = infoText;
  });

  // $.getJSON("http://localhost:3000/config", function (data) {
  //   const area=data["area"];
  //   const hour_prediction=data["hour_prediction"];
  //   resolution=data["resolution"];
  //   resolution_scale=data["resolution_scale"];
  //   initial_bounds=data["initial_bounds"];
  // }).fail(function () {

  // });
}

function loadTemperature( time,bounds, data) {

  var imageUrl = "Image/minimal_temperature_plot_" + time + ".png";

  // Aggiungi l'immagine come layer principale
  // L.imageOverlay(imageUrl, imageBounds, {opacity: 0.6}).addTo(map);
  addImageOverlay(imageUrl, bounds, { opacity: 0.6 }); // Aggiungi l'immagine come layer principale

  // Aggiorna la color bar
  loadWidgetInfo("temperature", data); // Aggiungi i marker per la temperatura
}

function loadWind( time, bounds,data) {

  var imageUrl = "Image/minimal_wind_plot_" + time + ".png";

  // Aggiungi l'immagine come layer principale
  // L.imageOverlay(imageUrl, imageBounds).addTo(map);
  addImageOverlay(imageUrl, bounds); // Aggiungi l'immagine come layer principale
  
  loadWidgetInfo("wind", data); // Aggiungi i marker per il vento

}

function loadRain( time, bounds,data) {

  var imageUrl = "Image/minimal_rain_plot_" + time + ".png";

  // Aggiungi l'immagine come layer principale
  // L.imageOverlay(imageUrl, imageBounds).addTo(map);
  addImageOverlay(imageUrl, bounds,{opacity:0.6}); // Aggiungi l'immagine come layer principale
  
  loadWidgetInfo("rain", data); // Aggiungi i marker per la pioggia

}

document.querySelector("#timeSlider").addEventListener("change", (e) => {
  setTime(e.target.value);
});

function setTime(value) {
  const hour = Number(value) % 24;
  document.getElementById("selectedTime").textContent =
    "" + hour.toString().padStart(2, "0") + ":00";
}

// Esempio: runtime = "2024060512" (YYYYMMDDHH), hour_prediction = 48
let lastTimelineRuntime = null;
let lastTimelineHourPrediction = null;

function generateTimeline(runtime, hour_prediction) {
  lastTimelineRuntime = runtime;
  lastTimelineHourPrediction = hour_prediction;
  const ticksContainer = document.querySelector('.timeline-ticks');
  ticksContainer.innerHTML = ""; // Svuota i tick

  // Parsing della data di partenza
  const year = parseInt(runtime.slice(0, 4));
  const month = parseInt(runtime.slice(4, 6)) - 1; // JS: 0-based
  const day = parseInt(runtime.slice(6, 8));
  const hour = runtime.length >= 10 ? parseInt(runtime.slice(8, 10)) : 0;

  // Scegli la frequenza dei tick in base alla larghezza dello schermo
  const isMobile = window.innerWidth <= 600;
  const tickStep = isMobile ? 24 : 6; // Su mobile mostra solo ogni 24 ore

  for (let i = 0; i < hour_prediction; i++) {
    const date = new Date(year, month, day, hour + i);
    if (i % tickStep === 0 || i === 0 || i === hour_prediction - 1) {
      const dayShort = date.toLocaleString('it-IT', { weekday: 'short' });
      const dayNum = date.getDate().toString().padStart(2, '0');
      const hourStr = date.getHours().toString().padStart(2, '0');
      const label = `${dayShort} ${dayNum} - ${hourStr}:00`;
      const span = document.createElement('span');
      span.textContent = label;
      ticksContainer.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.textContent = '';
      ticksContainer.appendChild(span);
    }
  }

  // Aggiorna lo slider
  const slider = document.getElementById('timeSlider');
  slider.max = hour_prediction - 1;

  // slider.addEventListener('input', function() {
  //   const idx = parseInt(slider.value);
  //   const date = new Date(year, month, day, hour + idx);
  //   const dayShort = date.toLocaleString('it-IT', { weekday: 'short' });
  //   const dayNum = date.getDate().toString().padStart(2, '0');
  //   const hourStr = date.getHours().toString().padStart(2, '0');
  //   document.getElementById('selectedTime').textContent =
  //     `Orario selezionato: ${dayShort} ${dayNum} - ${hourStr}:00`;
  // });
}

window.addEventListener('resize', function() {
  if (lastTimelineRuntime && lastTimelineHourPrediction) {
    generateTimeline(lastTimelineRuntime, lastTimelineHourPrediction);
  }
});

$.getJSON("json/config.json", function (config) {
        const area=config["area"];
        const hour_prediction=config["hour_prediction"];
        const resolution=config["resolution"];
        const resolution_scale=config["resolution_scale"];
        const initial_bounds=config["initial_bounds"];
        const initial_zoom = config["initial_zoom"] || 8;
        document.querySelector(
            ".logo"
          ).textContent = `MeteoSuMisura:${area}`;
        
        document.querySelector(
          ".dataset-info"
        ).innerHTML = `<span class='info-label'>Area:</span> <span class='info-value'>${area}</span><br>`+
          `<span class='info-label'>Durata:</span> <span class='info-value'>${hour_prediction}h</span><br>`+
          `<span class='info-label'>Risoluzione:</span> <span class='info-value'>${resolution} ${resolution_scale}</span>`;
        map.setView(initial_bounds, initial_zoom)

        document.querySelector("#timeSlider").max = hour_prediction-1;
        
        $.getJSON("json/datasetinfo.json", function (data) {
          const validDate = data["dataprediction"];
          console.log("Valid date:", validDate);
          // Genera la timeline
          generateTimeline(validDate, config.hour_prediction);
        })

        document.title = `MeteoSuMisura ${area}`;

      }).fail(function () {

      });

setTime(document.querySelector("#timeSlider").value);
loadInfo();
loadForecast();

// --- Precaricamento immagini forecast ---
const preloadedImages = {};
function preloadForecastImages(type, maxTime) {
  for (let t = 0; t <= maxTime; t++) {
    let url = '';
    if (type === 'temperature') url = `Image/minimal_temperature_plot_${t}.png`;
    else if (type === 'wind') url = `Image/minimal_wind_plot_${t}.png`;
    else if (type === 'rain') url = `Image/minimal_rain_plot_${t}.png`;
    const img = new Image();
    img.src = url;
    preloadedImages[`${type}_${t}`] = img;
  }
}

// --- Debounce utility ---
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Modifica l'evento dello slider per usare debounce
const slider = document.getElementById('timeSlider');
slider.removeEventListener('input', setTime); // Rimuovi eventuale vecchio handler
slider.addEventListener('input', debounce(function(e) {
  setTime(e.target.value);
  loadForecast();
}, 120)); // 120ms debounce

// Precarica le immagini all'avvio (puoi anche farlo dopo aver letto config)
$.getJSON("json/config.json", function (config) {
  // ...existing code...
  preloadForecastImages('temperature', config.hour_prediction-1);
  preloadForecastImages('wind', config.hour_prediction-1);
  preloadForecastImages('rain', config.hour_prediction-1);
  // ...existing code...
});

// Applica una transizione CSS all'opacità delle immagini overlay
const style = document.createElement('style');
style.innerHTML = `.leaflet-image-layer { transition: opacity 0.3s; }`;
document.head.appendChild(style);

$(document).ready(function () {
  // Timeline play/stop logic
  let timelineInterval = null;
  const $slider = $('#timeSlider');
  const $playBtn = $('#timelinePlayBtn');
  const $playIcon = $('#timelinePlayIcon');

  $playBtn.on('click', function () {
    if (timelineInterval) {
      // Stop
      clearInterval(timelineInterval);
      timelineInterval = null;
      $playIcon.removeClass('bi-pause-fill').addClass('bi-play-fill');
    } else {
      // Play
      $playIcon.removeClass('bi-play-fill').addClass('bi-pause-fill');
      timelineInterval = setInterval(function () {
        let val = parseInt($slider.val(), 10);
        let max = parseInt($slider.attr('max'), 10);
        if (val < max) {
          $slider.val(val + 1).trigger('input');
          setTime(val + 1); // aggiorna la label orario selezionato
          loadForecast(); // aggiorna la mappa
        } else {
          $slider.val(0).trigger('input');
          setTime(0); // aggiorna la label orario selezionato
          loadForecast(); // aggiorna la mappa
        }
      }, 600); // 600ms per step
    }
  });

  // Stop animation if user interacts with slider manually
  $slider.on('mousedown touchstart', function () {
    if (timelineInterval) {
      clearInterval(timelineInterval);
      timelineInterval = null;
      $playIcon.removeClass('bi-pause-fill').addClass('bi-play-fill');
    }
  });

  // Gestione visibilità info-panel
  const $infoPanel = $('.info-panel');
  $infoPanel.hide();
  $('#toggleInfoPanel').on('click', function(e) {
    e.preventDefault();
    $infoPanel.toggle();
  });

});

// Gestione selezione forecast type minimale
$(document).on('change', 'input[name="forecastType"]', function() {
  $('.icon-label').removeClass('active');
  $(this).next('.icon-label').addClass('active');
});
