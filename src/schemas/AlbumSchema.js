const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    album: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    tracks: {
        type: mongoose.SchemaTypes.Array,
        required: true,
    }
}, { versionKey: false });

module.exports = mongoose.model('Album', AlbumSchema);