var alt = require('../alt');
var helper = require('../helper');


var localActions = function() {
    function localActions() {
        helper.classCallCheck(this, localActions);
        this.generateActions('stream');
    }
    helper.createClass(localActions, [{
        key: 'stream',
        value: function stream(file) {
            this.dispatch();
        }
    }, {
        key: 'host',
        value: function host(file) {
            this.dispatch();
        }
    }]);
    return localActions;
}();
module.exports = alt.createActions(localActions);