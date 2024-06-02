const mongoose = require('mongoose')

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    files: {
        type: [String],
        default: []
    }
})

const AccountModel = mongoose.model('Account', AccountSchema);
module.exports = AccountModel;