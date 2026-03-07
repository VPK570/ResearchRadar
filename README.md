# ⬡ ResearchRadar

**ResearchRadar** is a powerful research discovery tool that finds unexplored connections between academic papers and generates novel research hypotheses using AI.

---

## 🚀 How It Works

1.  **Search**: Fetches real academic papers from the **Semantic Scholar API** based on your query.
2.  **Embeddings**: Generates semantic vectors for titles and abstracts using `sentence-transformers` (`all-MiniLM-L6-v2`).
3.  **Knowledge Graph**: Builds a `networkx` graph where nodes represent papers and edges represent citations or high semantic similarity.
4.  **Gap Detection**: Identifies pairs of papers that are semantically related but have never cited each other (sharing at least 2 common neighbors).
5.  **AI Hypothesis**: Sends these "gaps" to **Google Gemini 2.5-Flash** to generate novel research ideas, complete with methodology and potential impact.

---

## 🛠️ Tech Stack

-   **Backend**: FastAPI (Async, Pydantic, SQLAlchemy)
-   **AI/ML**: `sentence-transformers` (Fallback to Random in local env due to segfaults), `numpy`
-   **Graph Analysis**: `networkx`
-   **Hypothesis Generation**: Google Gemini (via `google-genai` SDK)
-   **Frontend**: React (Vite), D3.js

---

## 📁 Project Structure

```text
ResearchRadar/
├── .env                # API Keys (Gemini)
├── run.py              # Root Execution Script
├── backend/            # FastAPI Application Root
│   ├── main.py         # App Entry Point & Routing
│   ├── services/       # Core Logic
│   └── db/             # Database Connection
├── frontend/           # React Application
└── README.md           # This file
```

---

## ⚙️ Installation & Setup

### 1. Requirements
Ensure you have **Python 3.11+**.

```bash
# Install dependencies
pip install sqlalchemy tenacity aiosqlite python-jose[cryptography] passlib[bcrypt] structlog fastapi uvicorn google-genai
```

### 2. Configure Gemini API
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_actual_key_here
```

### 3. Run the Application
Start the backend from the root:
```bash
python run.py
```

### 4. Access the UI
Open your browser and visit:
👉 **`http://localhost:8000/docs`** (API Documentation)
👉 **`http://localhost:5173`** (Frontend dev server - run `npm install && npm run dev` in `frontend/`)

---

## 💡 Usage Tips

-   **Search Queries**: Use specific research domains like *"transformer neural networks"* or *"federated learning"* for best results.
-   **Interactive Graph**: Drag nodes to reorganize the view. Hover over blue nodes to see paper titles.
-   **Pink Lines**: These represent the **gaps** — the unexplored connections the AI is analyzing.
-   **Hypothesis Cards**: Novelty scores are calculated based on shared local density and semantic similarity.

---

## ⚖️ License
This project is open-source and intended for research exploration.
