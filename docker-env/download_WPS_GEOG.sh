#!/bin/bash
# filepath: c:\Users\Asus\Desktop\WRF\WRF4Salerno\docker-env\download_WPS_GEOG.sh

set -e

# Directory di destinazione
DEST_DIR="."

# URL ufficiale
WPS_GEOG_URL="https://www2.mmm.ucar.edu/wrf/src/wps_files/geog_high_res_mandatory.tar.gz"

# Crea la directory se non esiste
mkdir -p "$DEST_DIR"

echo "Scaricamento dei dati WPS_GEOG..."
wget -O "$DEST_DIR/geog_high_res_mandatory.tar.gz" "$WPS_GEOG_URL"

echo "Estrazione dei dati..."
tar -xzvf "$DEST_DIR/geog_high_res_mandatory.tar.gz" -C "$DEST_DIR"

echo "Pulizia file temporanei..."
rm "$DEST_DIR/geog_high_res_mandatory.tar.gz"

echo "Download e preparazione WPS_GEOG completati."