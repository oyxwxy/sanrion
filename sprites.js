/* =========================================================
   SPRITES — 픽셀 스티커 / 종이접기 쪽지 모양
   ========================================================= */
(function () {
  const PX = window.PX;

  function drawRows(ctx, rows, pal, x, y, s = 1, flip = false) {
    const w = rows[0].length;
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const ch = r[i]; if (ch === "." || ch === " ") continue;
        const c = pal[ch]; if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x + (flip ? w - 1 - i : i) * s, y + j * s, s, s);
      }
    }
  }
  PX.drawRows = drawRows;

  /* ---------- 스티커 ---------- */
  const ST = [
    { id: "heart", name: "하트", pal: { o: "#7a1f35", a: "#c8323f", w: "#ffd6dc" }, rows: [
      ".ooo.ooo.", "oawaoaaao", "oaaaaaaao", "oaaaaaaao", ".oaaaaao.", "..oaaao..", "...oao...", "....o...."] },
    { id: "heartp", name: "핑크하트", pal: { o: "#b83a6b", a: "#f28fb3", w: "#ffffff" }, rows: [
      ".ooo.ooo.", "oawaoaaao", "oaaaaaaao", "oaaaaaaao", ".oaaaaao.", "..oaaao..", "...oao...", "....o...."] },
    { id: "sparkle", name: "반짝", pal: { o: "#e0578a", a: "#ffffff" }, rows: [
      "...o...", "...a...", "..aaa..", "oaaaaao", "..aaa..", "...a...", "...o..."] },
    { id: "star", name: "별", pal: { o: "#a8742a", a: "#f4d26b", w: "#fff6cf" }, rows: [
      "....o....", "...oao...", "oooawaooo", "oaaaaaaao", ".oaaaaao.", "..oaaao..", ".oaaoaao.", ".oao.oao.", ".oo...oo."] },
    { id: "starl", name: "라임별", pal: { o: "#5f8a1c", a: "#b9e35a", w: "#efffc9" }, rows: [
      "....o....", "...oao...", "oooawaooo", "oaaaaaaao", ".oaaaaao.", "..oaaao..", ".oaaoaao.", ".oao.oao.", ".oo...oo."] },
    { id: "ribbon", name: "리본", pal: { o: "#8e2550", a: "#e0578a", A: "#b83a6b", w: "#f8bfd3" }, rows: [
      "oo.....oo", "owoo.ooao", "oaaaoaaao", "oaaAAAaao", "oaaoAoaao", "oo.oAo.oo", "..oAoAo..", ".oAo.oAo.", ".oo...oo."] },
    { id: "cake", name: "케이크", pal: { o: "#3a1d2e", w: "#ffffff", p: "#f28fb3", s: "#f6d79b", r: "#c8323f", R: "#ff8a9a" }, rows: [
      ".......rr.", "......oRro", "....ooww.o", "..oowwwwwo", "oowwwwwwwo", "oppppppppo", "osssssssso", "oppppppppo", "oooooooooo"] },
    { id: "hotchoco", name: "핫초코", pal: { o: "#3a1d2e", w: "#ffffff", W: "#f1e3e8", m: "#f8bfd3", M: "#e0578a", h: "#c8323f" }, rows: [
      "...w..w....", "..w..w.....", "ooooooooo..", "owwWwwWwo..", "ommmmmmmooo", "ommmmmmmo.o", "ommmhmmmo.o", "ommhhhmmooo", ".ommhmmMo..", "..ooooo...."] },
    { id: "snow", name: "눈꽃", pal: { o: "#7fb2e0", a: "#e8f4ff" }, rows: [
      "....o....", ".o..o..o.", "..o.a.o..", "...oao...", "ooaaaaaoo", "...oao...", "..o.a.o..", ".o..o..o.", "....o...."] },
    { id: "sun", name: "태양", pal: { o: "#d0862a", y: "#ffd86b", w: "#fff4c2" }, rows: [
      ".....o.....", ".o...o...o.", "..o.....o..", "....ooo....", "...oywyo...", "oo.oyyyo.oo", "...oyyyo...", "....ooo....", "..o.....o..", ".o...o...o.", ".....o....."] },
    { id: "moon", name: "새벽달", pal: { o: "#b89332", m: "#f6e6a8", s: "#ffffff" }, rows: [
      "...ooo...", ".oomm...s", ".omo.....", "omo......", "omo....s.", "omo......", ".omo....o", ".oommooo.", "...ooo..."] },
    { id: "flower", name: "꽃", pal: { o: "#b83a6b", p: "#f8bfd3", y: "#f4d26b" }, rows: [
      "...ooo...", "..opppo..", ".oopppoo.", "oppoyoppo", "opppyyppo", "oppoyoppo", ".oopppoo.", "..opppo..", "...ooo..."] },
    { id: "crown", name: "왕관", pal: { o: "#8a5a1c", a: "#f4d26b", r: "#c8323f", g: "#1f8f63" }, rows: [
      "o...o...o", "oo.ooo.oo", "oaoaaaoao", "oaaaaaaao", "oaraagaao", "ooooooooo"] },
    { id: "crane", name: "종이학", pal: { o: "#8e2550", L: "#fde8f0", a: "#f28fb3", D: "#d4618d" }, rows: ["o.....o.....o", "oo...oLo...oo", ".oo.oLLLo.oao", "..ooLLaLLooa.", "...oaaaaaaao.", "....oaaaaDo..", ".....oDDDo...", "......ooo...."] },
    { id: "letter", name: "편지", pal: { o: "#3a1d2e", a: "#ffffff", D: "#f3cbda", r: "#c8323f" }, rows: [
      "ooooooooooo", "oDaaaaaaaDo", "oaDaaaaaDao", "oaaDarraDao", "oaaaDrDaaao", "oaaaaaaaaao", "ooooooooooo"] },
    { id: "arrow", name: "화살표", pal: { o: "#3a1d2e", a: "#a8e6dc" }, rows: [
      "...oooooo", "...oaaaao", "....ooaao", "...oaoaao", "..oaao.oo", ".oaao....", "oaao.....", "oao......", "ooo......"] },
    { id: "one", name: "1주년", pal: { o: "#3a1d2e", a: "#e0578a", w: "#ffffff" }, rows: [
      "..ooooo..", ".oaaaaao.", "oaaawaaao", "oaawwaaao", "oaaawaaao", "oaaawaaao", "oaawwwaao", ".oaaaaao.", "..ooooo.."] }
  ];
  const byId = Object.fromEntries(ST.map((s) => [s.id, s]));
  PX.stickers = {
    list: ST,
    get: (id) => byId[id],
    size: (id) => { const s = byId[id]; return s ? [s.rows[0].length, s.rows.length] : [8, 8]; },
    draw(ctx, id, x, y, s = 1, flip = false) { const st = byId[id]; if (st) drawRows(ctx, st.rows, st.pal, x, y, s, flip); }
  };

  /* ---------- 종이접기 쪽지 (방명록) ---------- */
  const OR = [
    { id: "crane", name: "종이학", rows: ["o.....o.....o", "oo...oLo...oo", ".oo.oLLLo.oao", "..ooLLaLLooa.", "...oaaaaaaao.", "....oaaaaDo..", ".....oDDDo...", "......ooo...."] },
    { id: "star", name: "별", rows: [
      "....o....", "...oLo...", "oooLLaooo", "oLLaaaaDo", ".oaaaaaD.", "..oaaaDo.", ".oaaoaDo.", ".oao.oDo.", ".oo...oo."] },
    { id: "heart", name: "하트", rows: [
      ".ooo.ooo.", "oLLaoaaDo", "oLaaaaaDo", "oaaaLaaDo", ".oaaLaDo.", "..oaLDo..", "...oDo...", "....o...."] },
    { id: "scroll", name: "두루마리", rows: [
      ".oooooooo.", "oLLLLLLLLo", "oaaaRRaaao", "oaaaRRaaao", "oDDDDDDDDo", ".oooooooo."] },
    { id: "letter", name: "편지", rows: [
      "ooooooooooo", "oDaaaaaaaDo", "oaDaaaaaDao", "oaaDaRaDaao", "oaaaDRDaaao", "oaaaaaaaaao", "ooooooooooo"] },
    { id: "boat", name: "종이배", rows: [
      ".....o......", "....oLo.....", "...oLaLo....", "oooooooooooo", ".oaaaaaaaao.", "..oDDDDDDo..", "...oooooo..."] }
  ];
  const orById = Object.fromEntries(OR.map((s) => [s.id, s]));
  const palCache = {};
  function orPal(color) {
    if (palCache[color]) return palCache[color];
    return (palCache[color] = {
      a: color, L: PX.tint(color, 0.45), D: PX.shade(color, 0.18), o: PX.shade(color, 0.55), R: "#ffffff"
    });
  }
  PX.origami = {
    list: OR,
    get: (id) => orById[id] || OR[0],
    size: (id) => { const s = orById[id] || OR[0]; return [s.rows[0].length, s.rows.length]; },
    draw(ctx, id, color, x, y, s = 1, flip = false) { drawRows(ctx, (orById[id] || OR[0]).rows, orPal(color), x, y, s, flip); },
    COLORS: ["#f8bfd3", "#e0578a", "#ffffff", "#c8323f", "#1f8f63", "#a8e6dc", "#f4d26b", "#b9a6e8", "#9ec9ef", "#ffcfa8"]
  };
})();
