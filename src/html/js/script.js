const AdmZip = require('adm-zip');
const fs = require('fs');
const puppeteer = require('puppeteer');
const saveScan = "scan.json"

let browser;
let page;
let lastScan = null;
let spanScan = document.getElementById('last-scan');
let nbViruses = 0;

if (fs.existsSync(saveScan))
    lastScan = JSON.parse(fs.readFileSync(saveScan, {encoding:'utf8', flag:'r'}));



if (lastScan != null) {
    for (const file of lastScan.files) {
        if (file.virus)
            nbViruses++;
    }
}

if (spanScan) {
    if (lastScan)
        spanScan.innerHTML = "Dernier scan: " + lastScan.date + " - " + lastScan.nbFiles + " fichiers - " + nbViruses + " virus";
    else
        spanScan.innerHTML = "Aucun scan effectué";
}

(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
})();

const analyse = async (filePath) => {
    return new Promise(async (resolve, reject) => {
        await page.goto('https://virusscan.jotti.org');
        await page.waitForSelector('input[type="file"]');
        const fileInput = await page.$('input[type="file"]');
        fileInput.uploadFile(filePath).then(async () => {
            await page.waitForSelector('[class="statusText"]');
            let result = await page.$('[class="statusText"]')
            let text = await (await result.getProperty('textContent')).jsonValue();
            while (!text.startsWith("Scan terminé")) {
                result = await page.$('[class="statusText"]')
                text = await (await result.getProperty('textContent')).jsonValue();
            }
            resolve(isVirus(text));
        });
    });
}

const isVirus = (result) => {
    let lines = result.split(' ');
    let percentageSplit = lines[2].split('/');
    if (percentageSplit[0] >= 7)
        return true;
    return false;   
}

const deleteVirues = () => {
    for (const virus of lastScan.files) {
        if (fs.existsSync(virus.path) && virus.virus)
            fs.unlinkSync(virus.path);
    }
}

const input = document.getElementById('folder');
const virusLabel = document.getElementById('text_virus');
const deleteButton = document.getElementById('button_yes');

if (virusLabel) {

    if (nbViruses > 0) {
        virusLabel.innerHTML = "Chauve-souvirus détectés: " + nbViruses;
    } else {
        virusLabel.innerHTML = "Aucun chauve-souvirus détecté";
    }
}

if (deleteButton) {
    deleteButton.addEventListener('click', () => {
        deleteVirues();
        window.location.href = "page_5.html";
    });

}

if (input)
    input.addEventListener('change', async (event) => {
        nbFiles = event.target.files.length;
        let files = [];
        for (const file of event.target.files) {
            console.log(file.path);
            let zip = new AdmZip();
            zip.addLocalFile(file.path);
            zip.writeZip(file.path + '.zip');
            let virus = await analyse(file.path + '.zip');
            fs.unlinkSync(file.path + '.zip');
            files.push({
                path: file.path,
                virus: virus
            });
        }
        lastScan = {
            date: new Date(),
            files: files
        };
        fs.writeFileSync(saveScan, JSON.stringify(lastScan));
        window.location.href = "page_4.html"
    });