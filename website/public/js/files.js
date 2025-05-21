

function buildTable() {
    $.getJSON('http://localhost:3000/filelist', function(data) {
        var table = $('tbody');        
        table.empty();
        $.each(data, function(index, file) {
            var row = $('<tr>');
            row.append(
                $('<td>').append(
                    $('<a>')
                        .attr('href', '/files/' + file.name) // Percorso del file
                        .attr('download', file.name)        // Attributo per il download
                        .text(file.name)                    // Testo del link
                )
            );
            const filesizeMB = (file.size / (1024 * 1024)).toFixed(2);
            row.append($('<td>').text(filesizeMB + ' MB'));
            row.append($('<td>').text(file.created));
            table.append(row);
        });
    });
}

buildTable();