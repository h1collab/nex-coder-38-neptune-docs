(() => {
  const root = document.documentElement;
  const saved = localStorage.getItem("zorix-dev-theme");
  if (saved === "dark") root.dataset.theme = "dark";
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("zorix-dev-theme", root.dataset.theme);
  });

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy || "");
        const old = btn.textContent;
        btn.textContent = "✓";
        setTimeout(() => btn.textContent = old, 900);
      } catch {}
    });
  });

  const drawer = document.querySelector("[data-drawer]");
  document.querySelector("[data-menu-toggle]")?.addEventListener("click", () => drawer?.classList.toggle("open"));
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => drawer.classList.remove("open")));

  const overlay = document.querySelector("[data-search-overlay]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const catalog = Array.isArray(window.ZORIX_MODEL_CATALOG) ? window.ZORIX_MODEL_CATALOG : [];
  const esc = (s) => String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

  const render = (q = "") => {
    const term = q.trim().toLowerCase();
    const rows = catalog.filter((m) => !term || `${m.name} ${m.description} ${m.type} ${m.modelId}`.toLowerCase().includes(term)).slice(0,30);
    if (!results) return;
    results.innerHTML = rows.length ? rows.map((m) => `
      <a class="search-item" href="${esc(m.href)}">
        <div class="search-item-icon">${esc((m.name || "Z").replace(/^Zorix\s+/i,"").slice(0,2).toUpperCase())}</div>
        <div><div class="search-item-name">${esc(m.name)}</div><div class="search-item-desc">${esc(m.description || "")}</div></div>
      </a>`).join("") : '<div class="empty">No matching Zorix models.</div>';
  };

  const openSearch = () => {
    if (!overlay) return;
    render("");
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    setTimeout(() => input?.focus(), 0);
  };
  const closeSearch = () => {
    overlay?.classList.remove("open");
    document.documentElement.style.overflow = "";
  };

  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
  document.querySelectorAll("[data-search-close]").forEach((b) => b.addEventListener("click", closeSearch));
  input?.addEventListener("input", (e) => render(e.target.value));

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
    if (e.key === "Escape") closeSearch();
  });
})();
