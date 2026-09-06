const searchDialog = document.getElementById("searchDialog");
const searchTrigger = document.getElementById("searchTrigger");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function openSearch() {
  searchDialog.classList.add("open");
  searchDialog.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => searchInput.focus(), 20);
}

function closeSearch() {
  searchDialog.classList.remove("open");
  searchDialog.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  searchInput.value = "";
  filterResults("");
}

function filterResults(value) {
  const q = value.toLowerCase().trim();

  [...searchResults.querySelectorAll("button")].forEach((button) => {
    button.style.display =
      !q || button.textContent.toLowerCase().includes(q)
        ? "block"
        : "none";
  });
}

searchTrigger.addEventListener("click", openSearch);

document
  .querySelectorAll("[data-close-search]")
  .forEach((el) => el.addEventListener("click", closeSearch));

searchInput.addEventListener("input", (event) => {
  filterResults(event.target.value);
});

searchResults.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-target]");
  if (!button) return;

  closeSearch();

  const target = document.getElementById(button.dataset.target);
  if (target) target.scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (
    (event.metaKey || event.ctrlKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    openSearch();
  }

  if (event.key === "Escape") {
    closeSearch();
  }
});


const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");

mobileMenu.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

sidebar.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});


const sections = [
  ...document.querySelectorAll(
    "main section[id]"
  )
];

const tocLinks = [
  ...document.querySelectorAll(".toc a")
];

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    tocLinks.forEach((link) => {
      link.classList.toggle(
        "toc-active",
        link.getAttribute("href") === `#${visible.target.id}`
      );
    });
  },
  {
    rootMargin: "-20% 0px -68% 0px",
    threshold: [0, 0.1, 0.3, 0.6]
  }
);

sections.forEach((section) => observer.observe(section));


// ==========================================================
// ZORIX-MOBILE-NAV-V2
// ==========================================================

const mobileBackdrop = document.createElement("div");

mobileBackdrop.className = "mobile-nav-backdrop";

document.body.appendChild(mobileBackdrop);


function syncMobileSidebar() {
  const visible = sidebar.classList.contains("open");

  mobileBackdrop.classList.toggle("visible", visible);

  document.body.classList.toggle(
    "sidebar-visible",
    visible
  );
}


mobileMenu.addEventListener("click", () => {
  requestAnimationFrame(syncMobileSidebar);
});


mobileBackdrop.addEventListener("click", () => {
  sidebar.classList.remove("open");

  syncMobileSidebar();
});


window.addEventListener("resize", () => {
  if (window.innerWidth > 850) {
    sidebar.classList.remove("open");

    syncMobileSidebar();
  }
});
