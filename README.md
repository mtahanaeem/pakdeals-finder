<div align="center">

# 🛒 PakDeals Finder

**AI-Powered Deal Aggregator for Pakistani E-Commerce**

[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.1-F97316?logo=groq&logoColor=white)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## 📋 Overview

PakDeals Finder is an intelligent deal aggregation platform that scrapes, analyzes, and ranks deals from **4 major Pakistani e-commerce platforms**. It uses a multi-agent AI pipeline with **LLM-powered deal analysis**, **semantic search**, and **price history tracking** to help users find the best value for their money.

| Platform | Scope | Integration |
|:--------:|:-----:|:-----------:|
| **Daraz** 🛍️ | Full catalog | BeautifulSoup + Algolia |
| **Telemart** 📱 | Electronics & gadgets | Playwright |
| **iShopping** 🏪 | General merchandise | Requests + HTML |
| **Shophive** 🖥️ | Tech & accessories | Playwright |

---

## ✨ Features

- **🔍 Multi-Platform Scraping** — Real-time price comparison across 4 platforms simultaneously
- **🧠 AI-Powered Deal Scoring** — RAG pipeline with 6-month price history for accurate deal evaluation (score 0–100)
- **🎯 Intelligent Search** — TF-IDF + SVM intent classification with BERT NER entity extraction
- **📈 Price History Charts** — Visualize price trends over the last 6 months with interactive Chart.js graphs
- **🤖 AI Summaries** — Llama 3.1 (via Groq) generates grounded deal summaries based on real scraped data
- **🌙 Dark Mode** — Full dark mode with system preference detection
- **📱 Responsive Design** — Works seamlessly on desktop, tablet, and mobile

---

## 🗂️ Project Structure

```
pakdeals-finder/
├── 🎨 frontend/                          # React 18 + Vite app
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── AISummary.jsx           # AI-generated deal summary card
│   │   │   ├── Navbar.jsx              # Navigation + dark mode toggle
│   │   │   ├── PriceChart.jsx          # Interactive price history chart
│   │   │   └── SearchBar.jsx           # Query input with auto-suggest
│   │   ├── pages/                       # Route pages
│   │   │   ├── Home.jsx                # Main search + results dashboard
│   │   │   ├── Compare.jsx             # Side-by-side product comparison
│   │   │   ├── PriceHistory.jsx        # Detailed price trends page
│   │   │   ├── FlashSales.jsx          # Flash deals monitor
│   │   │   ├── Alerts.jsx              # Price drop alerts
│   │   │   ├── Pipeline.jsx            # AI pipeline visualization
│   │   │   └── About.jsx               # Project information
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── services/                    # Axios API service layer
│   │   └── App.jsx
│   ├── vite.config.js                   # Vite + proxy config
│   └── package.json
│
├── ⚙️ backend/                           # Python Flask API
│   ├── app.py                           # Flask entry point + CORS
│   ├── config.py                        # Environment configuration
│   ├── nlp/                             # Natural language processing
│   │   ├── classifier.py               # TF-IDF + SVM intent classifier
│   │   ├── ner_extractor.py            # BERT-based entity extraction
│   │   └── train_classifier.py         # Model training pipeline
│   ├── agents/                          # LangGraph multi-agent system
│   │   ├── scout_agent.py              # Web scraping orchestrator
│   │   ├── comparator_agent.py         # Price normalization + dedup
│   │   ├── deal_analyst_agent.py       # Deal scoring algorithm
│   │   └── pipeline.py                 # LangGraph orchestration DAG
│   ├── scrapers/                        # Platform-specific scrapers
│   │   ├── daraz_scraper.py            # Daraz (Algolia API)
│   │   ├── telemart_scraper.py         # Telemart (Playwright)
│   │   ├── ishopping_scraper.py        # iShopping (Requests)
│   │   ├── shophive_scraper.py         # Shophive (Playwright)
│   │   └── filter.py                   # Result filtering & ranking
│   ├── rag/                             # Retrieval-Augmented Generation
│   │   ├── indexer.py                  # FAISS vector index builder
│   │   ├── retriever.py                # Similarity search (cosine)
│   │   ├── augmentor.py                # Context window builder
│   │   └── generator.py                # Groq LLM response generator
│   ├── database/                        # SQLite data layer
│   ├── routes/                          # REST API endpoints
│   ├── data/                            # Persistent storage (auto-created)
│   └── requirements.txt
│
├── 🚀 run.bat                          # Windows one-click launcher
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Download |
|:------------|:-------:|:---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.10+ | [python.org](https://www.python.org/) |
| Groq API Key | Free | [console.groq.com](https://console.groq.com) |

### 1. Clone

```bash
git clone https://github.com/mtahanaeem/pakdeals-finder.git
cd pakdeals-finder
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set your Groq API key
# Windows:
set GROQ_API_KEY=your-api-key-here
# macOS/Linux:
export GROQ_API_KEY="your-api-key-here"
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## 🎮 Running the App

### One-Click Start (Windows)

```bash
run.bat
```

### Manual Start (Two Terminals)

| Terminal | Command | URL |
|:---------|:--------|:---:|
| **Backend** | `cd backend && python app.py` | `http://localhost:5000` |
| **Frontend** | `cd frontend && npm run dev` | `http://localhost:3000` |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/classify` | Classify search query intent |
| `POST` | `/api/extract` | Extract entities (product, brand, price) |
| `POST` | `/api/search` | Search and compare deals across platforms |
| `GET` | `/api/history/<product>` | Get 6-month price history for a product |
| `GET` | `/api/status` | Get pipeline processing status |
| `GET` | `/api/health` | Health check endpoint |

---

## 🧠 How It Works

```
User Query → Classify Intent → Extract Entities → Scrape Platforms
                                                       ↓
Ranked Deals ← AI Summary ← Score Deals ← RAG Retrieval ← Normalize Prices
```

| Step | Component | What It Does |
|:----:|:----------|:-------------|
| 1 | **Search Bar** | User enters a product query (e.g., "best laptop under 100k") |
| 2 | **Intent Classifier** | TF-IDF + SVM determines search intent (buying, comparing, browsing) |
| 3 | **NER Extractor** | BERT model extracts product name, brand, category, target price |
| 4 | **Scout Agent** | Fires 4 scrapers in parallel across Daraz, Telemart, iShopping, Shophive |
| 5 | **Comparator Agent** | Normalizes prices, deduplicates, and standardizes currency |
| 6 | **RAG Retriever** | FAISS similarity search fetches historical prices from vector DB |
| 7 | **Deal Analyst** | Computes deal quality score (0–100) based on historical averages |
| 8 | **Generator** | Llama 3.1 via Groq produces a grounded natural language summary |
| 9 | **UI Dashboard** | Ranked deals with scores, charts, and AI summary displayed |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Chart.js, React Router 6, Axios |
| **Backend** | Python 3.10+, Flask 3.0, SQLite |
| **NLP** | TF-IDF + SVM (scikit-learn), BERT (HuggingFace Transformers) |
| **Vector Search** | Sentence-Transformers, FAISS (cosine similarity) |
| **AI Pipeline** | LangGraph (DAG orchestration) |
| **LLM** | Groq API — Llama 3.1 70B |
| **Scraping** | BeautifulSoup, Playwright, Requests, Algolia Search API |

---

## 📈 Key Takeaways

1. **🎯 Multi-agent architecture works** — Separating scraping, comparison, and analysis into dedicated agents (orchestrated via LangGraph) makes the pipeline modular and debuggable.

2. **⚡ Parallel scraping is essential** — With 4 platforms, sequential scraping takes 20s+. Concurrent scraping via `asyncio` + `ThreadPoolExecutor` cuts it to under 8s.

3. **🧠 RAG > raw LLM** — Grounding Llama 3.1 with real price history via FAIST retrieval eliminates hallucination and produces fact-grounded deal summaries.

4. **📊 Price history is the real signal** — A "50% off" badge means nothing without context. Comparing against 6-month averages gives meaningful deal scores.

5. **🔍 Intent classification + NER beats keyword search** — Understanding that "best laptop under 100k" means a buying intent with `product=laptop, max_price=100000` transforms search relevance.

---

## 🤝 Connect

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-mtahanaeem-181717?logo=github)](https://github.com/mtahanaeem)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://linkedin.com/in/mtahanaeem)

**If you find this project useful, consider giving it a ⭐!**

</div>
