const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.maximize();
    win.loadFile('html/index.html')
}

app.whenReady().then(() => {
    createWindow()
})