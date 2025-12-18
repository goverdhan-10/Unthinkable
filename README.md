# Unthinkable (AI Customer Support Bot)

> A smart customer support agent capable of answering FAQs, maintaining contextual memory, and intelligently escalating complex issues to human agents.

## 📋 Project Overview
**Unthinkable** is a full-stack AI chatbot designed to simulate real-world support scenarios. It uses a **Hybrid Intelligence System**:
1.  **Local Knowledge:** Checks a strict internal FAQ dataset for store policies (Returns, Shipping, etc.).
2.  **General AI (Llama 3.3 via Groq):** Handles general conversation and context using the Groq API.
3.  **Escalation Protocol:** Automatically detects queries requiring human intervention (e.g., specific order tracking) and flags the session.

## 🚀 Key Features
* **🧠 Contextual Memory:** The bot retains previous conversation history to understand context (e.g., "What is my name?" after being told).
* [cite_start]**⚡ Smart Escalation:** Automatically identifies sensitive queries (Order status, cancellations) and triggers an "Escalated" status[cite: 54].
* [cite_start]**💾 Session Persistence:** All chats are saved in MongoDB, allowing users to revisit past conversations[cite: 59].
* **⚡ High-Performance AI:** Powered by **Groq SDK** running **Llama 3.3 (70b-versatile)** for near-instant responses.

## 🛠️ Tech Stack
* **Frontend:** React (Vite), CSS3
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **AI Engine:** Groq SDK (Llama 3.3-70b-versatile)

---

## Video Link 
[Video](https://drive.google.com/file/d/13hfcHLcdxbcE70XJm5_wx7iqRvI1nPez/view?usp=sharing)

## ⚙️ Setup & Installation

### 1. Prerequisites
* Node.js installed
* MongoDB installed locally or a MongoDB Atlas URI
* A free API Key from [Groq Cloud](https://console.groq.com/)

### 2. Clone the Repository
```bash
git clone [https://github.com/goverdhan-10/Unthinkable.git](https://github.com/goverdhan-10/Unthinkable.git)
cd Unthinkable


