var React = require('react');
var {
    History
}
= require('react-router');
var engineStore = require('../../../stores/engineStore');
var torrentActions = require('../../../actions/torrentActions');
var ModalStore = require('../store');
var {
    ipcRenderer
}
= require('electron');
var events = require('../../Player/utils/events');
var _ = require('lodash');
var ls = require('local-storage');

var ModalActions = require('../actions');

module.exports = React.createClass({

    mixins: [History],

    componentDidMount() {
        this.refs.dialog.open();
    },
    componentDidMount() {
        this.refs.dialog.addEventListener('iron-overlay-canceled', ModalActions.close);
    },

    componentWillUnmount() {
        this.refs.dialog.removeEventListener('iron-overlay-canceled', ModalActions.close);
    },
    handleYes() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        if (!modalState.shouldExit)
            torrent.kill();
        
        if (this.refs.checky.checked)
            ls('removeLogic', 1);

        ModalActions.close();

        torrentActions.clear();
        
        events.close();

        if (!modalState.shouldExit)
            this.history.replaceState(null, '');
        else
            torrent.kill(() => {
                ipcRenderer.send('app:close');
            });
    },
    handleNo() {
        var engineState = engineStore.getState(),
            modalState = ModalStore.getState(),
            torrent = engineState.torrents[engineState.infoHash];

        if (!modalState.shouldExit)
            torrent.softKill();

        if (this.refs.checky.checked)
            ls('removeLogic', 2);

        ModalActions.close();

        torrentActions.clear();
        
        events.close();

        if (!modalState.shouldExit)
            this.history.replaceState(null, '');
        else
            torrent.softKill(() => {
                ipcRenderer.send('app:close');
            });
    },
    render() {
        return '';/*(
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px', maxWidth: '90%', backgroundColor: '#303030', color: 'white', padding: '20px', textAlign: 'center'}}
                entry-animation="slide-from-top-animation"
                opened={true}
                with-backdrop >
                
                <div style={{margin: '0', marginBottom: '5px', fontSize: '16px'}}>
                    Would you like to remove the downloaded files?
                </div>
                
                <paper-checkbox ref="checky" class="dark">Remember Choice</paper-checkbox>

                <div style={{marginTop: '25px', marginBottom: '0', display: 'inline-block'}}>
                    <paper-button
                        raised
                        onClick={this.handleYes}
                        style={{float: 'none', marginRight: '15px', marginBottom: '0'}}
                        className='playerButtons-primary' >
                    Yes
                    </paper-button>
                    <paper-button
                        raised
                        onClick={this.handleNo}
                        style={{float: 'none', margin: '0'}}
                        className='playerButtons' >
                    No
                    </paper-button>
                </div>
            </paper-dialog>
        );*/
    }
});