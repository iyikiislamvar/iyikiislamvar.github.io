/* ==========================================================================
   filter.js — sureler.html / konular.html içindeki kategori çipleri
   Tamamen statik: hiçbir veri çekmez, sadece sayfadaki .teaser-card
   elemanlarını data-cat özniteliğine göre gösterir/gizler.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const filterRow = document.querySelector("#filter-row");
  const grid = document.querySelector("#list-grid");
  if (!filterRow || !grid) return;

  const chips = filterRow.querySelectorAll(".filter-chip");
  const cards = grid.querySelectorAll("[data-cat]");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const val = chip.dataset.val;
      cards.forEach((card) => {
        const show = val === "Tümü" || card.dataset.cat === val;
        card.style.display = show ? "" : "none";
      });
    });
  });
});
