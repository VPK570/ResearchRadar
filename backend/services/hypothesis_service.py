import os
import asyncio
from google import genai
from pydantic import BaseModel
from typing import List
import structlog

logger = structlog.get_logger()

# Response Schema for Gemini
class Hypothesis(BaseModel):
    title: str
    hypothesis: str
    method: str
    impact: str
    novelty_score: int

class HypothesisList(BaseModel):
    hypotheses: List[Hypothesis]

async def generate_hypotheses_async(gaps: List[dict]):
    if not gaps:
        return []
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("gemini_api_key_missing")
        return []
        
    client = genai.Client(api_key=api_key)
    
    # Prepare the prompt
    prompt_context = "You are a senior research scientist. For the following research gaps (pairs of papers that are semantically related but have no citations between them), generate a novel research hypothesis that bridges them.\n\n"
    
    for i, gap in enumerate(gaps):
        paper_a = gap['paper_a']
        paper_b = gap['paper_b']
        prompt_context += f"Gap {i+1}:\n"
        prompt_context += f"Paper A: {paper_a.get('title')}\nAbstract A: {paper_a.get('abstract')}\n"
        prompt_context += f"Paper B: {paper_b.get('title')}\nAbstract B: {paper_b.get('abstract')}\n\n"
        
    prompt_context += "Generate a title, a detailed hypothesis, a proposed testing method, a potential impact statement, and a novelty score (1-100) for each gap."

    try:
        logger.info("generating_hypotheses_with_gemini", num_gaps=len(gaps))
        
        # Use structured output
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt_context,
            config={
                'response_mime_type': 'application/json',
                'response_schema': HypothesisList,
            }
        )
        
        # Parse result
        if response and response.parsed:
            result = response.parsed.hypotheses
            # Attach paper info back
            for i, hyp in enumerate(result):
                if i < len(gaps):
                    # Convert pydantic to dict
                    hyp_dict = hyp.model_dump()
                    hyp_dict['paper_a'] = gaps[i]['paper_a'].get('title')
                    hyp_dict['paper_b'] = gaps[i]['paper_b'].get('title')
                    result[i] = hyp_dict
            
            logger.info("hypotheses_generated_successfully", count=len(result))
            return result
            
        logger.warning("gemini_returned_empty_parsed_response")
        return []
        
    except Exception as e:
        logger.exception("gemini_generation_failed", error=str(e))
        return []
