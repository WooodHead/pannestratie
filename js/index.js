(function () {
    const remote = require('electron').remote;
    const hotkeys = remote.require("./js/hotkeys");

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
            if(event.which === 13) {
                unsetListeners();
                confirmModal.modal("hide");
                callback(true);
            }
        });
        confirmModal.find(".confirm-text").text(text);
        confirmModal.find("#ok").on("click", () => {
            unsetListeners();
            callback(true)
        });
        confirmModal.find("#cancel").on("click", () => {
            unsetListeners();
            callback(false)
        });
        confirmModal.on("hide.bs.modal", () => {
            unsetListeners();
            callback(false)
        });

        const unsetListeners = () => {
            confirmModal.find("#cancel").off("click");
            confirmModal.find("#ok").off("click");
            confirmModal.off("hide.bs.modal");
            confirmModal.off("keypress");
        }
    }

    window.formatCurrency = formatCurrency;
    window.alert = alert;
    window.confirm = confirm;
})();