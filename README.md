<a id="readme-top"></a>


[![Typing SVG](https://readme-typing-svg.herokuapp.com/?color=dcebfd&size=35&center=true&vCenter=true&width=1000&lines=WRF4Salerno)](https://git.io/typing-svg)

<!-- ABOUT THE PROJECT -->
## About The Project
Questo progetto ha come obiettivo sviluppare un applicativo in grado di utilizzare il modello [**WRF**](https://github.com/wrf-model/WRF)  per fare una previsione meteo del Golfo di Salerno con una risoluzione delle griglia 1x1km.

Per poterlo realizzare deve essere configurato un ambiente docker in cui è possibile lanciare il **WRF** e usare il modello dato in output per ottenere la previsione meteo in formato **.grib2**.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

### Prerequisiti
Per poter installare il WRF è necessario una macchina linux. 
Installare le seguenti librerie

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
### Installation
* Entra nella directory WRF4Salerno
```
cd WRF4Salerno/
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





