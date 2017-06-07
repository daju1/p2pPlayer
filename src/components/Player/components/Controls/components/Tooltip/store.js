var alt = require('../../../../../../alt');
var tooltipActions = require('./actions');

class TooltipStore {

    constructor() {
        this.bindActions(tooltipActions);

        this.scrobbleTooltip = 'none';

    }

    onSettingChange(setting) {
        this.setState(setting);
    }

}

module.exports = alt.createStore(TooltipStore);
