const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'active' },
    avatar: { type: String }
}, { timestamps: true, 
    collection: 'User'
});

module.exports = mongoose.model('User', UserSchema);