/* Utility: carica txt e restituisce stringa trim */
async function loadTxt(path){
  try{
    const res = await fetch(path, {cache: "no-store"});
    if(!res.ok) throw new Error("fetch failed");
    const txt = await res.text();
    return txt.trim();
  }catch(e){
    return "";
  }
}

/* Parsing CSV (separatore ';') in oggetti */
function parseSemicolonCSV(text){
  if(!text) return [];
  const rows = text.split(/\r?\n/).filter(Boolean);
  const header = rows.shift().split(";");
  return rows.map(line=>{
    const cols = line.split(";");
    const obj = {};
    header.forEach((h,i)=> obj[h.trim()] = (cols[i]||"").trim());
    return obj;
  });
}

/* Inizializza toggle tema (nessun salvataggio locale) */
function setupThemeToggle(){
  const btn = document.getElementById("themeToggle");
  if(!btn) return;
  let dark = false;

  const sun = btn.querySelector(".sun");
  const moon = btn.querySelector(".moon");

  function render(){
    document.documentElement.classList.toggle("theme-dark", dark);
    if(sun && moon){
      sun.style.display = dark ? "none" : "inline";
      moon.style.display = dark ? "inline" : "none";
    }
  }

  btn.addEventListener("click", () => { dark = !dark; render(); });
  render();
}

/* Popola select Località e badge */
async function setupLocalita(){
  const select = document.getElementById("localitaSelect");
  const badge = document.getElementById("badgeLocalita");
  if(!select || !badge) return;

  // Carica file dati: metti il file nel repo in /data/C-S-A-maggio-2025.txt
  const raw = await loadTxt("data/C-S-A-maggio-2025.txt");
  const rows = parseSemicolonCSV(raw);

  // Fai vedere nell'elenco solo COMUNE (SIGLA_PROV)
  const fragment = document.createDocumentFragment();
  rows.forEach((r, idx)=>{
    if(!r.COMUNE) return;
    const opt = document.createElement("option");
    opt.value = String(idx); // indice come chiave
    const sigla = r.SIGLA_PROV ? ` (${r.SIGLA_PROV})` : "";
    opt.textContent = `${r.COMUNE}${sigla}`;
    fragment.appendChild(opt);
  });
  select.appendChild(fragment);

  // Aggiorna badge
  function renderBadge(r){
    if(!r || !r.COMUNE){
      badge.textContent = "Seleziona una località…";
      return;
    }
    const vento = r.VENTO || "—";
    const neve = r.CARICO_NEVE || "—";
    const alt = r.ALTITUDINE ? `${r.ALTITUDINE} m` : "—";
    const zona = r.ZONA_SISMICA || "—";
    const reg = r.REGIONE || "—";
    const provCitta = r.PROV_CITTA_METROPOLITANA || "—";
    const istat = r.COD_ISTAT_COMUNE || "—";

    badge.innerHTML =
      `<div><strong>Vento:</strong> ${vento} &nbsp; <strong>Carico neve:</strong> ${neve} &nbsp; <strong>Altitudine:</strong> ${alt} &nbsp; <strong>Zona sismica:</strong> ${zona}</div>
       <div><strong>Regione:</strong> ${reg} &nbsp; <strong>Prov./Città Metrop.:</strong> ${provCitta} &nbsp; <strong>ISTAT:</strong> ${istat}</div>`;
  }

  select.addEventListener("change", ()=>{
    const idx = Number(select.value);
    const rec = rows[idx];
    renderBadge(rec);
  });

  // valore iniziale del badge
  renderBadge(null);
}

/* Inizializza header, impostazioni, footer, data odierna */
document.addEventListener("DOMContentLoaded", async () => {
  // Titolo
  const title = (await loadTxt("data/site-title.txt")) || "BUGETBOX";
  const titleNode = document.getElementById("siteTitle");
  if (titleNode) titleNode.textContent = title;
  const headTitle = document.querySelector("head > title");
  if (headTitle && !headTitle.textContent.includes(title)) headTitle.textContent = `${title} – Pagina 1`;

  // Logo
  const logoUrl = await loadTxt("data/logo-url.txt");
  const logoImg = document.getElementById("companyLogo");
  if (logoImg) {
    logoImg.src = logoUrl || "https://www.glcgrimaldelli.com/wp-content/uploads/2020/06/cropped-favicon-192x192.png";
  }

  // Revisione
  const revRaw = await loadTxt("data/revision.txt"); // es.: "Rev|26/08/2025|v0.11"
  const [label, date, ver] = (revRaw || "").split("|");
  const badge = document.getElementById("revBadge");
  if (badge){
    badge.textContent = (label && date && ver) ? `${label} ${date} • ${ver}` : "Rev —";
  }

  // Repository (footer e pagina Impostazioni)
  const repo = (await loadTxt("data/repo-name.txt")) || "BudgetBox";
  const repoSpans = document.querySelectorAll("#repoName");
  repoSpans.forEach(n => n.textContent = repo);
  const cfgRepo = document.getElementById("cfgRepo");
  if (cfgRepo) cfgRepo.textContent = repo;

  // Pulsante stampa
  const printBtn = document.getElementById("printBtn");
  if (printBtn){
    printBtn.addEventListener("click", () => window.print());
  }

  // Popola pagina Impostazioni (solo lettura)
  const cfgTitle = document.getElementById("cfgTitle");
  if (cfgTitle) cfgTitle.textContent = title;
  const cfgLogo = document.getElementById("cfgLogo");
  if (cfgLogo) cfgLogo.textContent = logoUrl || "—";
  const cfgRev = document.getElementById("cfgRev");
  if (cfgRev) cfgRev.textContent = (label && date && ver) ? `${label} ${date} • ${ver}` : "—";

  // Data odierna in input date (override sempre possibile)
  const dataInput = document.getElementById("dataInput");
  if (dataInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const dd = String(today.getDate()).padStart(2,"0");
    dataInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Tema
  setupThemeToggle();

  // Località + badge
  setupLocalita();
});
