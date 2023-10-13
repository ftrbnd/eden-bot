const mongoose = require('mongoose');

const MusicPermissionSchema = new mongoose.Schema({
    roleName: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    roleId: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
}, { versionKey: false });

module.exports = mongoose.model('MusicPermission', MusicPermissionSchema);