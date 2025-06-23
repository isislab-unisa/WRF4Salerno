// Variabili globali per i dati di configurazione e dataset
let area = null;
let hour_prediction = null;
let resolution = null;
let resolution_scale = null;
let initial_bounds = null;
let initial_zoom = null;
let validDate = null;
let validRuntime = null;
let endhour = null;

// Variabile globale per l'ultimo punto selezionato con doppio click
let lastChartPoint = null;

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
      "data:image/svg+xml;charset=UTF-8," 
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
  // const centerLat = (minLat + maxLat) / 2;
  // const centerLng = (minLng + maxLng) / 2;
  // map.setView([centerLat, centerLng]);

  // Impedisci lo scorrimento oltre i limiti
  // map.on("drag", function () {
  //   map.panInsideBounds(bounds, { animate: false });
  // });
}

function loadForecast() {
  const time = document.getElementById("timeSlider").value;
  $.getJSON("json/output_"+time+".geojson", function (data) {
    loadForecastHelper(data);
    // Se il chart è attivo, aggiorna il grafico e la UI
    const chartContainer = document.querySelector('.chart-container');
    const toggleChartBtn = document.getElementById('toggleChartBtn');
    if ((chartContainer && chartContainer.style.display !== 'none') || (toggleChartBtn && toggleChartBtn.classList.contains('active'))) {
      activateChartView();
      if (lastChartPoint) {
        loadChartData(lastChartPoint.lat, lastChartPoint.lng);
      } else {
        loadChartData(initial_bounds[0], initial_bounds[1]);
      }
    }
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
        const info = `Lat: ${lat}, Lng: ${lng}, T: ${data.toFixed(
          2
        )} °C`;
        document.getElementById("data").textContent = info;
      } else if (typeofData === "wind") {
        const u = matchingFeature.properties.u_values;
        const v = matchingFeature.properties.v_values;
        const data = Math.sqrt(u ** 2 + v ** 2);
        const direction = (Math.atan2(u, v) * 180 / Math.PI + 360) % 360; // direzione in gradi
        const knots = data * 1.94384; // 1 m/s = 1.94384 knot
        const info = `Lat: ${lat}, Lng: ${lng}, spd: ${data.toFixed(2)} m/s (${knots.toFixed(2)} kt), dir: ${direction.toFixed(0)}°`;
        document.getElementById("data").textContent = info;
      } else if (typeofData === "rain") {
        // Mostra info pioggia (rain: istantanea, rain_accum: accumulo totale)
        const rain = matchingFeature.properties.rain;
        const rainAccum = matchingFeature.properties.rain_accum;
        const info = `Lat: ${lat}, Lng: ${lng}, rain: ${rain.toFixed(2)} mm, acc: ${rainAccum.toFixed(2)} mm`;
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
    validDate = data["dataprediction"];
    validRuntime = data["runtime"];
    endhour = data["endhour"];

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

// Esempio: runtime = "2024060512" (YYYYMMDDHH), hour_prediction = 48
let lastTimelineRuntime = null;
let lastTimelineHourPrediction = null;


function setTime(value, runtime = null, hour_prediction = null) {
  // Aggiorna le variabili globali se passate
  if (runtime) lastTimelineRuntime = runtime;
  if (hour_prediction) lastTimelineHourPrediction = hour_prediction;
  if (lastTimelineRuntime) {
    const year = parseInt(lastTimelineRuntime.slice(0, 4));
    const month = parseInt(lastTimelineRuntime.slice(4, 6)) - 1;
    const day = parseInt(lastTimelineRuntime.slice(6, 8));
    const startHour = lastTimelineRuntime.length >= 10 ? parseInt(lastTimelineRuntime.slice(8, 10)) : 0;
    // Calcola la data/ora effettiva sommando value ore all'inizio
    const date = new Date(year, month, day, startHour + Number(value));
    const dayShort = date.toLocaleString('it-IT', { weekday: 'short' });
    const dayNum = date.getDate().toString().padStart(2, '0');
    const hourStr = date.getHours().toString().padStart(2, '0');
    document.getElementById("selectedTime").textContent = `${dayShort} ${dayNum} - ${hourStr}:00`;
  
    // Attiva solo quando si cambia giorno rispetto al precedente
    if (typeof setTime.prevDayNum === 'undefined') setTime.prevDayNum = null;
    if (setTime.prevDayNum !== dayNum) {
      // (Rimosso: non disattivare più il chart quando si cambia giorno)
      // loadChartData( initial_bounds[0],initial_bounds[1]);
    }
    setTime.prevDayNum = dayNum;
  } else {
    // Fallback se non è ancora nota la data di partenza
    const hour = Number(value) % 24;
    document.getElementById("selectedTime").textContent = hour.toString().padStart(2, "0") + ":00";
  }
}


let dataForchart = null; // Variabile globale per i dati del grafico

// let lastTimelineRuntime = null;
// let lastTimelineHourPrediction = null;
function loadChartData( latitude,longitude) {
  // Mostra lo spinner di loading
  const spinner = document.getElementById('chartLoadingSpinner');
  if (spinner) spinner.style.display = '';
  // Rimuovi il vecchio chart all'inizio
  if (window.chartInstance) {
    window.chartInstance.destroy();
    window.chartInstance = null;
  }
  const toggleChartBtn = document.getElementById('toggleChartBtn');
  if (toggleChartBtn) toggleChartBtn.disabled = true;
  const sliderValue = Number(document.querySelector("#timeSlider").value);
  const day = Math.floor(sliderValue / 24);
  // Calcola il numero di ore effettive per il giorno selezionato
  let startHour = 24 * day;
  let endHour = Math.min(startHour + 23, hour_prediction - 1);
  let numHours = endHour - startHour + 1;
  // Usa la variabile globale validDate (formato YYYYMMDD)
  const year = parseInt(validDate.slice(0, 4));
  const month = parseInt(validDate.slice(4, 6)) - 1;
  const dayNum = validDate.slice(6, 8);
  const dateObj = new Date(year, month, dayNum);
  const dayShort = dateObj.toLocaleString('it-IT', { weekday: 'short' });
  let requests = [];
  let dataForchart = {title:`${dayShort} ${dayNum}` ,features:[]};
  let dataByLatLon = {};
  // Ottieni il forecastType selezionato
  const forecastType = document.querySelector('input[name="forecastType"]:checked').value;
  for (let i = startHour; i <= endHour; i++) {
    requests.push(
      $.getJSON(`json/output_${i}.geojson`, function (geojson) {
        geojson.features.filter(f => {
          const lat = f.properties.latitude;
          const lon = f.properties.longitude;
          if(lat === latitude && lon === longitude) {
            const key = `${lat},${lon}`;
            if (!dataByLatLon[key]) {
              dataByLatLon[key] = new Array(numHours).fill(null);
            }
            const hourIdx = i - startHour;
            dataByLatLon[key][hourIdx] = {
              ...f.properties,
              time: i
            };
          }
        });
      })
    );
  }
  $.when.apply($, requests).always(function () {
    dataForchart.features = dataByLatLon;
    if (toggleChartBtn) toggleChartBtn.disabled = false;
    // Nascondi lo spinner di loading
    if (spinner) spinner.style.display = 'none';
    // console.log("Dati per il grafico caricati:", dataForchart);
    loadChartInfo(latitude, longitude, dataForchart, forecastType, numHours); // Passa anche numHours
    dataForchart= null; // Resetta la variabile globale per evitare conflitti futuri
  });
}

function loadChartInfo(latitude,longitude,dataForchart,forecastType,numHours){
  // Trova la feature corrispondente alla latitudine e longitudine

  if (!dataForchart || !dataForchart.features) {
    console.warn("Dati per il grafico non disponibili");
    return;
  }

  // Trova la feature corrispondente alla latitudine e longitudine
  const key = `${latitude},${longitude}`;
  const matchingFeature = dataForchart.features[key];
  
  if (matchingFeature) {
    // Se la feature esiste, aggiorna il grafico
    // console.log("Feature trovata:", matchingFeature);
    // Qui puoi aggiungere la logica per aggiornare il grafico con i dati della feature
    const chartData = {
      labels: Array.from({ length: numHours }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      datasets: []
    };
    
    if (forecastType === 'temperature') {
      let temperature=[]
      for (let i = 0; i < matchingFeature.length; i++) {
        temperature[i] = matchingFeature[i].temperature;
      }
      // console.log(temperature);

      chartData.datasets.push({
        label: `Punto Selezionato: ${latitude},${longitude}`,
        data: temperature,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true
      });
    }
    else if (forecastType === 'wind') {
      const windKnots = [];
      const windDir = [];
      for (let i = 0; i < matchingFeature.length; i++) {
        const u = matchingFeature[i].u_values;
        const v = matchingFeature[i].v_values;
        const speed = Math.sqrt(u * u + v * v);
        windKnots[i] = speed * 1.94384; // 1 m/s = 1.94384 nodi
        windDir[i] = (Math.atan2(u, v) * 180 / Math.PI + 360) % 360; // direzione in gradi
      }
      chartData.datasets.push({
        label: `Punto Selezionato: ${latitude},${longitude}`,
        data: windKnots,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        yAxisID: 'y',
      });
      chartData.datasets.push({
        label: 'Direzione vento (°)',
        data: windDir,
        borderColor: 'rgba(255, 205, 86, 1)',
        backgroundColor: 'rgba(255, 205, 86, 0.2)',
        fill: false,
        yAxisID: 'y1',
        pointRadius: 2,
        borderDash: [5,5],
      });
    } else if (forecastType === 'rain') {
      chartData.datasets.push({
        label: `Punto Selezionato: ${latitude},${longitude}`,
        data: matchingFeature.map(f => f.rain),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      });
    }

    // Qui puoi aggiungere la logica per disegnare il grafico con chartData
    const ctx = document.getElementById('infoChart').getContext('2d');
    window.chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ora del giorno'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: forecastType === 'wind' ? 'Vento (kt)' : (forecastType === 'temperature' ? 'Temperatura (°C)' : 'Pioggia (mm)')
            },
            beginAtZero: true
          },
          y1: forecastType === 'wind' ? {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Direzione (°)'
            },
            min: 0,
            max: 360,
            grid: {
              drawOnChartArea: false
            }
          } : undefined
        }
      }
    });    

  } else {
    console.log("Nessuna feature trovata per le coordinate:", latitude, longitude);
  }

}


$.getJSON("json/config.json", function (config) {
        area=config["area"];
        hour_prediction=config["hour_prediction"];
        resolution=config["resolution"];
        resolution_scale=config["resolution_scale"];
        initial_bounds=config["initial_bounds"];
        initial_zoom = config["initial_zoom"] || 8;
        
        // Aggiorna solo lo span dell'area
        document.querySelector(".logo-area").textContent = area;
        
        document.querySelector(
          ".dataset-info"
        ).innerHTML = `<span class='info-label'>Area:</span> <span class='info-value'>${area}</span><br>`+
          `<span class='info-label'>Durata:</span> <span class='info-value'>${hour_prediction}h</span><br>`+
          `<span class='info-label'>Risoluzione:</span> <span class='info-value'>${resolution} ${resolution_scale}</span>`;
        map.setView(initial_bounds, initial_zoom)

        document.querySelector("#timeSlider").max = hour_prediction-1;
        
        $.getJSON("json/datasetinfo.json", function (data) {
          const validDate = data["dataprediction"];
          // console.log("Valid date:", validDate);
          // Genera la timeline
          // generateTimeline(validDate, config.hour_prediction);
          setTime(document.querySelector("#timeSlider").value,validDate, config.hour_prediction);
          
        })

        updateTimeSliderLabelsOnConfig(); // Aggiorna le etichette del timeSlider

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

// --- Scala di intensità dinamica ---
function updateLegendScale(type, windMax = 30) {
  const legend = document.getElementById('legend-scale');
  if (!legend) return;
  let title = '';
  let min = '';
  let max = '';
  let bar = '';
  let barClass = '';
  if (type === 'temperature') {
    title = 'Temperatura (°C)';
    min = 'Min';
    max = 'Max';
    bar = 'linear-gradient(90deg, #00c3ff 0%, #ffff1c 50%, #ff0000 100%)';
    barClass = '';
  } else if (type === 'wind') {
    // Conversione m/s -> nodi (kt)
    title = 'Vento (kt)';
    min = '0';
    max = Math.round(windMax * 1.94384).toString();
    bar = 'linear-gradient(90deg, #440154 0%, #31688e 25%, #35b779 50%, #fde725 100%)'; // viridis
    barClass = 'viridis';
  } else if (type === 'rain') {
    title = 'Pioggia (mm)';
    min = '0';
    max = '50+';
    bar = 'linear-gradient(90deg, #e0f7fa 0%, #00bcd4 50%, #01579b 100%)';
    barClass = '';
  } else {
    legend.innerHTML = '';
    return;
  }
  legend.innerHTML = `
    <div class="legend-scale-title">${title}</div>
    <div class="legend-scale-bar ${barClass}" style="background: ${bar};"></div>
    <div class="legend-scale-labels d-flex justify-content-between w-100">
      <span>${min}</span>
      <span>${max}</span>
    </div>
  `;
}

// Aggiorna la scala quando cambia il tipo di previsione
$(document).on('change', 'input[name="forecastType"]', function() {
  if(this.value === 'wind') {
    // Calcolo dinamico del massimo valore del vento (m/s) se disponibile
    if(window.lastWindMax) {
      updateLegendScale('wind', window.lastWindMax);
    } else {
      updateLegendScale('wind');
    }
  } else {
    updateLegendScale(this.value);
  }
});
// Aggiorna la scala all'avvio
const initialType = document.querySelector('input[name="forecastType"]:checked').value;
if(initialType === 'wind' && window.lastWindMax) {
  updateLegendScale('wind', window.lastWindMax);
} else {
  updateLegendScale(initialType);
}

// Calcolo dinamico del massimo valore del vento (m/s) quando si carica un nuovo dataset
function setWindLegendMaxFromData(data) {
  if (!data || !data.features) return;
  let maxWind = 0;
  data.features.forEach(f => {
    const u = f.properties.u_values;
    const v = f.properties.v_values;
    const wind = Math.sqrt(u*u + v*v);
    if (wind > maxWind) maxWind = wind;
  });
  window.lastWindMax = Math.ceil(maxWind);
  // Aggiorna la scala se il tipo selezionato è wind
  if(document.querySelector('input[name="forecastType"]:checked').value === 'wind') {
    updateLegendScale('wind', window.lastWindMax);
  }
}
// Chiama setWindLegendMaxFromData(data) ogni volta che carichi i dati del vento
// Esempio: dentro loadWind(..., data) aggiungi setWindLegendMaxFromData(data);

// --- Gestione toggle chart/info-box/scala ---
let chartActive=false
document.addEventListener('DOMContentLoaded', function() {
  const chartContainer = document.querySelector('.chart-container');
  const infoBox = document.querySelector('.info-box');
  const legendScale = document.getElementById('legend-scale');
  const toggleChartBtn = document.getElementById('toggleChartBtn');
   chartActive = false;

  if (chartContainer && infoBox && legendScale && toggleChartBtn) {
    chartContainer.style.display = 'none'; // di default mostra info-box e scala
    toggleChartBtn.addEventListener('click', function() {
      chartActive = !chartActive;
      if (chartActive) {
        activateChartView();
        if (lastChartPoint) {
          loadChartData(lastChartPoint.lat, lastChartPoint.lng);
        } else {
          loadChartData(initial_bounds[0], initial_bounds[1]);
        }
        // console.log("Grafico attivo, info-box e scala nascoste.");
      } else {
        deactivateChartView();
        // Se vuoi, puoi anche azzerare lastChartPoint qui:
        // lastChartPoint = null;
      }
    });
  }
});

// Funzione globale per attivare la visuale chart in modo coerente
function activateChartView() {
  const chartContainer = document.querySelector('.chart-container');
  const infoBox = document.querySelector('.info-box');
  const legendScale = document.getElementById('legend-scale');
  const toggleChartBtn = document.getElementById('toggleChartBtn');
  if (chartContainer && infoBox && legendScale && toggleChartBtn) {
    chartContainer.style.display = '';
    infoBox.style.display = 'none';
    legendScale.style.visibility = 'hidden';
    toggleChartBtn.classList.add('active');
    if (window.hasOwnProperty('chartActive')) chartActive = true;
  }
}

// Funzione globale per disattivare la visuale chart
function deactivateChartView() {
  const chartContainer = document.querySelector('.chart-container');
  const infoBox = document.querySelector('.info-box');
  const legendScale = document.getElementById('legend-scale');
  const toggleChartBtn = document.getElementById('toggleChartBtn');
  if (chartContainer && infoBox && legendScale && toggleChartBtn) {
    chartContainer.style.display = 'none';
    infoBox.style.display = '';
    legendScale.style.visibility = 'visible';
    toggleChartBtn.classList.remove('active');
    if (window.hasOwnProperty('chartActive')) chartActive = false;
  }
}

// Gestione doppio click sulla mappa
map.on('dblclick', function(e) {
  const lat = parseFloat(e.latlng.lat.toFixed(2));
  const lng = parseFloat(e.latlng.lng.toFixed(2));
  lastChartPoint = { lat, lng };
  chartActive=true
  // Attiva la visuale chart in modo centralizzato
  activateChartView();
  // Carica il chart per il punto selezionato
  loadChartData(lat, lng);
});

// All'avvio, se c'è un valore precedente per lastChartPoint, attiva la visuale chart
if (lastChartPoint) {
  activateChartView();
}

// Genera le etichette solo ogni 24 ore sotto il timeSlider, con la data (es: Mar 17)
function renderTimeSliderLabels() {
  const labelsDiv = document.getElementById('timeSliderLabels');
  if (!labelsDiv) return;
  let html = '';
  if (typeof hour_prediction !== 'number' || hour_prediction < 1 || !validDate) {
    labelsDiv.innerHTML = '';
    return;
  }
  // validDate formato YYYYMMDD
  const year = parseInt(validDate.slice(0, 4));
  const month = parseInt(validDate.slice(4, 6)) - 1; // JS: 0=Gen
  const day = parseInt(validDate.slice(6, 8));
  for (let i = 0; i < hour_prediction; i += 24) {
    const date = new Date(year, month, day + Math.floor(i/24));
    const label = date.toLocaleDateString('it-IT', { month: 'short', day: '2-digit' });
    html += `<span style="position:absolute;left:${(i/(hour_prediction-1))*100}%;transform:translateX(-50%);font-size:0.85em;">${label.charAt(0).toUpperCase() + label.slice(1)}</span>`;
  }
  labelsDiv.innerHTML = html;
  labelsDiv.style.position = 'relative';
  labelsDiv.style.height = '1.2em';
}

document.addEventListener('DOMContentLoaded', renderTimeSliderLabels);
// Aggiorna le etichette quando cambia hour_prediction
function updateTimeSliderLabelsOnConfig() {
  renderTimeSliderLabels();
}
// Chiamare updateTimeSliderLabelsOnConfig() dopo aver settato hour_prediction da config.json
