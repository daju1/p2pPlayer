var alt = require('../alt');
var helper = require('../helper');



var externalActions = function() {
    function externalActions() {
        helper.classCallCheck(this, externalActions);
        this.generateActions('gotLicense', 'gotContributors', 'gotVersion');
    }
    helper.createClass(externalActions, [{
        key: 'getLicense',
        value: function getLicense() {
            this.dispatch();
            require('../utils/aboutUtil').getLicense();
        }
    }, {
        key: 'getContributors',
        value: function getContributors() {
            this.dispatch();
            require('../utils/aboutUtil').getContributors();
        }
    }, {
        key: 'getVersion',
        value: function getVersion() {
            this.dispatch();
            require('../utils/aboutUtil').getVersion();
        }
    }]);
    return externalActions;
}();
module.exports = alt.createActions(externalActions);
