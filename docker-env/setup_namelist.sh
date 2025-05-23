#!/bin/bash


# Exit on error to prevent proceeding with unresolved issues
set -ex

# Calcola la data di oggi
TODAY=$(date +"%Y-%m-%d")
START_YEAR=$(date +"%Y")
START_MONTH=$(date +"%m")
START_DAY=$(date +"%d")

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

# Calcola la data di fine aggiungendo le ore
END_DATE=$(date -d "$TODAY $HOUR_PREDICTION hour" +"%Y-%m-%d")
END_YEAR=$(date -d "$TODAY $HOUR_PREDICTION hour" +"%Y")
END_MONTH=$(date -d "$TODAY $HOUR_PREDICTION hour" +"%m")
END_DAY=$(date -d "$TODAY $HOUR_PREDICTION hour" +"%d")
END_HOUR=$(date -d "$TODAY $HOUR_PREDICTION hour" +"%H")


NAMELIST_WPS="WPS/namelist.wps"
NAMELIST_INPUT="WRF/run/namelist.input"

# Aggiorna il file namelist.wps
if [ -f "$NAMELIST_WPS" ]; then
    sed -i "s/start_date.*/start_date = '${TODAY}_00:00:00','${TODAY}_00:00:00',/" "$NAMELIST_WPS"
    sed -i "s/end_date.*/end_date   = '${END_DATE}_${END_HOUR}:00:00','${END_DATE}_${END_HOUR}:00:00',/" "$NAMELIST_WPS"
    echo "Aggiornato namelist.wps con start_date=${TODAY}_00:00:00 e end_date=${END_DATE}_${END_HOUR}:00:00"
else
    echo "Errore: "$NAMELIST_WPS" non trovato!"
fi

# Aggiorna il file namelist.input
if [ -f "$NAMELIST_INPUT" ]; then
    sed -i "s/run_hours.*/run_hours                           = ${HOUR_PREDICTION},/" "$NAMELIST_INPUT"
    sed -i "s/start_year.*/start_year                          = ${START_YEAR}, ${START_YEAR},/" "$NAMELIST_INPUT"
    sed -i "s/start_month.*/start_month                         = ${START_MONTH},   ${START_MONTH},/" "$NAMELIST_INPUT"
    sed -i "s/start_day.*/start_day                           = ${START_DAY},   ${START_DAY},/" "$NAMELIST_INPUT"
    sed -i "s/start_hour.*/start_hour                          = 00,   00,/" "$NAMELIST_INPUT"
    sed -i "s/end_year.*/end_year                            = ${END_YEAR}, ${END_YEAR},/" "$NAMELIST_INPUT"
    sed -i "s/end_month.*/end_month                         = ${END_MONTH},   ${END_MONTH},/" "$NAMELIST_INPUT"
    sed -i "s/end_day.*/end_day                           = ${END_DAY},   ${END_DAY},/" "$NAMELIST_INPUT"
    sed -i "s/end_hour.*/end_hour                          = ${END_HOUR},   ${END_HOUR},/" "$NAMELIST_INPUT"
    echo "Aggiornato namelist.input con end_date=${END_DATE} ${END_HOUR}:00:00"
else
    echo "Errore: "$NAMELIST_INPUT" non trovato!"
fi