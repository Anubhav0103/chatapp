import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    socket.emit('join', user._id);

    // Load chat list
    axios.get(`http://localhost:5000/api/messages/chat-list/${user._id}`).then((res) => setChatList(res.data));

    // Listen for messages
    socket.on('message', (msg) => {
      if ((msg.sender === user._id && msg.receiver === selectedUser?._id) || (msg.sender === selectedUser?._id && msg.receiver === user._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off('message');
  }, [user._id, selectedUser]);

  const handleSearch = async () => {
    const res = await axios.get(`http://localhost:5000/api/auth/search?query=${searchQuery}`);
    setUsers(res.data.filter((u) => u._id !== user._id));
  };

  const startChat = async (otherUser) => {
    setSelectedUser(otherUser);
    const res = await axios.get(`http://localhost:5000/api/messages/${user._id}/${otherUser._id}`);
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const msg = { senderId: user._id, receiverId: selectedUser._id, text: message };
      socket.emit('message', msg);
      setMessages((prev) => [...prev, { sender: user._id, receiver: selectedUser._id, text: message, timestamp: new Date() }]);
      setMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
        <h2>Welcome, {user.username}</h2>
        <input
          type="text"
          placeholder="Search by email or username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
        <h3>Search Results</h3>
        {users.map((u) => (
          <div key={u._id} onClick={() => startChat(u)} style={{ cursor: 'pointer' }}>
            <img src={u.profilePicture || 'default-avatar.png'} alt="avatar" width="30" />
            {u.username}
          </div>
        ))}
        <h3>Chat History</h3>
        {chatList.map((partner) => (
          <div key={partner._id} onClick={() => startChat(partner)} style={{ cursor: 'pointer' }}>
            <img src={partner.profilePicture || 'default-avatar.png'} alt="avatar" width="30" />
            {partner.username}
          </div>
        ))}
      </div>
      <div style={{ width: '70%' }}>
ại
        {selectedUser ? (
          <>
            <h2>Chatting with {selectedUser.username}</h2>
            <div style={{ height: '80%', overflowY: 'scroll' }}>
              {messages.map((msg, idx) => (
                <p key={idx}>
                  <b>{msg.sender === user._id ? 'You' : selectedUser.username}:</b> {msg.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{ width: '80%' }}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;