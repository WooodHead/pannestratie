class Utils {

    /**
     * Returns a formatted amount with a euro sign prepended
     *
     * @param {number|string} amount
     * @return {string}
     */
    static formatCurrency(amount) {
        amount = Number(amount);
        if (amount != '' && amount != undefined && !isNaN(amount)) {
            const amountString = amount.toFixed(2) + "";
            return "&euro; " + amountString.replace(".", ",");
        } else {
            return '';
        }
    };

    static currencyToValue(amount) {
        console.log(amount);
        amount = parseFloat(amount.replace(",", "."));
        console.log(amount);
        return amount;
    }

}

module.exports = Utils;