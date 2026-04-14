// ═══════════════════════════════════════════════
// api.js — Appels vers l'API Gateway PHP
// ═══════════════════════════════════════════════

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    try {
        const res = await fetch(`${GATEWAY_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
        if (res.status === 401 || res.status === 403) {
            logout();
            return null;
        }
        if (res.status === 204) return null;
        return await res.json();
    } catch (err) {
        console.error("Erreur API :", err);
        throw err;
    }
}

// ── Professeurs ──────────────────────────────
const getProfesseurs   = ()     => apiFetch("/api/professeurs");
const createProfesseur = (data) => apiFetch("/api/professeurs", {
    method: "POST", body: JSON.stringify(data)
});
const deleteProfesseur = (id)   => apiFetch(`/api/professeurs/${id}`, {
    method: "DELETE"
});

// ── Matières ─────────────────────────────────
const getMatieres   = ()     => apiFetch("/api/matieres");
const createMatiere = (data) => apiFetch("/api/matieres", {
    method: "POST", body: JSON.stringify(data)
});
const deleteMatiere = (id)   => apiFetch(`/api/matieres/${id}`, {
    method: "DELETE"
});

// ── Attributions ─────────────────────────────
const getAttributions   = ()     => apiFetch("/api/attributions");
const createAttribution = (data) => apiFetch("/api/attributions", {
    method: "POST", body: JSON.stringify(data)
});
const deleteAttribution = (id)   => apiFetch(`/api/attributions/${id}`, {
    method: "DELETE"
});
