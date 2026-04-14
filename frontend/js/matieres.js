// ═══════════════════════════════════════════════
// matieres.js
// ═══════════════════════════════════════════════
requireAuth();

const CREDIT_BADGE = {
  1:'badge-coral', 2:'badge-coral', 3:'badge-blue',
  4:'badge-blue',  5:'badge-green', 6:'badge-green',
};
function getCreditBadge(c) { return CREDIT_BADGE[Math.min(c,6)] || 'badge-blue'; }

let allMatieres = [];
let selectedId  = null;

function showAlert(msg, type='error') {
  const box = document.getElementById('alert-box');
  box.className = `alert alert-${type}`;
  box.innerHTML = (type==='error'?'⚠️ ':'✅ ') + msg;
  box.style.display = 'flex';
  if (type==='success') setTimeout(()=>box.style.display='none',3000);
}

function updateStats() {
  const total   = allMatieres.length;
  const credits = allMatieres.reduce((s,m)=>s+(m.credits||0),0);
  document.getElementById('stat-total').textContent   = total;
  document.getElementById('stat-credits').textContent = credits;
  document.getElementById('stat-moy').textContent     = total ? (credits/total).toFixed(1) : '0';
}

function renderCards(list) {
  const grid = document.getElementById('cards-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">📖</div>
      <div class="empty-text">${document.getElementById('search').value?'Aucun résultat.':'Aucune matière enregistrée.'}</div>
    </div>`;
    return;
  }
  grid.innerHTML = list.map((m,i)=>{
    const badge = getCreditBadge(m.credits);
    const sel   = m.id === selectedId;
    return `
    <div class="item-card${sel?' selected':''}" style="animation-delay:${i*0.05}s"
         onclick="selectCard(${m.id},'${escHtml(m.intitule)}','${escHtml(m.code)}',${m.credits})">
      <div style="margin-bottom:10px">
        <span class="badge-mono">${escHtml(m.code)}</span>
      </div>
      <div class="card-name" style="margin-bottom:10px">${escHtml(m.intitule)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="badge ${badge}">⭐ ${m.credits} crédit${m.credits>1?'s':''}</span>
        ${sel?'<span class="card-check">✓</span>':''}
      </div>
    </div>`;
  }).join('');
}

function filterCards() {
  const q = document.getElementById('search').value.toLowerCase();
  renderCards(allMatieres.filter(m=>
    `${m.intitule} ${m.code}`.toLowerCase().includes(q)
  ));
}

function selectCard(id, intitule, code, credits) {
  if (selectedId===id){deselect();return;}
  selectedId=id;
  document.getElementById('intitule').value = intitule;
  document.getElementById('code').value     = code;
  document.getElementById('credits').value  = credits;
  document.getElementById('btn-delete').disabled=false;
  document.getElementById('btn-deselect').style.display='inline-flex';
  document.getElementById('form-label').textContent='Matière sélectionnée';
  document.getElementById('alert-box').style.display='none';
  renderCards(allMatieres.filter(m=>{
    const q=document.getElementById('search').value.toLowerCase();
    return `${m.intitule} ${m.code}`.toLowerCase().includes(q);
  }));
}

function deselect() {
  selectedId=null;
  document.getElementById('intitule').value='';
  document.getElementById('code').value='';
  document.getElementById('credits').value=3;
  document.getElementById('btn-delete').disabled=true;
  document.getElementById('btn-deselect').style.display='none';
  document.getElementById('form-label').textContent='Ajouter une matière';
  filterCards();
}

async function loadMatieres() {
  const grid=document.getElementById('cards-grid');
  grid.innerHTML=[1,2,3,4,5,6].map(i=>
    `<div class="skeleton skeleton-card" style="animation-delay:${i*0.08}s"></div>`
  ).join('');
  try {
    allMatieres = await getMatieres() || [];
    updateStats(); filterCards();
  } catch {
    showAlert("Impossible de charger les matières.");
  }
}

async function handleSubmit() {
  const intitule=document.getElementById('intitule').value.trim();
  const code    =document.getElementById('code').value.trim().toUpperCase();
  const credits =Number(document.getElementById('credits').value);
  if (!intitule||!code||!credits){showAlert("Veuillez remplir tous les champs.");return;}
  const btn=document.getElementById('btn-submit');
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span> Enregistrement...';
  try {
    await createMatiere({intitule,code,credits});
    deselect();
    showAlert("Matière ajoutée avec succès !","success");
    await loadMatieres();
  } catch { showAlert("Erreur lors de l'ajout."); }
  finally { btn.disabled=false; btn.innerHTML='✚ Enregistrer la matière'; }
}

async function handleDelete() {
  if (!selectedId||!confirm("Supprimer cette matière définitivement ?")) return;
  try {
    await deleteMatiere(selectedId);
    deselect();
    showAlert("Matière supprimée.","success");
    await loadMatieres();
  } catch { showAlert("Erreur lors de la suppression."); }
}

function escHtml(str){
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

loadMatieres();
