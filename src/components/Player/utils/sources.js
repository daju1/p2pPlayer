var ytdl = require('youtube-dl');
var ls = require('local-storage');

module.exports = {
    youtubeDL: (link, cb) => {
        var ytdlArgs = ['-g'];

        if (ls('ytdlQuality') < 4) {
            var qualities = [360, 480, 720, 1080];
            ytdlArgs.push('-f');
            ytdlArgs.push('[height <=? ' + qualities[ls('ytdlQuality')] + ']');
        }

        var video = ytdl(link, ytdlArgs);

        video.on('info', cb);
    },
}
