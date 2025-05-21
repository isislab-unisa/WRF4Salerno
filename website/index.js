const express = require('express');
const cors = require('cors');


const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/public',express.static('public'));
app.use('/files', express.static('public/files'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css')); 
app.use('/json', express.static('public/json'));
app.use('/Image', express.static('public/Image'));

app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    }   
);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
}
);


app.get('/filelist', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const directoryPath = path.join(__dirname, 'public/files');
    

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        // Filter out non-JSON files
        const jsonFiles = files.
            filter(file => file.endsWith('.grb2') || file.endsWith('.nc') || file.endsWith('.png'))
            .map(file =>{
                const filePath = path.join(directoryPath, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    size: stats.size,
                    created: stats.birthtime,
                };
            });

        jsonFiles.sort((a, b) => new Date(b.created) - new Date(a.created));
        res.json(jsonFiles);
    });
}
);

app.get('/forecastPoint', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const directoryPath = path.join(__dirname, 'public/json');
    
    fs.readdir(directoryPath,(err,files)=>{
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        } 
        const filePath= path.join(directoryPath, files[2]);
        res.sendFile(filePath)
    })
});

app.get('/forecastPoint/:hour', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const directoryPath = path.join(__dirname, 'public/json');
    const timestamp = req.params.hour;
    const fileName = `output_${timestamp}.geojson`;
    const filePath = path.join(directoryPath, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send(`File ${fileName} not found.`);
        }
        res.sendFile(filePath);
    });
});


app.get('/datasetinfo', (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join(__dirname, 'public/json/datasetinfo.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send('datasetinfo.json not found.');
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseErr) {
            res.status(500).send('Error parsing datasetinfo.json.');
        }
    });
});