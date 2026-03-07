export const API_BASE = ""; // Relative path for integrated app

export async function searchPapers(query) {
    const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error("API_ERROR");
    }
    return await response.json();
}
