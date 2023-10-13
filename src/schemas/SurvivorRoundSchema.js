const mongoose = require('mongoose');

const SurvivorRoundSchema = new mongoose.Schema({
    album: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    tracks: {
        type: mongoose.SchemaTypes.Array,
        required: true,
    },
    votes: {
        type: mongoose.SchemaTypes.Map, // song: userId
        of: mongoose.SchemaTypes.Array,
        required: true,
    },
    standings: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    lastMessageId: {
        type: mongoose.SchemaTypes.String,
        required: false,
    },
    roundNumber: {
        type: mongoose.SchemaTypes.Number,
        required: false,
    }
}, { versionKey: false });

module.exports = mongoose.model('SurvivorRound', SurvivorRoundSchema);