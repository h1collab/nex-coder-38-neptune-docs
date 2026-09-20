(() => {
  const grid = document.querySelector("[data-book-grid]");
  const featured = document.querySelector("[data-featured]");
  const search = document.querySelector("[data-book-search]");
  const count = document.querySelector("[data-book-count]");

  const esc = (s) => String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;");

  let books = [];

  function coverMarkup(book) {
    if (book.cover) {
      return `<img src="${esc(book.cover)}" alt="${esc(book.title)} cover" loading="lazy">`;
    }
    return `<div class="zb-placeholder"><span>ZORIX BOOKS</span><strong>${esc(book.title)}</strong><small>${esc(book.edition || "")}</small></div>`;
  }

  function renderFeatured(book) {
    if (!featured || !book) return;
    featured.innerHTML = `
      <a class="zb-feature-card" href="${esc(book.path)}">
        <div class="zb-feature-cover" data-tilt>${coverMarkup(book)}</div>
        <div class="zb-feature-copy">
          <div>
            <div class="zb-meta"><span>${esc(book.publisher || "Zorix")}</span><span>·</span><span>${esc(book.type || "Book")}</span><span>·</span><span>${esc(book.edition || "")}</span></div>
            <h2>${esc(book.tagline || book.title)}</h2>
            <div class="zb-subtitle">${esc(book.subtitle || "")}</div>
          </div>
          <div class="zb-read">Read book <span class="arrow">→</span></div>
        </div>
      </a>`;
    setupTilt();
  }

  function renderGrid(items) {
    if (!grid) return;
    count.textContent = `${items.length} book${items.length === 1 ? "" : "s"}`;
    grid.innerHTML = items.length ? items.map(book => `
      <article class="zb-card">
        <a href="${esc(book.path)}">
          <div class="zb-card-cover">${coverMarkup(book)}</div>
          <div class="zb-card-meta">${esc(book.publisher || "Zorix")} · ${esc(book.edition || "")}${book.pages ? ` · ${book.pages} pages` : ""}</div>
          <h3>${esc(book.title)}</h3>
          <p>${esc(book.subtitle || "")}</p>
        </a>
      </article>`).join("") : '<div class="zb-empty">No books match your search.</div>';

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    }, {threshold:.12});
    document.querySelectorAll(".zb-card").forEach(card => observer.observe(card));
  }

  function setupTilt() {
    document.querySelectorAll("[data-tilt]").forEach(stage => {
      const img = stage.querySelector("img");
      if (!img) return;
      stage.addEventListener("pointermove", e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        img.style.setProperty("--ry", `${x*8}deg`);
        img.style.setProperty("--rx", `${-y*6}deg`);
        img.style.setProperty("--ty", "-5px");
      });
      stage.addEventListener("pointerleave", () => {
        img.style.setProperty("--ry","0deg");
        img.style.setProperty("--rx","0deg");
        img.style.setProperty("--ty","0");
      });
    });
  }

  async function init() {
    try {
      const res = await fetch("/data/books.json", {cache:"no-store"});
      const data = await res.json();
      books = Array.isArray(data) ? data : (Array.isArray(data.books) ? data.books : []);
    } catch (err) {
      grid.innerHTML = '<div class="zb-empty">Unable to load the book catalog.</div>';
      return;
    }

    const featuredBook = books.find(b => b.featured) || books[0];
    renderFeatured(featuredBook);
    renderGrid(books);

    search?.addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = books.filter(b =>
        `${b.title || ""} ${b.subtitle || ""} ${b.tagline || ""} ${b.publisher || ""}`
          .toLowerCase().includes(q)
      );
      renderGrid(filtered);
    });
  }

  init();
})();
