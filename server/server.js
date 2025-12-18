require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Session = require('./models/Session');
const Groq = require('groq-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIG: Groq AI ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy-key'
});

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// --- DATA: Store Policies ---
const faqData = {
  "return": "You can return any item within 30 days of purchase if it is unused and in original packaging.",
  "hours": "Our support team is available Monday to Friday, 9 AM to 5 PM EST.",
  "shipping": "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.",
  "payment": "We accept Visa, MasterCard, PayPal, and Apple Pay.",
  "location": "Our headquarters are located in San Francisco, CA."
};

// --- LOGIC 1: Local Fallback (The "Safety Net") ---
const fallbackLogic = (userMessage) => {
  console.log("⚠️ Using Fallback Logic");
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return { 
      answer: "Hello! My AI brain is currently offline, but I can still help you with store policies (Returns, Shipping, Hours).", 
      action: 'respond' 
    };
  }

  for (const [key, value] of Object.entries(faqData)) {
    if (lowerMsg.includes(key)) {
      return { answer: value, action: 'respond' };
    }
  }

  return { 
    answer: "I'm sorry, I couldn't access my AI brain right now. I am escalating this to a human specialist.", 
    action: 'escalate' 
  };
};

// --- LOGIC 2: Main AI Handler (Groq / Llama3) ---
// Now accepts 'history' to remember context
const processMessage = async (userMessage, history = []) => {
  const lowerMsg = userMessage.toLowerCase();
  
  // 1. Manual Escalation Check
  if (lowerMsg.includes('speak to human') || lowerMsg.includes('agent') || lowerMsg.includes('escalate')) {
    return { answer: "I am connecting you to a human agent now.", action: 'escalate' };
  }

  // 2. Try Real AI (Groq)
  try {
    // Format history for Groq (Limit to last 10 messages to save tokens)
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful customer support AI.
          
          Context (Store Policies): ${JSON.stringify(faqData)}.
          
          Instructions:
          1. First, check if the user's question relates to the Store Policies above. If yes, answer strictly based on that context.
          2. If the user asks a General Knowledge question (e.g., "Who is the President?", "What is 2+2?"), answer it helpfully and briefly.
          3. Only reply "ESCALATE_TO_AGENT" if the question requires specific private customer data (like "Where is my order #123?").
          4. Be polite and concise.`
        },
        ...recentHistory, // <--- INJECT MEMORY HERE
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "llama-3.3-70b-versatile", 
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0]?.message?.content || "";

    if (aiResponse.includes("ESCALATE_TO_AGENT")) {
      return { answer: "I don't have information on that specific topic. Connecting you to a human agent...", action: 'escalate' };
    }

    return { answer: aiResponse, action: 'respond' };

  } catch (error) {
    console.error("❌ Groq API Error:", error.message);
    return fallbackLogic(userMessage);
  }
};

// --- ROUTES ---

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  try {
    // A. GET OR CREATE SESSION FIRST
    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = new Session({ sessionId, messages: [] });
    }

    // B. PROCESS MESSAGE (Pass existing history)
    // We pass 'session.messages' so the AI knows what was said before
    const result = await processMessage(message, session.messages);
    
    // C. UPDATE DB
    session.messages.push({ role: 'user', content: message });
    session.status = result.action === 'escalate' ? 'escalated' : 'active';
    session.messages.push({ role: 'assistant', content: result.answer });
    
    await session.save();

    res.json({ 
      role: 'assistant', 
      content: result.answer,
      status: session.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. Get History
app.get('/api/session/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    res.json(session ? session.messages : []);
  } catch (error) { res.status(500).json({ error: 'Error fetching history' }); }
});

// 3. Get All Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({}, 'sessionId title messages').sort({ _id: -1 }); 
    const formatted = sessions.map(s => ({
      id: s.sessionId,
      title: s.title || (s.messages.find(m => m.role === 'user')?.content.substring(0, 30) + '...') || 'New Chat'
    }));
    res.json(formatted);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch sessions' }); }
});

// 4. Rename Session
app.patch('/api/session/:sessionId', async (req, res) => {
  try {
    await Session.findOneAndUpdate({ sessionId: req.params.sessionId }, { title: req.body.title });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to rename' }); }
});

// 5. Delete Session
app.delete('/api/session/:sessionId', async (req, res) => {
  try {
    await Session.findOneAndDelete({ sessionId: req.params.sessionId });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete' }); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));