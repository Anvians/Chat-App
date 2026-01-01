import { io } from 'socket.io-client';

const token = localStorage.getItem('token');
const server_url = 'http://localhost:3003' ||   'https://chat-app-l5l5.vercel.app'

// Only create socket connection if user is authenticated
const socket = token ? io(`${server_url}`, {
  auth: { token },
  transports: ['websocket', 'polling'], 
  timeout: 20000, // 20 second timeout
}) : null;

if (socket) {
  console.log('Creating socket connection with token:', !!token);
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    console.error('Error details:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
} else {
  console.log('No token found, socket not created');
}

export default socket;