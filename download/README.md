### Installation

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
