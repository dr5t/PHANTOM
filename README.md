# 🪦 PHANTOM — Local-First AI Software Archaeology

> **"Your Machine Remembers What You Have Forgotten."**

PHANTOM is an open-source, local-first software archaeology tool. It investigates dormant and abandoned Git codebases, uncovers forgotten implementation details, reconstructs historical decision trajectories, surfaces buried TODOs and unmerged stashes, and synthesizes evidence-backed project resurrection blueprints using on-device open-weight LLMs.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6%20%7C%207.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-green.svg)](https://vitest.dev/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20Inference-black.svg)](https://ollama.ai/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Air--Gapped-brightgreen.svg)](#security--threat-model)

---

## 🏛️ Core Philosophy

- **Zero Cloud Leakage:** All Git log extraction, AST source scanning, vector search, and model inference execute strictly within your local machine.
- **Evidence-Grounded Factualism:** Verified repository facts (commit hashes, authors, line numbers, file paths) are strictly distinguished from AI interpretations. If evidence is lacking, PHANTOM explicitly acknowledges that conclusions cannot be established.
- **Safe Subprocess Security:** All Git executions use sanitized argument arrays (`child_process.execFile`). No arbitrary shell commands, pipes, or redirects are exposed.
- **Actionable Resurrection:** Produces structured Markdown reports and concrete bash remediation recipes. Generated commands are never executed automatically without human review.

---

## ⚡ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PHANTOM DARK GRID FRONTEND                         │
│   React 19 · TypeScript · Vite · Lucide Icons · CSS Grid Tokens        │
│                                                                        │
│  [Hero & Navbar]     [Live Controlled Terminal]    [Ghost Memory]      │
│  [Digital Graveyard] [Resurrection Mode]           [OpenSourceAI]      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Vite API Proxy (/api -> :3001)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PHANTOM FORENSICS BACKEND                          │
│               Node.js · Express · TypeScript · Vitest                  │
├────────────────────────────────────────────────────────────────────────┤
│  • routes.ts         REST endpoints & Server-Sent Events (SSE)         │
│  • git.ts            Commit graphs, diffs, branches, stashes, tags     │
│  • security.ts       Filesystem boundaries & subprocess sanitization   │
│  • todos.ts          TODO, FIXME, HACK detection & language profiling  │
│  • evidenceAi.ts     Bounded evidence retrieval & prompt protection    │
│  • reports.ts        Resurrection blueprint & Markdown exporter        │
│  • terminal.ts       Controlled CLI command parser                     │
│  • ollama.ts         Genuine local Ollama runtime discovery & prompt   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP (127.0.0.1:11434)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LOCAL OLLAMA RUNTIME                            │
│  • Llama 3.2 (3B) · Qwen 2.5 Coder (7B) · DeepSeek-Coder (6.7B)        │
│  • 100% Offline · Apple Metal / NVIDIA CUDA / CPU SIMD acceleration    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features & Capabilities

### 1. Real Git Forensics Engine
- **Commit History & Metrics:** Parses commits, authors, timestamps, additions, deletions, and changed files across all branches.
- **Stash Archaeology:** Uncovers uncommitted git stashes with diff previews, rescuing work that was abruptly abandoned.
- **Dormancy Calculation:** Accurately computes repository inactivity days and pinpoints the last active developer.
- **Working Tree Inspection:** Scans for uncommitted modifications left in working directories.

### 2. Source Code & TODO Analysis
- **Keyword Scanner:** Identifies `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`, and `NOTE` annotations with line numbers and 3-line code context.
- **Priority Categorization:** High priority automatically assigned to `FIXME`, `BUG`, and critical security keywords (`urgent`, `broken`, `fatal`).
- **Language Detection:** Analyzes codebase file sizes across 25+ language extensions.

### 3. Genuine Local Ollama Integration
- **Runtime Discovery:** Connects to `http://127.0.0.1:11434/api/tags` to discover locally installed models, parameter sizes, and quantization levels.
- **Air-Gapped Inference:** Calls `POST /api/generate` with zero cloud fallback.
- **Graceful Offline Mode:** If Ollama is offline or uninstalled, all Git forensics, TODO extraction, and report generation continue to operate with 100% fidelity.

### 4. Evidence-Grounded Q&A
- Queries are answered by retrieving matching commits, diffs, stashes, and TODOs, formatting them into structured evidence items with file locations and line references.
- Strict system prompt defending against prompt injection attacks embedded inside repository contents.

### 5. Controlled Forensic Terminal
- Replaces unrestricted shell execution with a secure command parser supporting:
  - `status`: Displays current repository forensic summary.
  - `history [limit]`: Shows recent commits with short hashes and authors.
  - `todos [filter]`: Displays pending TODOs, FIXMEs, and HACKs.
  - `stashes`: Inspects uncommitted git stashes.
  - `branches`: Lists branches and current HEAD.
  - `diff <hash>`: Safe commit diff inspector.
  - `models`: Queries local Ollama runtime and lists installed models.
  - `ask <query>`: Queries evidence-grounded AI engine.
  - `report`: Generates archaeological recovery report.
  - `clear` & `help`: Terminal controls.

### 6. Real-Time Scanning via SSE
- Real Server-Sent Events (`/api/repos/scan-stream`) report real progress phases:
  - `validating` → `history` → `branches` → `stashes` → `todos` → `files` → `complete`.

### 7. Markdown Resurrection Reports
- Generates comprehensive recovery blueprints including:
  - Project overview & dormancy diagnosis.
  - Recent historical milestones.
  - Unfinished features with estimated completion percentages.
  - Potential issues and risk classifications.
  - Recommended next steps with non-destructive action commands.
  - Exportable as a GitHub-flavored Markdown document.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.0.0 or higher
- **npm** v10.0.0 or higher
- **Git** installed and available in PATH
- *(Optional for AI)* **Ollama** installed from [ollama.com](https://ollama.com)

---

### Installation

1. Clone or navigate to the repository:
   ```bash
   git clone <repo-url>
   cd "MLH-3rd challenge"
   ```

2. Install root and frontend dependencies:
   ```bash
   npm install
   ```

3. Install server dependencies:
   ```bash
   cd server && npm install && cd ..
   ```

---

### Running the Application

You can run the frontend and backend in separate terminal tabs:

#### Terminal 1 — Start the Forensics Backend:
```bash
npm run server:dev
```
*The backend starts at `http://127.0.0.1:3001` with API routes mounted under `/api`.*

#### Terminal 2 — Start the Frontend UI:
```bash
npm run dev
```
*The Vite frontend starts at `http://127.0.0.1:5173`. Requests to `/api/*` are automatically proxied to `:3001`.*

Open your browser to `http://127.0.0.1:5173`.

---

## 🤖 Ollama Local AI Setup (Optional)

PHANTOM's Git forensics, AST scans, and report generation work completely offline without Ollama. To enable deep neural Q&A:

1. Install Ollama:
   ```bash
   # macOS (Homebrew)
   brew install ollama

   # Linux
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. Start the local Ollama daemon:
   ```bash
   ollama serve
   ```

3. Pull your preferred coding model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull qwen2.5-coder:7b
   # or
   ollama pull deepseek-coder:6.7b
   ```

4. Refresh PHANTOM's **Open Source AI** section or open the **Scanner Modal** to see your locally installed models detected immediately.

---

## 🧪 Testing

The test suite validates Git history extraction, security boundaries, invalid path rejection, TODO detection, evidence grounding, and report generation against dynamically created temporary Git repositories.

Run all tests:
```bash
npm test
```
*or directly inside the server directory:*
```bash
cd server && npm test
```

Build verification:
```bash
# Frontend production build
npm run build

# Backend TypeScript build
npm run server:build
```

---

## 🔒 Security & Threat Model

1. **Subprocess Isolation:** Commands are executed strictly through `execFile('git', args, ...)` with argument arrays. Input strings are never passed to a shell (`/bin/sh` or `/bin/bash`), eliminating shell injection vulnerabilities.
2. **Sensitive File Boundary:** The scanner strictly ignores sensitive files including `.env*`, `id_rsa`, `id_ed25519`, `*.pem`, `*.key`, `credentials.json`, `secret*`, and `.git-credentials`.
3. **Restricted Paths:** Only verified Git repository directories are accepted. Null-byte injection and non-directory paths are rejected.
4. **Prompt Injection Defense:** Repository contents are treated as untrusted data and strictly bounded within evidence citation blocks.
5. **No Automatic Command Execution:** Recovery commands in reports and terminal output are formatted for human inspection. PHANTOM will never execute write commands without user consent.

---

## 📁 Repository Structure

```
.
├── server/                       # Backend Forensics Engine
│   ├── src/
│   │   ├── index.ts              # Express entry point & middleware
│   │   ├── routes.ts             # API endpoints & SSE scan stream
│   │   ├── git.ts                # Git history, branches, stashes, diffs
│   │   ├── security.ts           # Path validation & subprocess security
│   │   ├── todos.ts              # Codebase scanner & TODO forensics
│   │   ├── ollama.ts             # Local Ollama client & model discovery
│   │   ├── evidenceAi.ts         # Evidence retrieval & Q&A grounding
│   │   ├── reports.ts            # Recovery report & Markdown generator
│   │   ├── terminal.ts           # Controlled CLI command parser
│   │   ├── store.ts              # In-memory repository index
│   │   └── types.ts              # Shared TypeScript definitions
│   ├── test/
│   │   └── forensics.test.ts     # Automated Git forensics test suite
│   ├── package.json              # Server dependencies & scripts
│   └── tsconfig.json             # Server TypeScript configuration
├── src/                          # Frontend User Interface
│   ├── components/               # React components (Dark Grid System)
│   │   ├── Hero.tsx              # Hero header & entry call-to-actions
│   │   ├── Navbar.tsx            # Navigation & status indicator
│   │   ├── TerminalPreview.tsx   # Live controlled CLI & output
│   │   ├── GhostMemory.tsx       # Forensic timeline & AST facts
│   │   ├── DigitalGraveyard.tsx  # Discovered repository archive
│   │   ├── ResurrectionMode.tsx  # Project recovery report & export
│   │   ├── OpenSourceAI.tsx      # Ollama model status & selector
│   │   └── LaunchModal.tsx       # Real-time SSE scanner & Q&A dialog
│   ├── services/
│   │   └── api.ts                # Frontend API client
│   ├── types/                    # Frontend type definitions
│   ├── data/                     # Demonstration fixtures
│   ├── App.tsx                   # Main application layout
│   └── index.css                 # Dark grid typography and tokens
├── vite.config.ts                # Vite config with /api proxy
├── package.json                  # Root scripts
└── README.md                     # Documentation
```

---

## ⚖️ Implementation Status

| Capability | Status | Implementation Detail |
| :--- | :---: | :--- |
| **Git Commit Forensics** | ✅ Implemented | Genuine `git log` metadata extraction with shortstat and authors |
| **Git Stash Archaeology** | ✅ Implemented | Genuine `git stash list` & `git stash show -p` inspection |
| **TODO/FIXME Analysis** | ✅ Implemented | Multi-language regex scanner with priorities and context |
| **Controlled Terminal** | ✅ Implemented | Safe command dispatcher without unrestricted shell access |
| **Real-Time SSE Scan** | ✅ Implemented | Live Server-Sent Events reporting 6 forensic stages |
| **Recovery Report (.md)** | ✅ Implemented | Structured report generation, clipboard copy, and Markdown download |
| **Ollama Model Discovery**| ✅ Implemented | Genuine `127.0.0.1:11434` connection check and model tags listing |
| **Evidence Grounded Q&A** | ✅ Implemented | Context retrieval across commits, TODOs, and stashes |
| **Automated Tests** | ✅ Implemented | 21 Vitest tests running on temporary Git repositories |

---

## 📄 License

MIT License. Built for developers reviving the forgotten corners of their hard drives.
