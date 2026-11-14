/* =========================================================
   MAIN — 스테이지 전환 / 장식 / 초기화
   ========================================================= */
(function () {
  const PX = window.PX, CFG = window.SITE_CONFIG;
  const GAME_HELP = {
    runner: { t: "1 · JUMP RUN", d: "시작 전 ←→로 산타·오리온을 골라요. 블록을 넘으며 끝까지 달리면 상대가 기다리고 있어요. A를 길게 누르면 더 높이, 공중에서 ↓를 누르면 빨리 내려와요." },
    catch: { t: "2 · SWEET CATCH", d: "60초 동안 핫초코와 케이크(+10), 하트(+30)를 받아요. 산타가 못 마시는 쓴 커피와 산타가 태운 토스트는 피하세요! 목숨 3개로 버티면 엔딩." },
    stack: { t: "3 · CAKE STACK", d: "움직이는 케이크 층을 A로 떨어뜨려 15층 웨딩 케이크를 완성해요. PERFECT 3연속이면 층이 다시 넓어져요." },
    brick: { t: "4 · BRICK BREAK", d: "←→로 받침대, A로 발사. 하트 → 1 → 격자 → 마지막 판까지 4판을 모두 깨면 엔딩이에요." }
  };


  let cur = 1;
  PX.goStage = function (n) {
    cur = n;
    PX.$$(".stage").forEach((s) => s.classList.toggle("is-active", +s.dataset.stage === n));
    PX.$$(".stage-tab").forEach((b) => {
      const on = +b.dataset.go === n;
      b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on);
      if (+b.dataset.go < n) b.classList.add("is-cleared");
    });
    n === 1 ? PX.intro.show() : PX.intro.hide();
    n === 5 ? PX.bottle.show() : PX.bottle.hide();
    PX.games.setActive(n === 2);
    if (n === 4) PX.polaroid.render();
    PX.ui.colorPicker.close();
    PX.sfx("select");
    const app = PX.$(".px-app"), top = app.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top: top - 8, behavior: "smooth" });
    try { const fe = window.frameElement; if (fe && fe.getBoundingClientRect().top < 0) fe.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
  };

  function decorate() {
    const app = PX.$(".px-app");
    const L = ["################", "################", "###..######..###", "################", ".##############.", "..############..", "....########....", "......####......"];
    const c = document.createElement("canvas"); c.width = 16; c.height = L.length;
    const x = c.getContext("2d"); x.fillStyle = "#ffffff";
    L.forEach((r, j) => r.split("").forEach((ch, i) => ch === "#" && x.fillRect(i, j, 1, 1)));
    app.style.setProperty("--lace", `url(${c.toDataURL()})`);
    const icon = (rows, col) => { const k = document.createElement("canvas"); k.width = 5; k.height = 5; const kx = k.getContext("2d"); kx.fillStyle = col; rows.forEach((r, j) => r.split("").forEach((ch, i) => ch === "#" && kx.fillRect(i, j, 1, 1))); return k.toDataURL(); };
    const SPARK = ["..#..", "..#..", "#####", "..#..", "..#.."], HRT = [".#.#.", "#####", "#####", ".###.", "..#.."];
    const imgs = [icon(SPARK, "#ffffff"), icon(HRT, "#f08cb0"), icon(SPARK, "#f6b4cb"), icon(HRT, "#ffffff")];
    const spots = [[2, 12], [97, 8], [1, 34], [98, 28], [2, 58], [97, 52], [1, 82], [98, 76], [50, 1], [30, 99], [72, 98], [98, 95]];
    const d = PX.$(".decor");
    spots.forEach(([l, t], i) => { const e = document.createElement("i"); e.style.cssText = `left:${l}%;top:${t}%;background-image:url(${imgs[i % 4]});animation-delay:${(i * 0.37) % 2}s`; if (i % 3 === 0) e.classList.add("big"); d.appendChild(e); });
    // 마퀴
    const mq = PX.$(".marquee span");
    const unit = `SANTA ♥ ORION · 1ST ANNIVERSARY · 2025.11.28 — 2026.11.28 · DAY ${PX.daysSinceStart()} · SANRION SAVE FILE · `;
    mq.textContent = unit.repeat(6);
  }

  /* iframe에 넣었을 때 높이 자동 맞춤 (스크롤바 없이) */
  function autoHeight() {
    if (window.parent === window) return;
    const send = () => {
      const h = Math.ceil(PX.$(".px-app").getBoundingClientRect().height);
      try { if (window.frameElement) window.frameElement.style.height = h + "px"; } catch (e) {}
      try { window.parent.postMessage({ sanrionHeight: h }, "*"); } catch (e) {}
    };
    try { new ResizeObserver(send).observe(PX.$(".px-app")); } catch (e) { setInterval(send, 1000); }
    send();
  }

  function init() {
    decorate();
    PX.$$("[data-site-name]").forEach((e) => (e.textContent = CFG.siteNameKo));
    PX.$$("[data-console-label]").forEach((e) => (e.textContent = CFG.consoleLabel));
    PX.$$(".stage-tab").forEach((b) => b.addEventListener("click", () => PX.goStage(+b.dataset.go)));
    PX.$$("[data-next]").forEach((b) => b.addEventListener("click", () => PX.goStage(+b.dataset.next)));
    // BGM
    const bgmBtn = PX.$(".bgm-btn"), bgmTitle = PX.$(".bgm-title");
    const paintBgm = () => { const on = PX.music.isPlaying(); bgmBtn.classList.toggle("is-on", on); bgmTitle.textContent = on ? PX.music.title() : "BGM OFF"; };
    PX.music.onChange(paintBgm); paintBgm();
    bgmBtn.addEventListener("click", () => { PX.music.setEnabled(!PX.music.isPlaying()); paintBgm(); });
    PX.$(".bgm-next").addEventListener("click", () => { if (!PX.music.isPlaying()) PX.music.setEnabled(true); else PX.music.next(); paintBgm(); });
    const snd = PX.$(".sound-btn");
    const paintSnd = () => { snd.classList.toggle("is-off", PX.muted); snd.title = PX.muted ? "소리 켜기" : "소리 끄기"; snd.setAttribute("aria-label", snd.title); };
    snd.addEventListener("click", () => { PX.muted = !PX.muted; PX.store.set("muted", PX.muted); paintSnd(); PX.unlockAudio(); PX.sfx("blip"); });
    paintSnd();

    PX.intro.prepare();
    PX.maker.mount(PX.$(".maker"));
    PX.intro.mount(PX.$('.stage[data-stage="1"]'));
    PX.games.mount(PX.$(".handheld"));
    PX.polaroid.mount(PX.$(".pola"));
    PX.bottle.mount(PX.$('.stage[data-stage="5"]'));

    const help = PX.$(".game-help");
    const setHelp = (id) => { const h = GAME_HELP[id]; if (h) { PX.$("b", help).textContent = h.t; PX.$("p", help).textContent = h.d; } };
    PX.games.onSelect(setHelp); setHelp("runner");

    autoHeight();
    PX.intro.show();
    const shelf = PX.$(".awards"); PX.cert.renderShelf(shelf); PX.cert.onChange(() => PX.cert.renderShelf(shelf));
    PX.entryIntro(PX.$(".intro"), () => { PX.intro.start(); PX.music.startIfEnabled(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
