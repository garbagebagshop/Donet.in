
import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface ChatModalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  recipientName: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ messages, onSendMessage, onClose, recipientName }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex flex-col">
      <div className="mt-auto bg-white w-full max-w-lg mx-auto rounded-t-[2.5rem] flex flex-col max-h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900">{recipientName}</h3>
            <p className="text-[10px] font-black text-green-500 uppercase">Online</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xs font-bold text-slate-400 uppercase">Start a conversation with your driver</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium ${m.sender === 'customer' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t pb-10 flex gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-xl shadow-lg active:scale-95 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
