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
    function showAlert(type, text) {
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

    window.formatCurrency = formatCurrency;
    window.showAlert = showAlert;
})();