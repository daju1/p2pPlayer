import _ = require('lodash');
import ls = require('local-storage');

var map = {
    torrentContent: true,
    resizeOnPlaylist: true,
    ytdlQuality: 2,
    renderFreq: 500,
    renderHidden: true,
    subEncoding: 'auto',
    peerPort: 6881,
    maxPeers: 200,
    bufferSize: 7000,
    removeLogic: 0,
    downloadType: 0,
    playerType: false,
    adultContent: false,
    myFilmonPlugins: [],
    torrentWarning: 1,
    casting: {},
    extPlayers: [],
    dlnaFinder: 0
}

module.exports = () => {
    _.forEach(map, (el, ij) => {
        if (!ls.isSet(ij)) ls(ij, el);
    });
}
