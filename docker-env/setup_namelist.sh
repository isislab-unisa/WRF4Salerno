#!/bin/bash

# Calcola la data di oggi e del giorno successivo
TODAY=$(date +"%Y-%m-%d")
TOMORROW=$(date -d "tomorrow" +"%Y-%m-%d")

# Estrai anno, mese e giorno per il formato richiesto in namelist.input
START_YEAR=$(date +"%Y")
START_MONTH=$(date +"%m")
START_DAY=$(date +"%d")
END_YEAR=$(date -d "tomorrow" +"%Y")
END_MONTH=$(date -d "tomorrow" +"%m")
END_DAY=$(date -d "tomorrow" +"%d")

NAMELIST_WPS="WPS/namelist.wps"
NAMELIST_INPUT="WRF/run/namelist.input"

# Aggiorna il file namelist.wps
if [ -f "$NAMELIST_WPS" ]; then
    sed -i "s/start_date.*/start_date = '${TODAY}_00:00:00','${TODAY}_00:00:00',/" "$NAMELIST_WPS"
    sed -i "s/end_date.*/end_date   = '${TOMORROW}_00:00:00','${TOMORROW}_00:00:00',/" "$NAMELIST_WPS"
    echo "Aggiornato namelist.wps con start_date=${TODAY} e end_date=${TOMORROW}"
else
    echo "Errore: "$NAMELIST_WPS" non trovato!"
fi

# Aggiorna il file namelist.input
if [ -f "$NAMELIST_INPUT" ]; then
    sed -i "s/start_year.*/start_year                          = ${START_YEAR}, ${START_YEAR},/" "$NAMELIST_INPUT"
    sed -i "s/start_month.*/start_month                         = ${START_MONTH},   ${START_MONTH},/" "$NAMELIST_INPUT"
    sed -i "s/start_day.*/start_day                           = ${START_DAY},   ${START_DAY},/" "$NAMELIST_INPUT"
    sed -i "s/start_hour.*/start_hour                          = 00,   00,/" "$NAMELIST_INPUT"
    sed -i "s/end_year.*/end_year                            = ${END_YEAR}, ${END_YEAR},/" "$NAMELIST_INPUT"
    sed -i "s/end_month.*/end_month                         = ${END_MONTH},   ${END_MONTH},/" "$NAMELIST_INPUT"
    sed -i "s/end_day.*/end_day                           = ${END_DAY},   ${END_DAY},/" "$NAMELIST_INPUT"
    sed -i "s/end_hour.*/end_hour                          = 00,   00,/" "$NAMELIST_INPUT"
    echo "Aggiornato namelist.input con start_date=${TODAY} e end_date=${TOMORROW}"
else
    echo "Errore: "$NAMELIST_INPUT" non trovato!"
fi