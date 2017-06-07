var React = require('react');
var _ = require('lodash');
var MessageStore = require('./store');
var MessageActions = require('./actions');


module.exports = React.createClass({
    getInitialState() {
        return {
            message: ''
        };
    },
    componentWillMount() {
        MessageStore.listen(this.update);
    },

    componentWillUnmount() {
        MessageStore.unlisten(this.update);
    },
    update() {
        this.setState({
            message: MessageStore.getState().message
        });
    },
    render() {
        return "";/*(
            <div>

                <paper-toast
                    id="main-toaster"
                    text={this.state.message} />

            </div>
        );*/
    }
});