# ⬡ ResearchRadar

**ResearchRadar** is a powerful research discovery tool that finds unexplored connections between academic papers and generates novel research hypotheses using AI.

---

## 🚀 Quick Start Guide

Follow these very simple steps to get the application running from scratch on your computer.

### Prerequisites
Make sure you have installed:
1.  **Python 3.11+** (or Miniconda/Anaconda)
2.  **Node.js** (for running the React frontend)
3.  **Git**

### Step 1: Clone the Repository
Open your terminal and clone the project:
```bash
git clone <your-repository-url>
cd ResearchRadar
```

### Step 2: Set Up the Backend
We recommend using a conda virtual environment so your global python installation stays clean.

```bash
# 1. Create and activate a conda environment
conda create -n research-radar python=3.11 -y
conda activate research-radar

# 2. Install the necessary Python packages
pip install -r requirements.txt

# 3. Create a .env file and add your Gemini API Key. 
# You can get a free key at: https://aistudio.google.com/app/apikey
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env

# 4. Start the backend server!
python run.py
```
*The backend will be running at `http://localhost:8000`.*

### Step 3: Set Up the Frontend
Open a **new terminal window** (keep the backend running in the first one) and navigate to the `frontend` folder:

```bash
cd ResearchRadar/frontend

# 1. Install frontend dependencies
npm install

# 2. Start the React development server
npm run dev
```
*The frontend will be running at `http://localhost:5173`. Open this link in your browser!*

---

## 🧪 Testing Locally (Mock Data Mode)

If you don't want to use live APIs or if you are hitting rate limits, you can download mock data locally!

1. Stop the backend server temporarily (`Ctrl+C`).
2. Run the mock data script:
   ```bash
   python scripts/download_mock_data.py --topic "artificial intelligence" --limit 50
   ```
3. Restart the backend (`python run.py`).
4. Go to the UI and search for exactly "**artificial intelligence**". It will instantly load your local data!

---

## 🛠️ Project Structure
- `backend/` - FastAPI Python backend that handles graphing and AI generation.
- `frontend/` - React application with D3.js visualizer.
- `scripts/` - Helpful utilities like the mock data downloader.
- `run.py` - Main execution script for the backend.
