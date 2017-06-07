var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var ModalStore = require('./store');
var ModalActions = require('./actions');

var TraktCode = require('./components/TraktCode');
var TraktInfo = require('./components/TraktInfo');
var TraktSearch = require('./components/TraktSearch');

var CastingScanner = require('./components/Casting-dummy');
var CastingSettings = require('./components/Casting-dummy');
var CastingControls = require('./components/Casting-dummy');
var CastingLink = require('./components/Casting-dummy');
var CastingProcess = require('./components/Casting-dummy');
var CastingPlayer = require('./components/Casting-dummy');
var CastingPlayerScanner = require('./components/Casting-dummy');

module.exports = React.createClass({

    mixins: [PureRenderMixin],
    
    getInitialState() {

        var modalState = ModalStore.getState();

        return {
            modalIsOpen: modalState.open,
            type: modalState.type,
            data: modalState.data,
            theme: modalState.theme
        };
    },

    componentDidMount() {
        ModalStore.listen(this.update);
    },

    componentWillUnmount() {
        ModalStore.unlisten(this.update);
    },

    update() {
        if (this.isMounted()) {

            var modalState = ModalStore.getState();

            this.setState({
                modalIsOpen: modalState.open,
                data: modalState.data,
                type: modalState.type
            });
        }
    },

    openModal() {
        this.setState({
            modalIsOpen: true
        });
    },

    closeModal() {
        this.setState({
            modalIsOpen: false
        });
    },

    getContents() {
        switch (this.state.type) {
            case 'TraktCode':
                return <TraktCode />;
                break;
            case 'TraktInfo':
                return <TraktInfo />;
                break;
            case 'TraktSearch':
                return <TraktSearch />;
                break;
            case 'CastingScanner':
                return <CastingScanner />;
            case 'CastingSettings':
                return <CastingSettings />;
            case 'CastingControls':
                return <CastingControls />;
            case 'CastingLink':
                return <CastingLink />;
            case 'CastingProcess':
                return <CastingProcess />;
            case 'CastingPlayer':
                return <CastingPlayer />;
            case 'CastingPlayerScanner':
                return <CastingPlayerScanner />;
        }
    },

    render() {
        return '';/*(
            <div style={{width: '0px', height: '0px'}}>
                {this.getContents()}
            </div>
        );*/
    }
});