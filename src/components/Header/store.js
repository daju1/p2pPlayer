var alt = require('../../alt');
var helper = require('../../helper');
var HeaderActions = require('./actions');
var engineStore = require('../../stores/engineStore');

var HeaderStore = function() {
    function HeaderStore() {
        helper.classCallCheck(this, HeaderStore);
        this.bindActions(HeaderActions);

        this.maximized = false;
        this.minimized = false;
    }
    helper.createClass(HeaderStore, [{

    key: 'onMaximized',
    value: function 
    onMaximized(toggle) {
        this.setState({
            maximized: toggle,
        });
    }

    }, {
    key: 'onMinimized',
    value: function 
    onMinimized(toggle) {
        this.setState({
            minimized: toggle,
        });
    }
    }]);
    return HeaderStore;
    
}();

module.exports = alt.createStore(HeaderStore);