#!/bin/bash
# filepath: c:\Users\Asus\Desktop\WRF\WRF4Salerno\docker-env\set_cron_from_config.sh

CONFIG="/wrf/WRF/config.json"

SCRIPT_PATH="/wrf/WRF/run_interval.sh"

# Leggi i parametri dal JSON
INTERVAL=$(jq -r '.run_interval' "$CONFIG")
TIME=$(jq -r '.run_time' "$CONFIG")

HOUR=$(echo $TIME | cut -d: -f1)
MIN=$(echo $TIME | cut -d: -f2)

if [ "$INTERVAL" = "daily" ]; then
    CRON="$MIN $HOUR * * * $SCRIPT_PATH >> /wrf/WRF/cronjob.log 2>&1"
elif [ "$INTERVAL" = "weekly" ]; then
    # 0 = domenica, puoi cambiare il giorno (0-6)
    CRON="$MIN $HOUR * * 0 $SCRIPT_PATH >> /wrf/WRF/cronjob.log 2>&1"
else
    echo "run_interval non valido (usa 'daily' o 'weekly')"
    exit 1
fi

# Rimuovi vecchie entry per run_WRF.sh e aggiungi la nuova
(crontab -l | grep -v "$SCRIPT_PATH"; echo "$CRON") | crontab -

echo "Crontab aggiornato con: $CRON"