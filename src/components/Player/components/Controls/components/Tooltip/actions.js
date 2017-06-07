var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');

var TooltipActions = function() {

    function TooltipActions() {
        helper.classCallCheck(this, TooltipActions);
        this.generateActions(
            'settingChange'
        );
    }

    return TooltipActions;

}();


module.exports = alt.createActions(TooltipActions);
