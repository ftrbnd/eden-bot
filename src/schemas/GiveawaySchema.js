const mongoose = require('mongoose');

const GiveawaySchema = new mongoose.Schema({
    prize: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    description: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    endDate: {
        type: mongoose.SchemaTypes.Date,
        required: true,
    },
    entries: {
        type: mongoose.SchemaTypes.Array,
        required: false,
    },
    imageURL: {
        type: mongoose.SchemaTypes.String,
        required: false,
    }
}, { versionKey: false });

module.exports = mongoose.model('Giveaway', GiveawaySchema);