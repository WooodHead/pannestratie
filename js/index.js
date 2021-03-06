(function () {
    const remote        = require('electron').remote;
    const hotkeys       = remote.require("./js/hotkeys");
    const {ipcRenderer} = require('electron');

    /**
     * Returns a formatted amount with a euro sign prepended
     *
     * @param {number|string} amount
     * @return {string}
     */
    function formatCurrency(amount) {
        amount = Number(amount);
        if (amount != '' && amount != undefined) {
            const amountString = amount.toFixed(2) + "";
            return "&euro; " + amountString.replace(".", ",");
        } else {
            return '';
        }
    }

    /**
     *
     * @param {string} type possible values: "success", "info", "warning", "dager"
     * @param {string} text
     */
    function alert(type, text) {
        const alertWrapper = $(".alert-wrapper");
        alertWrapper.append(
            "<div class='alert alert-dismissable alert-" + type + "' role='alert'>" +
            "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
            "<span aria-hidden='true'>&times;</span>" +
            "</button>" +
            text + "" +
            "</div>");
        const alert = alertWrapper.children().last();
        setTimeout(() => {
            alert.slideUp(() => {
                alert.remove()
            });
        }, 3000);
    }

    function confirm(text, callback) {
        const confirmModal = $("#confirm");
        if (confirmModal.is(":visible")) {
            throw new Error("Confirm already visible");
        }
        confirmModal.modal("show");
        confirmModal.on("keypress", (event) => {
            if (event.which === 13) {
                ok();
            }
        });
        confirmModal.find(".confirm-text").text(text);
        confirmModal.find("#confirm-ok").on("click", () => {
            ok();
        });
        confirmModal.find("#confirm-cancel").on("click", () => {
            cancel();
        });
        confirmModal.on("hide.bs.modal", () => {
            cancel();
        });

        const ok = () => {
            unsetListeners();
            confirmModal.modal("hide");
            callback(true);
        };

        const cancel = () => {
            unsetListeners();
            confirmModal.modal("hide");
            callback(false);
        };

        const unsetListeners = () => {
            confirmModal.find("#cancel").off("click");
            confirmModal.find("#ok").off("click");
            confirmModal.off("hide.bs.modal");
            confirmModal.off("keypress");
        }
    }

    function prompt(text, callback) {
        const promptModal = $("#prompt");
        if (promptModal.is(":visible")) {
            throw new Error("Prompt already visible");
        }
        promptModal.modal("show");

        promptModal.on("keypress", (event) => {
            if (event.which === 13) {
                ok();
            }
        });
        promptModal.find(".prompt-text").text(text);
        promptModal.find("#prompt-ok").on("click", () => {
            ok();
        });

        const ok = () => {
            unsetListeners();
            const valueElement = promptModal.find("#prompt-value");
            const value        = valueElement.val();
            valueElement.val("");
            promptModal.modal("hide");
            callback(value);
        };

        const unsetListeners = () => {
            promptModal.find("#prompt-ok").off("click");
            promptModal.off("keypress");
        }
    }

    ipcRenderer.on("prompt", (event, text, callback) => {
        prompt(text, (value) => {
            ipcRenderer.send("prompt", value)
        });
    });

    window.formatCurrency = formatCurrency;
    window.alert          = alert;
    window.confirm        = confirm;
    window.prompt         = prompt;
})();