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

-   **Backend**: Flask (serving both API and UI)
-   **AI/ML**: `sentence-transformers`, `scikit-learn` (cosine similarity)
-   **Graph Analysis**: `networkx`
-   **Hypothesis Generation**: Google Gemini 2.5-Flash (via `google-genai` SDK)
-   **Frontend**: D3.js (Interactive Graph), Vanilla JS, CSS Glassmorphism

---

## 📁 Project Structure

```text
ResearchRadar/
├── .env                # API Keys (Gemini)
├── backend/            # Flask Application Root
│   ├── main.py         # App Entry Point & Routes
│   ├── services/       # Modular Logic
│   │   ├── paper_service.py
│   │   ├── embedding_service.py
│   │   ├── graph_service.py
│   │   └── hypothesis_service.py
│   ├── templates/      # Main HTML UI
│   │   └── index.html
│   └── static/         # Frontend Assets
│       ├── css/
│       └── js/
└── README.md           # This file
```

---

## ⚙️ Installation & Setup

### 1. Requirements
Ensure you have **Python 3.11** (recommended via conda).

```bash
# Activate your environment
conda activate research-radar

# Install dependencies
pip install requests sentence-transformers networkx numpy scikit-learn google-genai flask flask-cors python-dotenv
```

### 2. Configure Gemini API
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_actual_key_here
```
> [!IMPORTANT]
> Get your key from [Google AI Studio](https://aistudio.google.com/).

### 3. Run the Application
Navigate to the `backend/` folder and start the server:
```bash
cd backend
python main.py
```

### 4. Access the UI
Open your browser and visit:
👉 **`http://127.0.0.1:8000`**

---

## 💡 Usage Tips

-   **Search Queries**: Use specific research domains like *"transformer neural networks"* or *"federated learning"* for best results.
-   **Interactive Graph**: Drag nodes to reorganize the view. Hover over blue nodes to see paper titles.
-   **Pink Lines**: These represent the **gaps** — the unexplored connections the AI is analyzing.
-   **Hypothesis Cards**: Novelty scores are calculated based on shared local density and semantic similarity.

---

## ⚖️ License
This project is open-source and intended for research exploration.
