var alt = require('../../../../alt');
var helper = require('../../../../helper');

var VisibilityActions = function() {

    function VisibilityActions() {
        helper.classCallCheck(this, VisibilityActions);
        this.generateActions(
            'settingChange',
            'toggleMenu',
            'uiShown'
        );
    }
    return VisibilityActions;

}();

module.exports = alt.createActions(VisibilityActions);
