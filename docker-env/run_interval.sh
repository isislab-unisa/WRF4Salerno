#!/bin/bash
# filepath: c:\Users\Asus\Desktop\WRF\WRF4Salerno\docker-env\run_and_postWRF.sh


# Lancia run_WRF.sh
echo "Esecuzione run_WRF.sh..."
/wrf/WRF/run_WRF.sh

# Se run_WRF.sh termina con successo, lancia postWRF.sh
echo "Esecuzione postWRF.sh..."
/wrf/WRF/postWRF.sh

echo "Esecuzione completa di run_WRF.sh e postWRF.sh."