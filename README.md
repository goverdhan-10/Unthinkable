# AI Customer Support Bot

## Project Description
An AI-powered support bot that answers queries based on store policies and escalates complex issues to human agents.

## Features
- Contextual Memory (Remembers previous chat)
- Smart Escalation Logic
- Admin Dashboard Sidebar
- Dark/Light Mode

## Setup
1. Clone the repo.
2. Run `npm install` in both client and server folders.
3. Add `.env` file with `GROQ_API_KEY` and `MONGO_URI`.
4. Run `npm start` (client) and `node server.js` (server).

## Prompts Used
"You are a helpful customer support AI. Check store policies first. If unrelated, escalate..."
