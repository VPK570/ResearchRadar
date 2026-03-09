# ResearchRadar - Project Overview

This document provides a detailed, comprehensive breakdown of **every single file and directory** in the `ResearchRadar` project, what they do, and our overall aims.

---

## 📁 Full File Breakdown

### 1. Root Directory Files
These files govern the high-level configuration, execution, and documentation of the project.
- `.DS_Store`: MacOS system file that stores custom attributes of its containing folder. (Can be safely ignored/deleted).
- `.env`: (Auto-generated/added by user) Stores secret environment variables locally, such as your `GEMINI_API_KEY`, database passwords, etc.
- `.gitignore`: Specifies which files and directories Git should ignore (e.g., node_modules, Python cache files).
- `Project_Overview.md`: This very file, providing a detailed guide to the repository.
- `README.md`: The primary quick-start guide containing basic setup instructions and application details.
- `api.py`: A legacy standalone prototype of the backend API, containing logic for Semantic Scholar queries, graph building, gap finding, and Gemini hypothesis generation in a single file. Refactored out in favor of the `backend/` directory.
- `docker-compose.yml`: Defines the local infrastructure via Docker, spinning up **PostgreSQL** (relational database) and **Redis** (in-memory data store/message broker).
- `requirements.txt`: Lists all Python dependencies required to run the backend (FastAPI, SQLAlchemy, uvicorn, NetworkX, etc.).
- `run.py`: The main entry point script that starts the local FastAPI server using `uvicorn`, redirecting to `backend/main.py`.

---

### 2. `backend/` Directory
Contains the fully refactored FastAPI Python backend, broken into scalable components.
- `__init__.py`: Marks the backend directory as a standard Python package.
- `main.py`: The core FastAPI application instance. Sets up CORS, attaches middleware, and unites all endpoint routers.
- `researchradar.db`: Local SQLite database file generated when testing without the full PostgreSQL container.
- `alembic.ini`: Configuration file for **Alembic**, a database migration tool mapped to SQLAlchemy.
- `worker.py`: Contains async background logic (the "Search Pipeline"). It manages fetching papers, generating embeddings, building maps, and detecting gaps asynchronously.

#### Subdirectories inside `backend/`:
- **`alembic_migrations/`**: Tracks schema changes to the database over time.
  - `README`, `script.py.mako`, `env.py`: Boilerplate and configuration files used by Alembic to connect to the DB and generate new scripts.
  - `versions/`: Contains the actual migration script history (e.g., `813cace3876a_...`, `adce93b9e813_...`) to easily upgrade/downgrade the database layout.
- **`db/`**: Connection and session logic.
  - `database.py`: Establishes the async SQLAlchemy engine and session makers connecting to PostgreSQL/SQLite.
- **`middleware/`**: Custom layers intercepted before requests hit endpoints.
  - `auth_middleware.py`: Handles token-based authentication on incoming HTTP requests.
  - `rate_limiter.py`: Logic to cap the number of requests a user can make per hour/minute to prevent abuse.
- **`mock_data/`**: JSON files acting as local caching for papers to avoid hitting external APIs continuously.
  - `machine_learinig.json`, `nlp_in_medical_data.json`: Example datasets previously downloaded.
- **`models/`**: SQL database schema definitions.
  - `models.py`: The SQLAlchemy objects mapping Python classes (like `User` and `Search`) to database tables.
- **`routes/`**: FastAPI endpoints that accept client HTTP requests.
  - `auth.py`: Endpoints for logging in and registering.
  - `export.py`: Endpoints for exporting graph/hypothesis data.
  - `history.py`: Endpoints for retrieving a user's past search runs.
  - `hypotheses.py`: Dedicated endpoints interacting with the Gemini AI.
  - `search.py`: The primary endpoint that triggers the `worker.py` pipeline.
- **`schemas/`**: Pydantic models for data validation.
  - `auth.py`: Ensures incoming data matches the required structure (e.g., username/password form).
- **`services/`**: The core business logic and algorithms.
  - `embedding_service.py`: Generates semantic text embeddings for papers.
  - `export_service.py`: Formats complex data into clean exportable strings/files.
  - `gap_service.py`: Mathematical logic to find structural "gaps" in the knowledge graph.
  - `graph_service.py`: Uses NetworkX to organize papers into a node-edge structure.
  - `hypothesis_service.py`: The bridge to Google's Gemini LLM, crafting specialized prompts based on graph gaps.
  - `paper_service.py`: Handles actual HTTP communication with the remote Semantic Scholar API.
- **`static/` & `templates/`**:
  - Legacy vanilla HTML/JS/CSS files (e.g., `index.html`, `js/ui.js`, `css/styles.css`). This was an earlier UI iteration before the React frontend was built.
- **`tests/`**:
  - `test_services.py`: Automated PyTest file to ensure services are operating nominally.
- **`utils/`**:
  - `security.py`: Helper functions for cryptographic hashing of passwords, and decoding/encoding JWT authentication tokens.

---

### 3. `frontend/` Directory
Contains the React SPA (Single Page Application), built with Vite.
- `.gitignore`: Specifying files for Git to ignore just for the frontend (like built assets).
- `README.md`: Basic scaffolding instructions from Vite.
- `eslint.config.js`: Configuration for ESLint to maintain clean JavaScript/React syntax rules.
- `index.html`: The root HTML file that the browser loads; it mounts the main React script.
- `package.json` & `package-lock.json`: Defines the project's Node.js dependencies (React, D3, Axios) and locks their specific versions.
- `vite.config.js`: Configurations for the Vite bundler (e.g., development server port, proxying API requests to the backend).

#### Subdirectories inside `frontend/`:
- **`public/`**: Assets that bypass the bundler and are served directly (e.g., `vite.svg` favicon).
- **`src/`**: The main React source files.
  - `main.jsx`: The absolute React entry point that renders `App.jsx` into the DOM.
  - `App.jsx`: Sets up the router (page navigation) and central structure of the website.
  - `index.css`: Global cascading style sheets.
  - `assets/react.svg`: Static vector graphic.
  - `api/client.js`: A centralized JavaScript file that configures Axios to communicate with the FastAPI backend, automatically attaching auth tokens.
  - **`components/`**: Modular, reusable UI building blocks.
    - `ExportBar.jsx`: A UI strip handling data downloading.
    - `GraphView.jsx`: The complex D3.js component that visually renders the nodes and connections.
    - `Header.jsx`: The top navigation bar.
    - `HypothesisPanel.jsx`: The text box that displays the AI-generated results.
    - `LoginModal.jsx`: The pop-up window for user authentication.
    - `NodeDrawer.jsx`: A side panel showing specific details when a paper node is clicked.
  - **`context/`**: 
    - `AuthContext.jsx`: A React Context Provider that manages and distributes global login state to any component that needs it.
  - **`pages/`**: Full views mapped to URL routes.
    - `HomePage.jsx`: The main landing view and search bar.
    - `HistoryPage.jsx`: View showing older generated graphs.
    - `ResultsPage.jsx`: The core view wrapping the graph, drawer, and hypotheses.
    - `SavedPage.jsx`: A view to look at bookmarked/saved hypotheses.

---

### 4. `scripts/` Directory
Helper scripts for external utilities or setup tasks.
- `download_mock_data.py`: A CLI-tool that bypasses the complex pipeline simply to fetch raw data from Semantic Scholar and save it to `backend/mock_data/` for local off-line UI testing.
- `init_db.py`: A bootstrap script used to synchronously create all database tables in PostgreSQL/SQLite based on our SQLAlchemy models.

---

## 🎯 What Are We Aiming To Do?

### Overall Project Goal
**ResearchRadar** aims to be a powerful research discovery tool. Its core purpose is to track academic papers, find unexplored connections between them (semantic gaps), and use AI (Google Gemini) to generate novel, innovative research hypotheses based on these unexplored connections.

### Current Technical Focus
Based on the recent refactoring, our immediate technical aims are centered on **scaling and improving the backend architecture**:
1. **Data Persistence & Scalability**: Utilizing the newly wired **PostgreSQL** database (via Docker) to permanently store user histories and heavy search results.
2. **Background Processing**: Utilizing **Redis** and the async loops in `backend/worker.py` to handle long-running pipeline tasks invisibly so the UI remains fast and responsive.
3. **Advanced Graph Analytics**: Preparing the ground to deploy sophisticated algorithms (like PageRank) inside `graph_service.py` to find the most mathematically significant literature.
4. **AI Enhancements**: Enhancing the modular logic inside `hypothesis_service.py` to command Gemini to produce even stronger scientific hypotheses.
5. **Decoupled Client-Server**: Refining the strict boundary between the React `frontend/` (managed via `api/client.js`) and the FastAPI `backend/` routing.
