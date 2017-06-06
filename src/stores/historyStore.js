var alt = require('../alt');
var historyActions = require('../actions/historyActions');

var helper = require('../helper');

var historyStore = function() {
    function historyStore() {
        helper.classCallCheck(this, historyStore);
        this.bindActions(historyActions);

        this.history = false;
    }
    helper.createClass(historyStore, [{
        key: 'onHistory',
        value: function onHistory(history) {
            this.setState({
                history: history
            });
        }
    }]);
    return historyStore;
}();
module.exports = alt.createStore(historyStore);