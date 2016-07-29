(($, formatCurrency) => {
    const remote = require('electron').remote;
    const {ipcRenderer} = require('electron');

    const regel = remote.require('./js/database/regel');
    const arrayConversion = remote.require('./js/database/arrayConversion');

    const table = $("#line-table");
    const tableContent = table.find("tbody");
    const regelModal = $("#new-regel");

    /**
     * The order in which the fields should be printed to the table
     *
     * @type {string[]}
     */
    const keyOrder = ["_id", "description", "extra", "category", "date", "kas_in", "kas_uit", "bank_in", "bank_uit"];

    /**
     * Fields which are money
     *
     * @type {string[]}
     */
    const valutaFields = ["kas_in", "kas_uit", "bank_in", "bank_uit"];

    ipcRenderer.on('newLine', () => {
        createNewRegel();
    });

    regel.findAll({}, (docs) => {
        let table = "";
        for (let doc of docs) {
            table += addRegel(doc, true);
        }
        tableContent.append(table);
        updateTableListener();
    });

    const updateTableListener = () => {
        tableContent.find("tr").on("dblclick", (event) => {
            const target = $(event.currentTarget);
            const realTarget = $(event.target);
            createNewRegel(target.data(), realTarget.index() - 1);
        });
    };

    /**
     *
     * @param {{}} doc
     * @param {boolean} mass
     */
    const addRegel = (doc, mass = false) => {
        let row = '<tr id="' + doc._id + '"';
        let data = '';
        for (let key of keyOrder) {
            row += ' data-' + key + '="' + doc[key] + '"';
            if (valutaFields.indexOf(key) > -1) {
                data += '<td tabindex="0">' + formatCurrency(doc[key]) + '</td>'
            } else {
                data += '<td tabindex="0">' + doc[key] + '</td>'
            }
        }
        row += '>' + data + '</tr>';

        if (mass) { // _if a lot of rows need to be added, add them out of the loop for better performance
            return row;
        } else {
            tableContent.append(row);
            updateTableListener();
        }
    };

    function createNewRegel(data = {}, focusField = 1) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                regelModal.find("#" + key).val(data[key]);
            }
        }
        regelModal.modal("show");
        $(regelModal.find('input:visible, select')[focusField]).focus();
        regelModal.find('#btn-save').click(regelModal, (event) => {
                addNewRegel(event);
                regelModal.modal("hide");
                regelModal.find("form").reset();
            }
        );
        regelModal.find("")
    }

    const addNewRegel = (event) => {
        const newline = event.data;
        let data = newline.find('form').serializeArray();
        data = arrayConversion.arrayToObject(data);
        if (data._id !== null) {
            regel.update(data, {_id: data._id}, (error, numAffected, updatedDoc) => {
                    if (error) {
                        console.log(error);
                    }
                    const regel = addRegel(updatedDoc, true);
                    $("#" + updatedDoc._id).replaceWith(regel);
                }
            );
        } else {
            regel.create(data, (newDoc) => {
                    addRegel(newDoc);
                }
            );
        }
    };

    window.createNewRegel = createNewRegel;
})(jQuery, formatCurrency);