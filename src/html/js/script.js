const AdmZip = require('adm-zip');
const fs = require('fs');
const puppeteer = require('puppeteer');

let viruses = [];
let browser;
let page;

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
    for (const virus of viruses) {
        if (fs.existsSync(virus))
            fs.unlinkSync(virus);
    }
    viruses = [];
}

const input = document.getElementById('folder');

input.addEventListener('change', async (event) => {

    for (const file of event.target.files) {
        console.log(file.path);
        let zip = new AdmZip();
        zip.addLocalFile(file.path);
        zip.writeZip(file.path + '.zip');
        let virus = await analyse(file.path + '.zip');
        if (virus) {
            viruses.push(file.path);
            console.log("Virus detected");
        }
        fs.unlinkSync(file.path + '.zip');
    }
});