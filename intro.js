/* =========================================================
   ENTRY INTRO + STAGE 1 — 입장 인트로 / 커플 씬 / 프로필 / 소개서
   ========================================================= */
(function () {
  const PX = window.PX, CFG = window.SITE_CONFIG;
  const RED = "#c8323f", GREEN = "#1f8f63", PINK = "#e0578a", INK = "#3a1d2e";
  let grids = [];

  /* =====================================================
     입장 인트로 (겨울 → 봄)
     ===================================================== */
  PX.entryIntro = function (overlay, onDone) {
    const cv = PX.$(".intro-cv", overlay), x = cv.getContext("2d");
    const W = 256, H = 144, GY = 118;
    let t = 0, g = 0, gate = true, done = false, raf, blocks = 0;
    const flakes = Array.from({ length: 70 }, () => ({ x: PX.rand(0, W), y: PX.rand(-H, H), vy: PX.rand(0.25, 0.7), o: PX.rand(0, 100), s: PX.pick([1, 1, 2]) }));
    const lerp = (a, b, k) => PX.rgbToHex(...PX.hexToRgb(a).map((v, i) => v + (PX.hexToRgb(b)[i] - v) * k));
    const [p1, p2] = CFG.players;
    const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
    function heart(cx, cy, s, c) { x.fillStyle = c; HEART.forEach((r, j) => r.split("").forEach((ch, i) => ch === "#" && x.fillRect(cx + i * s, cy + j * s, s, s))); }

    // 아래쪽 플레이어 카드
    const cards = PX.$(".iu-cards", overlay);
    CFG.players.forEach((p, k) => {
      const c = document.createElement("div"); c.className = "iu-card"; c.style.setProperty("--pc", p.color);
      const av = document.createElement("canvas"); av.width = av.height = 32;
      const ax = av.getContext("2d"); PX.maker.drawBg(ax, PX.maker.presetState(p.preset), 32, 1); PX.maker.drawGrid(ax, grids[k], 0, 0, 1);
      c.appendChild(av);
      const info = document.createElement("div"); info.innerHTML = `<span class="iu-slot"></span><b></b><small></small>`;
      info.querySelector(".iu-slot").textContent = p.slot; info.querySelector("b").textContent = p.code; info.querySelector("small").textContent = p.codeKo + " · " + p.name;
      c.appendChild(info); cards.appendChild(c);
      if (k === 0) { const v = document.createElement("div"); v.className = "iu-vs"; v.innerHTML = `<i class="hrt"></i><b>DAY ${PX.daysSinceStart()}</b><small>SINCE 2025.11.28</small>`; cards.appendChild(v); }
    });
    const sbtn = PX.$(".iu-sound", overlay);
    const paintS = () => { const on = !PX.muted && PX.music.enabled(); sbtn.classList.toggle("off", !on); sbtn.querySelector("span").textContent = on ? "소리 ON" : "소리 OFF"; };
    sbtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = !(!PX.muted && PX.music.enabled());
      PX.muted = !on; PX.store.set("muted", PX.muted); PX.unlockAudio();
      PX.music.setEnabled(on);
      paintS(); PX.sfx("blip");
    });
    paintS();

    function drawWinter(k, tt) {
      const top = lerp("#2a2340", "#f9c6da", k), bot = lerp("#5b4f7a", "#fde8f0", k);
      for (let yy = 0; yy < GY; yy += 4) { x.fillStyle = lerp(top, bot, yy / GY); x.fillRect(0, yy, W, 4); }
      if (k < 1) { x.globalAlpha = 1 - k; [[20, 14], [60, 30], [110, 10], [170, 24], [220, 16], [240, 40], [90, 44], [30, 60]].forEach(([sx, sy], i) => { if ((tt + i * 13) % 50 > 10) { x.fillStyle = "#fff"; x.fillRect(sx, sy, 1, 1); } }); x.globalAlpha = 1; }
      const sunY = Math.round(GY + 20 - k * 50);
      x.fillStyle = lerp("#5b4f7a", "#ffe1a8", k);
      for (let r = 18; r > 0; r -= 2) { const w = Math.round(Math.sqrt(18 * 18 - r * r) * 2); x.fillRect(W / 2 - w / 2, sunY - r, w, 2); }
      for (let xx = 0; xx < W; xx++) {
        const h1 = Math.round(16 + 6 * Math.sin(xx / 22) + 3 * Math.sin(xx / 7)); x.fillStyle = lerp("#463d63", "#f4bfd3", k); x.fillRect(xx, GY - h1, 1, h1);
        const h2 = Math.round(8 + 4 * Math.sin(xx / 13 + 2)); x.fillStyle = lerp("#5f5584", "#eda2bf", k); x.fillRect(xx, GY - h2, 1, h2);
      }
      x.fillStyle = lerp("#e8ecf6", PINK, k); x.fillRect(0, GY, W, 2);
      for (let yy = GY + 2; yy < H; yy += 4) for (let xx = 0; xx < W; xx += 4) { x.fillStyle = (((xx + yy) / 4) | 0) % 2 ? lerp("#ffffff", "#fff4f8", k) : lerp("#d9deec", "#f7d4e2", k); x.fillRect(xx, yy, 4, 4); }
    }
    function snow(k, tt) {
      flakes.forEach((f) => {
        f.y += f.vy; f.x += Math.sin((tt + f.o) / 24) * 0.35;
        if (f.y > GY) { f.y = -4; f.x = PX.rand(0, W); }
        x.fillStyle = k < 0.5 ? (f.o > 50 ? "#ffffff" : "#e3e9f8") : (f.o > 70 ? "#f28fb3" : f.o > 50 ? "#f8bfd3" : "#ffffff");
        x.fillRect(Math.round(f.x), Math.round(f.y), f.s + (k > 0.5 ? 1 : 0), f.s);
      });
    }
    function frame() {
      if (gate) {
        g++;
        drawWinter(0, g); snow(0, g);
        PX.text(x, CFG.siteName, W / 2, 34, "#ffffff", 3, "center");
        PX.text(x, "SANTA * ORION", W / 2, 58, "#f8bfd3", 1, "center");
        if (Math.floor(g / 30) % 2 === 0) { x.fillStyle = "#3a1d2e"; x.fillRect(W / 2 - 46, 76, 92, 15); PX.text(x, "PRESS START", W / 2, 81, "#ffffff", 1, "center"); }
        PX.text(x, "SOUND ON  *  CLICK", W / 2, 128, "#8a83a8", 1, "center");
      } else {
        t++;
        if (t <= 95) {
          x.fillStyle = INK; x.fillRect(0, 0, W, H);
          for (let yy = 0; yy < H; yy += 6) for (let xx = (yy / 6) % 2 ? 3 : 0; xx < W; xx += 6) { x.fillStyle = "#4a2639"; x.fillRect(xx, yy, 1, 1); }
          PX.text(x, "LOADING SAVE DATA", W / 2, 52, "#f8bfd3", 1, "center");
          PX.text(x, CFG.siteName, W / 2, 62, "#ffffff", 2, "center");
          x.fillStyle = "#f8bfd3"; x.fillRect(68, 82, 120, 10); x.fillStyle = INK; x.fillRect(70, 84, 116, 6);
          const n = Math.min(14, Math.floor(t / 6));
          if (n > blocks) { blocks = n; PX.sfx("blip"); }
          for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? PINK : "#f28fb3"; x.fillRect(72 + i * 8, 85, 7, 4); }
          PX.text(x, Math.min(100, Math.floor((t / 84) * 100)) + "%", W / 2, 98, "#b07c93", 1, "center");
          if (t === 95) PX.sfx("boot");
        } else {
          const k = PX.clamp((t - 200) / 120, 0, 1);
          drawWinter(k, t);
          const walk = PX.clamp((t - 110) / 140, 0, 1), ease = 1 - Math.pow(1 - walk, 2);
          const sx = Math.round(-36 + (W / 2 - 46 + 36) * ease), ox = Math.round(W + 4 - (W + 4 - (W / 2 + 14)) * ease);
          if (walk > 0 && walk < 1 && t % 14 === 0) PX.sfx("step");
          const bob = (o) => (walk < 1 ? Math.floor((t + o) / 8) % 2 : Math.floor((t + o) / 30) % 2);
          x.fillStyle = lerp("#c3c9dc", "#e8a6c0", k); x.fillRect(sx + 10, GY, 12, 1); x.fillRect(ox + 10, GY, 12, 1);
          if (grids[0]) PX.maker.drawGrid(x, grids[0], sx, GY - 31 + bob(0), 1);
          if (grids[1]) PX.maker.drawGrid(x, grids[1], ox, GY - 31 + bob(4), 1);
          snow(k, t);
          if (t === 230) PX.sfx("twinkle");
          if (t > 262) {
            const hp = Math.min(1, (t - 262) / 18), s = hp < 1 ? 1 + Math.round(hp * 2) : 2;
            heart(W / 2 - (7 * s) / 2, GY - 52 - Math.round(hp * 6), s, PINK);
            if (t === 263) PX.sfx("perfect");
            if (t < 300) for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, d = (t - 262) * 1.2; x.fillStyle = i % 2 ? "#fff" : "#f28fb3"; x.fillRect(Math.round(W / 2 + Math.cos(a) * d), Math.round(GY - 46 + Math.sin(a) * d), 2, 2); }
          }
          if (walk >= 1) {
            const tg = (tx, label, bg) => { const w = PX.textWidth(label) + 6, lx = Math.round(tx - w / 2); x.fillStyle = bg; x.fillRect(lx, GY + 6, w, 9); PX.text(x, label, lx + 3, GY + 8, "#fff"); };
            tg(sx + 16, p1.code, RED); tg(ox + 16, p2.code, GREEN);
          }
          PX.text(x, "2025.11.28", 6, H - 9, lerp("#8a83a8", "#b8486f", k));
          if (t > 300) PX.text(x, "2026.11.28", W - 6, H - 9, "#b8486f", 1, "right");
        }
        if (t === 330) { overlay.classList.add("show-title"); PX.sfx("clear"); }
        if (t === 380) overlay.classList.add("show-start");
      }
      if (!done) raf = requestAnimationFrame(frame);
    }
    frame();
    const begin = () => {
      gate = false; PX.unlockAudio(); overlay.classList.add("started");
      if (!PX.muted && PX.music.enabled() && !PX.music.isPlaying()) PX.music.playTrack(3);
      PX.sfx("select");
    };
    const finish = () => {
      if (done) return;
      if (gate) return begin();
      if (t < 380) { t = Math.max(t, 380); blocks = 14; overlay.classList.add("show-title", "show-start"); return; }
      done = true; PX.sfx("select");
      cancelAnimationFrame(raf); overlay.classList.add("is-off");
      setTimeout(() => { overlay.remove(); onDone && onDone(); }, 500);
      window.removeEventListener("keydown", key);
    };
    const key = (e) => { if (["Enter", "Space", "KeyZ"].includes(e.code)) { e.preventDefault(); finish(); } };
    PX.$(".intro-skip", overlay).addEventListener("click", (e) => { e.stopPropagation(); if (gate) begin(); t = Math.max(t, 380); overlay.classList.add("show-title", "show-start"); });
    overlay.addEventListener("click", finish);
    window.addEventListener("keydown", key);
  };

  /* =====================================================
     STAGE 1 씬
     ===================================================== */
  const C = {
    sky1: "#f9d2e1", sky2: "#fde6ef", cloud: "#ffffff", cloudS: "#f6dbe6", hill1: "#f4bfd3", hill2: "#eda2bf",
    ground: PINK, groundD: "#b83a6b", tile: "#fff4f8", tileD: "#f7d4e2", blk: "#ffffff", blkD: "#f0b6cb", gold: "#d9a441"
  };
  const W = 192, H = 108, GROUND = 84;
  const ONE = [".##.", "###.", ".##.", ".##.", ".##.", "####"];
  const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];
  let sctx, scv, running = false, tick = 0, confetti = [], hop = [-1, -1];
  const block = (x, y) => { sctx.fillStyle = INK; sctx.fillRect(x, y, 8, 8); sctx.fillStyle = C.blk; sctx.fillRect(x + 1, y + 1, 6, 6); sctx.fillStyle = C.blkD; sctx.fillRect(x + 1, y + 6, 6, 1); sctx.fillRect(x + 6, y + 1, 1, 6); sctx.fillStyle = PINK; sctx.fillRect(x + 3, y + 3, 2, 2); };
  const cloud = (x, y) => { sctx.fillStyle = C.cloud; sctx.fillRect(x + 3, y, 8, 2); sctx.fillRect(x + 1, y + 2, 14, 2); sctx.fillRect(x, y + 4, 18, 3); sctx.fillStyle = C.cloudS; sctx.fillRect(x + 1, y + 6, 16, 1); };
  function heart(x, y, c, outline) {
    if (outline) HEART.forEach((r, j) => r.split("").forEach((ch, i) => { if (ch === "#") { sctx.fillStyle = outline; sctx.fillRect(x + i - 1, y + j, 3, 1); sctx.fillRect(x + i, y + j - 1, 1, 3); } }));
    HEART.forEach((r, j) => r.split("").forEach((ch, i) => { if (ch === "#") { sctx.fillStyle = c; sctx.fillRect(x + i, y + j, 1, 1); } }));
    sctx.fillStyle = "#fff"; sctx.fillRect(x + 1, y + 1, 1, 1);
  }
  const sparkle = (x, y, c) => { sctx.fillStyle = c; sctx.fillRect(x, y - 2, 1, 5); sctx.fillRect(x - 2, y, 5, 1); };
  const tag = (x, y, label, bg) => { const w = PX.textWidth(label) + 6; sctx.fillStyle = bg; sctx.fillRect(x, y, w, 9); sctx.fillStyle = "#fff"; sctx.fillRect(x, y + 9, w, 1); PX.text(sctx, label, x + 3, y + 2, "#ffffff"); return w; };
  function drawScene() {
    const t = tick;
    sctx.fillStyle = C.sky1; sctx.fillRect(0, 0, W, H);
    sctx.fillStyle = C.sky2;
    for (let y = 26; y < GROUND; y++) for (let x = y % 2; x < W; x += 2) if (y > 46 || (x + y) % 4 === 0) sctx.fillRect(x, y, 1, 1);
    [[20, 34, 0], [70, 22, 40], [140, 40, 80], [176, 26, 20], [100, 14, 60]].forEach(([x, y, o]) => { if (Math.floor((t + o) / 40) % 3) sparkle(x, y, "#fff"); });
    cloud(((t * 0.08) % (W + 40)) - 30, 22); cloud(((t * 0.05 + 110) % (W + 40)) - 30, 36);
    for (let x = 0; x < W; x++) {
      const h1 = Math.round(14 + 6 * Math.sin((x + t * 0.05) / 18) + 3 * Math.sin(x / 7)); sctx.fillStyle = C.hill1; sctx.fillRect(x, GROUND - h1 - 6, 1, h1 + 6);
      const h2 = Math.round(8 + 4 * Math.sin((x + t * 0.1) / 11 + 2)); sctx.fillStyle = C.hill2; sctx.fillRect(x, GROUND - h2, 1, h2);
    }
    const gy = (x) => 4 + Math.round(6 * Math.sin((x / W) * Math.PI));
    sctx.fillStyle = INK; for (let x = 0; x < W; x++) sctx.fillRect(x, gy(x), 1, 1);
    const flagC = [RED, "#ffffff", GREEN, PINK];
    for (let i = 0; i < 11; i++) { const fx = 6 + i * 17, fy = gy(fx) + 1; sctx.fillStyle = flagC[i % 4]; for (let r = 0; r < 6; r++) sctx.fillRect(fx + Math.floor(r / 2), fy + r, 6 - Math.floor(r / 2) * 2, 1); }
    sctx.fillStyle = C.ground; sctx.fillRect(0, GROUND, W, 2); sctx.fillStyle = C.groundD; sctx.fillRect(0, GROUND + 2, W, 1);
    for (let y = GROUND + 3; y < H; y += 4) for (let x = 0; x < W; x += 4) { sctx.fillStyle = (((x + y) / 4) | 0) % 2 ? C.tile : C.tileD; sctx.fillRect(x, y, 4, 4); }
    const ox = 156, oy = GROUND - ONE.length * 8;
    ONE.forEach((row, j) => row.split("").forEach((c, i) => { if (c === "#") block(ox + i * 8, oy + j * 8); }));
    const pos = [34, 92];
    grids.forEach((g, k) => {
      if (!g) return;
      let jy = 0;
      if (hop[k] >= 0) { hop[k]++; jy = -Math.round(Math.sin((hop[k] / 30) * Math.PI) * 12); if (hop[k] >= 30) hop[k] = -1; }
      else if ((t + k * 130) % 300 === 150) hop[k] = 0;
      const bob = hop[k] < 0 && Math.floor((t + k * 15) / 30) % 2 ? 1 : 0;
      sctx.fillStyle = C.groundD; sctx.fillRect(pos[k] + 10, GROUND, 12, 1);
      PX.maker.drawGrid(sctx, g, pos[k], GROUND - 31 + jy + bob, 1);
    });
    const bx = 70, by = GROUND - 14 + (Math.floor(t / 24) % 2);
    heart(bx, by, RED, INK);
    if (t % 120 < 90) { const fh = (t % 120) / 120; sctx.globalAlpha = 1 - fh; heart(bx + Math.round(Math.sin(t / 10) * 2), by - 10 - Math.round(fh * 30), PINK, null); sctx.globalAlpha = 1; }
    confetti.forEach((p) => { p.y += p.vy; p.x += Math.sin((t + p.o) / 20) * 0.3; if (p.y > GROUND) { p.y = -4; p.x = PX.rand(0, W); } sctx.fillStyle = p.c; sctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h); });
    const [p1, p2] = CFG.players;
    tag(4, H - 13, p1.slot + " " + p1.code, RED);
    const w2 = PX.textWidth(p2.slot + " " + p2.code) + 6; tag(W - 4 - w2, H - 13, p2.slot + " " + p2.code, GREEN);
    PX.text(sctx, "DAY " + PX.daysSinceStart(), W / 2, H - 11, INK, 1, "center");
  }
  function loop() { if (!running) return; tick++; drawScene(); requestAnimationFrame(loop); }

  /* =====================================================
     프로필 카드 + 소개서 모달
     ===================================================== */
  function avatarCanvas(k, size = 32) {
    const p = CFG.players[k], av = document.createElement("canvas");
    av.width = av.height = 32;
    const ax = av.getContext("2d"), st = PX.maker.presetState(p.preset);
    PX.maker.drawBg(ax, st, 32, 1); PX.maker.drawGrid(ax, grids[k], 0, 0, 1);
    return av;
  }
  function openDoc(k) {
    const p = CFG.players[k], d = p.intro;
    const body = document.createElement("div");
    body.className = "doc";
    body.style.setProperty("--pc", p.color);
    body.innerHTML = `
      <header class="doc-head">
        <div class="doc-av"></div>
        <div class="doc-who">
          <span class="profile-slot">${p.slot}</span>
          <b class="doc-code"></b>
          <span class="doc-name"></span>
          <span class="doc-by">WRITTEN BY <em></em></span>
        </div>
      </header>
      <h3 class="doc-title"></h3>
      <section class="doc-sec"><h4>내가 본 성격</h4><div class="doc-pers"></div></section>
      <section class="doc-sec"><h4>대표 키워드</h4><div class="kw-list"></div></section>
      <section class="doc-sec"><h4>소개하는 글</h4><div class="doc-letter"></div></section>
      <nav class="doc-nav"><button type="button" class="px-btn sm ghost doc-other"></button></nav>`;
    body.querySelector(".doc-av").appendChild(avatarCanvas(k));
    body.querySelector(".doc-code").textContent = p.code;
    body.querySelector(".doc-name").textContent = `${p.codeKo} · ${p.name}` + (p.age ? ` · ${p.age}` : "");
    body.querySelector(".doc-by em").textContent = d.by;
    body.querySelector(".doc-title").textContent = d.title;
    d.personality.forEach((t) => { const e = document.createElement("p"); e.textContent = t; body.querySelector(".doc-pers").appendChild(e); });
    d.keywords.forEach((t) => { const e = document.createElement("span"); e.className = "kw"; e.textContent = "#" + t; body.querySelector(".kw-list").appendChild(e); });
    d.toOthers.forEach((t) => { const e = document.createElement("p"); e.textContent = t; body.querySelector(".doc-letter").appendChild(e); });
    const other = 1 - k, op = CFG.players[other];
    body.querySelector(".doc-other").textContent = `${op.codeKo} 소개서 보기 ▶`;
    const m = PX.ui.modal({ title: `${p.code}.TXT — ${d.by.split(" · ")[0]}이(가) 쓴 소개서`, body, cls: "doc-modal" });
    body.querySelector(".doc-other").onclick = () => { m.close(); setTimeout(() => openDoc(other), 120); };
  }
  function buildProfiles(box) {
    CFG.players.forEach((p, k) => {
      const card = document.createElement("article");
      card.className = "profile px-box";
      card.style.setProperty("--pc", p.color);
      card.innerHTML = `
        <div class="profile-top">
          <div class="profile-av-wrap"></div>
          <div class="profile-info">
            <span class="profile-slot"></span><b class="profile-code"></b>
            <dl><dt>코드네임</dt><dd class="pc-ko"></dd><dt>본명</dt><dd class="pc-name"></dd>${p.age ? '<dt>나이</dt><dd class="pc-age"></dd>' : ""}</dl>
          </div>
        </div>
        <blockquote class="profile-quote"></blockquote>
        <div class="kw-list"></div>
        <button type="button" class="px-btn sm profile-open">소개서 열기 <small>by ${p.intro.by.split(" · ")[0]}</small></button>`;
      card.querySelector(".profile-av-wrap").appendChild(avatarCanvas(k));
      card.querySelector(".profile-slot").textContent = p.slot;
      card.querySelector(".profile-code").textContent = p.code;
      card.querySelector(".pc-ko").textContent = p.codeKo;
      card.querySelector(".pc-name").textContent = p.name;
      if (p.age) card.querySelector(".pc-age").textContent = p.age;
      card.querySelector(".profile-quote").textContent = p.intro.title;
      p.intro.keywords.slice(0, 3).forEach((t) => { const e = document.createElement("span"); e.className = "kw"; e.textContent = "#" + t; card.querySelector(".kw-list").appendChild(e); });
      card.querySelector(".profile-open").onclick = () => openDoc(k);
      box.appendChild(card);
      if (k === 0) { const h = document.createElement("i"); h.className = "profile-heart"; h.setAttribute("aria-hidden", "true"); box.appendChild(h); }
    });
  }

  /* =====================================================
     대화창
     ===================================================== */
  let lines = CFG.dialog, li = 0, ci = 0, typingTimer = null, textEl, arrowEl, nextBtn;
  function showLine() {
    clearInterval(typingTimer); ci = 0; textEl.textContent = ""; arrowEl.classList.remove("show");
    const s = lines[li];
    typingTimer = setInterval(() => { ci++; textEl.textContent = s.slice(0, ci); if (ci % 2 === 0 && s[ci - 1] !== " ") PX.sfx("blip"); if (ci >= s.length) finishLine(); }, 36);
    PX.$(".dlg-count").textContent = `${li + 1}/${lines.length}`;
  }
  function finishLine() { clearInterval(typingTimer); typingTimer = null; textEl.textContent = lines[li]; arrowEl.classList.add("show"); if (li === lines.length - 1) nextBtn.classList.add("show"); }
  function advance() { if (typingTimer) return finishLine(); li = (li + 1) % lines.length; showLine(); }

  PX.intro = {
    prepare() { grids = CFG.players.map((p) => PX.maker.composePreset(p.preset)); },
    mount(el) {
      if (!grids.length) this.prepare();
      scv = PX.$(".scene-canvas", el); sctx = scv.getContext("2d");
      textEl = PX.$(".dlg-text", el); arrowEl = PX.$(".dlg-arrow", el); nextBtn = PX.$(".dlg-next", el);
      PX.$(".dlg-speaker", el).textContent = CFG.speaker;
      for (let i = 0; i < 26; i++) confetti.push({ x: PX.rand(0, W), y: PX.rand(-H, GROUND), vy: PX.rand(0.15, 0.4), o: PX.rand(0, 100), w: PX.pick([1, 2]), h: PX.pick([1, 2]), c: PX.pick([RED, GREEN, "#fff", PINK, C.gold]) });
      buildProfiles(PX.$(".profiles", el));
      PX.$(".dlg", el).addEventListener("click", (e) => { if (!e.target.closest(".dlg-next")) { PX.unlockAudio(); advance(); } });
      scv.addEventListener("click", (e) => { const r = scv.getBoundingClientRect(), k = ((e.clientX - r.left) / r.width) * W < W / 2 - 10 ? 0 : 1; if (hop[k] < 0) { hop[k] = 0; PX.sfx("jump"); } });
      window.addEventListener("keydown", (e) => {
        if (!el.classList.contains("is-active") || PX.$(".intro") || PX.$(".xmodal")) return;
        const t = e.target; if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON")) return;
        if (["Space", "Enter", "KeyZ"].includes(e.code)) { e.preventDefault(); advance(); }
      });
    },
    start() { li = 0; showLine(); },
    show() { if (!running) { running = true; loop(); } },
    hide() { running = false; },
    getGrids: () => grids
  };
})();
