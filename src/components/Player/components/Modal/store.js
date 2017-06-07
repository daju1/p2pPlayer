var alt = require('../../../../alt');
var modalActions = require('./actions');


class darkModalStore {
    constructor() {
        this.bindActions(modalActions);

        this.open = false;
        this.type = false;
        this.meta = false;
        this.data = false;

    }

    onOpen(data) {
        this.setState({
            open: true,
            data: data,
            type: data.type
        });
    }

    onMetaUpdate(meta) {
        this.setState({
            meta: meta
        });
    }

    onClose() {
        this.setState({
            open: false,
            data: false,
            type: false
        });
    }
}

module.exports = alt.createStore(darkModalStore);