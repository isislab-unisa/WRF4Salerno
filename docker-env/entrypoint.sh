#!/bin/bash
# filepath: /wrf/WRF/entrypoint.sh

set -e

# Percorsi attesi
NML_INPUT="/wrf/WRF/WRF/run/namelist.input"
NML_WPS="/wrf/WRF/WPS/namelist.wps"
CONFIG="/wrf/WRF/config.json"
CONFIG_DEST="/wrf/WRF/website/public/json/config.json"

# Controllo presenza file
for f in "$NML_INPUT" "$NML_WPS" "$CONFIG"; do
    if [ ! -f "$f" ]; then
        echo "Errore: File obbligatorio mancante: $f"
        exit 1
    fi
done

# Copia config.json nella cartella pubblica del sito
cp "$CONFIG" "$CONFIG_DEST"

# Inizializza il cron solo la prima volta
/wrf/WRF/docker-env/init_cron_once.sh

# Avvia il servizio cron (se necessario)
service cron start

# Avvia il sito
cd /wrf/WRF/website/
npm start