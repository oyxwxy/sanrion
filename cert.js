/* =========================================================
   CERT — 게임 클리어 상장 + 수상 기록
   ========================================================= */
(function () {
  const PX = window.PX;
  const AWARDS = {
    runner: { name: "보고 싶어 달려간 상", game: "JUMP RUN", line: "끝까지 달려 사랑하는 사람에게 닿았기에" },
    catch: { name: "달콤함 나눔 상", game: "SWEET CATCH", line: "쓴 커피와 탄 토스트를 피해 달콤함만 모아 나눴기에" },
    stack: { name: "웨딩 케이크 장인 상", game: "CAKE STACK", line: "흔들림 없이 열다섯 층의 케이크를 쌓아 올렸기에" },
    brick: { name: "마음의 벽 허물기 상", game: "BRICK BREAK", line: "두 사람 사이의 모든 벽을 남김없이 허물었기에" }
  };
  const ORDER = ["runner", "catch", "stack", "brick"];
  const listeners = [];
  const getAll = () => PX.store.get("awards", {});

  function mark(game, score) {
    const all = getAll(), prev = all[game];
    all[game] = { score: Math.max(score, (prev && prev.score) || 0), date: Date.now() };
    PX.store.set("awards", all);
    listeners.forEach((f) => f());
  }

  /* ---------- 상장 그리기 ---------- */
  const INK = "#3a1d2e", PINK = "#e0578a", PINK_D = "#b83a6b", PINK_L = "#f8bfd3", GOLD = "#d9a441", GOLD_D = "#a8742a";
  const W = 800, H = 570;
  function seal(x, cx, cy, color, label) {
    const R = 36;
    for (let y = -R; y <= R; y += 2) for (let xx = -R; xx <= R; xx += 2) {
      const d = Math.hypot(xx + 1, y + 1);
      if (d <= R) { x.fillStyle = d > R - 4 ? color : d > R - 7 ? "#ffffff" : d > R - 9 ? color : color + "1f"; x.fillRect(cx + xx, cy + y, 2, 2); }
    }
    x.save(); x.translate(cx, cy); x.rotate(-0.12);
    x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = (label.length > 2 ? "17px" : "21px") + ' "NeoDunggeunmo", "Galmuri11", monospace'; x.fillText(label, 0, 1);
    x.restore();
  }
  function banner(x, cx, cy, w, text) {
    const h = 46, l = cx - w / 2;
    // 꼬리
    [[-1, l - 26], [1, cx + w / 2 - 4]].forEach(([d, tx]) => {
      x.fillStyle = PINK_D; x.fillRect(tx, cy - h / 2 + 10, 30, h);
      x.fillStyle = PINK_L;
      for (let i = 0; i < h / 2; i += 2) { const cut = d < 0 ? tx : tx + 30; x.fillRect(d < 0 ? cut : cut - (h / 2 - i) / 2.2, cy - h / 2 + 10 + i, (h / 2 - i) / 2.2, 2); x.fillRect(d < 0 ? cut : cut - (h / 2 - i) / 2.2, cy + h / 2 + 8 - i, (h / 2 - i) / 2.2, 2); }
    });
    x.fillStyle = INK; x.fillRect(l - 3, cy - h / 2 - 3, w + 6, h + 6);
    x.fillStyle = PINK; x.fillRect(l, cy - h / 2, w, h);
    x.fillStyle = "#f08cb0"; x.fillRect(l, cy - h / 2, w, 4);
    x.fillStyle = PINK_D; x.fillRect(l, cy + h / 2 - 4, w, 4);
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = '27px "MaruBuri-Regular", serif'; x.fillText(text, cx, cy + 1);
  }
  function rosette(x, cx, cy) {
    const s = 3;
    const ribbon = ["rr......RR", "rrr....RRR", ".rrr..RRR.", ".rrr..RRR.", "..rr..RR..", "..r....R.."];
    PX.drawRows(x, ribbon, { r: "#c8323f", R: "#1f8f63" }, cx - 15, cy + 18, s);
    const R = ["...pppppp...", ".ppPPPPPPpp.", ".pPoooooooPp", "pPooggggooPp", "pPoggwgggoPp", "pPogggg1goPp", "pPoggg11goPp", "pPogggg1goPp", "pPoogg111oPp", ".pPooooooPp.", ".ppPPPPPPpp.", "...pppppp..."];
    PX.drawRows(x, R, { p: PINK_L, P: PINK, o: GOLD_D, g: GOLD, w: "#fff2c4", 1: GOLD_D }, cx - 18, cy - 18, s);
  }
  async function draw(canvas, award, score, name, hero) {
    try { await Promise.all(['30px "MaruBuri-Regular"', '20px "NeoDunggeunmo"', '20px "Galmuri11"', '30px "Handletter"'].map((f) => document.fonts.load(f))); } catch (e) {}
    canvas.width = W; canvas.height = H;
    const x = canvas.getContext("2d"); x.imageSmoothingEnabled = false;
    // 바깥 분홍 + 도트
    x.fillStyle = "#f6c6d8"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#efb0c6";
    for (let yy = 2; yy < H; yy += 10) for (let xx = (yy / 10) % 2 ? 7 : 2; xx < W; xx += 10) x.fillRect(xx, yy, 3, 3);
    // 레이스 가장자리 (종이 바깥)
    const P0 = 34;
    x.fillStyle = "#ffffff";
    for (let i = P0; i < W - P0; i += 14) { x.fillRect(i + 2, P0 - 8, 10, 8); x.fillRect(i + 4, P0 - 12, 6, 4); x.fillRect(i + 2, H - P0, 10, 8); x.fillRect(i + 4, H - P0 + 8, 6, 4); }
    for (let i = P0; i < H - P0; i += 14) { x.fillRect(P0 - 8, i + 2, 8, 10); x.fillRect(P0 - 12, i + 4, 4, 6); x.fillRect(W - P0, i + 2, 8, 10); x.fillRect(W - P0 + 8, i + 4, 4, 6); }
    // 종이
    x.fillStyle = INK; x.fillRect(P0 - 2, P0 - 2, W - 2 * P0 + 4, H - 2 * P0 + 4);
    x.fillStyle = "#fffafc"; x.fillRect(P0, P0, W - 2 * P0, H - 2 * P0);
    x.fillStyle = "#fbeaf1";
    for (let yy = P0 + 6; yy < H - P0; yy += 8) for (let xx = P0 + ((yy / 8) % 2 ? 6 : 2); xx < W - P0; xx += 8) x.fillRect(xx, yy, 2, 2);
    // 금색 이중선
    const line = (m, c, w) => { x.fillStyle = c; x.fillRect(m, m, W - 2 * m, w); x.fillRect(m, H - m - w, W - 2 * m, w); x.fillRect(m, m, w, H - 2 * m); x.fillRect(W - m - w, m, w, H - 2 * m); };
    line(P0 + 10, GOLD, 4); line(P0 + 18, GOLD, 2);
    // 모서리 리본
    const BOW = ["oo.....oo", "oaoo.ooao", "oaaaoaaao", "oaaAAAaao", "oaaoAoaao", "oo.oAo.oo", "..oAoAo..", ".oAo.oAo."];
    [[P0 + 4, P0 + 4], [W - P0 - 31, P0 + 4], [P0 + 4, H - P0 - 28], [W - P0 - 31, H - P0 - 28]].forEach(([bx, by]) => PX.drawRows(x, BOW, { o: INK, a: PINK, A: PINK_D }, bx, by, 3));
    // 캐릭터 양옆
    const S = PX.maker.composePreset("santa"), O = PX.maker.composePreset("orion");
    [[S, 96, "#c8323f", "P1"], [O, W - 96 - 96, "#1f8f63", "P2"]].forEach(([g, gx, col, slot]) => {
      x.fillStyle = col + "22"; x.fillRect(gx + 8, 70, 80, 88);
      PX.maker.drawGrid(x, g, gx, 62, 3);
      x.fillStyle = col; x.fillRect(gx + 30, 160, 36, 16); PX.text(x, slot, gx + 48, 164, "#fff", 2, "center");
    });
    // 제목
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillStyle = PINK_L; x.font = '68px "MaruBuri-Regular", serif'; x.fillText("상   장", W / 2 + 3, 133);
    x.fillStyle = INK; x.fillText("상   장", W / 2, 130);
    PX.text(x, "SANRION 1ST ANNIVERSARY AWARD", W / 2, 148, PINK, 2, "center");
    rosette(x, W / 2, 182);
    // 상 이름 리본
    banner(x, W / 2, 252, 330, award.name);
    // 수상자
    x.textBaseline = "alphabetic"; x.textAlign = "right";
    x.font = '20px "MaruBuri-Regular", serif'; x.fillStyle = "#8a5a74"; x.fillText("성명", W / 2 - 92, 322);
    x.textAlign = "center"; x.font = '44px "Handletter", "MaruBuri-Regular", serif'; x.fillStyle = INK; x.fillText(name || "PLAYER", W / 2 + 30, 324);
    x.fillStyle = INK; x.fillRect(W / 2 - 70, 334, 200, 2);
    // 본문
    x.font = '18px "MaruBuri-Regular", serif'; x.fillStyle = INK;
    [`위 사람은 산타와 오리온의 1주년 보너스 스테이지 「${award.game}」에서`, award.line, `SCORE ${score}점, ${hero} 플레이어로 엔딩을 보았으므로`, "그 다정함을 기려 이 상장을 수여합니다."].forEach((l, i) => x.fillText(l, W / 2, 374 + i * 28));
    // 날짜 · 도장
    const d = new Date();
    x.font = '19px "MaruBuri-Regular", serif'; x.fillStyle = "#6e3d58";
    x.fillText(`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`, W / 2, 492);
    x.font = '15px "Galmuri11", monospace'; x.fillStyle = PINK_D; x.fillText("SANRION 1주년 기념 운영위원회", W / 2, 514);
    seal(x, W / 2 - 205, 478, "#c8323f", "산타");
    seal(x, W / 2 + 205, 478, "#1f8f63", "오리온");
  }

  function open(game, score, hero) {
    const award = AWARDS[game]; if (!award) return;
    const all = getAll(); if (score == null) score = (all[game] && all[game].score) || 0;
    hero = hero || "SANTA";
    const body = document.createElement("div"); body.className = "cert";
    body.innerHTML = `
      <p class="cert-msg">축하해요! <b></b>을(를) 받았어요.</p>
      <canvas class="cert-cv" width="800" height="570"></canvas>
      <div class="cert-row"><span class="mk-label">이름</span><input class="px-input cert-name" maxlength="12" placeholder="상장에 들어갈 이름"><button type="button" class="px-btn sm cert-save">PNG 저장</button></div>`;
    body.querySelector(".cert-msg b").textContent = "‘" + award.name + "’";
    const cv = body.querySelector(".cert-cv"), inp = body.querySelector(".cert-name");
    inp.value = PX.store.get("certName", PX.store.get("gbName", ""));
    const redraw = () => draw(cv, award, score, inp.value.trim() || "PLAYER", hero);
    let tm; inp.oninput = () => { PX.store.set("certName", inp.value); clearTimeout(tm); tm = setTimeout(redraw, 150); };
    inp.onkeydown = (e) => e.stopPropagation();
    body.querySelector(".cert-save").onclick = () => { PX.saveImage(cv, `sanrion-award-${game}.png`); PX.sfx("select"); };
    PX.ui.modal({ title: "AWARD.PNG — 상장 수여", body, cls: "cert-modal" });
    redraw();
  }

  /* 수상 진열장 */
  function renderShelf(el) {
    const all = getAll();
    el.innerHTML = `<div class="shelf-head"><b>MY AWARDS</b><span>${ORDER.filter((k) => all[k]).length} / ${ORDER.length}</span></div><div class="shelf"></div>`;
    const shelf = el.querySelector(".shelf");
    ORDER.forEach((k, i) => {
      const got = !!all[k], b = document.createElement("button");
      b.type = "button"; b.className = "award" + (got ? " got" : "");
      b.innerHTML = `<i></i><span></span>`;
      b.querySelector("span").textContent = got ? AWARDS[k].name : `${i + 1}. ${AWARDS[k].game}`;
      b.title = got ? "상장 다시 보기" : "클리어하면 상장을 받아요";
      b.onclick = () => (got ? open(k, all[k].score, PX.store.get("hero", 0) ? "ORION" : "SANTA") : PX.toast(`${AWARDS[k].game}을(를) 클리어하면 받을 수 있어요`));
      shelf.appendChild(b);
    });
  }
  PX.cert = { open, mark, AWARDS, renderShelf, onChange: (f) => listeners.push(f) };
})();
