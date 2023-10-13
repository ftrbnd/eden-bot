const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    birthday: {
        type: mongoose.SchemaTypes.Date,
        require: false,
    },
    timezone: {
        type: mongoose.SchemaTypes.String,
        require: false,
    },
    warnings: {
        type: mongoose.SchemaTypes.Number,
        require: false
    },
    muteEnd: {
        type: mongoose.SchemaTypes.Date,
        require: false
    }
}, { versionKey: false });

module.exports = mongoose.model('User', UserSchema);