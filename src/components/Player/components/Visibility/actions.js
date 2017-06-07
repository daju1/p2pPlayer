var alt = require('../../../../alt');

class VisibilityActions {

    constructor() {
        this.generateActions(
            'settingChange',
            'toggleMenu',
            'uiShown'
        );
    }

}

module.exports = alt.createActions(VisibilityActions);
