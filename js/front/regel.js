(($, formatCurrency) => {
    const remote = require('electron').remote;
    const {ipcRenderer} = require('electron');

    const regel = remote.require('./js/database/regel');

    const table = $("#line-table");
    const tableContent = table.find("tbody");
    const regelModal = $("#new-regel");

    ipcRenderer.on('newLine', () => {
        createNewRegel();
    });

    regel.findAll({}, (docs) => {
        let table = "";
        for (let doc of docs) {
            table += addRegel(doc, true);
        }
        tableContent.append(table);
    });

    /**
     *
     * @param {{}} doc
     * @param {boolean} mass
     */
    const addRegel = (doc, mass = false) => {
        console.log(doc);
        const regel =
            '<tr>' +
            '<td>' + doc._id + '</td>' +
            '<td>' + doc.description + '</td>' +
            '<td>' + doc.extra + '</td>' +
            '<td>' + doc.category + '</td>' +
            '<td>' + doc.date + '</td>' +
            '<td>' + formatCurrency(doc['kas-in']) + '</td>' +
            '<td>' + formatCurrency(doc['kas-uit']) + '</td>' +
            '<td>' + formatCurrency(doc['bank-in']) + '</td>' +
            '<td>' + formatCurrency(doc['bank-uit']) + '</td>' +
            '</tr>';

        if (mass) {
            return regel;
        } else {
            tableContent.append(regel);
        }
    };

    const createNewRegel = (data = {}) => {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                regelModal.find(key).val(data[key]);
            }
        }
        regelModal.modal("show");
        regelModal.find('input').first().focus();
        regelModal.find('#btn-save').click(regelModal, (event) => {
                const newline = event.data;
                regel.create(newline.find('form').serializeArray(), (newDoc)=> {
                        addRegel(newDoc);
                    }
                );
                regelModal.modal("hide");
            }
        );
    };
})(jQuery, window.formatCurrency);