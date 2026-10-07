const MODELS = [
  {
    name: "Zorix Transcribe 2.1",
    status: "Available",
    type: "Audio",
    family: "Transcribe",
    api: true,
    href: "/playground/zorix-transcribe-2-1/",
    modelId: "zorix-transcribe-2-1",
    inputPrice: "Not announced",
    outputPrice: "Not announced",
    description:
      "Speech-to-text transcription model with json, text, and verbose_json output formats."
  },

  {
    name: "Zorix Nex Coder 4 Plutos",
    status: "Available",
    type: "Coding",
    family: "Nex Coder",
    api: false,
    href: "/models/nex-coder-4-plutos/",
    modelId: "nex-coder-4-plutos",
    inputPrice: "Not announced",
    outputPrice: "Not announced",
    description:
      "Nex Coder 4 Plutos was officially released on October 2, 2026. It is currently available in Zorix Chat to Sovreign and Apex users, with broader staged gray testing planned."
  },

  {
    name: "Zorix Timeal 1.1",
    status: "Beta",
    type: "Realtime",
    family: "Timeal",
    variant: "Mini",
    api: false,
    href: "/models/zorix-timeal-1-1-mini/",
    modelId: "zorix-timeal-1-1-mini",
    inputPrice: "Not announced",
    outputPrice: "Not announced",
    description:
      "Mini variant of the Zorix Timeal real-time conversation model, currently in Beta."
  },

  {
    name: "Zorix Timeal 1",
    status: "Beta",
    type: "Realtime",
    family: "Timeal",
    variant: "High",
    api: false,
    href: "/models/zorix-timeal-1/",
    modelId: "zorix-timeal-1-high",
    inputPrice: "Not announced",
    outputPrice: "Not announced",
    description:
      "High variant of the Zorix Timeal real-time conversation model, currently in Beta."
  },

  {
    name: "Zorix Thrym 3",
    status: "Preview",
    type: "Internal",
    family: "Thrym",
    api: false,
    internal: true,
    href: "/models/zorix-thrym-3-preview/",
    modelId: "zorix-thrym-3-preview",
    inputPrice: "Not announced",
    outputPrice: "Not announced",
    description:
      "Very high-capability internal Preview model. Designed for Zorix internal testing, evaluation, and advanced internal workloads."
  },

  {
    name: "Zorix NexHate 2",
    status: "Preview",
    type: "Translation",
    family: "NexHate",
    api: false,
    href: "/models/zorix-nexhate-2/",
    description:
      "Preview translation model with strong multilingual translation capability. Public API pricing is not announced."
  },
  {
    name: "Nex Coder 3.8 Mercury",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: false,
    input: 6,
    output: 8,
    href: "/models/nex-coder-38-mercury/",
    description: "Fast-path Nex Coder 3.8 profile for daily coding and rapid iteration. Retired on October 2, 2026. Some users may retain temporary access during the transition; final shutdown is after October 3, 2026."
  },
  {
    name: "Nex Coder 3.8 Uranus",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: false,
    description: "Balanced 3.8 profile for sustained software-engineering workflows. Retired on October 2, 2026. Some users may retain temporary access during the transition; final shutdown is after October 3, 2026."
  },
  {
    name: "Nex Coder 3.8 Preview — Neptune",
    status: "Retired",
    type: "Coding",
    family: "Nex Coder 3.8",
    api: false,
    input: 12,
    output: 47,
    href: "/",
    description: "Deep frontier profile for long-horizon repository engineering. Retired on October 2, 2026. Some users may retain temporary access during the transition; final shutdown is after October 3, 2026."
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
    name: "Zorix Virexa 4",
    status: "Future",
    type: "Image",
    family: "Virexa",
    api: false,
    description:
      "Expected in October 2026. Final release date and launch details have not been announced."
  },
  {
    name: "Zorix Virexa 3.5",
    status: "Preview",
    type: "Image",
    family: "Virexa",
    api: false,
    href: "/models/zorix-virexa-3-5/",
    description:
      "Image generation model released around mid-September 2026. High-quality text-to-image Preview; image-to-image remains in internal testing."
  },
  {
    name: "Zorix Virexa",
    status: "Previous release",
    type: "Image",
    family: "Virexa",
    api: false,
    description:
      "Introduced in June 2026 when Star Image was renamed Virexa. It had no version number and was divided by effort levels."
  },
  {
    name: "Star Image 1.5",
    status: "Previous release",
    type: "Image",
    family: "Star Image",
    api: false,
    description:
      "The first Star Image release, launched on April 8, 2026 before the image line was renamed Virexa in June."
  },
  {
    name: "Zorix Virexa 3",
    status: "Available",
    type: "Image",
    family: "Virexa",
    api: false,
    description:
      "Released in August 2026. Virexa 3 merged the earlier effort-based split into a single numbered generation."
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

  if (value.includes("internal")) {
    return "status-internal";
  }

  if (value.includes("preview") || value.includes("beta")) {
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
  const status = String(model.status || "").toLowerCase();

  if (currentFilter === "all") return true;

  if (currentFilter === "current") {
    return !(
      status.includes("retired") ||
      status.includes("unsupported") ||
      status.includes("internal")
    );
  }

  if (currentFilter === "preview") {
    return status.includes("preview") || status.includes("beta");
  }

  if (currentFilter === "internal") {
    return status.includes("internal") || model.internal === true;
  }

  if (currentFilter === "retired") {
    return status.includes("retired") || status.includes("unsupported");
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
      model.family,
      model.description || ""
    ].join(" ").toLowerCase();

    return text.includes(query) && modelMatchesFilter(model);
  });

  count.textContent = `${visible.length} of ${MODELS.length} models`;
  empty.style.display = visible.length ? "none" : "block";

  grid.innerHTML = visible.map((model) => {
    const href = model.href || "";
    const clickable = href ? " clickable" : "";
    const action = href
      ? `<a class="model-action" href="${escapeHTML(href)}">View →</a>`
      : `<span class="model-action disabled">No detail page</span>`;

    return `
      <article class="model-card${clickable}">
        <div class="model-card-top">
          <span class="model-type">${escapeHTML(model.type || "Model")}</span>
          <span class="model-status ${statusClass(model.status || "")}">
            ${escapeHTML(model.status || "Unknown")}
          </span>
        </div>

        <h3>${escapeHTML(model.name)}</h3>

        <p>${escapeHTML(
          model.description ||
          `${model.family || "Zorix"} model in the current catalog.`
        )}</p>

        <div class="model-meta">
          <span class="model-family">${escapeHTML(model.family || "Zorix")}</span>
          ${action}
        </div>
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
