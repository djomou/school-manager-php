// ═══════════════════════════════════════════════
// professeurs.js
// ═══════════════════════════════════════════════
requireAuth();

const AVATAR_CLASSES = ['avatar-blue','avatar-green','avatar-purple','avatar-amber','avatar-coral','avatar-teal'];
let allProfs = [];
let selectedId = null;

function getInitials(nom, prenom) {
  return ((prenom||'')[0]||'').toUpperCase() + ((nom||'')[0]||'').toUpperCase();
}

function showAlert(msg, type = 'error') {
  const box = document.getElementById('alert-box');
  box.className = `alert alert-${type}`;
  box.innerHTML = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
  box.style.display = 'flex';
  if (type === 'success') setTimeout(() => box.style.display = 'none', 3000);
}

function updateStats() {
  document.getElementById('stat-total').textContent    = allProfs.length;
  document.getElementById('stat-specs').textContent    = new Set(allProfs.map(p => p.specialite)).size;
  document.getElementById('stat-selected').textContent = selectedId ? '1' : '0';
  document.getElementById('stat-selected').style.color = selectedId ? 'var(--accent)' : 'var(--text-muted)';
}

function renderCards(profs) {
  const grid = document.getElementById('cards-grid');
  if (profs.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🎓</div>
      <div class="empty-text">${document.getElementById('search').value ? 'Aucun résultat.' : 'Aucun professeur enregistré.'}</div>
    </div>`;
    return;
  }
  grid.innerHTML = profs.map((p, i) => {
    const avatarClass = AVATAR_CLASSES[p.id % AVATAR_CLASSES.length];
    const isSelected  = p.id === selectedId;
    return `
    <div class="item-card${isSelected ? ' selected' : ''}"
         style="animation-delay:${i*0.05}s"
         onclick="selectCard(${p.id}, '${escHtml(p.nom)}', '${escHtml(p.prenom)}', '${escHtml(p.specialite)}')">
      <div class="card-row">
        <div class="avatar ${avatarClass}">${getInitials(p.nom, p.prenom)}</div>
        <div class="card-info">
          <div class="card-name">${escHtml(p.prenom)} ${escHtml(p.nom)}</div>
          <span class="badge badge-blue">${escHtml(p.specialite)}</span>
          <div class="card-sub">${escHtml(p.email || '')}</div>
        </div>
        ${isSelected ? '<div class="card-check">✓</div>' : ''}
      </div>
    </div>`;
  }).join('');
}

function filterCards() {
  const q = document.getElementById('search').value.toLowerCase();
  renderCards(allProfs.filter(p =>
    `${p.nom} ${p.prenom} ${p.specialite}`.toLowerCase().includes(q)
  ));
}

function selectCard(id, nom, prenom, specialite) {
  if (selectedId === id) { deselect(); return; }
  selectedId = id;
  document.getElementById('nom').value        = nom;
  document.getElementById('prenom').value     = prenom;
  document.getElementById('specialite').value = specialite;
  document.getElementById('btn-delete').disabled    = false;
  document.getElementById('btn-deselect').style.display = 'inline-flex';
  document.getElementById('form-label').textContent = 'Professeur sélectionné';
  document.getElementById('alert-box').style.display = 'none';
  updateStats();
  filterCards();
}

function deselect() {
  selectedId = null;
  document.getElementById('nom').value        = '';
  document.getElementById('prenom').value     = '';
  document.getElementById('specialite').value = '';
  document.getElementById('btn-delete').disabled    = true;
  document.getElementById('btn-deselect').style.display = 'none';
  document.getElementById('form-label').textContent = 'Ajouter un professeur';
  updateStats();
  filterCards();
}

async function loadProfs() {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = [1,2,3,4].map(i =>
    `<div class="skeleton skeleton-card" style="animation-delay:${i*0.1}s"></div>`
  ).join('');
  try {
    allProfs = await getProfesseurs() || [];
    updateStats();
    filterCards();
  } catch {
    showAlert("Impossible de charger les professeurs. Vérifiez les microservices.");
  }
}

async function handleSubmit() {
  const nom       = document.getElementById('nom').value.trim();
  const prenom    = document.getElementById('prenom').value.trim();
  const specialite= document.getElementById('specialite').value.trim();
  if (!nom || !prenom || !specialite) {
    showAlert("Veuillez remplir tous les champs."); return;
  }
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Enregistrement...';
  try {
    await createProfesseur({
      nom, prenom, specialite,
      email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@ecole.com`
    });
    deselect();
    showAlert("Professeur ajouté avec succès !", "success");
    await loadProfs();
  } catch {
    showAlert("Erreur lors de l'ajout.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✚ Ajouter le professeur';
  }
}

async function handleDelete() {
  if (!selectedId || !confirm("Supprimer ce professeur définitivement ?")) return;
  try {
    await deleteProfesseur(selectedId);
    deselect();
    showAlert("Professeur supprimé.", "success");
    await loadProfs();
  } catch {
    showAlert("Erreur lors de la suppression.");
  }
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

loadProfs();
