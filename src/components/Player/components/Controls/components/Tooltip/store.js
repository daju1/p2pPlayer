var alt = require('../../../../../../alt');
var helper = require('../../../../../../helper');
var tooltipActions = require('./actions');

var TooltipStore = function(){

    function TooltipStore() {
        helper.classCallCheck(this, TooltipStore);
        this.bindActions(tooltipActions);

        this.scrobbleTooltip = 'none';

    }

    helper.createClass(TooltipStore, [{
    key: 'onSettingChange',
    value: function 
    onSettingChange(setting) {
        this.setState(setting);
    }
    }]);
    return TooltipStore;

}();

module.exports = alt.createStore(TooltipStore);
