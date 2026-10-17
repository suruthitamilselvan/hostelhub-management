import React, { useState, useEffect, useRef } from 'react';

export default function ChatDrawer({ isOpen, onClose, activeTicket, chatMessages, onSendMessage, activeRole }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

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
      <div className="chat-drawer" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="modal-header" style={{ padding: '1.25rem', borderBottom: '1px solid #E2E8F0', margin: 0, background: '#082B5C', color: '#FFFFFF' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#F5A623', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DIRECT MAINTENANCE CHANNEL
            </div>
            <h3 className="modal-title" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
              {activeRole === 'technician' ? 'Chat with Student' : 'Chat with Assigned Technician'}
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1', marginTop: '2px' }}>
              {activeTicket ? `${activeTicket.id} · ${activeTicket.title}` : '#CH1025 · Wash Basin Repair'}
            </div>
          </div>
          <button className="btn-close" onClick={onClose} style={{ color: '#FFFFFF' }}>×</button>
        </div>

        <div className="chat-messages" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#F8FAFC' }}>
          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            <span style={{ fontSize: '0.72rem', background: '#E2E8F0', color: '#64748B', padding: '3px 10px', borderRadius: '12px' }}>
              HostelHub End-to-End Encrypted Maintenance Channel
            </span>
          </div>

          {chatMessages.map(msg => {
            const isMe = (activeRole === 'technician' && msg.sender === 'technician') ||
                         (activeRole !== 'technician' && msg.sender === 'student');
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '2px', padding: '0 4px' }}>
                  {msg.sender === 'student' ? 'Student (Suruthi T.)' : 'Technician (Anand P.)'}
                </div>
                <div
                  className={`chat-bubble ${isMe ? 'sent' : 'received'}`}
                  style={{
                    background: isMe ? '#082B5C' : '#FFFFFF',
                    color: isMe ? '#FFFFFF' : '#1E293B',
                    border: isMe ? 'none' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '1rem', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          <input
            type="text"
            className="form-control"
            placeholder={activeRole === 'technician' ? 'Reply to student...' : 'Ask technician about repair arrival...'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: 'auto', padding: '8px 18px', background: '#F5A623', border: 'none', borderRadius: '4px', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}
