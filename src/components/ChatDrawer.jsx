import React, { useState } from 'react';

export default function ChatDrawer({ isOpen, onClose, activeTicket, chatMessages, onSendMessage }) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <>
      <div className="chat-drawer-backdrop" onClick={onClose}></div>
      <div className="chat-drawer">
        <div className="modal-header" style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', margin: 0 }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>
              Chat with Technician
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
              {activeTicket ? `${activeTicket.id} · ${activeTicket.title}` : '#CH1025 · Plumbing'}
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="chat-messages">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.sender === 'student' ? 'sent' : 'received'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.25rem' }}>
          <button type="view" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.25rem' }}></button>
            Send
          </button>
        </form>
      </div>
    </>
  );
}
