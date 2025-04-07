import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));

  useEffect(() => {
    // Fetch initial messages
    axios.get('http://localhost:5000/api/messages')
      .then((res) => setMessages(res.data.reverse()));

    // Listen for new messages
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('message');
  }, []);

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage = { username, text: message };
      socket.emit('message', newMessage);
      await axios.post('http://localhost:5000/api/messages', newMessage);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <div style={{ height: '400px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <p key={idx}><b>{msg.username}:</b> {msg.text}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;