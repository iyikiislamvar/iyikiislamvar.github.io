/* ==========================================================================
   app-shared.js — tüm sayfalarda ortak kullanılan yardımcılar
   KAYNAK DOSYA: generate.py bu dosyayı okuyup her HTML sayfasının içine
   satır içi (inline) script olarak GÖMER — harici dosya olarak yüklenmez.
   Bunu iki sebeple yapıyoruz: (1) bazı önizleme/uygulama-içi tarayıcılar
   harici .js dosyalarının yolunu çözemiyor, (2) sayfa sürüklenip çift
   tıklanarak (file://) açıldığında bile hiçbir ek istek olmadan çalışsın.
   Bu dosya sadece iki şeyden sorumludur:
     1) Karanlık / aydınlık mod
     2) Arama kutusu — arama KAYNAĞI window.SEARCH_INDEX değişkenidir;
        bu değişken generate.py tarafından data/sureler.json +
        data/konular.json içeriğinden üretilip her sayfanın en başına
        yazılır. Yeni içerik eklerken JSON dosyalarını güncelledikten
        sonra generate.py'yi tekrar çalıştırman (ya da benden istemen)
        yeterlidir — tüm sayfalar otomatik yeniden üretilir.
   ========================================================================== */

/* ---------------- Karanlık / Aydınlık Mod ---------------- */
(function initTheme() {
  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* depolama kapalıysa sessizce geç */ }
  }

  let prefersDark = false;
  try { prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) {}

  const saved = safeGet("site-theme");
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  function bind() {
    const btns = document.querySelectorAll(".theme-toggle");
    updateThemeIcons();
    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        safeSet("site-theme", next);
        updateThemeIcons();
      });
    });
  }

  function updateThemeIcons() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".theme-toggle .icon-sun").forEach((el) => (el.style.display = isDark ? "block" : "none"));
    document.querySelectorAll(".theme-toggle .icon-moon").forEach((el) => (el.style.display = isDark ? "none" : "block"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind(); // DOM zaten hazırsa hemen bağla
  }
})();

/* ==========================================================================
   ARAMA — window.SEARCH_INDEX değişkeni data/search-data.js dosyasından gelir.
   ========================================================================== */
function recordMatches(record, query) {
  const q = query.toLocaleLowerCase("tr");
  function walk(val) {
    if (val == null) return false;
    if (typeof val === "string" || typeof val === "number") {
      return String(val).toLocaleLowerCase("tr").includes(q);
    }
    if (Array.isArray(val)) return val.some(walk);
    if (typeof val === "object") {
      return Object.entries(val).some(([k, v]) => k.toLocaleLowerCase("tr").includes(q) || walk(v));
    }
    return false;
  }
  return walk(record);
}

function runSearch(query) {
  if (!query || query.trim().length < 1) return [];
  const idx = window.SEARCH_INDEX || { sureler: [], konular: [] };
  const sureResults = (idx.sureler || [])
    .filter((s) => recordMatches(s, query))
    .map((s) => ({ type: "sure", url: `/sureler/${s.id}/${s.id}.html`, title: s.isim, meta: `Sure • ${s.anlam}` }));
  const konuResults = (idx.konular || [])
    .filter((k) => recordMatches(k, query))
    .map((k) => ({ type: "konu", url: `/konular/${k.id}/${k.id}.html`, title: k.baslik, meta: `Konu • ${k.kategori}` }));
  return [...sureResults, ...konuResults].slice(0, 20);
}

function renderSearchResults(results, container) {
  if (!results.length) {
    container.innerHTML = `<div class="search-empty">Sonuç bulunamadı.</div>`;
    return;
  }
  container.innerHTML = results
    .map(
      (r) => `<a class="search-result-item" data-type="${r.type}" href="${r.url}">
        <span class="search-result-tag">${r.type === "sure" ? "Sure" : "Konu"}</span>
        <span>
          <div class="search-result-title">${r.title}</div>
          <div class="search-result-meta">${r.meta}</div>
        </span>
      </a>`
    )
    .join("");
}

function bindSearchInput() {
  const input = document.querySelector(".search-input");
  const resultsBox = document.querySelector(".search-results");
  if (!input || !resultsBox) return;

  let debounceId;
  input.addEventListener("input", () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      const q = input.value.trim();
      if (!q) {
        resultsBox.innerHTML = `<div class="search-empty">Sure adı, meal metni ya da konu başlığı yazmaya başlayın…</div>`;
        return;
      }
      if (!window.SEARCH_INDEX) {
        resultsBox.innerHTML = `<div class="search-empty">Arama verisi bulunamadı — data/search-data.js dosyasının sayfaya yüklendiğinden emin olun.</div>`;
        return;
      }
      const results = runSearch(q);
      renderSearchResults(results, resultsBox);
    }, 120);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindSearchInput);
} else {
  bindSearchInput();
}
