// ═══════════════════════════════════════════════
// auth.js — Gestion JWT + protection des routes
// ═══════════════════════════════════════════════

const GATEWAY_URL = "http://192.168.101.90:8081";

function getToken() {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = "/login.html";
    }
}

function logout() {
    document.cookie = "token=; max-age=0; path=/; SameSite=Lax";
    window.location.href = "/login.html";
}

// Marquer le lien actif dans la navbar
function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        if (href === path || (path === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
