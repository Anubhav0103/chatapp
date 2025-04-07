import React, { useState } from 'react';
   import axios from 'axios';
   import { useNavigate } from 'react-router-dom';

   function Signup() {
     const [email, setEmail] = useState('');
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [profilePicture, setProfilePicture] = useState(null);
     const navigate = useNavigate();

     const handleSubmit = async (e) => {
       e.preventDefault();
       const formData = new FormData();
       formData.append('email', email);
       formData.append('username', username);
       formData.append('password', password);
       if (profilePicture) formData.append('profilePicture', profilePicture);

       try {
         await axios.post('http://localhost:5000/api/auth/signup', formData);
         navigate('/login');
       } catch (error) {
         console.error(error.response.data);
       }
     };

     return (
       <div>
         <h1>Sign Up</h1>
         <form onSubmit={handleSubmit}>
           <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
           <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
           <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
           <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
           <button type="submit">Sign Up</button>
         </form>
       </div>
     );
   }

   export default Signup;