const express = require('express');
   const Message = require('../models/Message');
   const router = express.Router();

   // Get messages between two users
   router.get('/:userId/:otherUserId', async (req, res) => {
     const { userId, otherUserId } = req.params;
     try {
       const messages = await Message.find({
         $or: [
           { sender: userId, receiver: otherUserId },
           { sender: otherUserId, receiver: userId },
         ],
       }).sort({ timestamp: 1 });
       res.json(messages);
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   });

   // Get list of users you've chatted with
   router.get('/chat-list/:userId', async (req, res) => {
     const { userId } = req.params;
     try {
       const messages = await Message.find({
         $or: [{ sender: userId }, { receiver: userId }],
       }).populate('sender receiver', 'username profilePicture');
       const chatPartners = new Set();
       messages.forEach((msg) => {
         if (msg.sender._id.toString() !== userId) chatPartners.add(JSON.stringify(msg.sender));
         if (msg.receiver._id.toString() !== userId) chatPartners.add(JSON.stringify(msg.receiver));
       });
       res.json([...chatPartners].map(JSON.parse));
     } catch (error) {
       res.status(400).json({ error: error.message });
     }
   });

   module.exports = router;