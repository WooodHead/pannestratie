const electron                      = require('electron');
const {app, dialog, globalShortcut} = electron;

const main  = require('../main');
const {win} = main;

globalShortcut.register('CommandOrControl+N', () => {
    win().webContents.send('newLine');
});

const fs = require('fs');

const getPath = () => {
    return dialog.showSaveDialog(win(), {
        title:       "Overzicht exporteren",
        defaultPath: "~/export.pdf",
        filters:     [{name: "PDF", extensions: ["pdf"]}]
        }
    );
};

globalShortcut.register('CommandOrControl+P', () => {
    const path = getPath();

    if (path) {
        win().webContents.printToPDF({
            marginsType:        2,
            pageSize:           "A4",
            printBackground:    false,
            printSelectionOnly: false,
            landscape:          false
        }, (error, data) => {
            if (error) {
                console.log(error);
            }

            fs.writeFile(path, data, (error) => {
                if (error) throw error;
                console.log('Write PDF successfully.')
            });
        });
    }
});