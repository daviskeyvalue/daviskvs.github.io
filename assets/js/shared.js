/* Shared client behavior: theme toggle (persisted) + copy-code helper. */
(function () {
  "use strict";
  const STORAGE_KEY = "infra-upskill-theme";
  const root = document.documentElement;
  function getStoredTheme() { try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; } }
  function storeTheme(value) { try { localStorage.setItem(STORAGE_KEY, value); } catch (_) { /* ignore */ } }
  function systemPrefersDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      const label = btn.querySelector(".theme-toggle__label");
      if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    });
  }
  const initial = getStoredTheme() || (systemPrefersDark() ? "dark" : "light");
  applyTheme(initial);
  function bindToggles() {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next); storeTheme(next);
      });
    });
  }
  function enhanceCodeBlocks() {
    document.querySelectorAll(".code-block").forEach((block) => {
      if (block.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        const codeEl = block.querySelector("code, pre");
        const text = codeEl ? codeEl.innerText : block.innerText;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied!"; btn.dataset.copied = "true";
        } catch (_) {
          const ta = document.createElement("textarea");
          ta.value = text; ta.style.position = "fixed"; ta.style.top = "-1000px";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); btn.textContent = "Copied!"; btn.dataset.copied = "true"; }
          catch (_e) { btn.textContent = "Press ⌘C"; }
          document.body.removeChild(ta);
        }
        setTimeout(() => { btn.textContent = "Copy"; btn.removeAttribute("data-copied"); }, 1800);
      });
      block.appendChild(btn);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { bindToggles(); enhanceCodeBlocks(); });
  } else { bindToggles(); enhanceCodeBlocks(); }
  window.InfraUpskill = window.InfraUpskill || {};
  window.InfraUpskill.enhanceCodeBlocks = enhanceCodeBlocks;
  window.InfraUpskill.applyTheme = applyTheme;
})();
