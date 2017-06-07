var alt = require('../../alt');
var {
    ipcRenderer
}
= require('electron');
var remote = require('remote');
var engineStore = require('../../stores/engineStore');
var ModalActions = require('../Modal/actions');
var ls = require('local-storage');

class HeaderActions {
    constructor() {
        this.generateActions(
            'maximize',
            'minimize'
        );
    }

    toggleMaximize() {
        this.dispatch();
        let state = !ipcRenderer.sendSync('app:get:maximized');
        ipcRenderer.send('app:maximize', state);
        this.actions.maximize(state);
        document.querySelector('header .controls div.toggle i:nth-of-type(2)').style.display = state ? 'block' : 'none';
    }

    toggleMinimize() {
        this.dispatch();
        remote.getCurrentWindow().minimize();
        this.actions.minimize();
    }

    close() {
        var engineState = engineStore.getState();
        
        if (engineState.infoHash && engineState.torrents[engineState.infoHash]) {
            // it's a torrent, let's see if we should remove the files
            if (ls('removeLogic') < 1) {
                ModalActions.shouldExit(true);
                ModalActions.open({ type: 'askRemove' });
            } else {
                var torrent = engineState.torrents[engineState.infoHash];

                if (ls('removeLogic') == 1) {
                    torrent.kill(() => {
                        ipcRenderer.send('app:close');
                    });
                } else if (ls('removeLogic') == 2) {
                    torrent.softKill(() => {
                        ipcRenderer.send('app:close');
                    });
                }
            }
        } else {
            ipcRenderer.send('app:close');
        }
    }
}


module.exports = alt.createActions(HeaderActions);
