const express = require('express');
   const bcrypt = require('bcryptjs');
   const jwt = require('jsonwebtoken');
   const User = require('../models/User');
   const router = express.Router();

   module.exports = (upload) => {
     // Signup
     router.post('/signup', upload.single('profilePicture'), async (req, res) => {
       const { email, username, password } = req.body;
       try {
         const hashedPassword = await bcrypt.hash(password, 10);
         const user = new User({
           email,
           username,
           password: hashedPassword,
           profilePicture: req.file ? `/uploads/${req.file.filename}` : '',
         });
         await user.save();
         res.status(201).json({ message: 'User created' });
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     });

     // Login
     router.post('/login', async (req, res) => {
      const { identifier, password } = req.body;
      try {
        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, username: user.username, profilePicture: user.profilePicture } });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
     // Search users
     router.get('/search', async (req, res) => {
       const { query } = req.query;
       try {
         const users = await User.find({
           $or: [
             { email: { $regex: query, $options: 'i' } },
             { username: { $regex: query, $options: 'i' } },
           ],
         }).select('username email profilePicture');
         res.json(users);
       } catch (error) {
         res.status(400).json({ error: error.message });
       }
     });

     return router;
   };