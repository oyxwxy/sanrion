/* =========================================================
   STAGE 4 — 폴라로이드 꾸미기 에디터
   ========================================================= */
(function () {
  const PX = window.PX;
  const CW = 600, CH = 720, PHX = 36, PHY = 36, PHW = 528, PHH = 528;
  const FONTS = [
    { value: "Handletter", label: "손편지체", font: "Handletter" },
    { value: "KyoboHandwriting2020A", label: "교보손글씨 2020", font: "KyoboHandwriting2020A" },
    { value: "MaruBuri-Regular", label: "마루 부리", font: "MaruBuri-Regular" },
    { value: "양진체", label: "양진체", font: "양진체" },
    { value: "NeoDunggeunmo", label: "Neo둥근모", font: "NeoDunggeunmo" },
    { value: "Galmuri11", label: "갈무리11", font: "Galmuri11" },
    { value: "dalmoori", label: "달무리", font: "dalmoori" },
    { value: "YdestreetB", label: "Y이드스트릿", font: "YdestreetB" },
    { value: "Pretendard-Regular", label: "프리텐다드", font: "Pretendard-Regular" }
  ];
  const BGS = [
    { id: "check", name: "핑크 체크" }, { id: "halftone", name: "하프톤" }, { id: "winter", name: "겨울밤" },
    { id: "dawn", name: "새벽 노을" }, { id: "mint", name: "민트 도트" }, { id: "hearts", name: "하트" }, { id: "solid", name: "단색" }
  ];
  const FRAMES = ["#ffffff", "#fde8f0", "#f8bfd3", "#3a1d2e", "#a8e6dc", "#1d1b22"];
  const CHARS = [{ key: "santa", name: "P1 산타" }, { key: "orion", name: "P2 오리온" }, { key: "me", name: "내 캐릭터" }];

  const DEFAULT = () => ({
    bg: "check", bgColor: "#f8bfd3", frame: "#ffffff", stamp: true,
    caption: { text: "SANTA ♥ ORION · 1st", font: "Handletter", size: 46, color: "#3a1d2e" },
    items: [
      { id: 1, type: "char", key: "santa", x: 200, y: 360, s: 9, rot: 0, flip: false },
      { id: 2, type: "char", key: "orion", x: 400, y: 360, s: 9, rot: 0, flip: false },
      { id: 3, type: "sticker", key: "heart", x: 300, y: 250, s: 6, rot: 0, flip: false },
      { id: 4, type: "sticker", key: "sparkle", x: 110, y: 120, s: 6, rot: 0, flip: false },
      { id: 5, type: "sticker", key: "sparkle", x: 500, y: 170, s: 4, rot: 0, flip: false },
      { id: 6, type: "text", text: "HAPPY 1ST", font: "양진체", size: 54, color: "#e0578a", stroke: true, x: 300, y: 112, rot: -6 }
    ]
  });
  let state = PX.store.get("pola1", null);
  if (!state || !Array.isArray(state.items)) state = DEFAULT();
  let sel = null, root, cv, ctx, clip = null;
  const nextId = () => Math.max(0, ...state.items.map((i) => i.id)) + 1;
  const find = (id) => state.items.find((i) => i.id === id);

  /* ---------- 히스토리 ---------- */
  const undoS = [], redoS = [];
  const snap = () => JSON.stringify(state);
  function commit() { undoS.push(snap()); if (undoS.length > 150) undoS.shift(); redoS.length = 0; }
  function undo() { if (!undoS.length) return PX.toast("더 되돌릴 게 없어요"); redoS.push(snap()); state = JSON.parse(undoS.pop()); if (sel && !find(sel)) sel = null; save(true); PX.sfx("back"); }
  function redo() { if (!redoS.length) return PX.toast("다시 할 게 없어요"); undoS.push(snap()); state = JSON.parse(redoS.pop()); if (sel && !find(sel)) sel = null; save(true); PX.sfx("blip"); }
  function save(rebuild) { PX.store.set("pola1", state); render(); if (rebuild) buildSide(); }

  /* ---------- 그리기 ---------- */
  function charGrid(key) { return key === "me" ? PX.maker.compose() : PX.maker.composePreset(key); }
  const gridCache = {};
  function itemSize(it) {
    if (it.type === "char") return [32 * it.s, 32 * it.s];
    if (it.type === "sticker") { const [w, h] = PX.stickers.size(it.key); return [w * it.s, h * it.s]; }
    ctx.save(); ctx.font = `${it.size}px "${it.font}"`;
    const lines = String(it.text || " ").split("\n");
    const w = Math.max(...lines.map((l) => ctx.measureText(l || " ").width)) + 12;
    ctx.restore();
    return [w, lines.length * it.size * 1.15 + 6];
  }
  function drawBg(x) {
    const b = state.bg;
    x.save(); x.beginPath(); x.rect(PHX, PHY, PHW, PHH); x.clip();
    const cell = 8, n = PHW / cell;
    const R = (cx, cy, c, w = 1, h = 1) => { x.fillStyle = c; x.fillRect(PHX + cx * cell, PHY + cy * cell, w * cell, h * cell); };
    if (b === "check") { R(0, 0, "#fde8f0", n, n); for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (((i >> 2) + (j >> 2)) % 2) R(i, j, "#f8cfdc"); }
    else if (b === "halftone") { R(0, 0, "#ffffff", n, n); for (let j = 0; j < n; j += 2) for (let i = (j / 2) % 2; i < n; i += 2) { const d = Math.hypot(i - n * 0.75, j - n * 0.2) / n; if (d < 0.9) { const s = d < 0.3 ? 2 : 1; x.fillStyle = d < 0.5 ? "#f28fb3" : "#f8bfd3"; x.fillRect(PHX + i * cell, PHY + j * cell, s * cell * (d < 0.3 ? 0.75 : 0.6), s * cell * (d < 0.3 ? 0.75 : 0.6)); } } }
    else if (b === "winter") { const bands = ["#2a2340", "#332a4e", "#3d335c", "#4a3f6c", "#5b4f7a"]; bands.forEach((c, k) => R(0, Math.floor((k * n) / bands.length), c, n, Math.ceil(n / bands.length))); for (let k = 0; k < 90; k++) R((k * 37) % n, (k * 53) % n, k % 3 ? "#ffffff" : "#c9d3f0"); R(n - 14, 6, "#f6e6a8", 5, 5); R(n - 12, 6, "#2a2340", 3, 3); R(0, n - 8, "#e8ecf6", n, 8); }
    else if (b === "dawn") { const bands = ["#f6c6d8", "#f8d0d6", "#fbdcd2", "#fde6cf", "#fdeee0", "#fde8f0"]; bands.forEach((c, k) => R(0, Math.floor((k * n) / bands.length), c, n, Math.ceil(n / bands.length))); for (let r = 0; r < 12; r++) { const w = Math.round(Math.sqrt(144 - r * r) * 2); R(n / 2 - w / 2, n - 14 - r, "#ffe1a8", w, 1); } R(0, n - 14, "#f4bfd3", n, 14); for (let i = 0; i < n; i += 2) R(i, n - 14, "#eda2bf"); }
    else if (b === "mint") { R(0, 0, "#d3f0e6", n, n); for (let j = 1; j < n; j += 4) for (let i = (j % 8 === 1 ? 1 : 3); i < n; i += 4) R(i, j, "#ffffff", 1, 1); }
    else if (b === "hearts") { R(0, 0, "#fde8f0", n, n); for (let j = 0; j < n; j += 8) for (let i = (j / 8) % 2 ? 4 : 0; i < n; i += 8) { R(i, j, "#f8bfd3"); R(i + 2, j, "#f8bfd3"); R(i, j + 1, "#f8bfd3", 3, 1); R(i + 1, j + 2, "#f8bfd3"); } }
    else { R(0, 0, state.bgColor, n, n); }
    x.restore();
  }
  function drawItem(x, it) {
    const [w, h] = itemSize(it);
    x.save(); x.translate(it.x, it.y); x.rotate(((it.rot || 0) * Math.PI) / 180);
    if (it.type === "char") {
      const g = charGrid(it.key);
      PX.maker.drawGrid(x, g, -w / 2, -h / 2, it.s, it.flip);
    } else if (it.type === "sticker") {
      PX.stickers.draw(x, it.key, -w / 2, -h / 2, it.s, it.flip);
    } else {
      x.font = `${it.size}px "${it.font}"`; x.textAlign = "center"; x.textBaseline = "middle";
      const lines = String(it.text || "").split("\n"), lh = it.size * 1.15;
      lines.forEach((l, i) => {
        const yy = -((lines.length - 1) * lh) / 2 + i * lh;
        if (it.stroke) { x.lineJoin = "round"; x.strokeStyle = "#ffffff"; x.lineWidth = Math.max(4, it.size / 6); x.strokeText(l, 0, yy); }
        x.fillStyle = it.color; x.fillText(l, 0, yy);
      });
    }
    x.restore();
  }
  function drawAll(x, overlay) {
    x.clearRect(0, 0, CW, CH);
    x.imageSmoothingEnabled = false;
    // 프레임
    x.fillStyle = state.frame; x.fillRect(0, 0, CW, CH);
    const dark = PX.hexToRgb(state.frame).reduce((a, b) => a + b, 0) < 300;
    x.fillStyle = dark ? "rgba(255,255,255,.06)" : "rgba(58,29,46,.05)";
    for (let yy = 0; yy < CH; yy += 6) for (let xx = (yy / 6) % 2 ? 3 : 0; xx < CW; xx += 6) x.fillRect(xx, yy, 1, 1);
    drawBg(x);
    x.fillStyle = "rgba(58,29,46,.25)"; x.fillRect(PHX, PHY, PHW, 2); x.fillRect(PHX, PHY, 2, PHH);
    // 날짜 스탬프
    if (state.stamp) {
      const txt = "2025.11.28  2026.11.28";
      PX.text(x, txt, PHX + PHW - 16, PHY + PHH - 28, "rgba(255,138,61,.35)", 3, "right");
      PX.text(x, txt, PHX + PHW - 18, PHY + PHH - 30, "#ff8a3d", 3, "right");
    }
    // 캡션
    const c = state.caption;
    if (c.text) {
      x.save(); x.font = `${c.size}px "${c.font}"`; x.fillStyle = c.color; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(c.text, CW / 2, PHY + PHH + (CH - PHY - PHH) / 2); x.restore();
    }
    state.items.forEach((it) => drawItem(x, it));
    if (overlay && sel) {
      const it = find(sel); if (!it) return;
      const [w, h] = itemSize(it);
      x.save(); x.translate(it.x, it.y); x.rotate(((it.rot || 0) * Math.PI) / 180);
      x.strokeStyle = "#e0578a"; x.lineWidth = 3; x.setLineDash([10, 6]); x.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); x.setLineDash([]);
      x.fillStyle = "#fff"; x.strokeStyle = "#3a1d2e"; x.lineWidth = 3;
      x.fillRect(w / 2 - 6, h / 2 - 6, 18, 18); x.strokeRect(w / 2 - 6, h / 2 - 6, 18, 18);
      x.beginPath(); x.moveTo(0, -h / 2 - 6); x.lineTo(0, -h / 2 - 34); x.stroke();
      x.beginPath(); x.arc(0, -h / 2 - 42, 10, 0, Math.PI * 2); x.fill(); x.stroke();
      x.restore();
    }
  }
  function render() { if (ctx) drawAll(ctx, true); }

  /* ---------- 포인터 ---------- */
  function toLocal(it, px, py) {
    const a = (-(it.rot || 0) * Math.PI) / 180, dx = px - it.x, dy = py - it.y;
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  }
  function hitTest(px, py) {
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i], [w, h] = itemSize(it), [lx, ly] = toLocal(it, px, py);
      if (Math.abs(lx) <= w / 2 + 4 && Math.abs(ly) <= h / 2 + 4) return it;
    }
    return null;
  }
  function handleAt(px, py) {
    const it = sel && find(sel); if (!it) return null;
    const [w, h] = itemSize(it), [lx, ly] = toLocal(it, px, py);
    if (Math.abs(lx - (w / 2 + 3)) < 18 && Math.abs(ly - (h / 2 + 3)) < 18) return "scale";
    if (Math.hypot(lx, ly + h / 2 + 42) < 18) return "rotate";
    return null;
  }
  let drag = null;
  function pt(e) { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * CW, ((e.clientY - r.top) / r.height) * CH]; }
  function onDown(e) {
    e.preventDefault(); cv.setPointerCapture(e.pointerId);
    const [px, py] = pt(e), hd = handleAt(px, py);
    if (hd) { const it = find(sel); commit(); drag = { mode: hd, it, sx: px, sy: py, o: { ...it }, d0: Math.hypot(px - it.x, py - it.y) }; return; }
    const it = hitTest(px, py);
    if (it) { if (sel !== it.id) { sel = it.id; buildSide(); } commit(); drag = { mode: "move", it, sx: px, sy: py, o: { ...it }, moved: false }; PX.sfx("blip"); }
    else { if (sel) { sel = null; buildSide(); } drag = null; }
    render();
  }
  function onMove(e) {
    const [px, py] = pt(e);
    if (!drag) { const h = handleAt(px, py); cv.style.cursor = h === "scale" ? "nwse-resize" : h === "rotate" ? "grab" : hitTest(px, py) ? "move" : "default"; return; }
    const it = drag.it, o = drag.o;
    if (drag.mode === "move") { it.x = Math.round(o.x + px - drag.sx); it.y = Math.round(o.y + py - drag.sy); drag.moved = true; }
    else if (drag.mode === "scale") {
      const k = Math.hypot(px - it.x, py - it.y) / Math.max(1, drag.d0);
      if (it.type === "text") it.size = Math.round(PX.clamp(o.size * k, 10, 220));
      else it.s = Math.round(PX.clamp(o.s * k, 1, 24));
    } else if (drag.mode === "rotate") {
      let a = (Math.atan2(py - it.y, px - it.x) * 180) / Math.PI + 90;
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      it.rot = Math.round(((a + 540) % 360) - 180);
    }
    render(); syncProps();
  }
  function onUp() { if (drag) { if (drag.mode === "move" && !drag.moved) undoS.pop(); drag = null; save(false); } }

  /* ---------- 아이템 조작 ---------- */
  function addItem(it) { commit(); it.id = nextId(); state.items.push(it); sel = it.id; save(true); PX.sfx("coin"); }
  function del() { if (!sel) return; commit(); state.items = state.items.filter((i) => i.id !== sel); sel = null; save(true); PX.sfx("back"); }
  function dup(src) { const it = find(src || sel); if (!it) return; const c = JSON.parse(JSON.stringify(it)); c.x += 24; c.y += 24; addItem(c); }
  function layer(d) {
    const i = state.items.findIndex((x) => x.id === sel); if (i < 0) return;
    const j = d === "top" ? state.items.length - 1 : d === "bottom" ? 0 : PX.clamp(i + d, 0, state.items.length - 1);
    if (i === j) return; commit(); const [it] = state.items.splice(i, 1); state.items.splice(j, 0, it); save(true);
  }
  function nudge(dx, dy) { const it = find(sel); if (!it) return; commit(); it.x += dx; it.y += dy; save(false); syncProps(); }
  function exportPNG() {
    const c = document.createElement("canvas"); c.width = CW; c.height = CH;
    const fontsNeeded = [state.caption.font, ...state.items.filter((i) => i.type === "text").map((i) => i.font)];
    Promise.all(fontsNeeded.map((f) => document.fonts.load(`40px "${f}"`).catch(() => {}))).then(() => {
      drawAll(c.getContext("2d"), false);
      PX.download(c, "sanrion-polaroid.png"); PX.sfx("select"); PX.toast("폴라로이드를 저장했어요");
    });
  }

  /* ---------- 사이드 패널 ---------- */
  let curTab = "photo", propsRefs = {};
  function row(label, el) { const w = document.createElement("div"); w.className = "mk-row"; w.innerHTML = `<div class="mk-label">${label}</div>`; w.appendChild(el); return w; }
  function chipsOf(list, cur, onPick, getLabel = (x) => x.name) {
    const box = document.createElement("div"); box.className = "mk-chips";
    list.forEach((o) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip" + (cur(o) ? " is-on" : ""); b.textContent = getLabel(o); b.onclick = () => onPick(o); box.appendChild(b); });
    return box;
  }
  function swatchRow(list, cur, onSet) {
    const box = document.createElement("div"); box.className = "mk-swatches";
    list.forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.className = "sw" + (cur.toLowerCase() === c ? " is-on" : ""); b.style.setProperty("--c", c); b.onclick = () => { commit(); onSet(c); save(true); }; box.appendChild(b); });
    let started = false;
    box.appendChild(PX.ui.colorButton({ value: cur, cls: "sw-custom" + (list.includes(cur.toLowerCase()) ? "" : " is-on"),
      onInput: (c) => { if (!started) { commit(); started = true; } onSet(c); render(); },
      onCommit: (c) => { onSet(c); started = false; save(true); } }));
    return box;
  }
  function buildSide() {
    const panel = PX.$(".pl-panel", root); if (!panel) return;
    PX.$$(".pl-tab", root).forEach((t) => t.classList.toggle("is-on", t.dataset.tab === curTab));
    panel.innerHTML = ""; propsRefs = {};
    const it = sel && find(sel);
    const selBar = PX.$(".pl-selbar", root);
    selBar.classList.toggle("on", !!it);
    if (curTab === "photo") {
      panel.appendChild(row("배경", chipsOf(BGS, (o) => o.id === state.bg, (o) => { commit(); state.bg = o.id; save(true); })));
      panel.appendChild(row("단색 배경", swatchRow(["#f8bfd3", "#fde8f0", "#ffffff", "#a8e6dc", "#2a2340", "#e0578a"], state.bgColor, (c) => { state.bgColor = c; state.bg = "solid"; })));
      panel.appendChild(row("프레임", swatchRow(FRAMES, state.frame, (c) => (state.frame = c))));
      panel.appendChild(row("날짜 스탬프", chipsOf([{ v: true, name: "켜기" }, { v: false, name: "끄기" }], (o) => o.v === !!state.stamp, (o) => { commit(); state.stamp = o.v; save(true); })));
      const cap = document.createElement("div"); cap.className = "pl-cap";
      const ti = document.createElement("input"); ti.className = "px-input"; ti.maxLength = 40; ti.value = state.caption.text; ti.placeholder = "아래 여백 문구";
      let typed = false;
      ti.oninput = () => { if (!typed) { commit(); typed = true; } state.caption.text = ti.value; save(false); };
      ti.onblur = () => (typed = false);
      cap.appendChild(ti);
      panel.appendChild(row("캡션", cap));
      panel.appendChild(row("캡션 폰트", PX.ui.select({ options: FONTS, value: state.caption.font, fontPreview: true, onChange: (v) => { commit(); state.caption.font = v; document.fonts.load(`30px "${v}"`).finally(() => save(false)); } })));
      panel.appendChild(row("캡션 크기", PX.ui.stepper({ value: state.caption.size, min: 14, max: 90, step: 2, suffix: "px", onChange: (v) => { commit(); state.caption.size = v; save(false); } })));
      panel.appendChild(row("캡션 색", swatchRow(["#3a1d2e", "#e0578a", "#c8323f", "#1f8f63", "#ffffff", "#b07c93"], state.caption.color, (c) => (state.caption.color = c))));
    } else if (curTab === "chars") {
      const g = document.createElement("div"); g.className = "pl-grid";
      CHARS.forEach((c) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "pl-add";
        const cc = document.createElement("canvas"); cc.width = cc.height = 32; PX.maker.drawGrid(cc.getContext("2d"), charGrid(c.key), 0, 0, 1);
        b.appendChild(cc); const s = document.createElement("span"); s.textContent = c.name; b.appendChild(s);
        b.onclick = () => addItem({ type: "char", key: c.key, x: 300, y: 330, s: 8, rot: 0, flip: false });
        g.appendChild(b);
      });
      panel.appendChild(g);
      const n = document.createElement("p"); n.className = "mk-note"; n.textContent = "‘내 캐릭터’는 STAGE 3에서 만든 캐릭터예요. 메이커에서 바꾸면 여기도 바로 바뀌어요.";
      panel.appendChild(n);
    } else if (curTab === "stickers") {
      const g = document.createElement("div"); g.className = "pl-grid stickers";
      PX.stickers.list.forEach((s) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "pl-add"; b.title = s.name;
        const [w, h] = PX.stickers.size(s.id), cc = document.createElement("canvas"); cc.width = 18; cc.height = 18;
        PX.stickers.draw(cc.getContext("2d"), s.id, Math.floor((18 - w) / 2), Math.floor((18 - h) / 2), 1);
        b.appendChild(cc); const sp = document.createElement("span"); sp.textContent = s.name; b.appendChild(sp);
        b.onclick = () => addItem({ type: "sticker", key: s.id, x: 300 + PX.randi(-60, 60), y: 280 + PX.randi(-60, 60), s: 6, rot: 0, flip: false });
        g.appendChild(b);
      });
      panel.appendChild(g);
    } else if (curTab === "text") {
      const b = document.createElement("button"); b.type = "button"; b.className = "px-btn sm"; b.textContent = "+ 글자 추가";
      b.onclick = () => addItem({ type: "text", text: "LOVE", font: "Handletter", size: 56, color: "#e0578a", stroke: true, x: 300, y: 300, rot: 0 });
      panel.appendChild(row("새 글자", b));
      const n = document.createElement("p"); n.className = "mk-note"; n.textContent = "글자를 고르면 아래 ‘선택한 항목’에서 내용·폰트·색을 바꿀 수 있어요.";
      panel.appendChild(n);
    }
    // 선택한 항목 속성
    const pp = PX.$(".pl-props", root); pp.innerHTML = "";
    if (!it) { pp.innerHTML = `<p class="mk-note">사진 위 항목을 클릭하면 여기서 크기·회전·순서를 바꿀 수 있어요.</p>`; return; }
    const head = document.createElement("div"); head.className = "pl-props-head";
    head.textContent = "선택한 항목 · " + (it.type === "char" ? CHARS.find((c) => c.key === it.key).name : it.type === "sticker" ? PX.stickers.get(it.key).name : "글자");
    pp.appendChild(head);
    if (it.type === "text") {
      const ta = document.createElement("textarea"); ta.className = "px-input"; ta.rows = 2; ta.maxLength = 80; ta.value = it.text;
      let typed = false;
      ta.oninput = () => { if (!typed) { commit(); typed = true; } it.text = ta.value; save(false); };
      ta.onblur = () => (typed = false);
      pp.appendChild(row("내용", ta));
      pp.appendChild(row("폰트", PX.ui.select({ options: FONTS, value: it.font, fontPreview: true, onChange: (v) => { commit(); it.font = v; document.fonts.load(`30px "${v}"`).finally(() => save(false)); } })));
      propsRefs.size = PX.ui.stepper({ value: it.size, min: 10, max: 220, step: 2, big: 10, suffix: "px", onChange: (v) => { commit(); it.size = v; save(false); } });
      pp.appendChild(row("크기", propsRefs.size));
      pp.appendChild(row("색", swatchRow(["#e0578a", "#3a1d2e", "#ffffff", "#c8323f", "#1f8f63", "#a8e6dc", "#d9a441"], it.color, (c) => (it.color = c))));
      pp.appendChild(row("흰 테두리", chipsOf([{ v: true, name: "켜기" }, { v: false, name: "끄기" }], (o) => o.v === !!it.stroke, (o) => { commit(); it.stroke = o.v; save(true); })));
    } else {
      propsRefs.size = PX.ui.stepper({ value: it.s, min: 1, max: 24, step: 1, big: 4, suffix: "배", onChange: (v) => { commit(); it.s = v; save(false); } });
      pp.appendChild(row("크기", propsRefs.size));
      pp.appendChild(row("좌우 반전", chipsOf([{ v: false, name: "원래대로" }, { v: true, name: "뒤집기" }], (o) => o.v === !!it.flip, (o) => { commit(); it.flip = o.v; save(true); })));
    }
    propsRefs.rot = PX.ui.stepper({ value: it.rot || 0, min: -180, max: 180, step: 1, big: 15, suffix: "°", onChange: (v) => { commit(); it.rot = v; save(false); } });
    pp.appendChild(row("회전", propsRefs.rot));
  }
  function syncProps() {
    const it = sel && find(sel); if (!it) return;
    propsRefs.size && propsRefs.size.setValue(it.type === "text" ? it.size : it.s);
    propsRefs.rot && propsRefs.rot.setValue(it.rot || 0);
  }

  /* ---------- 마운트 ---------- */
  function mount(el) {
    root = el;
    root.innerHTML = `
      <div class="pl-stage">
        <div class="pl-wrap"><canvas class="pl-cv" width="${CW}" height="${CH}"></canvas></div>
        <div class="pl-selbar">
          <button type="button" class="tool-s" data-pa="undo" title="되돌리기 (Ctrl+Z)">↶</button>
          <button type="button" class="tool-s" data-pa="redo" title="다시하기 (Ctrl+Y)">↷</button>
          <span class="mk-sep"></span>
          <button type="button" class="tool-s sel-only" data-pa="dup" title="복제 (Ctrl+D)">⧉</button>
          <button type="button" class="tool-s sel-only" data-pa="up" title="앞으로 (])">▲</button>
          <button type="button" class="tool-s sel-only" data-pa="down" title="뒤로 ([)">▼</button>
          <button type="button" class="tool-s sel-only" data-pa="del" title="삭제 (Delete)">✕</button>
          <span class="mk-sep"></span>
          <button type="button" class="px-btn sm" data-pa="png">PNG 저장</button>
          <button type="button" class="px-btn sm ghost" data-pa="reset">초기화</button>
        </div>
      </div>
      <div class="pl-side">
        <div class="mk-tabs">
          <button type="button" class="mk-tab pl-tab" data-tab="photo">사진·프레임</button>
          <button type="button" class="mk-tab pl-tab" data-tab="chars">캐릭터</button>
          <button type="button" class="mk-tab pl-tab" data-tab="stickers">스티커</button>
          <button type="button" class="mk-tab pl-tab" data-tab="text">글자</button>
        </div>
        <div class="mk-panel pl-panel"></div>
        <div class="pl-props"></div>
        <div class="mk-keys"><b>단축키</b> 드래그 이동 · 모서리 □ 크기 · 위쪽 ○ 회전(Shift 15° 단위) · Ctrl+Z/Y 되돌리기·다시 · Ctrl+C/X/V 복사·잘라내기·붙여넣기 · Ctrl+D 복제 · Delete 삭제 · 방향키 이동(Shift 10px) · [ ] 순서 · Esc 선택 해제 · Ctrl+S 저장</div>
      </div>`;
    cv = PX.$(".pl-cv", root); ctx = cv.getContext("2d");
    cv.addEventListener("pointerdown", onDown); cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp); cv.addEventListener("pointercancel", onUp);
    PX.$$(".pl-tab", root).forEach((b) => (b.onclick = () => { curTab = b.dataset.tab; PX.sfx("blip"); buildSide(); }));
    PX.$$("[data-pa]", root).forEach((b) => (b.onclick = () => {
      const a = b.dataset.pa;
      if (a === "undo") undo(); else if (a === "redo") redo(); else if (a === "dup") dup(); else if (a === "del") del();
      else if (a === "up") layer(1); else if (a === "down") layer(-1); else if (a === "png") exportPNG();
      else if (a === "reset") { commit(); state = DEFAULT(); sel = null; save(true); PX.toast("처음 상태로 돌렸어요 (Ctrl+Z로 취소)"); }
    }));
    PX.maker.onChange(() => { if (state.items.some((i) => i.key === "me")) render(); if (curTab === "chars") buildSide(); });
    const fonts = new Set([state.caption.font, ...state.items.filter((i) => i.type === "text").map((i) => i.font)]);
    Promise.all([...fonts].map((f) => document.fonts.load(`30px "${f}"`).catch(() => {}))).then(render);
    buildSide(); render();
  }

  /* ---------- 단축키 ---------- */
  const visible = () => root && root.closest(".stage").classList.contains("is-active") && !PX.$(".xmodal") && !PX.ui.colorPicker.isOpen();
  const typingIn = (e) => { const t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
  window.addEventListener("keydown", (e) => {
    if (!visible() || typingIn(e)) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (mod && k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (mod && ((k === "z" && e.shiftKey) || k === "y")) { e.preventDefault(); redo(); }
    else if (mod && k === "d") { e.preventDefault(); dup(); }
    else if (mod && k === "s") { e.preventDefault(); exportPNG(); }
    else if (mod) return;
    else if (k === "delete" || k === "backspace") { if (sel) { e.preventDefault(); del(); } }
    else if (k === "escape") { sel = null; buildSide(); render(); }
    else if (k === "]") layer(1); else if (k === "[") layer(-1);
    else if (k.startsWith("arrow") && sel) {
      e.preventDefault(); const d = e.shiftKey ? 10 : 1;
      nudge(k === "arrowleft" ? -d : k === "arrowright" ? d : 0, k === "arrowup" ? -d : k === "arrowdown" ? d : 0);
    }
  });
  document.addEventListener("copy", (e) => { if (!visible() || typingIn(e) || !sel) return; e.preventDefault(); clip = JSON.stringify(find(sel)); e.clipboardData.setData("text/plain", "SANRION_POLA:" + clip); PX.toast("복사했어요"); });
  document.addEventListener("cut", (e) => { if (!visible() || typingIn(e) || !sel) return; e.preventDefault(); clip = JSON.stringify(find(sel)); e.clipboardData.setData("text/plain", "SANRION_POLA:" + clip); del(); PX.toast("잘라냈어요"); });
  document.addEventListener("paste", (e) => {
    if (!visible() || typingIn(e)) return;
    let t = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
    let src = t.startsWith("SANRION_POLA:") ? t.slice(13) : clip;
    if (!src) { if (t) { e.preventDefault(); addItem({ type: "text", text: t.slice(0, 80), font: "Handletter", size: 48, color: "#3a1d2e", stroke: true, x: 300, y: 300, rot: 0 }); } return; }
    e.preventDefault();
    try { const it = JSON.parse(src); it.x += 24; it.y += 24; addItem(it); } catch (err) {}
  });

  PX.polaroid = { mount, render, FONTS };
})();
