(() => {
  const tabs = [...document.querySelectorAll("[data-code-tab]")];
  const windows = [...document.querySelectorAll("[data-code-window]")];

  function activate(name) {
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.codeTab === name));
    windows.forEach((win) => win.classList.toggle("active", win.dataset.codeWindow === name));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.codeTab)));

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.14 });

  document.querySelectorAll(".zc-reveal").forEach((el) => observer.observe(el));
})();