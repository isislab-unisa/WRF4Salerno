#!/bin/bash


# Exit on error to prevent proceeding with unresolved issues
set -ex

# Directory dove verranno salvati i dati GFS
DATA_DIR="DATA"

# Calcola la data del giorno precedente
YESTERDAY=$(date -d "yesterday" +"%Y%m%d")

BASE_URL="https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/gfs.${YESTERDAY}/00/atmos"

# Leggi hour_prediction da config.json
CONFIG_JSON="config.json"
if [ ! -f "$CONFIG_JSON" ]; then
    echo "Errore: $CONFIG_JSON non trovato!"
    exit 1
fi

HOUR_PREDICTION=$(jq '.hour_prediction' "$CONFIG_JSON")
if [ -z "$HOUR_PREDICTION" ]; then
    echo "Errore: hour_prediction non trovato in $CONFIG_JSON!"
    exit 1
fi

FILES=()
for ((h=6; h<=HOUR_PREDICTION; h+=6)); do
    FILE_H=$(printf "%03d" $h)
    FILES+=("gfs.t00z.pgrb2.0p25.f${FILE_H}")
done

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