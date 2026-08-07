/* ==========================================================================
   nav.js — sticky navbar davranışı
   - Aşağı kaydırınca navbar smooth şekilde gizlenir
   - Yukarı kaydırınca ya da herhangi bir tıklamada smooth geri gelir
   - Mobil hamburger menü aç/kapat
   - Arama panelini aç/kapat (arama mantığı app-shared.js içinde)
   ========================================================================== */
(function () {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  /* ---------------- Scroll ile gizle / göster ---------------- */
  let lastY = window.scrollY;
  let ticking = false;
  const SHOW_THRESHOLD = 4; // küçük titremeleri yok say
  const HIDE_AFTER = 40; // navbar sadece bu kadar aşağı kaydırıldıktan sonra gizlensin

  function onScroll() {
    const y = window.scrollY;
    const diff = y - lastY;

    topbar.classList.toggle("nav-elevated", y > 4);

    if (Math.abs(diff) > SHOW_THRESHOLD) {
      if (diff > 0 && y > HIDE_AFTER) {
        // aşağı kaydırılıyor -> gizle
        topbar.classList.add("nav-hidden");
        closeSearchPanel();
      } else {
        // yukarı kaydırılıyor -> göster
        topbar.classList.remove("nav-hidden");
      }
      lastY = y;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Herhangi bir tıklamada navbar'ı geri getir (smooth)
  document.addEventListener("click", () => {
    topbar.classList.remove("nav-hidden");
  });

  /* ---------------- Mobil hamburger menü ---------------- */
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileClose = document.querySelector(".mobile-menu-close");

  function openMobileMenu() {
    mobileMenu.classList.add("open");
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.contains("open") ? closeMobileMenu() : openMobileMenu();
    });
    if (mobileClose) mobileClose.addEventListener("click", closeMobileMenu);
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileMenu));
  }

  /* ---------------- Arama paneli ---------------- */
  const searchBtn = document.querySelector(".nav-search-btn");
  const searchPanel = document.querySelector(".search-panel");
  const searchClose = document.querySelector(".search-close");
  const searchInput = document.querySelector(".search-input");

  window.closeSearchPanel = function () {
    if (!searchPanel) return;
    searchPanel.classList.remove("open");
    if (searchBtn) searchBtn.classList.remove("active");
  };

  function openSearchPanel() {
    searchPanel.classList.add("open");
    if (searchBtn) searchBtn.classList.add("active");
    setTimeout(function () { if (searchInput) searchInput.focus(); }, 200);
  }

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchPanel.classList.contains("open") ? closeSearchPanel() : openSearchPanel();
    });
    searchPanel.addEventListener("click", (e) => e.stopPropagation());
    if (searchClose) searchClose.addEventListener("click", closeSearchPanel);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearchPanel();
    });
  }
})();
