const remote = require('electron').remote;
const regel = remote.require('./js/database/regel');
const hotkeys = remote.require('./js/hotkeys');

regel.findAll({}, (docs) => {
    let table = "";
    for (let doc of docs) {
        table +=
            '<tr>' +
            '<td>' + doc._id + '</td>' +
            '<td>' + doc.description + '</td>' +
            '<td>' + doc.extra + '</td>' +
            '<td>' + doc.category + '</td>' +
            '<td>' + doc.date + '</td>' +
            '<td>' + doc['kas-in'] + '</td>' +
            '<td>' + doc['kas-uit'] + '</td>' +
            '<td>' + doc['bank-in'] + '</td>' +
            '<td>' + doc['bank-uit'] + '</td>' +
            '</tr>';
    }
    $('#line-table').find("tbody").append(table);
});
const {ipcRenderer} = require('electron');
ipcRenderer.on('newLine', () => {
    const newline = $('#newLine');
    newline.modal('show');
    newline.find('input').first().focus();
    newline.find('#btn-save').click(newline, (event) => {
        const newline = event.data;
        regel.create(newline.find('form').serializeArray());
    });
});