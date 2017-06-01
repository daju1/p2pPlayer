var notifier = require('node-notifier');
var path = require('path');
var _ = require('lodash');

module.exports = {
    notify: (notifyparams, clickFunction) => {
        notifyparams = _.defaults(notifyparams, {
            icon: path.join(__dirname, '../../', 'images/icons/logo.png'),
            message: '',
            sound: false,
            wait: false
        });
        notifier.notify(notifyparams);
        if (clickFunction)
            notifier.on('click', clickFunction);
    }
};