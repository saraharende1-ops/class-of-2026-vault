import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // 1. Initialize state safely with a fallback to localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem('class_2026_vault_messages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error("Failed to parse local storage messages:", error);
      return [];
    }
  });

  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef(null);

  // 2. Synchronize messages to local storage whenever the list changes
  useEffect(() => {
    localStorage.setItem('class_2026_vault_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Helper to keep the messaging vault view scrolled to the latest entry
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. Handle message submission securely
  const handleSendMessage = (e) => {
    e.preventDefault(); // Prevents page reload

    // Check if the input is purely whitespace
    if (!inputContent.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: inputContent.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputContent(''); // Clear the input field safely
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <h1 style={styles.title}>🎓 class-of-2026-vault</h1>
        <p style={styles.subtitle}>Anonymous messaging board for the Class of 2026 graduation.</p>
      </header>

      {/* Messaging Board Wall */}
      <div style={styles.boardWall}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            No secrets or congrats dropped yet. Be the first to leave a mark!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={styles.messageBubble}>
              <p style={styles.messageText}>{msg.text}</p>
              <span style={styles.messageTime}>{msg.timestamp}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Controls */}
      <form onSubmit={handleSendMessage} style={styles.inputArea}>
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Type an anonymous message to the class..."
          style={styles.textField}
          maxLength={300}
        />
        <button type="submit" style={styles.sendButton}>
          Drop Note
        </button>
      </form>
    </div>
  );
}

// Inline system styling tailored for a sleek, dark-mode terminal layout matching GitHub aesthetics
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #21262d',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.8rem',
    color: '#f0f6fc',
    margin: '0 0 5px 0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#8b949e',
    margin: 0,
  },
  boardWall: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    textAlign: 'center',
    color: '#8b949e',
    marginTop: '40px',
    fontStyle: 'italic',
  },
  messageBubble: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '12px 16px',
    alignSelf: 'flex-start',
    maxWidth: '85%',
    wordBreak: 'break-word',
    position: 'relative',
  },
  messageText: {
    margin: '0 0 4px 0',
    fontSize: '0.95rem',
    lineHeight: '1.4',
    color: '#e6edf3',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#8b949e',
    display: 'block',
    textAlign: 'right',
  },
  inputArea: {
    display: 'flex',
    padding: '20px',
    gap: '10px',
    borderTop: '1px solid #21262d',
    backgroundColor: '#0d1117',
  },
  textField: {
    flex: 1,
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '12px',
    color: '#f0f6fc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: '#238636',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '0 20px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};
