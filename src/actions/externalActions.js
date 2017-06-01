var alt = require('../alt');

class externalActions {

    constructor() {
        this.generateActions(
            'gotLicense',
            'gotContributors',
            'gotVersion'
        );
    }

    getLicense() {
        this.dispatch();
        require('../utils/aboutUtil').getLicense();
    }

    getContributors() {
        this.dispatch();
        require('../utils/aboutUtil').getContributors();
    }

    getVersion() {
        this.dispatch();
        require('../utils/aboutUtil').getVersion();
    }
}


module.exports = alt.createActions(externalActions);
