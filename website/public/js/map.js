var imageBounds = [
  [39.71, 14.07], // Angolo in alto a sinistra (latitudine, longitudine)
  [40.87, 15.74], // Angolo in basso a destra (latitudine, longitudine)
];
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
}).setView([40.3, 14.9], 9); // Adjust initial view

// Add a tile layer to the map
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap contributors'
}).addTo(map);


let imageLayers = [];

const markerCluster = L.markerClusterGroup();

// Funzione per aggiungere un imageOverlay e tenerne traccia
function addImageOverlay(url, bounds, options) {
  const layer = L.imageOverlay(url, bounds, options).addTo(map);
  imageLayers.push(layer);
  return layer;
}

function loadForecastHelper(data){
  // Rimuovi tutte le immagini precedenti
  imageLayers.forEach(layer => map.removeLayer(layer));
  imageLayers = [];

  const time = document.getElementById("timeSlider").value;
  const forecastType = document.querySelector(
    'input[name="forecastType"]:checked'
  ).value;
  
  // const btn = document.getElementById("loadBtn");
  // btn.disabled = true;

    const validDate = data.name.split("_")[1]; // Estrai la data dal nome del file
    if (forecastType === "temperature") {
      loadTemperature(validDate, time,data);
    } else if (forecastType === "wind") {
      loadWind(validDate, time,data);
    }
  

  // Calcola i bounds dinamicamente dai dati
  const lats = data.features.map(f => f.properties.latitude);
  const lngs = data.features.map(f => f.properties.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // const bounds = [
  //   [minLat, minLng], // Sud-Ovest
  //   [maxLat, maxLng]  // Nord-Est
  // ];
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
  $.getJSON("http://localhost:3000/forecastPoint", function (data) {
  loadDate(data);
  loadForecastHelper(data);
}).fail(function () {
    console.error("Errore nel caricamento dei dati JSON");
    btn.disabled = false; // Riabilita il bottone in caso di errore
    btn.textContent = "Carica dati";
  });
}


//TODO: aggiungere la gestione dell'orario
function loadWidgetInfo(typeofData,data) {
    map.on("mousemove", function (e) {
      let { lat, lng } = e.latlng; // Ottieni latitudine e longitudine
      lat= lat.toFixed(2);
      lng= lng.toFixed(2);
      console.log(`Latitudine: ${lat}, Longitudine: ${lng}`);
      const matchingFeature = data.features.find((feature) => {
        const featureLat = feature.properties.latitude.toFixed(2);
        const featureLng = feature.properties.longitude.toFixed(2);
        return featureLat === lat && featureLng === lng;
      });
      if (matchingFeature) {
        if (typeofData === "temperature") {
          const data = matchingFeature.properties.temperature;
          const info = `Lat: ${lat}, Long: ${lng}, Temperatura: ${data.toFixed(2)} °C`;
          document.getElementById("data").textContent = info;
        
        }else
        if (typeofData === "wind") {
          const data = Math.sqrt(
            matchingFeature.properties.u_values ** 2 +
              matchingFeature.properties.v_values ** 2
          );
          const info = `Lat: ${lat}, Long: ${lng}, Velocità: ${data.toFixed(2)} m/s`;
          document.getElementById("data").textContent = info;
        }
      } else {
        document.getElementById("data").textContent = "Nessun dato disponibile";
      }
    });
}

function loadDate(data) {
    const validDate = data.name.split("_")[1]; // Estrai la data dal nome del file
    const dateInput = document.getElementById("update-time");
    const formattedDate = `${validDate.slice(6, 8)}/${validDate.slice(
      4,
      6
    )}/${validDate.slice(0, 4)}`;
    dateInput.value = `Previsioni del - ${formattedDate}`;
    dateInput.textContent = `Previsioni del - ${formattedDate}`;
}

function loadTemperature(date, time,data) {
  const btn = document.getElementById("loadBtn");

  var imageUrl = "Image/minimal_temperature_plot" + date + ":" + time + ".png";

  var imageBounds = [
    [39.71, 14.07], // Angolo in alto a sinistra (latitudine, longitudine)
    [40.87, 15.74], // Angolo in basso a destra (latitudine, longitudine)
  ];

  // Aggiungi l'immagine come layer principale
  // L.imageOverlay(imageUrl, imageBounds, {opacity: 0.6}).addTo(map);
  addImageOverlay(
    imageUrl,
    imageBounds,
    { opacity: 0.6 }
  ); // Aggiungi l'immagine come layer principale

  // Aggiorna la color bar
  loadWidgetInfo("temperature",data); // Aggiungi i marker per la temperatura
  btn.disabled = false; // 🔓 Riabilita il bottone
  btn.textContent = "Carica dati";
}

function loadWind(date, time,data) {
  const btn = document.getElementById("loadBtn");

  // const samplingRate = 5; // Cambia questo valore per regolare il sampling (es. ogni 5 elementi)

  // fetch('json/output_20241206.geojson')
  // .then(response => {
  //     if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     return response.json(); // Parse the JSON data
  // })
  // .then(json => {
  //         json.features.forEach((feature,index) => {
  //         const { u_values, v_values } = feature.properties;
  //         if (index % samplingRate !== 0) {
  //             return; // Salta gli elementi che non soddisfano il sampling
  //         }

  //         if(u_values == 0 && v_values == 0){
  //             return; // Skip if both u and v are zero
  //         }
  //         const [lon, lat] = [feature.properties.longitude, feature.properties.latitude];
  //         const marker = L.circleMarker([lat, lon], {
  //             radius: 0,       // Raggio del marker invisibile
  //             opacity: 0,      // Opacità del bordo invisibile
  //             fillOpacity: 0   // Opacità del riempimento invisibile
  //         }).addTo(map);

  //         const speed = Math.sqrt(u_values ** 2 + v_values ** 2);
  //         marker.bindPopup(
  //             `Velocità: ${speed} m/s<br>Lat: ${lat}<br>Long: ${lon}`,
  //             { permanent: false, direction: "top" }
  //         );

  //         marker.addTo(map);
  //         // You can now use the JSON data here
  //         var imageUrl = 'Image/minimal_wind_plot'+date+':'+time+'.png';

  //         var imageBounds = [
  //             [39.71, 14.07], // Angolo in alto a sinistra (latitudine, longitudine)
  //             [40.87,15.74]  // Angolo in basso a destra (latitudine, longitudine)
  //         ];

  //         // Aggiungi l'immagine come layer principale
  //         L.imageOverlay(imageUrl, imageBounds).addTo(map);
  //             })
  //             .catch(error => {
  //                 console.error('Error loading JSON:', error);
  //             });

  //     }).finally(() => {
  //     btn.disabled = false;     // 🔓 Riabilita il bottone
  //     btn.textContent = "Carica dati";
  // });;
  var imageUrl = "Image/minimal_wind_plot" + date + ":" + time + ".png";

  var imageBounds = [
    [39.71, 14.07], // Angolo in alto a sinistra (latitudine, longitudine)
    [40.87, 15.74], // Angolo in basso a destra (latitudine, longitudine)
  ];

  // Aggiungi l'immagine come layer principale
  // L.imageOverlay(imageUrl, imageBounds).addTo(map);
  addImageOverlay(
    imageUrl,
    imageBounds,
  ); // Aggiungi l'immagine come layer principale
  //             })
  //             .catch(error => {
  //                 console.error('Error loading JSON:', error);
  //             });


  loadWidgetInfo("wind",data); // Aggiungi i marker per il vento

  // btn.disabled = false; // 🔓 Riabilita il bottone
  // btn.textContent = "Carica dati";
}



document.querySelector("#timeSlider").addEventListener("change", (e) => {
  const hour = Number(e.target.value) + 1;
  document.getElementById("selectedTime").textContent =
    "Orario Selezionato: " + hour;
  btn.disabled = true;
});

loadForecast();