var alt = require('../alt');
var torrentActions = require('../actions/torrentActions');
var localFilesActions = require('../actions/localfileActions');


class engineStore {
    constructor() {
        this.bindAction(torrentActions.add, this.onNewTorrent);
        this.bindAction(torrentActions.clear, this.onClearTorrents);

        this.torrents = {};
        this.localFiles = [];
        this.hosted = [];

    }

    onNewTorrent(instance) {
        this.torrents[instance.infoHash] = instance;
        this.setState({
            torrents: this.torrents,
            infoHash: instance.infoHash
        });
    }

    onClearTorrents() {
        this.setState({
            torrents: {},
            infoHash: null
        });
    }
}

module.exports = alt.createStore(engineStore);