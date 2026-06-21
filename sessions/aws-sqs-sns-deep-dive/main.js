/* AWS SQS & SNS session: tabs, TOC scroll-spy, collapsible sections. Vanilla JS only. */
(function () {
  "use strict";

  /* ---------- Tabs ---------- */
  function initTabs(root) {
    const buttons = root.querySelectorAll(".tabs__btn");
    const panels = root.querySelectorAll(".tabs__panel");
    function activate(id) {
      buttons.forEach((b) => {
        const match = b.dataset.tab === id;
        b.setAttribute("aria-selected", match ? "true" : "false");
        b.tabIndex = match ? 0 : -1;
      });
      panels.forEach((p) => { p.hidden = p.dataset.panel !== id; });
    }
    buttons.forEach((btn, idx) => {
      btn.addEventListener("click", () => activate(btn.dataset.tab));
      btn.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(buttons[next].dataset.tab);
      });
    });
    if (buttons[0]) activate(buttons[0].dataset.tab);
  }
  document.querySelectorAll(".tabs").forEach(initTabs);

  /* ---------- TOC scroll-spy ---------- */
  (function initTOC() {
    const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#']"));
    if (!tocLinks.length) return;
    const map = new Map();
    tocLinks.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (target) map.set(target, a);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    map.forEach((_, el) => observer.observe(el));
  })();

  /* ---------- Collapsible sections: toolbar + anchor auto-open ---------- */
  (function initCollapse() {
    const sections = Array.from(document.querySelectorAll("details.section__collapse"));
    if (!sections.length) return;
    function setAll(open) { sections.forEach((d) => { d.open = open; }); }
    document.querySelectorAll(".section-controls__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "expand-all") setAll(true);
        else if (btn.dataset.action === "collapse-all") setAll(false);
      });
    });
    function openAncestor(id) {
      if (!id) return null;
      const target = document.getElementById(id);
      if (!target) return null;
      let el = target;
      while (el && el !== document.body) {
        if (el.tagName === "DETAILS") el.open = true;
        el = el.parentElement;
      }
      return target;
    }
    if (location.hash) openAncestor(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("hashchange", () => {
      openAncestor(decodeURIComponent(location.hash.slice(1)));
    });
    const prevState = new WeakMap();
    window.addEventListener("beforeprint", () => {
      sections.forEach((d) => { prevState.set(d, d.open); d.open = true; });
    });
    window.addEventListener("afterprint", () => {
      sections.forEach((d) => { if (prevState.has(d)) d.open = prevState.get(d); });
    });
  })();

  /* ---------- Smooth scroll ---------- */
  document.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      let el = target;
      while (el && el !== document.body) {
        if (el.tagName === "DETAILS") el.open = true;
        el = el.parentElement;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });
})();
