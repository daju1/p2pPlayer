var alt = require('../alt');
var torrentActions = require('../actions/torrentActions');
var localFilesActions = require('../actions/localfileActions');
var helper = require('../helper');


var engineStore = function() {
    function engineStore() {
        helper.classCallCheck(this, engineStore);
        this.bindAction(torrentActions.add, this.onNewTorrent);
        this.bindAction(torrentActions.clear, this.onClearTorrents);

        this.torrents = {};
        this.localFiles = [];
        this.hosted = [];

    }
    helper.createClass(engineStore, [{
        key: 'onNewTorrent',
        value: function onNewTorrent(instance) {
            this.torrents[instance.infoHash] = instance;
            this.setState({
                torrents: this.torrents,
                infoHash: instance.infoHash
            });
        }
    }, {
        key: 'onClearTorrents',
        value: function onClearTorrents() {
            this.setState({
                torrents: {},
                infoHash: null
            });
        }
    }]);
    return engineStore;
}();
module.exports = alt.createStore(engineStore);