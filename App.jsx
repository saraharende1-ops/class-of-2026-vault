import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. INITIALIZE SUPABASE
const SUPABASE_URL = "https://waxfecdcfwrdrgnlgwtc.supabase.co";
// Make sure your complete, long anon key is placed inside these quotes!
const SUPABASE_ANON_KEY = "sb_publishable_bq0cWmRcGng-GzVQwlyddQ_Pv0gs..."; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all messages from the table
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Realtime subscription setup
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError('');

    const textToSend = input.trim();

    // Sends database updates directly to 'content' and 'is_approved' columns
    const { error: insertError } = await supabase
      .from('messages')
      .insert([
        { 
          content: textToSend,
          is_approved: true
        }
      ]);

    if (insertError) {
      setError('Failed to send message. Check console for details.');
      console.error('Supabase Insert Error:', insertError);
    } else {
      setInput('');
      fetchMessages();
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#111',
      color: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#a855f7' }}>🎓 Class of 2026 Vault 🎓</h1>
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
        Leave a magnifique, wonderful anonymous memory for the class.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', margin: '25px 0' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something wonderful..."
          maxLength={280}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid #333',
            backgroundColor: '#222',
            color: '#fff',
            fontSize: '16px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#a855f7',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Post'}
        </button>
      </form>

      {error && <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
            No memories added yet. Be the first to leave something magnifique! ✨
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#1e1e1e',
                borderLeft: '4px solid #a855f7',
                wordBreak: 'break-word'
              }}
            >
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>{msg.content}</p>
              <small style={{ color: '#555', display: 'block', marginTop: '8px', textAlign: 'right' }}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
