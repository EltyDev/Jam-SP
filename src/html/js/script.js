const virusTotal = require('api')('@virustotal/v3.0#40nj53llc655dro');
const AdmZip = require('adm-zip');
const fs = require('fs');

const analyse = (filePath) => {
    console.log(filePath);
    virusTotal.postFiles({file: filePath}, {accept: 'application/json', 'x-apikey': '64d8dfc2b763c37c0e8bb4c2bc9d17e5eee0aff4c92e756f29c33b25b3fa6b9e'})
        .then((response) => {
            console.log(response);
            fs.unlinkSync(filePath);
        }).catch((error) => {
            console.log(error);
        });
}

const input = document.getElementById('folder');

input.addEventListener('change', (event) => {
    for (const file of event.target.files) {
        let zip = new AdmZip();
        zip.addLocalFile(file.path);
        zip.writeZip(file.path + '.zip');
        analyse(file.path + '.zip');
    }
});