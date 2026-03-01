# 🚀 AgentFlow OS — Multi-Agent Governance & Orchestration Layer (MVP)

<p align="center">
  <img src="https://img.shields.io/badge/AgentFlow-OS-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Status-MVP-orange?style=for-the-badge" />
</p>

---

## 🧠 Overview

**AgentFlow OS** is a scalable multi-agent orchestration middleware designed to manage AI agents collaboratively with governance, execution tracing, and workflow lifecycle control.

This MVP demonstrates:

- Multi-agent workflow orchestration  
- Execution lifecycle tracking  
- Immutable trace timeline  
- Supabase-backed persistence + realtime  
- Human-readable workflow visualization  

👉 Goal: evolve into a **production-grade enterprise agent operating system**.

---

## ✨ Core Features

### ⚙️ Workflow Orchestration
- Define workflows with multiple agents
- Automatic execution engine
- Status lifecycle: `pending → running → completed`

### 🧾 Execution Trace Timeline
- Immutable event log per workflow
- Ordered execution history
- Real-time UI updates via Supabase

### 🏛 Governance Layer
- Controlled execution start logic
- Deterministic workflow state transitions
- Prevents duplicate or conflicting runs

### 🔄 Realtime Sync
- Supabase realtime subscriptions
- Live workflow & trace updates in UI
- Reactive timeline rendering

---

## 🏗 Architecture
```
Frontend (Next.js App Router)
│
│ UI actions
▼
Workflow Engine (Server Logic)
│
│ writes traces + status
▼
Supabase Database
• workflows
• workflow_traces
│
▼
Realtime Subscriptions → Timeline UI 
```

---

## 📂 Project Structure
```
agentflow-os-mvp/
│
├── public/ # Static assets
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── workflows/ # Workflow pages & dynamic routes
│ │ └── api/ # API routes (execution, CRUD)
│ │
│ ├── components/ # UI components
│ │ ├── timeline/ # Trace timeline UI
│ │ ├── workflow/ # Workflow cards & controls
│ │ └── layout/ # Layout & shared UI
│ │
│ ├── lib/ # Core logic
│ │ ├── engine.ts # Workflow execution engine
│ │ ├── supabase.ts # Supabase client
│ │ └── types.ts # Shared types
│ │
│ └── styles/ # Global styles
│
├── package.json
├── tsconfig.json
└── next.config.ts
```
---
```

## 🗄 Database Schema (Supabase)

### workflows

| column | type | description |
|--------|------|-------------|
id | uuid | workflow id |
name | text | workflow name |
status | text | pending/running/completed |
created_at | timestamp | creation time |

### workflow_traces

| column | type | description |
|--------|------|-------------|
id | uuid | trace id |
workflow_id | uuid | parent workflow |
event | text | execution event |
created_at | timestamp | event time |

---
```
## 🚀 Getting Started
```
```
### 1️⃣ Clone repo

git clone https://github.com/ShivenduShivu/agentflow-os-mvp.git
cd agentflow-os-mvp

### 2️⃣ Install dependencies
npm install
### 3️⃣ Configure environment

- Create .env.local
- NEXT_PUBLIC_SUPABASE_URL=your_url
- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
### 4️⃣ Run dev server
- npm run dev

- Open:

- http://localhost:3000 
```
---
```
▶️ How Execution Works

- User opens workflow page

- Page checks workflow status

- If pending → engine starts

- Engine:

- sets workflow → running

- writes trace events

- sets workflow → completed

- Timeline subscribes to traces → live UI
```
```
## 🧩 Key Design Decisions
```
- Execution triggered only once from route

- No duplicate trace writes

- Ordered by created_at

- Realtime enabled on:

- workflows

- workflow_traces

- Stateless UI, DB = source of truth
```

