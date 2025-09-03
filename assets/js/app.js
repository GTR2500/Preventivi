/* Utility: carica txt e restituisce stringa trim */
async function loadTxt(path){
  try{
    const res = await fetch(path, {cache: "no-store"});
    const txt = await res.text();
    return txt.trim();
  }catch(e){
    return "";
  }
}

/* Inizializzazione header e impostazioni */
document.addEventListener("DOMContentLoaded", async () => {
  // Titolo
  const title = (await loadTxt("data/site-title.txt")) || "BUGETBOX";
  const titleNode = document.getElementById("siteTitle");
  if (titleNode) titleNode.textContent = title;
  const headTitle = document.querySelector("head > title");
  if (headTitle) headTitle.textContent = `${title} – Pagina 1`;

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
});
