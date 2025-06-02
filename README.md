<a id="readme-top"></a>


[![Typing SVG](https://readme-typing-svg.herokuapp.com/?color=dcebfd&size=35&center=true&vCenter=true&width=1000&lines=WRF4Salerno)](https://git.io/typing-svg)

<!-- ABOUT THE PROJECT -->
## About The Project
Il progetto presenta **MeteoSuMisura** una piattaforma in grado di automatizzare l’intero processo di esecuzione di modelli meteorologici ad alta risoluzione per una specifica area geografica.
In particolare, integra il [**Global Forecast System (GFS)**](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) e il [**Weather Research and Forecasting Model (WRF)**](https://github.com/wrf-model/WRF), automatizzando tutte le fasi operative: dal download dei dati globali, alla loro pre-elaborazione e conversione in formati compatibili, fino all'esecuzione delle simulazioni locali ad alta risoluzione.

La piattaforma offre un sistema di visualizzazione web interattivo  che rende intuitiva la consultazione delle previsioni.
Infine, la piattaforma realizzata è stata utilizzata per l'esecuzione e la visualizzazione delle simulazioni meteorologice del Golfo di Salerno.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

### Prerequisiti
Per eseguire correttamente il progetto, è necessario avere installati i seguenti componenti:

* `Docker`: per l'esecuzione isolata e portabile dell'ambiente di simulazione e dei servizi ausiliari.

* `Python 3.8+`: utilizzato per gli script di automazione e gestione del flusso operativo.

* `Node.js`: utilizzato per l'esecuzione della piattaforma web.

### Struttura della repository

- `download/`  
  Script e file per scaricare e configurare il modello WRF sulla macchina locale.

- `wrf-docker/`  
  Configurazione e file per creare un container Docker pronto all’uso con tutti gli strumenti necessari per eseguire il WRF.

- `website/`  
  Front-end web interattivo della piattaforma, sviluppato con Node.js e JavaScript. Include tutte le componenti per la visualizzazione dinamica delle previsioni meteorologiche generate dal modello WRF, oltre alle API di backend e alle risorse statiche.

- `docker-env/`  
  Configurazione completa per predisporre e avviare la piattaforma in ambiente Docker, inclusi script di avvio, entrypoint e file di configurazione.

- `script/`  
  Raccolta di script Python e shell per automatizzare il flusso di lavoro: elaborazione, esecuzione e gestione dei dati generati dal WRF.

- `public/`  
  Risorse statiche e file per la visualizzazione interattiva dei dati meteorologici prodotti dal modello tramite il front-end web.

- `examples/`  
  Esempi di file di configurazione (`namelist.input`, `namelist.wps`, `config.json`) utili per personalizzare e avviare rapidamente la piattaforma.

## Avvio rapido di una propria istanza di MeteoSuMisura

Segui questi passaggi per avviare la piattaforma **MeteoSuMisura** da zero utilizzando Docker:

1. **Clona la repository**

   ```sh
   git clone https://github.com/tuo-utente/WRF4Salerno.git
   cd WRF4Salerno
   ```

2. **Costruisci l’immagine Docker**

   Vai nella cartella `docker-env` e costruisci l’immagine Docker:

   ```sh
   cd docker-env
   docker build -t meteosumisura .
   ```

3. **Configura i file di input**

   Prepara i file di configurazione necessari:
   - `namelist.input` e `namelist.wps` (per WRF e WPS)
   - `config.json` (per la configurazione della piattaforma)

   Puoi trovare esempi di questi file nella cartella `examples`.  
   Per maggiori dettagli sulla configurazione dei namelist consulta la [documentazione ufficiale WRF](https://www2.mmm.ucar.edu/wrf/users/wrf_users_guide/build/html/namelist_variables.html).

4. **Avvia il container Docker**

   Avvia il container, montando i file di input (adatta i percorsi ai tuoi file locali):

   ```sh
   docker run -d --name meteosumisura \
     -p 80:3000 \
     -v $(pwd)/namelist.input:/tmp/files/namelist.input \
     -v $(pwd)namelist.wps:/tmp/files/namelist.wps \
     -v $(pwd)/config.json:/tmp/files/config.json \
     meteosumisura
   ```

5. **Accedi all’interfaccia web**

   Una volta avviato il container, apri il browser su [http://localhost](http://localhost) per visualizzare la piattaforma MeteoSuMisura.

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>





