/* ==========================================================================
   MP3 PLAYER JS — kendi kendine yeterli (self-contained), harici dosyaya
   bağımlı değil. Bu bloğu ilgili sure sayfasındaki mevcut inline <script>
   bloğunun (site motorunun) ALTINA, ayrı bir <script> etiketi olarak ekle.
   Sayfada birden fazla .audio-player varsa hepsini otomatik bulur ve
   biri çalınca diğerlerini otomatik durdurur.
   ========================================================================== */
   (function () {
    function formatTime(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ":" + (s < 10 ? "0" : "") + s;
    }
  
    var players = document.querySelectorAll("[data-audio-player]");
  
    players.forEach(function (root) {
      var audio = root.querySelector(".audio-player-el");
      var playBtn = root.querySelector(".audio-player-playbtn");
      var seek = root.querySelector(".audio-player-seek");
      var curEl = root.querySelector(".audio-player-current");
      var durEl = root.querySelector(".audio-player-duration");
      var volBtn = root.querySelector(".audio-player-volbtn");
      var volSlider = root.querySelector(".audio-player-volume");
      var speedBtn = root.querySelector(".audio-player-speedbtn");
      if (!audio) return;
  
      var speeds = [1, 1.25, 1.5, 0.75];
      var speedIndex = 0;
  
      function paintRange(el, pct) {
        el.style.background =
          "linear-gradient(to right, var(--c-green) " + pct + "%, var(--c-line-strong) " + pct + "%)";
      }
      paintRange(seek, 0);
      if (volSlider) paintRange(volSlider, 100);
  
      function setPlaying(isPlaying) {
        root.classList.toggle("is-playing", isPlaying);
      }
  
      // "loadedmetadata" olayı, tarayıcı sesi çok hızlı önbelleğe aldığında
      // (örn. yerel sunucu/aynı ağ) bu script çalışmadan ÖNCE tetiklenmiş
      // olabilir — bu yüzden hem olayı dinliyoruz hem de mevcut durumu
      // hemen kontrol ediyoruz (readyState zaten yeterliyse anında yazıyoruz).
      function syncDuration() {
        if (audio.duration && isFinite(audio.duration)) {
          durEl.textContent = formatTime(audio.duration);
          seek.max = String(audio.duration);
        }
      }
      audio.addEventListener("loadedmetadata", syncDuration);
      syncDuration();
  
      function syncCurrentTime() {
        curEl.textContent = formatTime(audio.currentTime);
        var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        seek.value = String(audio.currentTime);
        paintRange(seek, pct);
      }
      syncCurrentTime();
  
      playBtn.addEventListener("click", function () {
        if (audio.paused) {
          // Sayfadaki diğer tüm çalarları durdur
          document.querySelectorAll(".audio-player-el").forEach(function (a) {
            if (a !== audio) a.pause();
          });
          audio.play().catch(function () {
            /* tarayıcı otomatik oynatmayı engellemiş olabilir, sessizce geç */
          });
        } else {
          audio.pause();
        }
      });
  
      audio.addEventListener("play", function () { setPlaying(true); });
      audio.addEventListener("pause", function () { setPlaying(false); });
      audio.addEventListener("ended", function () { setPlaying(false); });
      audio.addEventListener("timeupdate", syncCurrentTime);
  
      seek.addEventListener("input", function () {
        var val = parseFloat(seek.value);
        audio.currentTime = val;
        var pct = audio.duration ? (val / audio.duration) * 100 : 0;
        paintRange(seek, pct);
      });
  
      if (volSlider) {
        volSlider.addEventListener("input", function () {
          var v = parseFloat(volSlider.value);
          audio.volume = v;
          audio.muted = v === 0;
          root.classList.toggle("is-muted", v === 0);
          paintRange(volSlider, v * 100);
        });
      }
  
      if (volBtn) {
        volBtn.addEventListener("click", function () {
          audio.muted = !audio.muted;
          root.classList.toggle("is-muted", audio.muted);
          if (volSlider) {
            volSlider.value = audio.muted ? "0" : String(audio.volume || 1);
            paintRange(volSlider, (audio.muted ? 0 : (audio.volume || 1)) * 100);
          }
        });
      }
  
      if (speedBtn) {
        speedBtn.addEventListener("click", function () {
          speedIndex = (speedIndex + 1) % speeds.length;
          audio.playbackRate = speeds[speedIndex];
          speedBtn.textContent = speeds[speedIndex] + "x";
        });
      }
    });
  })();
  
  /* ==========================================================================
     Konum takibi: sayfa henüz player'ın olduğu yere ulaşmadıysa (yani player
     normalde bulunacağı konuma göre hâlâ aşağıdaysa) player ekranın altına
     sabitlenir. Kullanıcı kaydırarak o noktaya ulaşıp geçtiğinde player
     kendi doğal yerine oturur ve orada kalır. Yukarı geri kaydırılırsa
     tekrar sabitlenir (tamamen kaydırma konumuna bağlı, tek yönlü değil).
     HTML'de .audio-player'dan hemen önce boş bir
     <div class="audio-player-anchor" data-audio-player-anchor></div>
     bulunmalı — bu, player'ın "doğal" konumunu işaretler.
     ========================================================================== */
  (function () {
    var anchor = document.querySelector("[data-audio-player-anchor]");
    var player = document.querySelector(".audio-player");
    if (!anchor || !player) return;
  
    var ticking = false;
    function update() {
      var rect = anchor.getBoundingClientRect();
      var barHeight = player.offsetHeight || 78;
      var reached = rect.top <= window.innerHeight - barHeight; // player bu noktada zaten dokunacak mı
      player.classList.toggle("is-fixed", !reached);
      document.body.classList.toggle("has-fixed-audio-player", !reached);
      ticking = false;
    }
    update();
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
  })();