import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- ICONS ---
const IconSun = () => <span>☀️</span>;
const IconMoon = () => <span>🌙</span>;
const IconMenu = () => <span>☰</span>;

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const IconSidebarClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// NEW: Copy Icon
const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg small">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

// --- SUB-COMPONENT: Message Bubble with Copy Logic ---
const MessageItem = ({ msg, isLast, isEscalated }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-row ${msg.role}`}>
      <div className="message-content">
        {msg.content}
        {/* {isEscalated && isLast && msg.role === 'assistant' && (
          <div className="escalation-badge">⚠️ Human Agent Requested</div>
        )} */}
        
        {/* Only show copy button for Assistant */}
        {msg.role === 'assistant' && (
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`} 
            onClick={handleCopy} 
            title="Copy to clipboard"
          >
            {copied ? <IconCheck /> : <IconCopy />}
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistoryList, setChatHistoryList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const messagesEndRef = useRef(null);

  // --- INITIAL LOAD ---
  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sessions');
      const data = await res.json();
      if (Array.isArray(data)) setChatHistoryList(data);
    } catch (err) { console.error("History Error", err); }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
    fetchSessions();
    
    // Create Initial Session
    const newId = Math.random().toString(36).substring(2, 15);
    setSessionId(newId);
    setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
    
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const startNewChat = () => {
    const newId = Math.random().toString(36).substring(2, 15);
    setSessionId(newId);
    setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
    setIsEscalated(false);
    
    setChatHistoryList(prev => [{ id: newId, title: "New Chat" }, ...prev]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const loadChat = async (id) => {
    if (editingId) return; 
    setLoading(true);
    setSessionId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/session/${id}`);
      const data = await res.json();
      setMessages(data.length ? data : [{ role: 'assistant', content: 'Welcome back!' }]);
      setIsEscalated(false); 
    } catch (err) { console.error(err); } 
    finally { 
      setLoading(false);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setChatHistoryList(prev => prev.map(chat => 
      chat.id === sessionId ? { ...chat, preview: userMsg.content.substring(0, 30) + "..." } : chat
    ));

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: userMsg.content }),
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      setIsEscalated(data.status === 'escalated');
      
      fetchSessions();
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to server." }]);
    } finally { setLoading(false); }
  };

  const saveTitle = async (e, id) => {
    e.stopPropagation();
    setChatHistoryList(prev => prev.map(c => c.id === id ? { ...c, title: editTitle } : c));
    setEditingId(null);
    try {
      await fetch(`http://localhost:5000/api/session/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
    } catch (err) { fetchSessions(); }
  };

  const deleteChat = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    
    setChatHistoryList(prev => prev.filter(c => c.id !== id));
    if (id === sessionId) startNewChat();
    
    try {
      await fetch(`http://localhost:5000/api/session/${id}`, { method: 'DELETE' });
    } catch (err) { console.error(err); }
  };

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header-row">
          <button className="new-chat-btn" onClick={startNewChat}>
            <IconPlus /> <span>New Chat</span>
          </button>
          
          <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)} title="Close Sidebar">
            <IconSidebarClose />
          </button>
        </div>
        
        <div className="history-list">
          <div className="list-label">Recent Chats</div>
          {chatHistoryList.map(chat => (
            <div 
              key={chat.id} 
              className={`history-item ${chat.id === sessionId ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              {editingId === chat.id ? (
                <div className="edit-mode">
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle(e, chat.id)}
                  />
                  <div className="edit-actions">
                    <button className="icon-btn success" onClick={(e) => saveTitle(e, chat.id)}><IconCheck /></button>
                    <button className="icon-btn danger" onClick={() => setEditingId(null)}><IconX /></button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="chat-title" title={chat.title || chat.preview}>
                    {chat.title || chat.preview || "New Chat"}
                  </span>
                  <div className="actions">
                    <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditingId(chat.id); setEditTitle(chat.title || ""); }}><IconEdit /></button>
                    <button className="icon-btn danger" onClick={(e) => deleteChat(e, chat.id)}><IconTrash /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <><IconSun /> Light</> : <><IconMoon /> Dark</>}
          </button>
        </div>
      </aside>

      <main className="chat-interface">
        <header className="top-bar">
          {!sidebarOpen && (
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <IconMenu />
            </button>
          )}
          <div className="model-name">Bot 1.0</div>
        </header>

        <div className="messages-scroll-area">
          {messages.map((msg, index) => (
            <MessageItem 
              key={index} 
              msg={msg} 
              isLast={index === messages.length - 1} 
              isEscalated={isEscalated} 
            />
          ))}
          
          {loading && (
            <div className="message-row assistant">
              <div className="message-content typing">...</div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <form onSubmit={handleSend} className="input-box-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEscalated ? "Waiting for agent..." : "Ask me anything..."}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim()}>➤</button>
          </form>
          <div className="disclaimer">AI can make mistakes. Please check important info.</div>
        </div>
      </main>
    </div>
  );
}

export default App;