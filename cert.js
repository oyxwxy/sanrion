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
  const INK = "#3a1d2e", PINK = "#e0578a", GOLD = "#d9a441";
  function seal(x, cx, cy, color, label) {
    // 픽셀 원형 도장
    const R = 34;
    for (let y = -R; y <= R; y += 2) for (let xx = -R; xx <= R; xx += 2) {
      const d = Math.hypot(xx, y);
      if (d <= R && (d > R - 5 || d < R - 9)) { x.fillStyle = d > R - 5 ? color : color + "22"; x.fillRect(cx + xx, cy + y, 2, 2); }
    }
    x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
    x.font = (label.length > 2 ? '17px' : '22px') + ' "NeoDunggeunmo", "Galmuri11", monospace'; x.fillText(label, cx, cy + 1);
  }
  function medal(x, cx, cy) {
    const R = ["....oooo....", "..oowwggoo..", ".owwggggggo.", ".owgggg1ggo.", "oggggg11gggo", "ogggggg1gggo", "ogggggg1gggo", "oggggg111ggo", ".oggggggggo.", "..oooooooo.."];
    const ribbon = ["..rr....RR..", ".rrrr..RRRR.", ".rrrr..RRRR.", "..rrr..RRR..", "...rr..RR...", "...r....R..."];
    PX.drawRows(x, ribbon, { r: "#c8323f", R: "#1f8f63" }, cx - 24, cy + 36, 4);
    PX.drawRows(x, R, { o: "#a8742a", g: GOLD, w: "#fff2c4", 1: "#a8742a" }, cx - 24, cy, 4);
  }
  async function draw(canvas, award, score, name, hero) {
    try { await Promise.all(['30px "MaruBuri-Regular"', '20px "NeoDunggeunmo"', '20px "Galmuri11"', '30px "Handletter"'].map((f) => document.fonts.load(f))); } catch (e) {}
    const W = 760, H = 540, x = canvas.getContext("2d");
    canvas.width = W; canvas.height = H; x.imageSmoothingEnabled = false;
    x.fillStyle = "#fdf1f6"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#f6d3df";
    for (let yy = 0; yy < H; yy += 8) for (let xx = (yy / 8) % 2 ? 4 : 0; xx < W; xx += 8) x.fillRect(xx, yy, 2, 2);
    // 테두리 (분홍 · 흰 · 잉크 · 금)
    const frame = (m, c, w) => { x.fillStyle = c; x.fillRect(m, m, W - 2 * m, w); x.fillRect(m, H - m - w, W - 2 * m, w); x.fillRect(m, m, w, H - 2 * m); x.fillRect(W - m - w, m, w, H - 2 * m); };
    x.fillStyle = "#ffffff"; x.fillRect(18, 18, W - 36, H - 36);
    frame(18, PINK, 8); frame(30, GOLD, 3); frame(36, INK, 2);
    // 모서리 하트
    const HRT = [".oo.oo.", "oaaoaao", "oaaaaao", ".oaaao.", "..oao..", "...o..."];
    [[44, 44], [W - 44 - 21, 44], [44, H - 44 - 18], [W - 44 - 21, H - 44 - 18]].forEach(([hx, hy]) => PX.drawRows(x, HRT, { o: INK, a: PINK }, hx, hy, 3));
    // 레이스 상단
    for (let i = 0; i < W - 120; i += 16) { x.fillStyle = "#f8bfd3"; x.fillRect(60 + i, 48, 10, 4); x.fillRect(62 + i, 52, 6, 2); }
    medal(x, 108, 70);
    // 제목
    x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.fillStyle = INK; x.font = '62px "MaruBuri-Regular", serif'; x.fillText("상    장", W / 2, 136);
    x.fillStyle = PINK; x.font = '22px "NeoDunggeunmo", monospace'; x.fillText("SANRION 1ST ANNIVERSARY AWARD", W / 2, 170);
    // 상 이름
    x.fillStyle = INK; x.font = '30px "MaruBuri-Regular", serif'; x.fillText(award.name, W / 2, 228);
    x.fillStyle = "#f8bfd3"; x.fillRect(W / 2 - 150, 240, 300, 3);
    // 수상자
    x.font = '22px "MaruBuri-Regular", serif'; x.fillStyle = "#6e3d58"; x.fillText("성명", W / 2 - 110, 290);
    x.font = '40px "Handletter", "MaruBuri-Regular", serif'; x.fillStyle = INK; x.fillText(name || "PLAYER", W / 2 + 20, 292);
    x.fillStyle = INK; x.fillRect(W / 2 - 70, 300, 200, 2);
    // 본문
    x.font = '19px "MaruBuri-Regular", serif'; x.fillStyle = INK;
    const lines = [
      `위 사람은 산타와 오리온의 1주년 보너스 스테이지 「${award.game}」에서`,
      `${award.line}`,
      `SCORE ${score}점을 기록하고 ${hero} 플레이어로 엔딩을 보았으므로`,
      "그 다정함을 기려 이 상장을 수여합니다."
    ];
    lines.forEach((l, i) => x.fillText(l, W / 2, 346 + i * 30));
    // 날짜 + 도장
    const d = new Date();
    x.font = '20px "MaruBuri-Regular", serif'; x.fillStyle = "#6e3d58";
    x.fillText(`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`, W / 2, 484);
    x.font = '16px "Galmuri11", monospace'; x.fillStyle = PINK; x.fillText("SANRION 1주년 운영위원회", W / 2, 506);
    seal(x, W / 2 - 230, 478, "#c8323f", "산타");
    seal(x, W / 2 + 230, 478, "#1f8f63", "오리온");
  }

  function open(game, score, hero) {
    const award = AWARDS[game]; if (!award) return;
    const all = getAll(); if (score == null) score = (all[game] && all[game].score) || 0;
    hero = hero || "SANTA";
    const body = document.createElement("div"); body.className = "cert";
    body.innerHTML = `
      <p class="cert-msg">축하해요! <b></b>을(를) 받았어요.</p>
      <canvas class="cert-cv" width="760" height="540"></canvas>
      <div class="cert-row"><span class="mk-label">이름</span><input class="px-input cert-name" maxlength="12" placeholder="상장에 들어갈 이름"><button type="button" class="px-btn sm cert-save">PNG 저장</button></div>`;
    body.querySelector(".cert-msg b").textContent = "‘" + award.name + "’";
    const cv = body.querySelector(".cert-cv"), inp = body.querySelector(".cert-name");
    inp.value = PX.store.get("certName", PX.store.get("gbName", ""));
    const redraw = () => draw(cv, award, score, inp.value.trim() || "PLAYER", hero);
    let tm; inp.oninput = () => { PX.store.set("certName", inp.value); clearTimeout(tm); tm = setTimeout(redraw, 150); };
    inp.onkeydown = (e) => e.stopPropagation();
    body.querySelector(".cert-save").onclick = () => { redraw().then(() => PX.download(cv, `sanrion-award-${game}.png`)); PX.sfx("select"); };
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
