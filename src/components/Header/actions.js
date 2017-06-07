var alt = require('../../alt');
var helper = require('../../helper');
var {
    ipcRenderer
}
= require('electron');
var remote = require('remote');
var engineStore = require('../../stores/engineStore');
var ModalActions = require('../Modal/actions');
var ls = require('local-storage');

var HeaderActions = function() {
    function HeaderActions() {
        helper.classCallCheck(this, HeaderActions);
        this.generateActions(
            'maximize',
            'minimize'
        );
    }
    helper.createClass(HeaderActions, [{

    key: 'toggleMaximize',
    value: function 
    toggleMaximize() {
        this.dispatch();
        let state = !ipcRenderer.sendSync('app:get:maximized');
        ipcRenderer.send('app:maximize', state);
        this.actions.maximize(state);
        document.querySelector('header .controls div.toggle i:nth-of-type(2)').style.display = state ? 'block' : 'none';
    }

    }, {
    key: 'toggleMinimize',
    value: function 
    toggleMinimize() {
        this.dispatch();
        remote.getCurrentWindow().minimize();
        this.actions.minimize();
    }

    }, {
    key: 'close',
    value: function 
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
    }]);
    return HeaderActions;
}();


module.exports = alt.createActions(HeaderActions);
