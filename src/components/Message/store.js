var alt = require('../../alt');
var helper = require('../../helper');
var MessageActions = require('./actions');


var MessageStore = function() {
    function MessageStore() {
        helper.classCallCheck(this, MessageStore);
        this.bindActions(MessageActions);

        this.open = false;
        this.message = '';

    }
    helper.createClass(MessageStore, [{

    key: 'onOpen',
    value: function 
    onOpen(message) {
        this.setState({
            message: message
        });
        document.querySelector('#main-toaster').open();
    }

    }, {
    key: 'onClose',
    value: function 
    onClose() {
        this.setState({
            open: false,
            message: ''
        });
    }
    }]);
    return MessageStore;
}();

module.exports = alt.createStore(MessageStore);