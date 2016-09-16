(($) => {
    const remote        = require('electron').remote;
    const {ipcRenderer} = require('electron');

    const regel           = remote.require('./js/database/regel');
    const arrayConversion = remote.require('./js/database/arrayConversion');

    const table        = $("#line-table");
    const tableContent = table.find("tbody");
    const regelModal   = $("#new-regel");

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
            const data = filterForm.serializeArray().reduce(function (obj, item) {
                obj[item.name] = item.value;
                return obj;
            });

            const filter = {};
            if (data.category_filter) filter.category = data.category_filter;
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
        tableContent.html("");
        let table = "";
        for (let doc of docs) {
            table += addRegel(doc, true);
        }
        tableContent.append(table);
        updateTableListener();
    };

    /**
     * On modal close clear the form
     */
    regelModal.on("hidden.bs.modal", () => {
        regelModal.find("form")[0].reset();

    });

    const updateTableListener = () => {
        tableContent.find("tr").off("dblclick");
        tableContent.find("a.delete").off("click");

        tableContent.find("tr").on("dblclick", (event) => {
            const target     = $(event.currentTarget);
            const realTarget = $(event.target);
            createNewRegel(target.data(), realTarget.index() - 1);
        });

        tableContent.find("a.delete").on("click", (event) => {
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
        let row  = '<tr id="' + doc._id + '"';
        let data = '';
        for (let key of keyOrder) {
            row += ' data-' + key + '="' + doc[key] + '"';
            if (customFields.hasOwnProperty(key)) {
                data += '<td tabindex="0">' + customFields[key](doc[key]) + '</td>'
            } else {
                data += '<td tabindex="0">' + doc[key] + '</td>'
            }
        }
        data += '<td class="hidden-print"><a class="delete glyphicon glyphicon-remove"></a></td>';
        row += '>' + data + '</tr>';

        if (mass) { // _if a lot of rows need to be added, add them out of the loop for better performance
            return row;
        } else {
            tableContent.append(row);
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
        console.log(data);
        data = arrayConversion.arrayToObject(data);
        console.log(data);
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
                const row = tableContent.find("#" + id);
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