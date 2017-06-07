var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var ModalActions = require('../actions');
var ModalStore = require('../store');
var _ = require('lodash');
var LinkSupport = require('./../../Player/utils/supportedLinks');

module.exports = React.createClass({
    
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            meta: ModalStore.getState().meta,
            stats: {
                uploadSpeed: 0,
                downloadSpeed: 0,
                peers: {
                    active: 0,
                    total: false
                }
            }
        };
    },

    componentDidMount() {
        this.refs['dialog'].open();
    },
    
    componentDidUpdate() {
//        this.refs['dialog'].open();
    },

    componentWillMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    handelCancel() {
        var Linky = new LinkSupport;
        Linky.stopParsing();
    },

    update() {
        if (this.isMounted()) {
            this.setState({
                meta: ModalStore.getState().meta,
            });
            this.updateUI(this.state.meta.type)
        }
    },

    updateUI(type) {
        switch (type) {
            case 'torrent':
                this.updateStats(this.state.meta.data.swarm);
                break;
        }
    },

    updateStats(swarm) {
        if (this.isMounted()) {
            this.setState({
                stats: {
                    uploadSpeed: swarm.uploadSpeed,
                    downloadSpeed: swarm.downloadSpeed,
                    peers: {
                        active: swarm.wires && swarm.wires.length ? swarm.wires.length : 0,
                        total: swarm.wires && swarm.wires.length ? swarm.wires.length : 0
                    }
                }
            });

            _.delay(this.updateStats, 500, this.state.meta.data.swarm);
        }
    },

    render() { return '';/*
        var statusText = this.state.stats.peers.total ? <p className="peers" >Connected to {this.state.stats.peers.total} Peers</p> : <p className="peers">Processing URL</p>;
        return (
            <paper-dialog ref="dialog" style={{width: '440px', textAlign: 'left', borderRadius: '3px'}} entry-animation="slide-from-top-animation" opened={false} with-backdrop>
                <div style={{width: '394px', overflow: 'hidden', position: 'relative', marginBottom: '15px'}}>
                    <paper-progress indeterminate style={{width: '100%'}}></paper-progress>
                </div>
                <paper-button raised onClick={this.handelCancel} style={{float: 'right', marginRight: '22px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}} dialog-dismiss>Cancel</paper-button>
                {statusText}
            </paper-dialog>
        );*/
    }
});