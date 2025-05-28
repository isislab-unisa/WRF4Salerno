#!/bin/bash

# File di lock per evitare di settare il cron più volte
LOCKFILE="/wrf/WRF/.cron_initialized"

if [ ! -f "$LOCKFILE" ]; then
    echo "Prima esecuzione: setto il crontab..."
    /wrf/WRF/set_cron_from_config.sh
    touch "$LOCKFILE"
else
    echo "Crontab già inizializzato, salto la configurazione."
fi

# Avvia il servizio cron (se necessario, ad esempio in container che rimangono attivi)
# service cron start  # decommenta se vuoi avviare cron qui
