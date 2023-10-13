const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    link: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
}, { versionKey: false });

module.exports = mongoose.model('Playlist', PlaylistSchema);