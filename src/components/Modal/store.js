var alt = require('../../alt');
var modalActions = require('./actions');
var helper = require('../../helper');

var modalStore = function() {
    function modalStore() {
        helper.classCallCheck(this, modalStore);
        this.bindActions(modalActions);

        this.open = false;
        this.type = false;
        this.thinking = false;
        this.meta = false;
        this.fileSelectorFiles = {};
        this.data = false;
        this.index = -1;
        this.shouldExit = false;
        this.selectedPlugin = false;
        this.installededPlugin = false;
        this.searchPlugin = false;
        this.parseLink = false;
    }
    helper.createClass(modalStore, [{
        key: 'onSetIndex',
        value: function onSetIndex(index) {
            this.setState({
                index: index
            });
        }
    }, {
        key: 'onShouldExit',
        value: function onShouldExit(shouldI) {
            this.setState({
                shouldExit: shouldI
            });
        }
    }, {
        key: 'onOpen',
        value: function onOpen(data) {
            this.setState({
                open: !0,
                data: data,
                type: data.type
            });
        }
    }, {
        key: 'onMetaUpdate',
        value: function onMetaUpdate(meta) {
            this.setState({
                meta: meta
            });
        }
    }, {
        key: 'onThinking',
        value: function onThinking() {
            this.setState({
                type: 'thinking'
            });
        }
    }, {
        key: 'onPlugin',
        value: function onPlugin(el) {
            this.setState({
                selectedPlugin: el,
                type: 'plugin'
            });
        }
    }, {
        key: 'onInstalledPlugin',
        value: function onInstalledPlugin(el) {
            this.setState({
                installedPlugin: el,
                type: 'installedPlugin'
            });
        }
    }, {
        key: 'onSearchPlugin',
        value: function onSearchPlugin(el) {
            this.setState({
                searchPlugin: el,
                type: 'searchPlugin'
            });
        }
    }, {
        key: 'onTorrentWarning',
        value: function onTorrentWarning() {
            this.setState({
                type: 'torrentWarning'
            });
        }
    }, {
        key: 'onTorrentSelector',
        value: function onTorrentSelector(el) {
            this.setState({
                parseLink: el,
                type: 'torrentSelector'
            });
        }
    }, {
        key: 'onFileSelector',
        value: function onFileSelector(files) {
            this.setState({
                fileSelectorFiles: files,
                type: 'fileSelctor'
            });
        }
    }, {
        key: 'onSearchPlugins',
        value: function onSearchPlugins() {
            this.setState({
                type: 'searchPlugins'
            });
        }
    }, {
        key: 'onClose',
        value: function onClose() {
            this.setState({
                open: !1,
                data: !1,
                thinking: !1,
                type: !1
            });
        }
    }]);
    return modalStore;
}();


module.exports = alt.createStore(modalStore);