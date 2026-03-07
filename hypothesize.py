from google import genai
import json, os
from dotenv import load_dotenv
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

with open("gaps.json") as f:
    gaps = json.load(f)

def generate_hypothesis(gap):
    a = gap["paper_a"]
    b = gap["paper_b"]
    prompt = f"""Paper A: "{a['title']}" — {str(a.get('abstract',''))[:250]}
Paper B: "{b['title']}" — {str(b.get('abstract',''))[:250]}
These two research areas have never been combined.
Give 2 hypotheses as JSON:
{{"hypotheses":[{{"title":"...","hypothesis":"Combining X and Y may lead to...","method":"...","impact":"..."}}]}}
JSON only. No extra text."""

    res = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    raw = res.text.strip().replace("```json","").replace("```","")
    return json.loads(raw)

results = []
for i, gap in enumerate(gaps[:5]):
    print(f"Generating hypothesis {i+1}/5...")
    try:
        hyp = generate_hypothesis(gap)
        results.append({
            "gap": gap,
            "hypotheses": hyp["hypotheses"],
            "novelty_score": min(99, int(gap["gap_score"] * 100))
        })
    except Exception as e:
        print(f"  Error: {e}")

with open("hypotheses.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n=== SAMPLE OUTPUT ===")
for r in results[:2]:
    print(f"\nNovelty Score: {r['novelty_score']}/100")
    for h in r["hypotheses"]:
        print(f"  → {h['hypothesis']}")