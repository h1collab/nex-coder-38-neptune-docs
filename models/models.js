const MODELS = [
  {
    name: "Nex Coder 3.8 Mercury",
    status: "Preview",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: true,
    input: 6,
    output: 8,
    href: "/models/nex-coder-38-mercury/",
    description:
      "Fast-path Nex Coder 3.8 profile for daily coding and rapid iteration."
  },
  {
    name: "Nex Coder 3.8 Uranus",
    status: "Preview",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: false,
    description:
      "Balanced 3.8 profile for sustained software-engineering workflows."
  },
  {
    name: "Nex Coder 3.8 Preview — Neptune",
    status: "Preview",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: true,
    input: 12,
    output: 47,
    href: "/",
    description:
      "Deep frontier profile for long-horizon repository engineering."
  },
  {
    name: "Zorix Nex Coder 3.7 Pro",
    status: "Unsupported",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 3.6 Pro",
    status: "Unsupported",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 3.5 Pro",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 3.1 Pro",
    status: "Pro",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Sana Plus 3.5",
    status: "Available",
    type: "General",
    family: "Sana",
    api: false
  },
  {
    name: "Zorix Star Flash 3.5",
    status: "Future",
    type: "General",
    family: "Star Flash",
    api: false
  },
  {
    name: "Zorix Virexa 3.5",
    status: "Preview",
    type: "Image",
    family: "Virexa",
    api: false,
    href: "/models/zorix-virexa-3-5/",
    description:
      "High-quality text-to-image Preview. Available in Zorix Chat; image-to-image is in internal testing."
  },
  {
    name: "Zorix Virexa 3",
    status: "Available",
    type: "Image",
    family: "Virexa",
    api: false
  },
  {
    name: "Zorix Helix",
    status: "ZPBP",
    type: "Biology",
    family: "Helix",
    api: false
  },
  {
    name: "Zorix Helios-A",
    status: "Preview",
    type: "Security",
    family: "Helios",
    api: false
  },
  {
    name: "Zorix Axiom",
    status: "Preview",
    type: "Math",
    family: "Axiom",
    api: false
  },
  {
    name: "Zorix Nex Coder 3.1",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 3.1 Preview",
    status: "Apex Preview",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 3",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Nex Coder 2.8",
    status: "Available",
    type: "Coding",
    family: "Nex Coder",
    api: false
  },
  {
    name: "Zorix Sana Ecrepore",
    status: "Preview",
    type: "Agent",
    family: "Sana",
    api: false
  },
  {
    name: "Zorix Nex Plus 1.1 Preview",
    status: "Preview",
    type: "General",
    family: "Nex Plus",
    api: false
  },
  {
    name: "Zorix Nex Plus",
    status: "Available",
    type: "General",
    family: "Nex Plus",
    api: false
  },
  {
    name: "Zorix Nex 2.7 Coder",
    status: "Retired",
    type: "Coding",
    family: "Nex",
    api: false
  },
  {
    name: "Zorix Nex 2.6 Coder",
    status: "Retired",
    type: "Coding",
    family: "Nex",
    api: false
  },
  {
    name: "Zorix Star Flash 3",
    status: "Available",
    type: "General",
    family: "Star Flash",
    api: false
  },
  {
    name: "Zorix Star Flash 2.1",
    status: "Previous release",
    type: "General",
    family: "Star Flash",
    api: false
  },
  {
    name: "Zorix Star Flash 2",
    status: "Available",
    type: "General",
    family: "Star Flash",
    api: false
  },
  {
    name: "Zorix Nano 0.8B",
    status: "Open source",
    type: "Local",
    family: "Nano",
    api: false
  },
  {
    name: "Zorix Nano 2B",
    status: "Local / GGUF",
    type: "Local",
    family: "Nano",
    api: false
  },
  {
    name: "Zorix Virexa Flash",
    status: "Available",
    type: "Image",
    family: "Virexa",
    api: false
  },
  {
    name: "Zorix Virexa Pro",
    status: "Available",
    type: "Image",
    family: "Virexa",
    api: false
  },
  {
    name: "Zorix Virexa Pro +",
    status: "Available",
    type: "Image",
    family: "Virexa",
    api: false
  },
  {
    name: "Zorix Sana 2 Plus Think",
    status: "Retired",
    type: "General",
    family: "Sana",
    api: false
  },
  {
    name: "Zorix Sana 2.5 Plus",
    status: "Retired",
    type: "General",
    family: "Sana",
    api: false
  },
  {
    name: "Zorix Agent",
    status: "Retired",
    type: "Agent",
    family: "Agent",
    api: false
  },
  {
    name: "Zorix Agent Continue",
    status: "Retired",
    type: "Agent",
    family: "Agent",
    api: false
  },
  {
    name: "Thrym 2",
    status: "Internal only",
    type: "Research",
    family: "Thrym",
    api: false
  },
  {
    name: "Zorix Thrym",
    status: "Retired",
    type: "Coding",
    family: "Thrym",
    api: false
  }
];


const grid = document.getElementById("modelGrid");
const search = document.getElementById("modelSearch");
const count = document.getElementById("modelCount");
const empty = document.getElementById("emptyResults");

let currentFilter = "all";


function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function statusClass(status) {
  const value = status.toLowerCase();

  if (value.includes("retired") || value.includes("unsupported")) {
    return "status-retired";
  }

  if (value.includes("preview")) {
    return "status-preview";
  }

  if (
    value.includes("available") ||
    value.includes("open source") ||
    value.includes("local")
  ) {
    return "status-available";
  }

  return "status-neutral";
}


function modelMatchesFilter(model) {
  if (currentFilter === "all") {
    return true;
  }

  if (currentFilter === "api") {
    return model.api === true;
  }

  if (currentFilter === "preview") {
    return model.status.toLowerCase().includes("preview");
  }

  if (currentFilter === "available") {
    return (
      model.status.toLowerCase().includes("available") ||
      model.status.toLowerCase().includes("open source") ||
      model.status.toLowerCase().includes("local")
    );
  }

  if (currentFilter === "retired") {
    return (
      model.status.toLowerCase().includes("retired") ||
      model.status.toLowerCase().includes("unsupported")
    );
  }

  return true;
}


function render() {
  const query = search.value.trim().toLowerCase();

  const visible = MODELS.filter((model) => {
    const text = [
      model.name,
      model.status,
      model.type,
      model.family
    ].join(" ").toLowerCase();

    return text.includes(query) && modelMatchesFilter(model);
  });

  count.textContent =
    `${visible.length} of ${MODELS.length} models`;

  empty.style.display =
    visible.length ? "none" : "block";

  grid.innerHTML = visible.map((model) => {
    const apiBlock = model.api
      ? `
        <div class="card-api card-api-yes">
          <span>API AVAILABLE</span>
          <div>
            <b>$${model.input}</b>
            <small>input / 1M</small>
            <span class="api-divider">·</span>
            <b>$${model.output}</b>
            <small>output / 1M</small>
          </div>
        </div>
      `
      : `
        <div class="card-api">
          <span>API NOT AVAILABLE YET</span>
        </div>
      `;

    const action = model.href
      ? `
        <a class="model-action" href="${escapeHTML(model.href)}">
          ${model.api ? "View API docs →" : "View model →"}
        </a>
      `
      : `
        <span class="model-action disabled">
          API unavailable
        </span>
      `;

    return `
      <article class="model-card">

        <div class="model-card-top">
          <span class="model-type">
            ${escapeHTML(model.type)}
          </span>

          <span class="model-status ${statusClass(model.status)}">
            ${escapeHTML(model.status)}
          </span>
        </div>

        <h3>${escapeHTML(model.name)}</h3>

        <p>
          ${
            escapeHTML(
              model.description ||
              `${model.family} model listed in the current Zorix catalog.`
            )
          }
        </p>

        ${apiBlock}

        ${action}

      </article>
    `;
  }).join("");
}


document
  .querySelectorAll("[data-filter]")
  .forEach((button) => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll("[data-filter]")
        .forEach((item) => item.classList.remove("active"));

      button.classList.add("active");

      currentFilter = button.dataset.filter;

      render();
    });

  });


search.addEventListener("input", render);

render();
