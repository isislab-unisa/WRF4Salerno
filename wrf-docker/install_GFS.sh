#!/bin/bash

# Directory dove verranno salvati i dati GFS
DATA_DIR="DATA"

# Calcola la data del giorno precedente
YESTERDAY=$(date -d "yesterday" +"%Y%m%d")

# Controlla se la data è valida
echo "Controllo della data del giorno precedente: $YESTERDAY"

# Base URL per il download dei dati GFS
BASE_URL="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.${YESTERDAY}/00/atmos"

# File da scaricare
FILES=("gfs.t00z.pgrb2.0p25.f024" "gfs.t00z.pgrb2.0p25.f030" "gfs.t00z.pgrb2.0p25.f036" "gfs.t00z.pgrb2.0p25.f042" "gfs.t00z.pgrb2.0p25.f048")

# Creazione della directory se non esiste
if [ ! -d "$DATA_DIR" ]; then
    echo "Creazione della directory $DATA_DIR..."
    mkdir -p "$DATA_DIR"
else
    # Se la directory esiste, svuota il contenuto
    echo "La directory $DATA_DIR esiste già. Pulizia in corso..."
    rm -rf "$DATA_DIR"/*
fi

# Scarica i file GFS
echo "Scaricamento dei dati GFS del giorno precedente ($YESTERDAY) in corso..."
for FILE in "${FILES[@]}"; do
    wget -O "$DATA_DIR/$FILE" "$BASE_URL/$FILE"
    if [ $? -eq 0 ]; then
        echo "Scaricato: $FILE"
    else
        echo "Errore durante il download di: $FILE"
    fi
done

echo "Operazione completata."