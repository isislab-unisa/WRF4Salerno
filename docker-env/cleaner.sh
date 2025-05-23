#!/bin/bash


# Exit on error to prevent proceeding with unresolved issues
set -ex

# filepath: c:\Users\Asus\Desktop\DOCKERSCRIPT\cleaner.sh

# Percorsi delle directory
WPS_DIR="WPS"
WRF_RUN_DIR="WRF/run"

# Pulizia dei file generati da geogrid, ungrib e metgrid nella directory WPS
echo "Pulizia dei file generati da geogrid, ungrib e metgrid nella directory $WPS_DIR..."
rm -f $WPS_DIR/geo_em.d0*.nc
rm -f $WPS_DIR/met_em.d0*.nc
rm -f $WPS_DIR/FILE:*
rm -f $WPS_DIR/log.geogrid
rm -f $WPS_DIR/log.metgrid
rm -f $WPS_DIR/log.ungrib
rm -f $WPS_DIR/PFILE:*
rm -f $WPS_DIR/GRIBFILE.*

# Pulizia dei file generati da real.exe e wrf.exe nella directory WRF/run
echo "Pulizia dei file generati da real.exe e wrf.exe nella directory $WRF_RUN_DIR..."
rm -f $WRF_RUN_DIR/wrfbdy_d0*
rm -f $WRF_RUN_DIR/wrfinput_d0*
rm -f $WRF_RUN_DIR/wrfrst_d0*
rm -f $WRF_RUN_DIR/wrfout_d0*
rm -f $WRF_RUN_DIR/rsl.out.*
rm -f $WRF_RUN_DIR/rsl.error.*

# Pulizia dei collegamenti simbolici met_em* nella directory WRF/run
echo "Pulizia dei collegamenti simbolici met_em* nella directory $WRF_RUN_DIR..."
rm -f $WRF_RUN_DIR/met_em*

echo "Pulizia completata con successo."