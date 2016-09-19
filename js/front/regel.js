(($) => {
    const remote        = require('electron').remote;
    const {ipcRenderer} = require('electron');

    const regel           = remote.require('./js/database/regel');
    const arrayConversion = remote.require('./js/database/arrayConversion');

    const table      = $("#line-table");
    const tableBody  = table.find("tbody");
    const tableFoot  = table.find("tfoot");
    const regelModal = $("#new-regel");

    const filterForm   = $("#filter-form");
    const filterSubmit = filterForm.find("#submit-button");
    const filterReset  = filterForm.find("#reset-button");


    const categories = {
        "bemiddeling":            "Bemiddeling",
        "donatie_asoka":          "Donatie asoka",
        "donatie_olescan":        "Donatie Olescan",
        "donatie_overig":         "Donatie overig",
        "verkoop":                "Verkoop",
        "ontvangen_donatie":      "Ontvangen donatie",
        "werkreis":               "Werkreis",
        "inventaris_voer":        "Inventaris - voer",
        "inventaris_training":    "Inventaris - training",
        "inventaris_accessoires": "Inventaris - accessoires",
        "training":               "Training",
        "dierenarts":             "Dierenarts",
    };

    const getCategory = (categoryKey) => {
        return categories.hasOwnProperty(categoryKey) ? categories[categoryKey] : ""; // We don't want undefined to be returned
    };

    /**
     *
     * @type {Date}
     */
    const formatDate = (date) => {
        date = new Date(date);
        return date.toLocaleDateString();
    };

    /**
     * The order in which the fields should be printed to the table
     *
     * @type {string[]}
     */
    const keyOrder = ["_id", "description", "extra", "category", "date", "kas_in", "kas_uit", "bank_in", "bank_uit"];

    /**
     * Fields which have custom storage- and display values on them
     *
     * @type {{}}
     */
    const customFields = {
        "kas_in":   formatCurrency,
        "kas_uit":  formatCurrency,
        "bank_in":  formatCurrency,
        "bank_uit": formatCurrency,
        "category": getCategory,
        "date":     formatDate
    };

    ipcRenderer.on('newLine', () => {
        createNewRegel();
    });

    // Init filter
    filterSubmit.on("click", () => {
        const data     = [];
        /**
         * @type {[]}
         */
        const formData = filterForm.serializeArray();
        for (let filter of formData) {
            data[filter.name] = filter.value;
        }

            const filter = {};
        if (data.category_filter) {
            filter.category              = {};
            filter["category"]["$regex"] = data.category_filter;
        }
            if (data.from_date || data.to_date) filter.date = {};
            if (data.from_date) filter.date.$gte = data.from_date;
            if (data.to_date) filter.date.$lte = data.to_date;
            regel.findAll(filter, (docs) => {
                setData(docs);
            });
        }
    );

    filterReset.on("click", () => {
        resetTable();
    });

    const resetTable = () => {
        regel.findAll({}, (docs) => {
            setData(docs);
        });
    };

    // Init table
    resetTable();

    const setData = (docs) => {
        tableBody.html("");
        let table = "";
        if (docs && docs.length > 0) {
            for (let doc of docs) {
                table += addRegel(doc, true);
            }
            calculateTotals(docs);
            tableBody.append(table);
            updateTableListener();
        }
    };

    /**
     *
     * @param {[]} docs
     */
    const calculateTotals = (docs) => {
        let totalKasIn   = 0,
            totalKasUit  = 0,
            totalBankIn  = 0,
            totalBankUit = 0;

        if (docs && docs.length) {
            for (let doc of docs) {
                totalKasIn += doc.kas_in ? parseFloat(doc.kas_in) : 0;
                totalKasUit += doc.kas_uit ? parseFloat(doc.kas_uit) : 0;
                totalBankIn += doc.bank_in ? parseFloat(doc.bank_in) : 0;
                totalBankUit += doc.bank_uit ? parseFloat(doc.bank_uit) : 0;
            }
            tableFoot.html(`<tr>
                                <td colspan="5"></td>
                                <td>${formatCurrency(totalKasIn)}</td>
                                <td>${formatCurrency(totalKasUit)}</td>
                                <td>${formatCurrency(totalBankIn)}</td>
                                <td>${formatCurrency(totalBankUit)}</td>
                                <td></td>
                            </tr>`);
        } else {
            tableFoot.html("");
        }
    };

    /**
     * On modal close clear the form
     */
    regelModal.on("hidden.bs.modal", () => {
        regelModal.find("form")[0].reset();

    });

    const updateTableListener = () => {
        tableBody.find("tr").off("dblclick");
        tableBody.find("a.delete").off("click");

        tableBody.find("tr").on("dblclick", (event) => {
            const target     = $(event.currentTarget);
            const realTarget = $(event.target);
            createNewRegel(target.data(), realTarget.index() - 1);
        });

        tableBody.find("a.delete").on("click", (event) => {
            const target = $(event.target);
            removeRegel(target.parent().parent().data())
        });
    };

    /**
     *
     * @param {{}} doc
     * @param {boolean} mass
     */
    const addRegel = (doc, mass = false) => {
        let row  = `<tr id="${doc._id}"`;
        let data = '';
        for (let key of keyOrder) {
            row += ` data-${key}="${doc[key]}"`;
            if (customFields.hasOwnProperty(key)) {
                data += `<td tabindex="0">${customFields[key](doc[key])}</td>`;
            } else {
                data += `<td tabindex="0">${doc[key]}</td>`;
            }
        }
        data += `<td class="hidden-print"><a class="delete glyphicon glyphicon-remove"></a></td>`;
        row += `>${data}</tr>`;

        if (mass) { // _if a lot of rows need to be added, add them out of the loop for better performance
            return row;
        } else {
            tableBody.append(row);
            updateTableListener();
        }
    };

    function createNewRegel(data = {}, focusField = 0) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                regelModal.find("#" + key).val(data[key]);
            }
        }
        regelModal.modal("show");
        $(regelModal.find('input:visible, select')[focusField]).focus();
        regelModal.find('#btn-save').on("click", regelModal, (event) => {
                addNewRegel(event);
                unsetListeners();
            }
        );

        setTimeout(()=> {
            regelModal.find('input:visible, select').on("keypress", regelModal, (event) => {
                if (event.which === 13) {
                    addNewRegel(event);
                    unsetListeners();
                }
            });
        }, 20);


        regelModal.on("hide.bs.modal", () => {
                unsetListeners();
            }
        );

        const unsetListeners = () => {
            regelModal.find("#btn-save").off("click");
            regelModal.find('input:visible, select').off("keypress");

        };
    }

    const addNewRegel = (event) => {
        const newline = event.data;
        let data      = newline.find('form').serializeArray();
        data          = arrayConversion.arrayToObject(data);
        if (data._id) {
            regel.update(data, {_id: data._id}, (error, numAffected, updatedDoc) => {
                    if (error) {
                        console.log(error);
                    }
                    const regel = addRegel(updatedDoc, true);
                    $("#" + updatedDoc._id).replaceWith(regel);
                    updateTableListener();
                }
            );
        } else {
            regel.create(data, (newDoc) => {
                    addRegel(newDoc);
                }
            );
        }
        regelModal.modal("hide");
    };

    const removeRegel = (data) => {
        confirm("Weet u zeker dat u dit item wilt verwijderen?", (result) => {
            if (result) {
                const id  = Number(data._id);
                const row = tableBody.find("#" + id);
                row.remove();

                regel.remove({_id: id}, (numRemoved) => {
                    if (numRemoved === 1) {
                        alert("success", "Item succesvol verwijderd");
                    } else {
                        alert("error", "Het lijkt erop dat er iets fout is gegaan met het verwijderen");
                    }
                });
            } else {
                // Do nothing
            }
        });

    };

    window.createNewRegel = createNewRegel;
    window.removeRegel    = removeRegel;
})(jQuery);