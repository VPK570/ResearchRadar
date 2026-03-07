import { searchPapers } from './api.js';
import { drawGraph } from './graph.js';

const elements = {
    input: document.getElementById('query-input'),
    btn: document.getElementById('search-btn'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loader-text'),
    error: document.getElementById('api-error'),
    hypContainer: document.getElementById('hypotheses-container')
};

async function runSearch() {
    const query = elements.input.value.trim();
    if (!query) return;

    // Reset UI
    elements.error.classList.add('hidden');
    elements.loader.classList.remove('hidden');
    elements.loaderText.innerText = "FETCHING PAPERS...";
    elements.hypContainer.innerHTML = '<p class="empty-msg">Generating hypotheses...</p>';

    try {
        const data = await searchPapers(query);

        elements.loader.classList.add('hidden');

        if (data.error) {
            elements.hypContainer.innerHTML = `<p class="empty-msg">${data.error}</p>`;
            return;
        }

        drawGraph(data.nodes, data.edges);
        renderCards(data.hypotheses);

    } catch (err) {
        elements.loader.classList.add('hidden');
        elements.error.classList.remove('hidden');
        elements.hypContainer.innerHTML = '<p class="empty-msg">Error communicating with backend.</p>';
    }
}

function renderCards(hypotheses) {
    if (!hypotheses || hypotheses.length === 0) {
        elements.hypContainer.innerHTML = '<p class="empty-msg">No gaps detected for this query.</p>';
        return;
    }

    elements.hypContainer.innerHTML = hypotheses.map(h => `
        <div class="hypothesis-card">
            <div class="novelty-badge">⬡ NOVELTY SCORE: ${h.novelty_score}/100</div>
            <div class="hyp-title">${h.title}</div>
            <div class="paper-connection">${h.paper_a.substring(0, 45)} ↔ ${h.paper_b.substring(0, 45)}</div>
            <div class="hyp-text">${h.hypothesis}</div>
            <div class="hyp-meta"><strong>METHOD:</strong> ${h.method}</div>
            <div class="hyp-meta"><strong>IMPACT:</strong> ${h.impact}</div>
            <div class="tag-container">
                <span class="tag">cross-domain</span>
                <span class="tag">unexplored</span>
            </div>
        </div>
    `).join('');
}

elements.btn.addEventListener('click', runSearch);
elements.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') runSearch();
});
