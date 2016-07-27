const electron = require('electron');
const {globalShortcut} = electron;

const main = require('../main');
const {win} = main;

globalShortcut.register('CommandOrControl+N', () => {
    win().webContents.send('newLine');
});