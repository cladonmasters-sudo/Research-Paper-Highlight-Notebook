document.getElementById('pdfUpload').addEventListener('change', function(event) {

    const file = event.target.files[0];

    if (file) {
        document.getElementById('viewer').innerHTML =
            '<h3>Loaded PDF:</h3><p>' + file.name + '</p>';
    }

});
