const electron = require('electron');
const {app, globalShortcut} = electron;

const main = require('../main');
const {win} = main;

globalShortcut.register('CommandOrControl+N', () => {
    win().webContents.send('newLine');
});

const fs = require('fs');

globalShortcut.register('CommandOrControl+P', ()=> {
    win().webContents.printToPDF({
        marginsType: 0,
        pageSize: "A4",
        printBackground: false,
        printSelectionOnly: false,
        landscape: false
    }, (error, data) => {
        if (error) {
            console.log(error);
        }
        fs.stat(app.getPath('userData') + '/tmp', (error, stats) => {
            if (error) console.log(error);
            if (!stats.isDirectory()) {
                fs.mkdir(app.getPath('userData') + '/tmp');
            }
        });
        fs.writeFile(app.getPath('userData') + '/tmp/print.pdf', data, (error) => {
            if (error) throw error;
            console.log('Write PDF successfully.')
        });
    });
});