var React = require('react');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var ModalStore = require('./store');
var ModalActions = require('./actions');

var FileStreamSelector = require('./components/fileStreamSelector');
var URLContents = require('./components/URLadd');
var Thinking = require('./components/Thinking');
var DashboardMenu = require('./components/dashboardMenu');
var DashboardFileMenu = require('./components/dashboardFileMenu');
var AskRemove = require('./components/askRemove');
var About = require('./components/about');
var Plugin = require('./components/Plugin');
var InstalledPlugin = require('./components/InstalledPlugin');
var SearchPlugin = require('./components/SearchPlugin');
var SearchPlugins = require('./components/SearchPlugins');
var TorrentSelector = require('./components/torrentSelector');
var TorrentWarning = require('./components/torrentWarning');

module.exports = React.createClass({

    mixins: [PureRenderMixin],

    getInitialState() {

        var modalState = ModalStore.getState();

        return {
            Thinking: modalState.thinking,
            modalIsOpen: modalState.open,
            type: modalState.type,
            data: modalState.data
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
                type: modalState.type,
                Thinking: modalState.thinking
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

    /*getContents() {
        switch (this.state.type) {
            case 'URLAdd':
                return <URLContents />;
                break;
            case 'fileSelctor':
                return <FileStreamSelector />;
                break;
            case 'thinking':
                return <Thinking />;
                break;
            case 'dashboardMenu':
                return <DashboardMenu />;
                break;
            case 'dashboardFileMenu':
                return <DashboardFileMenu />;
                break;
            case 'askRemove':
                return <AskRemove />;
                break;
            case 'about':
                return <About />;
                break;
            case 'plugin':
                return <Plugin />;
                break;
            case 'installedPlugin':
                return <InstalledPlugin />;
                break;
            case 'searchPlugin':
                return <SearchPlugin />;
                break;
            case 'searchPlugins':
                return <SearchPlugins />;
                break;
            case 'torrentSelector':
                return <TorrentSelector />;
                break;
            case 'torrentWarning':
                return <TorrentWarning />;
                break;
        }
    },*/

    render() {
        return '';/*(
            <div style={{width: '0px', height: '0px'}}>
                {this.getContents()}
            </div>
        );*/
    }
});