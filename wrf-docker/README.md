## wrf-docker

Questa directory contiene la configurazione e i file necessari per creare un container Docker pronto all’uso con tutti gli strumenti necessari per eseguire il WRF.

### Usage

Per utilizzare il Dockerfile è necessario avere installato **Docker**.

Se vuoi utilizzare il WRF con un'area personalizzata, modifica i file `WPS/namelist.wps` e `WRF/namelist.input` (di default sono configurati su Salerno).  
Ulteriori informazioni sulla configurazione dei namelist sono disponibili nella [Documentazione ufficiale](https://www2.mmm.ucar.edu/wrf/users/wrf_users_guide/build/html/namelist_variables.html).

#### Costruzione dell'immagine

Posizionati nella cartella dove si trova il Dockerfile ed esegui:

```bash
docker build -t wrf-image .
```
### Avvio del container
Per avviare il container in modalità interattiva:

```bash
docker run -it wrf-image
```
L'installazione richiederà alcune ore. Una volta terminata, puoi eseguire WRF tramite uno script chiamato `run.sh` presente nella cartella `/wrf/WRF` all’interno del container.

### Esecuzione dello script WRF
Per eseguire lo script run.sh:

```bash
docker exec -it <nome_container> bash -c "cd /wrf/WRF && ./run.sh"
```
Sostituisci <nome_container> con il nome o l’ID del tuo container (puoi trovarlo con docker ps -a).
Se il container non è già in esecuzione, avvialo prima con:

```bash
docker start <nome_container>
```

### Conclusioni

L'esecuzione del modello WRF può richiedere un tempo variabile in base alla potenza del computer e alla configurazione dei namelist.  
Al termine della simulazione, i risultati saranno disponibili nella cartella `wrf/OUTPUT` all’interno del container in formato nc.

