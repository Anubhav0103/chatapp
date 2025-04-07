const mongoose = require('mongoose');

   const userSchema = new mongoose.Schema({
     email: { type: String, required: true, unique: true },
     username: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     profilePicture: { type: String, default: '' }, // URL or base64
   });

   module.exports = mongoose.model('User', userSchema);