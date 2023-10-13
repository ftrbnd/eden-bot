const mongoose = require('mongoose');

const GptSchema = new mongoose.Schema({
    parentMessageId: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
}, { versionKey: false });

module.exports = mongoose.model('Gpt', GptSchema);