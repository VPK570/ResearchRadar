from google import genai as google_genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

def generate_hypotheses(gaps, paper_map):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY not found in environment.")
        return []
        
    client = google_genai.Client(api_key=api_key)
    hypotheses = []
    
    for gap in gaps:
        try:
            pa = paper_map[gap["a"]]
            pb = paper_map[gap["b"]]
            
            prompt = f"""
            Paper A: "{pa['title']}" — {pa.get('abstract','')[:200]}
            Paper B: "{pb['title']}" — {pb.get('abstract','')[:200]}
            These two research areas have never been directly combined according to my analysis of citations and semantic similarity.
            Give 1 research hypothesis that bridges these two papers as JSON:
            {{
                "title": "Short Descriptive Title",
                "hypothesis": "Combining X and Y may lead to...",
                "method": "Briefly describe a possible methodology",
                "impact": "Potential impact on the field"
            }}
            JSON only. No extra text. No markdown.
            """
            
            res = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            
            raw = res.text.strip().replace("```json","").replace("```","")
            # Minimal parsing safety
            parsed = json.loads(raw)
            
            hypotheses.append({
                "paper_a": pa["title"],
                "paper_b": pb["title"],
                "novelty_score": min(99, int(gap["score"] * 100)),
                "title": parsed.get("title", "Novel Connection"),
                "hypothesis": parsed.get("hypothesis", ""),
                "method": parsed.get("method", ""),
                "impact": parsed.get("impact", "")
            })
            
        except Exception as e:
            print(f"Error generating hypothesis for gap {gap}: {str(e)}")
            if 'res' in locals():
                print(f"Raw response: {res.text}")
                
    return hypotheses
