var React = require('react');
var {
    clipboard
} = require('electron');

var ModalActions = require('../actions');
var ModalStore = require('../store');

var MessageActions = require('../../Message/actions');
var PlayerActions = require('../../Player/actions');

var linkUtil = require('../../../utils/linkUtil');
var plugins = require('../../../utils/plugins');
var _ = require('lodash');
var filmonUtil = require('../../Player/utils/filmon');
var ls = require('local-storage');


module.exports = React.createClass({

    getInitialState() {
        return {
        }
    },

    componentDidMount() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs.urlInput.$.input.focus()
        });
    },

    handleURLAdd() {
        var inputvalue = this.refs.urlInput.value;
        
        var results = plugins.fetchByName(inputvalue);
        filmonUtil.groups().forEach( el => {
            el.real_channels.forEach( (elm, ijm) => {
                if (elm.title.toLowerCase().indexOf(inputvalue.toLowerCase()) > -1) {
                    if (ls('adultContent') || (!ls('adultContent') && elm.adult_content == '0')) {
                        elm.filmon = true;
                        elm.idx = ijm;
                        elm.channels = el.real_channels;
                        elm.tags = [];
                        results.push(elm);
                    }
                }
            });
        });
        if (results.length) {
            ModalActions.close();
            plugins.events.emit('pluginListUpdate', { terms: inputvalue, results: results });
        } else {
            MessageActions.open(new Error('No Results'));
        }
    },
    pasteClipboard() {
        this.refs['urlInput'].value = clipboard.readText('text/plain');
    },
    componentDidUpdate() {
        this.refs['dialog'].open();
        _.delay(() => {
            this.refs['urlInput'].$.input.focus()
        });
    },
    render() {
        return '';/*(
            <paper-dialog
                ref="dialog"
                style={{width: '440px', textAlign: 'left', borderRadius: '3px'}}
                entry-animation="slide-from-top-animation"
                opened={false}
                with-backdrop >

                <paper-input
                    ref="urlInput"
                    style={{marginBottom: '15px', marginTop: '20px'}}
                    fullWidth={true}
                    onKeyDown={event => event.keyCode === 13 ? this.handleURLAdd() : void 0}
                    onContextMenu={this.pasteClipboard}
                    label={'Search Plugin Names'}
                    no-label-float />
                    
                <paper-button
                    raised
                    onClick={this.handleURLAdd}
                    style={{float: 'right', background: '#00bcd4', color: 'white', padding: '8px 15px', fontWeight: 'bold', marginRight: '22px', marginTop: '0px', textTransform: 'none'}}>
                Search
                </paper-button>
                
                <paper-button
                    raised
                    onClick={ModalActions.close}
                    style={{float: 'right', marginRight: '10px', padding: '8px 15px', fontWeight: 'bold', marginTop: '0px', textTransform: 'none'}}
                  dialog-dismiss>
              Cancel
              </paper-button>
                
            </paper-dialog>
        );*/
    }
});