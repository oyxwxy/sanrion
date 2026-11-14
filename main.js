/* =========================================================
   MAIN — 스테이지 전환 / 장식 / 초기화
   ========================================================= */
(function () {
  const PX = window.PX, CFG = window.SITE_CONFIG;
  const GAME_HELP = {
    runner: { t: "1 · JUMP RUN", d: "블록을 뛰어넘으며 멀리 달려요. 시작 전 ←→로 산타·오리온을 고를 수 있어요. A를 길게 누르면 더 높이, 공중에서 ↓를 누르면 빨리 내려와요." },
    catch: { t: "2 · SWEET CATCH", d: "둘 다 좋아하는 민트초코와 핫초코를 받아요(+10), 하트는 +30. 오리온이 못 먹는 매운 고추와 산타가 태운 토스트는 피하세요! A를 누르고 있으면 빨리 움직여요." },
    stack: { t: "3 · CAKE STACK", d: "좌우로 움직이는 케이크 층을 A로 떨어뜨려 쌓아요. PERFECT를 3번 이어서 내면 층이 다시 넓어져요. 끝나면 꼭대기에 하트 토퍼가 꽂혀요." },
    brick: { t: "4 · BRICK BREAK", d: "←→로 받침대를 움직이고 A로 공을 발사해요. 받침대 끝에 맞을수록 공이 크게 꺾여요. 하트 → 1 → 격자 순서로 판이 바뀌어요." }
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

  function init() {
    decorate();
    PX.$$("[data-site-name]").forEach((e) => (e.textContent = CFG.siteNameKo));
    PX.$$("[data-console-label]").forEach((e) => (e.textContent = CFG.consoleLabel));
    PX.$$(".stage-tab").forEach((b) => b.addEventListener("click", () => PX.goStage(+b.dataset.go)));
    PX.$$("[data-next]").forEach((b) => b.addEventListener("click", () => PX.goStage(+b.dataset.next)));
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

    PX.intro.show();
    PX.entryIntro(PX.$(".intro"), () => PX.intro.start());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
