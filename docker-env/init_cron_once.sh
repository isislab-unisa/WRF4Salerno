#!/bin/bash

# File di lock per evitare di settare il cron più volte
LOCKFILE="/wrf/WRF/.cron_initialized"

if [ ! -f "$LOCKFILE" ]; then
    echo "Prima esecuzione: setto il crontab..."
    cp /tmp/files/namelist.input /wrf/WRF/WRF/run/namelist.input
    cp /tmp/files/namelist.wps /wrf/WRF/WPS/namelist.wps
    cp /tmp/files/config.json /wrf/WRF/config.json
    cp /tmp/files/config.json /wrf/WRF/website/public/json/config.json
    /wrf/WRF/set_cron_from_config.sh
    /wrf/WRF/run_interval.sh &
    touch "$LOCKFILE"
else
    echo "Crontab già inizializzato, salto la configurazione."
fi

# Avvia il servizio cron (se necessario, ad esempio in container che rimangono attivi)
# service cron start  # decommenta se vuoi avviare cron qui
