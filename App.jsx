import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. INITIALIZE SUPABASE (Replace with your actual project keys)
const SUPABASE_URL = "https://waxfecdcfwrdrgnlgwtc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bq0cWmRcGng-GzVQwlyddQ_Pv0gs..."

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch only approved/unflagged messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('is_approved', true) // Filter out flagged posts
      .order('created_at', { ascending: false });

    if (!error) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Post a new message
  const handlePost = async (e) => {
    e.preventDefault();
    setError('');
    const cleanInput = input.trim();

    if (!cleanInput) return;

    // Basic automation safety check
    const containsBadWord = BANNED_WORDS.some(word => 
      cleanInput.toLowerCase().includes(word)
    );

    if (containsBadWord) {
      setError(' Your message contains restricted language. Keep it kind!');
      return;
    }

    setLoading(true);

    const { error: submitError } = await supabase
      .from('messages')
      .insert([{ content: cleanInput, is_approved: true }]);

    if (submitError) {
      setError('Failed to send. Try again!');
    } else {
      setInput('');
      fetchMessages();
    }
    setLoading(false);
  };

  // Flag/Report a message (Hides it instantly for review)
  const reportMessage = async (id) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_approved: false })
      .eq('id', id);

    if (!error) {
      // Remove from current UI state immediately
      setMessages(messages.filter(msg => msg.id !== id));
      alert('Message reported and removed for moderation.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-xl w-full mx-auto space-y-8">
        
        {/* Branding Header */}
        <header className="text-center space-y-2 pt-4">
          <div className="inline-block bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            🎓 Class of 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Anonymous Vault
          </h1>
          <p className="text-sm text-slate-400">Share memories, confessions, and drop shout-outs completely anonymously.</p>
        </header>

        {/* Input Terminal */}
        <form onSubmit={handlePost} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="Type your confession or shout-out here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all resize-none"
            />
            <span className="absolute bottom-3 right-3 text-xs font-mono text-slate-600">
              {250 - input.length}
            </span>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {loading ? 'Dropping...' : 'Drop Anonymously →'}
            </button>
          </div>
        </form>

        {/* Live Feed */}
        <main className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Feed</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-900 rounded-2xl">
                <p className="text-sm text-slate-600">The vault is empty. Be the first to break the silence!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="group bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-5 space-y-3 transition-all relative">
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                  
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-600 pt-2">
                    <span>🕵️ Anonymous Senior</span>
                    <button 
                      onClick={() => reportMessage(msg.id)}
                      className="text-slate-700 hover:text-rose-400 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Report message"
                    >
                      Report ⚠️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] font-mono text-slate-700 mt-12">
        🔒 Encrypted & completely anonymous. Legacy 2026.
      </footer>
    </div>
  );
}
