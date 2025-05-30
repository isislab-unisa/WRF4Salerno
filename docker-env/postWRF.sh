cd /wrf/WRF/website/ || { echo "Directory website non trovata"; exit 1; }

mkdir -p public
mkdir -p public/Image
mkdir -p public/json
mkdir -p public/files

# Esegui il post-processing
echo "Esecuzione del post-processing..."
python3 ../wrftoGrib2.py
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di wrftoGrib2.py."
    exit 1
fi

python3 ../wrftoImage.py
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di wrftoImage.py."
    exit 1
fi

python3 ../WRFtoMapData.py
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di WRFtoMapData.py."
    exit 1
fi

echo "Esecuzione completata con successo."

# Aggiorna datasetinfo.json con la data della predizione e il giorno di lancio
PREDICTION_DATE=$(date +"%Y%m%d")
RUNTIME_DATE=$(date -d "yesterday" +"%Y%m%d")
END_HOUR=$(date -d "yesterday" +"%H:%M")

cat > public/json/datasetinfo.json <<EOF
{
    "dataprediction": "$PREDICTION_DATE",
    "runtime": "$RUNTIME_DATE"
    "endhour","$END_HOUR"
}
EOF

echo "Aggiornato datasetinfo.json con dataprediction=$PREDICTION_DATE, runtime=$RUNTIME_DATE e endhour=$END_HOUR."