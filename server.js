const express = require('express');
   const http = require('http');
   const { Server } = require('socket.io');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const multer = require('multer');
   const path = require('path');
   const authRoutes = require('./routes/auth');
   const messageRoutes = require('./routes/messages');

   const app = express();
   const server = http.createServer(app);
   const io = new Server(server, { cors: { origin: '*' } });

   app.use(cors());
   app.use(express.json());
   app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

   // MongoDB connection
   mongoose.connect('mongodb://localhost:27017/chat-app', {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   }).then(() => console.log('MongoDB connected'));

   // File upload setup
   const storage = multer.diskStorage({
     destination: (req, file, cb) => cb(null, 'uploads/'),
     filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
   });
   const upload = multer({ storage });

   // Routes
   app.use('/api/auth', authRoutes(upload));
   app.use('/api/messages', messageRoutes);

   // Socket.IO for real-time chat
   io.on('connection', (socket) => {
     console.log('User connected:', socket.id);

     socket.on('join', (userId) => {
       socket.join(userId); // Join a room based on user ID
     });

     socket.on('message', async ({ senderId, receiverId, text }) => {
       const message = new (require('./models/Message'))({ sender: senderId, receiver: receiverId, text });
       await message.save();
       io.to(receiverId).to(senderId).emit('message', message); // Send to both sender and receiver
     });

     socket.on('disconnect', () => {
       console.log('User disconnected:', socket.id);
     });
   });

   server.listen(5000, () => console.log('Server running on port 5000'));