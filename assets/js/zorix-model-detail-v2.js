(() => {
  const doc = document.documentElement;
  const body = document.body;
  const esc = (s) => String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");

  const savedTheme = localStorage.getItem("zorix-dev-theme");
  if (savedTheme === "dark") doc.dataset.theme = "dark";
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    doc.dataset.theme = doc.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("zorix-dev-theme", doc.dataset.theme);
  });

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    let timer = null;
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy || ""); } catch {}
      clearTimeout(timer);
      btn.classList.add("copied");
      btn.setAttribute("aria-label", "Copied");
      timer = setTimeout(() => {
        btn.classList.remove("copied");
        btn.setAttribute("aria-label", "Copy model ID");
      }, 1500);
    });
  });

  document.querySelectorAll("[data-model-select]").forEach((wrap) => {
    const trigger = wrap.querySelector("[data-model-select-trigger]");
    const close = () => {
      wrap.classList.remove("open");
      trigger?.setAttribute("aria-expanded", "false");
      trigger?.setAttribute("data-state", "closed");
    };
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !wrap.classList.contains("open");
      wrap.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", String(open));
      trigger.setAttribute("data-state", open ? "open" : "closed");
    });
    wrap.querySelectorAll("[data-model-option]").forEach((o) => o.addEventListener("click", close));
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  });

  const leftNav = document.querySelector("[data-left-nav]");
  const navKey = "zorix-docs:left-nav:" + (leftNav?.dataset.leftNavId || location.pathname);
  const storageOK = (() => {
    try { sessionStorage.setItem("__zx_test","1"); sessionStorage.removeItem("__zx_test"); return true; } catch { return false; }
  })();
  const restoreLeftNav = () => {
    if (!leftNav || !storageOK) return;
    const raw = sessionStorage.getItem(navKey);
    if (raw !== null) leftNav.scrollTop = Number(raw) || 0;
  };
  const saveLeftNav = () => {
    if (!leftNav || !storageOK) return;
    sessionStorage.setItem(navKey, String(leftNav.scrollTop));
  };
  restoreLeftNav();
  leftNav?.addEventListener("scroll", saveLeftNav, {passive:true});
  window.addEventListener("pageshow", restoreLeftNav);
  window.addEventListener("beforeunload", saveLeftNav);

  const sectionIds = ["pricing","modalities","endpoints","features","snapshots","rate-limits"];
  const sideLinks = [...document.querySelectorAll("[data-section-link]")];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries.filter((e) => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!active) return;
      sideLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + active.target.id));
      const selected = sideLinks.find((a) => a.classList.contains("active"));
      window.requestAnimationFrame(() => selected?.scrollIntoView({block:"nearest",inline:"nearest"}));
    }, {rootMargin:"-25% 0px -60% 0px",threshold:[0,.1,.5]});
    sections.forEach((s) => observer.observe(s));
  }

  const searchOverlay = document.querySelector("[data-search-overlay]");
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");
  const catalog = Array.isArray(window.ZORIX_MODEL_CATALOG) ? window.ZORIX_MODEL_CATALOG : [];

  const renderSearch = (q="") => {
    if (!searchResults) return;
    const term = q.trim().toLowerCase();
    const rows = catalog.filter((m) => !term || `${m.name} ${m.description} ${m.type} ${m.modelId}`.toLowerCase().includes(term)).slice(0,30);
    searchResults.innerHTML = rows.length ? rows.map((m) => `
      <a class="zx-search-item" href="${esc(m.href)}">
        <div class="zx-search-icon">${esc((m.name || "Z").replace(/^Zorix\\s+/i,"").slice(0,2).toUpperCase())}</div>
        <div><div class="zx-search-name">${esc(m.name)}</div><div class="zx-search-desc">${esc(m.description || "")}</div></div>
      </a>`).join("") : '<div class="zx-empty">No matching Zorix models.</div>';
  };

  const openSearch = (trigger) => {
    if (!searchOverlay) return;
    renderSearch("");
    searchOverlay.classList.add("open");
    body.style.overflow = "hidden";
    window.requestAnimationFrame(() => {
      searchInput?.focus();
      searchInput?.select();
    });
  };
  const closeSearch = () => {
    searchOverlay?.classList.remove("open");
    body.style.overflow = "";
  };

  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", () => openSearch(b)));
  document.querySelectorAll("[data-search-close]").forEach((b) => b.addEventListener("click", closeSearch));
  searchInput?.addEventListener("input", (e) => renderSearch(e.target.value));
  document.addEventListener("header:open-search", (event) => openSearch(event.detail?.trigger || null));

  const drawer = document.querySelector("[data-mobile-drawer]");
  const drawerTrigger = document.querySelector("[data-mobile-menu]");
  const closeDrawer = () => {
    drawer?.classList.remove("open");
    drawerTrigger?.setAttribute("aria-expanded","false");
    body.style.overflow = "";
  };
  const openDrawer = () => {
    drawer?.classList.add("open");
    drawerTrigger?.setAttribute("aria-expanded","true");
    body.style.overflow = "hidden";
  };
  drawerTrigger?.addEventListener("click", () => drawer?.classList.contains("open") ? closeDrawer() : openDrawer());
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  drawer?.querySelector("[data-mobile-search]")?.addEventListener("click", (e) => {
    const target = e.currentTarget;
    closeDrawer();
    window.requestAnimationFrame(() => {
      target.blur();
      document.dispatchEvent(new CustomEvent("header:open-search", {detail:{trigger:target,variant:"mobile"}}));
    });
  });

  const compareOverlay = document.querySelector("[data-compare-overlay]");
  const compareBody = document.querySelector("[data-compare-body]");
  const current = window.ZORIX_CURRENT_MODEL || null;
  const openCompare = () => {
    if (!compareOverlay || !compareBody) return;
    const rows = [current, ...catalog.filter((m) => m.name !== current?.name).slice(0,5)].filter(Boolean);
    compareBody.innerHTML = `<table class="zx-compare-table">
      <thead><tr><th>Model</th><th>Type</th><th>Input</th><th>Output</th><th>API</th></tr></thead>
      <tbody>${rows.map((m) => `<tr>
        <td><a class="zx-link" href="${esc(m.href)}">${esc(m.name)}</a></td>
        <td>${esc(m.type || "Model")}</td>
        <td>${esc(m.inputPrice || "Not announced")}</td>
        <td>${esc(m.outputPrice || "Not announced")}</td>
        <td>${m.api ? "Available" : "Not available"}</td>
      </tr>`).join("")}</tbody></table>`;
    compareOverlay.classList.add("open");
    body.style.overflow = "hidden";
  };
  const closeCompare = () => {
    compareOverlay?.classList.remove("open");
    body.style.overflow = "";
  };
  document.querySelectorAll("[data-compare-open]").forEach((b) => b.addEventListener("click", openCompare));
  document.querySelectorAll("[data-compare-close]").forEach((b) => b.addEventListener("click", closeCompare));

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); openSearch(null);
    }
    if (e.key === "Escape") {
      closeSearch(); closeCompare(); closeDrawer();
      document.querySelectorAll("[data-model-select].open").forEach((x) => x.classList.remove("open"));
    }
  });
})();
