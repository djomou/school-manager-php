// ═══════════════════════════════════════════════
// attributions.js
// ═══════════════════════════════════════════════
requireAuth();

const AVATAR_CLASSES = ['avatar-blue','avatar-green','avatar-purple','avatar-amber','avatar-coral','avatar-teal'];
let allAttribitions = [], allProfs = [], allMatieres = [];

function showAlert(msg, type='error') {
  const box = document.getElementById('alert-box');
  box.className = `alert alert-${type}`;
  box.innerHTML = (type==='error'?'⚠️ ':'✅ ') + msg;
  box.style.display = 'flex';
  if (type==='success') setTimeout(()=>box.style.display='none',3500);
}

function getProf(id)    { return allProfs.find(p=>p.id===Number(id)); }
function getMatiere(id) { return allMatieres.find(m=>m.id===Number(id)); }
function getInitials(nom,prenom) {
  return ((prenom||'')[0]||'').toUpperCase()+((nom||'')[0]||'').toUpperCase();
}

function updateStats() {
  document.getElementById('stat-att').textContent   = allAttribitions.length;
  document.getElementById('stat-profs').textContent = allProfs.length;
  document.getElementById('stat-mats').textContent  = allMatieres.length;
  const moy = allProfs.length ? (allAttribitions.length/allProfs.length).toFixed(1) : '0';
  document.getElementById('stat-moy').textContent   = moy;
}

function populateSelects() {
  const sp = document.getElementById('sel-prof');
  const sm = document.getElementById('sel-mat');
  const fp = document.getElementById('filter-prof');
  const fm = document.getElementById('filter-mat');

  sp.innerHTML = '<option value="">— Sélectionner un enseignant —</option>' +
    allProfs.map(p=>`<option value="${p.id}">${escHtml(p.prenom)} ${escHtml(p.nom)} · ${escHtml(p.specialite)}</option>`).join('');

  sm.innerHTML = '<option value="">— Sélectionner une matière —</option>' +
    allMatieres.map(m=>`<option value="${m.id}">${escHtml(m.code)} · ${escHtml(m.intitule)}</option>`).join('');

  const profCount = id => allAttribitions.filter(a=>a.professeur_id===id||a.professeurId===id).length;
  fp.innerHTML = '<option value="">Tous les professeurs</option>' +
    allProfs.map(p=>`<option value="${p.id}">${escHtml(p.prenom)} ${escHtml(p.nom)} (${profCount(p.id)})</option>`).join('');

  fm.innerHTML = '<option value="">Toutes les matières</option>' +
    allMatieres.map(m=>`<option value="${m.id}">${escHtml(m.code)} · ${escHtml(m.intitule)}</option>`).join('');

  // Aperçu en temps réel
  [sp, sm, document.getElementById('annee')].forEach(el =>
    el.addEventListener('change', updatePreview)
  );
  document.getElementById('annee').addEventListener('input', updatePreview);
}

function updatePreview() {
  const profId  = document.getElementById('sel-prof').value;
  const matId   = document.getElementById('sel-mat').value;
  const annee   = document.getElementById('annee').value;
  const preview = document.getElementById('preview-box');
  if (profId && matId) {
    const prof = getProf(profId);
    const mat  = getMatiere(matId);
    document.getElementById('preview-text').innerHTML =
      `<strong>${prof?prof.prenom+' '+prof.nom:'?'}</strong> → <strong>${mat?mat.code:'?'}</strong> · ${annee}`;
    preview.style.display = 'flex';
  } else {
    preview.style.display = 'none';
  }
}

function filterList() {
  const fp = document.getElementById('filter-prof').value;
  const fm = document.getElementById('filter-mat').value;
  const filtered = allAttribitions.filter(a => {
    const pid = String(a.professeur_id ?? a.professeurId ?? '');
    const mid = String(a.matiere_id    ?? a.matiereId    ?? '');
    return (!fp || pid === fp) && (!fm || mid === fm);
  });
  renderList(filtered);
}

function renderList(list) {
  const container = document.getElementById('att-list');
  if (!list.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔗</div>
      <div class="empty-text">Aucune affectation trouvée.</div>
    </div>`;
    return;
  }
  container.innerHTML = list.map((a,i) => {
    const pid  = a.professeur_id ?? a.professeurId;
    const mid  = a.matiere_id    ?? a.matiereId;
    const prof = getProf(pid);
    const mat  = getMatiere(mid);
    const av   = AVATAR_CLASSES[(pid||0) % AVATAR_CLASSES.length];
    const ini  = prof ? getInitials(prof.nom, prof.prenom) : '??';
    return `
    <div class="att-card" style="animation-delay:${i*0.04}s">
      <div class="avatar ${av}" style="width:42px;height:42px;font-size:13px">${ini}</div>
      <div class="att-info">
        <div class="att-prof">
          ${prof ? escHtml(prof.prenom)+' '+escHtml(prof.nom) : 'Prof #'+pid}
          <span class="att-spec">${prof ? '· '+escHtml(prof.specialite) : ''}</span>
        </div>
        <div class="att-row2">
          ${mat ? `<span class="badge-mono">${escHtml(mat.code)}</span>
                   <span style="font-size:13px;color:var(--text-secondary)">${escHtml(mat.intitule)}</span>`
                : `<span style="color:var(--text-muted)">Matière #${mid}</span>`}
          <span class="att-year">${escHtml(a.annee_academique ?? a.anneeAcademique ?? '')}</span>
        </div>
      </div>
      <button class="att-del" onclick="handleDelete(${a.id})" title="Supprimer">🗑</button>
    </div>`;
  }).join('');
}

async function loadAll() {
  document.getElementById('att-list').innerHTML =
    [1,2,3].map(i=>`<div class="skeleton skeleton-card" style="animation-delay:${i*0.1}s;margin-bottom:12px"></div>`).join('');
  try {
    [allAttribitions, allProfs, allMatieres] = await Promise.all([
      getAttributions(), getProfesseurs(), getMatieres()
    ]);
    allAttribitions = allAttribitions || [];
    allProfs        = allProfs        || [];
    allMatieres     = allMatieres     || [];
    updateStats();
    populateSelects();
    filterList();
  } catch {
    showAlert("Erreur de chargement. Vérifiez les microservices et la Gateway.");
  }
}

async function handleSubmit() {
  const profId = document.getElementById('sel-prof').value;
  const matId  = document.getElementById('sel-mat').value;
  const annee  = document.getElementById('annee').value.trim();
  if (!profId || !matId || !annee) {
    showAlert("Veuillez sélectionner un professeur, une matière et une année."); return;
  }
  const btn = document.getElementById('btn-submit');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Enregistrement...';
  try {
    await createAttribution({
      professeurId: Number(profId),
      matiereId:    Number(matId),
      anneeAcademique: annee
    });
    document.getElementById('sel-prof').value = '';
    document.getElementById('sel-mat').value  = '';
    document.getElementById('preview-box').style.display = 'none';
    showAlert("Affectation enregistrée avec succès !", "success");
    await loadAll();
  } catch { showAlert("Erreur lors de l'affectation."); }
  finally { btn.disabled=false; btn.innerHTML="🔗 Valider l'affectation"; }
}

async function handleDelete(id) {
  if (!confirm("Supprimer cette affectation définitivement ?")) return;
  try {
    await deleteAttribution(id);
    showAlert("Affectation supprimée.", "success");
    await loadAll();
  } catch { showAlert("Erreur lors de la suppression."); }
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

loadAll();
