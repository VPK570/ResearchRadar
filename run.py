import uvicorn
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

if __name__ == "__main__":
    print("Starting ResearchRadar Backend...")
    # Run from the backend directory to ensure relative paths for DB/Templates work
    os.chdir("backend")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
