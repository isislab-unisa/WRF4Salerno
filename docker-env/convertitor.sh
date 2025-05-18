cd ~/wrf/WRF/OUTPUT/

mkdir public 
mkdir public/Images
mkdir public/json

# Esegui il post-processing
echo "Esecuzione del post-processing..."
python3 ../wrftoGrib2.py
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione

python3 wrftoImage.py."
    echo "errore durante l'esecuzione di wrftoImage.py."
    exit 1
fi

python3 ../WRFtoMapData.py
if [ $? -ne 0 ]; then
    echo "Errore durante l'esecuzione di WRFtoMapData.py."
    exit 1
fi

echo "Esecuzione completata con successo."