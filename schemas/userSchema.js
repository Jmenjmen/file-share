const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        required: true,
        type: String,
        unique: true
    },
    hashedPasswd: {
        required: true,
        type: String
    }
}, { timestamps: true })

const userModule = mongoose.model('User', UserSchema);
module.exports = userModule;