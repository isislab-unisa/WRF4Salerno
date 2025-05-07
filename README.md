<a id="readme-top"></a>


[![Typing SVG](https://readme-typing-svg.herokuapp.com/?color=dcebfd&size=35&center=true&vCenter=true&width=1000&lines=WRF4Salerno)](https://git.io/typing-svg)

<!-- ABOUT THE PROJECT -->
## About The Project
Il progetto ha l'obiettivo di creare una piattaforma in grado di automatizzare l’intero processo di esecuzione di modelli meteorologici ad alta risoluzione per una specifica area geografica.
In particolare, integra il [**Global Forecast System (GFS)**](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) e il [**Weather Research and Forecasting Model (WRF)**](https://github.com/wrf-model/WRF), automatizzando tutte le fasi operative: dal download dei dati globali, alla loro pre-elaborazione e conversione in formati compatibili, fino all'esecuzione delle simulazioni locali ad alta risoluzione.

La piattaforma offre inoltre un sistema di visualizzazione web interattivo  che rende intuitiva la consultazione delle previsioni.
Infine, la piattaforma realizzata è stata utilizzata per l'esecuzione e la visualizzazione delle simulazioni meteorologice del Golfo di Salerno.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

### Prerequisiti
Per eseguire correttamente il progetto, è necessario avere installati i seguenti componenti:

* Docker: per l'esecuzione isolata e portabile dell'ambiente di simulazione e dei servizi ausiliari.

* Python 3.8+: utilizzato per gli script di automazione e gestione del flusso operativo.

### Struttura della repository
* `download/` - Contiene l’installer e i file necessari per scaricare e configurare il modello WRF sulla macchina locale.
* `docker-env/`- Include la configurazione e i file per creare un container Docker pronto all’uso, con tutti gli strumenti necessari per eseguire il WRF.
* `script/` - Raccolta di script Python e shell per automatizzare il flusso di lavoro: elaborazione, esecuzione, e gestione dei dati generati dal WRF.
* `public/` - Contiene il front-end web per la visualizzazione interattiva dei dati meteorologici prodotti dal modello.

### Installation

Per poter installare il WRF è stato sviluppato un installer nella cartella `download`. 
Per poter utilizzare l'installer sono necessarie le seguenti librerie:

```
sudo apt-get update && apt-get install -y \
    build-essential \
    csh \
    gfortran \
    m4 \
    curl \
    wget \
    perl \
    git \
    mpich \
    gcc \
    gfortran \
    g++ \
    libtool \
    automake \
    autoconf \
    make \
    m4 \
    grads \
    default-jre \
    csh
```

* Entra nella directory `download`
```
cd download/
```
* Usa il comando:
```
chmod +x install_WRF.sh
```
Installa il WRF
```
./install_WRF.sh
```

### Usage
Dopo aver scaricato il WRF:
* crea nella cartella creata `DATA` 
* scarica i dati [**WPS_GEOG**](http://www2.mmm.ucar.edu/wrf/users/download/get_sources_wps_geog.html).
* Installa i dati da [**GFS**](https://www.ncei.noaa.gov/products/weather-climate-models/global-forecast) o ECMWF
* entra nelle cartelle WPS e WRF/run e configura i dati `namelist.wps` e `namelist.input` 

Ulteriore informazione per la configurazione dei namelist nella [Documentazione](https://www2.mmm.ucar.edu/wrf/users/wrf_users_guide/build/html/namelist_variables.html)

### Costruzione macchina Docker 
Nella cartella `WRF4Salerno` è possibile trovare il Dockerfile per la built di una macchina docker



