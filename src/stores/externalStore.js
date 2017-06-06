var alt = require('../alt');
var externalActions = require('../actions/externalActions');
var helper = require('../helper');


var externalStore = function() {
    function externalStore() {
        helper.classCallCheck(this, externalStore);
        this.bindActions(_externalActions2.default);
        this.errors = {};

        this.license = false;
        this.contributors = false;
        this.version = false;

    }
    helper.createClass(externalStore, [{
        key: 'onGotLicense',
        value: function onGotLicense(license) {
            this.setState({
                license: license
            });
        }
    }, {
        key: 'onGotContributors',
        value: function onGotContributors(contributors) {
            this.setState({
                contributors: contributors
            });
        }
    }, {
        key: 'onGotVersion',
        value: function onGotVersion(version) {
            this.setState({
                version: version
            });
        }
    }, {
        key: 'errors',
        value: function errors(_ref) {
            var _errors = _ref.errors;
            this.setState({
                errors: _errors
            });
        }
    }]);
    return externalStore;
}();


module.exports = alt.createStore(externalStore);
