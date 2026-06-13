import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Realtime listener to display incoming classmate messages immediately
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching vault data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const textPayload = inputContent.trim();
    setInputContent(''); 

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{ text: textPayload }]);

      if (error) throw error;
    } catch (err) {
      console.error('Submission blocked by database rules:', err.message);
      setInputContent(textPayload); 
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎓 class-of-2026-vault</h1>
        <p style={styles.subtitle}>Anonymous messaging board for the Class of 2026 graduation.</p>
      </header>

      <div style={styles.boardWall}>
        {loading ? (
          <div style={styles.statusState}>Opening the vault...</div>
        ) : messages.length === 0 ? (
          <div style={styles.statusState}>No messages dropped yet. Be the first!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id || msg.created_at} style={styles.messageBubble}>
              <p style={styles.messageText}>{msg.text}</p>
              <span style={styles.messageTime}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

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

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '800px', margin: '0 auto', backgroundColor: '#0d1117', color: '#c9d1d9', fontFamily: 'sans-serif' },
  header: { padding: '20px', borderBottom: '1px solid #21262d', textAlign: 'center' },
  title: { fontSize: '1.8rem', color: '#f0f6fc', margin: '0 0 5px 0' },
  subtitle: { fontSize: '0.9rem', color: '#8b949e', margin: 0 },
  boardWall: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  statusState: { textAlign: 'center', color: '#8b949e', marginTop: '40px', fontStyle: 'italic' },
  messageBubble: { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '12px 16px', alignSelf: 'flex-start', maxWidth: '85%', wordBreak: 'break-word' },
  messageText: { margin: '0 0 4px 0', fontSize: '0.95rem', lineHeight: '1.4', color: '#e6edf3' },
  messageTime: { fontSize: '0.75rem', color: '#8b949e', display: 'block', textAlign: 'right' },
  inputArea: { display: 'flex', padding: '20px', gap: '10px', borderTop: '1px solid #21262d', backgroundColor: '#0d1117' },
  textField: { flex: 1, backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '12px', color: '#f0f6fc', fontSize: '0.95rem', outline: 'none' },
  sendButton: { backgroundColor: '#238636', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0 20px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }
};
