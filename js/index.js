const remote = require('electron').remote;
const hotkeys = remote.require("./js/hotkeys");

/**
 * Returns a formatted amount with a euro sign prepended
 *
 * @param {number} amount
 * @return {string}
 */
window.formatCurrency = (amount) => {
    amount = Number(amount);
    if (amount != '' && amount != undefined) {
        const amountString = amount.toFixed(2) + "";
        return "&euro; " + amountString.replace(".", ",");
    } else {
        return '';
    }
};