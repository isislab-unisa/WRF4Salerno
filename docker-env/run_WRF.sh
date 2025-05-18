#!/bin/bash

# filepath: c:\Users\Asus\Desktop\DOCKERSCRIPT\run_WRF.sh
# Esegui cleaner.sh per pulire i file generati precedentemente
echo "Esecuzione di cleaner.sh..."
./cleaner.sh
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di cleaner.sh. Interruzione."
    exit 1
fi

# Verifica la presenza dei dati WPS_GEOG
WPS_GEOG_DIR="WPS_GEOG"
if [ ! -d "$WPS_GEOG_DIR" ] || [ -z "$(ls -A $WPS_GEOG_DIR)" ]; then
    echo "Dati WPS_GEOG non trovati o directory vuota. Scaricamento in corso..."
    # Comando per scaricare i dati WPS_GEOG (modifica con il comando corretto)
    ./download_WPS_GEOG.sh
    if [ $? -ne 0 ]; then
        echo "Errore durante il download dei dati WPS_GEOG. Interruzione."
        exit 1
    fi
else
    echo "Dati WPS_GEOG trovati. Procedo con l'esecuzione."
fi

# Esegui install_GFS.sh per scaricare i dati GFS
echo "Esecuzione di install_GFS.sh..."
./install_GFS.sh
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di install_GFS.sh. Interruzione."
    exit 1
fi

# Esegui setup_namelist.sh per configurare i file namelist
echo "Esecuzione di setup_namelist.sh..."
./setup_namelist.sh
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di setup_namelist.sh. Interruzione."
    exit 1
fi

# Passa alla directory WPS
echo "Passaggio alla directory WPS..."
cd WPS/ || { echo "Errore: impossibile accedere alla directory WPS."; exit 1; }

# Esegui geogrid.exe
echo "Esecuzione di geogrid.exe..."
./geogrid.exe
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di geogrid.exe. Controlla log.geogrid per i dettagli."
    exit 1
fi

# Collega i file GFS
echo "Collegamento dei file GFS..."
./link_grib.csh ../DATA/
if [ $? -ne 0 ]; then
    echo "Errore durante il collegamento dei file GFS."
    exit 1
fi

# Collega il Vtable
echo "Collegamento del Vtable..."
ln -sf ungrib/Variable_Tables/Vtable.GFS Vtable
if [ $? -ne 0 ]; then
    echo "Errore durante il collegamento del Vtable."
    exit 1
fi

# Esegui ungrib.exe
echo "Esecuzione di ungrib.exe..."
./ungrib.exe
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di ungrib.exe."
    exit 1
fi

# Esegui metgrid.exe
echo "Esecuzione di metgrid.exe..."
./metgrid.exe
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di metgrid.exe. Controlla log.metgrid per i dettagli."
    exit 1
fi

# Passa alla directory WRF/run
echo "Passaggio alla directory WRF/run..."
cd ../WRF/run || { echo "Errore: impossibile accedere alla directory WRF/run."; exit 1; }

# Collega i file met_em*
echo "Collegamento dei file met_em*..."
ln -sf ../../WPS/met_em* .
if [ $? -ne 0 ]; then
    echo "Errore durante il collegamento dei file met_em*."
    exit 1
fi

# Esegui real.exe
echo "Esecuzione di real.exe..."
mpirun -np 1 ./real.exe
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di real.exe."
    exit 1
fi

# Esegui wrf.exe
echo "Esecuzione di wrf.exe..."
mpirun -np 1 ./wrf.exe
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di wrf.exe."
    exit 1
fi

ncrcat wrfout* ../../../OUTPUT/wrfoutput.nc
if [ $? -ne 0 ]; then
    echo "Errore durante l'unione dei file wrfout* con ncrcat."
    exit 1
fi
echo "Esecuzione completata con successo. File di output salvato in OUTPUT/wrfoutput.nc."