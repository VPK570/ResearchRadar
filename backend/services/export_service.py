import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import io
import structlog

logger = structlog.get_logger()

def export_papers_csv(results: dict) -> io.BytesIO:
    nodes = results.get("nodes", [])
    if not nodes:
        return io.BytesIO()
        
    df = pd.DataFrame(nodes)
    # Remove large/unnecessary columns if they exist
    cols_to_keep = [c for c in ["id", "title", "year", "venue", "citationCount"] if c in df.columns]
    if not cols_to_keep:
        cols_to_keep = df.columns
        
    output = io.BytesIO()
    df[cols_to_keep].to_csv(output, index=False)
    output.seek(0)
    return output

def export_hypotheses_pdf(results: dict) -> io.BytesIO:
    hypotheses = results.get("hypotheses", [])
    output = io.BytesIO()
    
    doc = SimpleDocTemplate(output, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    body_style = styles['BodyText']
    
    story.append(Paragraph("ResearchRadar: AI Hypotheses Report", title_style))
    story.append(Spacer(1, 12))
    
    if not hypotheses:
        story.append(Paragraph("No hypotheses found for this search.", body_style))
    else:
        for i, h in enumerate(hypotheses):
            story.append(Paragraph(f"{i+1}. {h.get('title', 'Novel Connection')}", subtitle_style))
            story.append(Spacer(1, 6))
            
            story.append(Paragraph(f"<b>Bridging:</b> {h.get('paper_a')} AND {h.get('paper_b')}", body_style))
            story.append(Spacer(1, 4))
            
            story.append(Paragraph(f"<b>Novelty Score:</b> {h.get('novelty_score')}/100", body_style))
            story.append(Spacer(1, 8))
            
            story.append(Paragraph("<b>Hypothesis:</b>", body_style))
            story.append(Paragraph(h.get('hypothesis', ''), body_style))
            story.append(Spacer(1, 8))
            
            story.append(Paragraph("<b>Proposed Method:</b>", body_style))
            story.append(Paragraph(h.get('method', ''), body_style))
            story.append(Spacer(1, 8))
            
            story.append(Paragraph("<b>Impact:</b>", body_style))
            story.append(Paragraph(h.get('impact', ''), body_style))
            story.append(Spacer(1, 20))
            
    doc.build(story)
    output.seek(0)
    return output
