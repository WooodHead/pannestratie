(($) => {
    $(document).keydown((event)=> {
        const target = $(event.target);
        if (target.is("td")) {
            switch (event.keyCode) {
                case 37:
                    // Move cell back
                    target.prev().focus();
                    break;
                case 38:
                    // Move row up
                    target.parent().prev().find(":eq(" + target.index() + ")").focus();
                    break;
                case 39:
                    // Move cell forward
                    target.next().focus();
                    break;
                case 40:
                    // Move row down
                    target.parent().next().find(":eq(" + target.index() + ")").focus();
                    break;
                case 13:
                    // Open edit window with focus to current field
                    createNewRegel(target.parent().data(), target.index() - 1);
                    break;
                default:
                    break;
            }
        }
    });
})(jQuery);