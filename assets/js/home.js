/* Homepage tile renderer. Source of truth: inline <script id="sessions-data">. */
(function () {
  "use strict";
  const TILE_CONTAINER_ID = "tile-grid";
  const INLINE_DATA_ID = "sessions-data";
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch];
    });
  }
  function thumbnailSVG(seed, label) {
    const palettes = [
      ["#1d4ed8","#0ea5e9","#ff9900"],["#7c3aed","#ec4899","#f59e0b"],
      ["#059669","#0891b2","#3b82f6"],["#dc2626","#f97316","#facc15"],
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    const p = palettes[hash % palettes.length];
    const text = (label && String(label).trim()) ||
      seed.split("-").map((w) => w[0]).slice(0,3).join("").toUpperCase();
    const fontSize = text.length <= 3 ? 56 : text.length <= 5 ? 44 : text.length <= 7 ? 36 : 28;
    return '<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      escapeHTML(seed) + ' artwork">' +
      '<defs><linearGradient id="g-' + seed + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="' + p[0] + '"/>' +
        '<stop offset="0.6" stop-color="' + p[1] + '"/>' +
        '<stop offset="1" stop-color="' + p[2] + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="320" height="180" fill="url(#g-' + seed + ')"/>' +
      '<g opacity="0.18" fill="#ffffff"><circle cx="40" cy="40" r="60"/><circle cx="280" cy="140" r="80"/></g>' +
      '<text x="24" y="150" font-family="-apple-system,system-ui,sans-serif" font-size="' + fontSize +
      '" font-weight="800" fill="#ffffff" opacity="0.95">' + escapeHTML(text) + '</text></svg>';
  }
  function renderTile(s) {
    const tags = (s.tags || []).map((t) => '<span class="tag">' + escapeHTML(t) + "</span>").join("");
    return '<a class="tile" href="' + escapeHTML(s.path) + '" aria-label="Open session: ' + escapeHTML(s.title) + '">' +
      '<div class="tile__thumb">' + thumbnailSVG(s.id, s.logo) + '</div>' +
      '<div class="tile__body">' +
        '<h3 class="tile__title">' + escapeHTML(s.title) + '</h3>' +
        '<p class="tile__summary">' + escapeHTML(s.summary) + '</p>' +
        '<div class="tile__meta">' +
          (s.level ? '<span><span class="tag">' + escapeHTML(s.level) + '</span></span>' : "") +
          (s.duration ? '<span>⏱ ' + escapeHTML(s.duration) + '</span>' : "") +
          (s.updated ? '<span>📅 ' + escapeHTML(s.updated) + '</span>' : "") +
        '</div>' +
        '<div class="tile__tags">' + tags + '</div>' +
        '<span class="tile__cta">Open session</span>' +
      '</div></a>';
  }
  function render(sessions) {
    const root = document.getElementById(TILE_CONTAINER_ID);
    if (!root) return;
    if (!Array.isArray(sessions) || sessions.length === 0) {
      root.innerHTML = '<div class="empty">No sessions yet.</div>'; return;
    }
    root.innerHTML = sessions.map(renderTile).join("");
  }
  function readInline() {
    const tag = document.getElementById(INLINE_DATA_ID);
    if (!tag) return [];
    try { return JSON.parse(tag.textContent); } catch (e) { return []; }
  }
  async function load() {
    const inline = readInline(); render(inline);
    if (location.protocol === "http:" || location.protocol === "https:") {
      try {
        const res = await fetch("./sessions/sessions.json", {cache:"no-cache"});
        if (res.ok) { const data = await res.json(); if (Array.isArray(data) && data.length) render(data); }
      } catch (_e) { /* keep inline */ }
    }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", load); }
  else { load(); }
})();
