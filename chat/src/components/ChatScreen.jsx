import socket from '../connection/ClientConnect'
import { useState, useEffect } from 'react';
const ChatScreen = () => {
    const [message, setMessage] = useState('')
    const [recvMsg, setRecvMsg] = useState('')
    const [messages, setMessages] = useState([])

    const Send_msg = () => {
        if (message.trim() === '') return; // prevent empty messages
        socket.emit('send_message', { message });
        setMessages(prev => [...prev, { sender: 'You', text: message }])
        setMessage(''); // clear input

    };


    useEffect(() => {
        const handler = (data) => {
            // If data is an object like { message: "Hello" }
            const text = data.message || data; // fallback if data is already a string
            setMessages(prev => [...prev, { sender: 'Other', text }]);
        };
        socket.on('recv_msg', handler);

        return () => {
            socket.off('recv_msg', handler);
        };
    }, []);


    return (
        <div className="flex flex-col w-full h-full bg-gray-100">
  {/* Messages area */}
  <div className="flex-1 overflow-y-auto p-4 space-y-3">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs px-4 py-2 rounded-lg ${
            msg.sender === 'You'
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          } shadow-md`}
        >
          <p className="text-sm">{msg.text}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Input area */}
  <div className="border-t p-4 flex items-center space-x-2 bg-white">
    <input
      value={message}
      placeholder="Type a message..."
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') Send_msg() }}
      className="flex-1 border bg-gray-400 border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button
      onClick={Send_msg}
      className="p-3 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        className="bi bi-send"
        viewBox="0 0 16 16"
      >
        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
      </svg>
    </button>
  </div>
</div>

    );
};

export default ChatScreen;
