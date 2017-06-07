var alt = require('../../../../alt');
var helper = require('../../../../helper');
var modalActions = require('./actions');


var darkModalStore = function() {
    function darkModalStore() {
        helper.classCallCheck(this, darkModalStore);
        this.bindActions(modalActions);

        this.open = false;
        this.type = false;
        this.meta = false;
        this.data = false;

    }

    helper.createClass(darkModalStore, [{
    key: 'onOpen',
    value: function 
    onOpen(data) {
        this.setState({
            open: true,
            data: data,
            type: data.type
        });
    }

    }, {
    key: 'onMetaUpdate',
    value: function 
    onMetaUpdate(meta) {
        this.setState({
            meta: meta
        });
    }

    }, {
    key: 'onClose',
    value: function 
    onClose() {
        this.setState({
            open: false,
            data: false,
            type: false
        });
    }
    }]);
    return darkModalStore;
}();

module.exports = alt.createStore(darkModalStore);