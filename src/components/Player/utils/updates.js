var notifier = require('node-notifier');
var needle = require('needle');
var path = require('path');
var ls = require('local-storage');
var fs = require('fs');
var {
    shell
} = require('electron');

module.exports = {
    checkUpdates: () => {
        if (!ls.isSet('version')) ls('version', '1.00');
        if (!ls.isSet('updateCheck')) ls('updateCheck', 0);
        
        // announce update every 3 days
        if (ls('updateCheck') < Math.floor(Date.now() / 1000) - 259200) {
            needle.get('http://powder.media/version', (err, res) => {
                if (!err && res.body && res.body.includes('|')) {
                    var vers = new TextDecoder("utf-8").decode(res.body).split('|');
                    if (vers[0] == ls('version')) {
                        ls('updateCheck', Math.floor(Date.now() / 1000));
                    } else {
                        var iconPath = path.join(__dirname, '../../../../images/icons/powder-icon-padding.png');
                        if (!fs.accessSync(iconPath, fs.F_OK))
                            iconPath = path.join(__dirname, '../../../../../images/icons/powder-icon-padding.png');

                        notifier.notify({
                            title: 'Powder v' + vers[0] + ' Available',
                            message: 'Includes awesome new features!',
                            icon: iconPath,
                            sound: true,
                            wait: true
                        }, (err, response) => {
                            if (!err) {
                                ls('updateCheck', Math.floor(Date.now() / 1000));
                                if (response == 'activate')
                                    shell.openExternal(vers[1]);
                            }
                        });
                    }
                }
            });
        }
    }
}