var alt = require('../../../../../../alt')

class TooltipActions {

    constructor() {
        this.generateActions(
            'settingChange'
        );
    }

}


module.exports = alt.createActions(TooltipActions);
