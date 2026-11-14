/* =========================================================
   STAGE 5 — 쪽지 병 방명록 (Firebase Firestore)
   ========================================================= */
(function () {
  const PX = window.PX, CFG = window.SITE_CONFIG;
  const JW = 180, JH = 220, PER = 36, SC = 2;
  const NOTE_FONTS = [
    { value: "Handletter", label: "손편지체", font: "Handletter" },
    { value: "KyoboHandwriting2020A", label: "교보손글씨 2020", font: "KyoboHandwriting2020A" },
    { value: "MaruBuri-Regular", label: "마루 부리", font: "MaruBuri-Regular" },
    { value: "Galmuri11", label: "갈무리11", font: "Galmuri11" },
    { value: "NeoDunggeunmo", label: "Neo둥근모", font: "NeoDunggeunmo" },
    { value: "Pretendard-Regular", label: "프리텐다드", font: "Pretendard-Regular" }
  ];
  const SHAPES = PX.origami.list.map((o) => o.id);
  const COOLDOWN = 30 * 1000;
  let fb = null, col = null, root, jar, jx, entries = [], bottleIdx = -1, firstLoad = true, known = new Set(), drops = [], hover = -1, t = 0, raf = null, running = false;
  const draft = Object.assign({ shape: "crane", color: "#f8bfd3", font: "Handletter", attach: true }, PX.store.get("noteDraft", {}));

  /* ---------- Firebase ---------- */
  async function init() {
    const base = `https://www.gstatic.com/firebasejs/${CFG.firebaseVersion}/`;
    const [app, fs] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-firestore.js")]);
    const a = app.getApps().length ? app.getApp() : app.initializeApp(CFG.firebase);
    fb = fs; col = fs.collection(fs.getFirestore(a), CFG.guestbookCollection);
    import(base + "firebase-analytics.js").then(async (an) => { if (await an.isSupported()) an.getAnalytics(a); }).catch(() => {});
  }
  function listen() {
    const q = fb.query(col, fb.orderBy("createdAt", "desc"), fb.limit(360));
    fb.onSnapshot(q, (snap) => {
      const list = [];
      snap.forEach((d) => list.push(Object.assign({ id: d.id }, d.data())));
      list.reverse();
      const fresh = list.filter((e) => !known.has(e.id));
      entries = list; list.forEach((e) => known.add(e.id));
      const bottles = Math.max(1, Math.ceil(entries.length / PER));
      if (bottleIdx < 0 || bottleIdx >= bottles || (!firstLoad && fresh.length)) bottleIdx = bottles - 1;
      if (!firstLoad) fresh.forEach((e) => drops.push({ id: e.id, t: 0 }));
      firstLoad = false;
      status(entries.length ? "" : "아직 병이 비어 있어요. 첫 번째 쪽지를 넣어 주세요!");
      updateTag(); buildList();
    }, (err) => { console.error(err); status("방명록을 불러오지 못했어요. (Firestore 규칙을 확인해 주세요)"); });
  }
  const status = (s) => { const el = PX.$(".bt-status", root); if (el) el.textContent = s; };

  /* ---------- 병 그리기 ---------- */
  const inBody = (x, y) => {
    const L = 24, R = 156, T = 78, B = 208, r = 26;
    if (y < 58 || y > B) return false;
    if (y < T) { const k = (y - 58) / (T - 58); const hw = 22 + Math.sqrt(k) * 44; return Math.abs(x - 90) < hw; }
    if (x < L || x > R) return false;
    const cx = x < L + r ? L + r : x > R - r ? R - r : x, cy = y > B - r ? B - r : y;
    return Math.hypot(x - cx, y - cy) <= r || (cx === x || cy === y);
  };
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
  function layout(list) {
    // 바닥부터 차곡차곡
    const slots = [];
    let row = 0;
    while (slots.length < PER && row < 12) {
      const y = 204 - 14 - row * 13;
      const off = row % 2 ? 11 : 0;
      for (let x = 30 + off; x < 150; x += 22) { if (inBody(x + 2, y + 2) && inBody(x + 20, y + 2) && inBody(x + 2, y + 13)) slots.push([x, y]); }
      row++;
    }
    return list.map((e, i) => {
      const s = slots[i] || slots[slots.length - 1], j = hash(e.id || String(i));
      return { e, x: s[0] + Math.round((j - 0.5) * 6), y: s[1] + Math.round((hash((e.id || "") + "y") - 0.5) * 4), flip: j > 0.5 };
    });
  }
  function current() { return entries.slice(bottleIdx * PER, bottleIdx * PER + PER); }
  function drawJar() {
    if (!jx) return;
    t++;
    const x = jx; x.clearRect(0, 0, JW, JH);
    // 그림자
    x.fillStyle = "rgba(184,58,107,.16)"; x.fillRect(30, 212, 120, 4); x.fillRect(40, 216, 100, 2);
    // 유리 뒷면
    for (let yy = 50; yy < 212; yy++) for (let xx = 18; xx < 162; xx++) if (inBody(xx, yy)) { x.fillStyle = (xx + yy) % 2 ? "rgba(255,255,255,.55)" : "rgba(253,232,240,.6)"; x.fillRect(xx, yy, 1, 1); }
    // 쪽지들
    const lay = layout(current());
    lay.forEach((p, i) => {
      let y = p.y;
      const d = drops.find((dd) => dd.id === p.e.id);
      if (d) { d.t++; const k = Math.min(1, d.t / 40); y = Math.round(30 + (p.y - 30) * (k * k)); if (d.t === 40) PX.sfx("drop"); if (d.t > 60) drops.splice(drops.indexOf(d), 1); }
      const hov = i === hover ? -2 : 0;
      const [w, h] = PX.origami.size(p.e.shape);
      const sc = 1;
      PX.origami.draw(x, SHAPES.includes(p.e.shape) ? p.e.shape : "crane", p.e.color || "#f8bfd3", p.x + Math.round((20 - w) / 2), y + hov, sc, p.flip);
      if (i === hover) { x.fillStyle = "#e0578a"; x.fillRect(p.x + 8, y - 6 + hov, 4, 2); x.fillRect(p.x + 9, y - 4 + hov, 2, 1); }
    });
    // 유리 테두리
    x.fillStyle = "#cdb3c2";
    for (let yy = 48; yy < 214; yy++) for (let xx = 16; xx < 164; xx++) {
      if (inBody(xx, yy)) continue;
      if (inBody(xx + 1, yy) || inBody(xx - 1, yy) || inBody(xx, yy + 1) || inBody(xx, yy - 1)) x.fillRect(xx, yy, 1, 1);
    }
    // 하이라이트
    x.fillStyle = "rgba(255,255,255,.9)";
    x.fillRect(32, 96, 3, 70); x.fillRect(36, 88, 2, 20); x.fillRect(146, 120, 2, 40); x.fillRect(70, 62, 10, 2);
    // 병목
    x.fillStyle = "rgba(255,255,255,.6)"; x.fillRect(66, 34, 48, 26);
    x.fillStyle = "#cdb3c2"; x.fillRect(65, 34, 1, 26); x.fillRect(114, 34, 1, 26); x.fillRect(62, 30, 56, 4);
    // 코르크
    x.fillStyle = "#c79a64"; x.fillRect(68, 12, 44, 22); x.fillStyle = "#b0824f"; x.fillRect(68, 30, 44, 4);
    x.fillStyle = "#dcb784"; x.fillRect(68, 12, 44, 3);
    [[74, 18], [86, 22], [98, 17], [104, 25], [80, 27]].forEach(([a, b]) => { x.fillStyle = "#9a6f3f"; x.fillRect(a, b, 2, 1); });
    x.fillStyle = "#e8d2b0"; x.fillRect(78, 16, 24, 9); x.fillStyle = "#e0578a"; PX.text(x, "S*O", 90, 18, "#b83a6b", 1, "center");
    // 리본
    const rb = "#e0578a", rbd = "#b83a6b";
    x.fillStyle = rb; x.fillRect(64, 40, 52, 7); x.fillStyle = rbd; x.fillRect(64, 46, 52, 1);
    const bowL = ["..oooo", ".oaaao", "oaaaao", "oaaaao", ".oaaao", "..oooo"], bowR = bowL.map((r) => r.split("").reverse().join(""));
    PX.drawRows(x, bowL, { o: rbd, a: rb }, 108, 37, 1); PX.drawRows(x, bowR, { o: rbd, a: rb }, 120, 37, 1);
    x.fillStyle = rbd; x.fillRect(114, 39, 6, 6); x.fillStyle = rb; x.fillRect(115, 40, 4, 4);
    const tail = (sx, dir) => { for (let i = 0; i < 14; i++) { const xx = sx + dir * Math.round(i * 0.35) + Math.round(Math.sin(i / 3 + t / 30)), yy = 45 + i; x.fillStyle = rb; x.fillRect(xx, yy, 3, 1); } x.fillStyle = rbd; x.fillRect(sx + dir * 5 - 1, 59, 2, 2); x.fillRect(sx + dir * 5 + 2, 59, 2, 2); };
    tail(114, -1); tail(118, 1);
  }
  function loop() { if (!running) { raf = null; return; } drawJar(); raf = requestAnimationFrame(loop); }
  function updateTag() {
    const total = Math.max(1, Math.ceil(entries.length / PER));
    PX.$(".bt-tag", root).textContent = `병 ${bottleIdx + 1} / ${total} · 쪽지 ${entries.length}개`;
    PX.$(".bt-prev", root).disabled = bottleIdx <= 0;
    PX.$(".bt-next", root).disabled = bottleIdx >= total - 1;
  }

  /* ---------- 쪽지 펼치기 ---------- */
  function fmt(ts) {
    if (!ts || !ts.toDate) return "방금";
    const d = ts.toDate(), p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function avatar(str, size = 32) {
    const c = document.createElement("canvas"); c.width = c.height = 32; c.className = "note-av";
    const g = str ? PX.maker.decode(str) : null, x = c.getContext("2d");
    if (g) PX.maker.drawGrid(x, g, 0, 0, 1);
    else { x.fillStyle = "#fbe1eb"; x.fillRect(6, 6, 20, 20); x.fillStyle = "#3a1d2e"; x.fillRect(6, 6, 20, 1); x.fillRect(6, 25, 20, 1); x.fillRect(6, 6, 1, 20); x.fillRect(25, 6, 1, 20); PX.text(x, "?", 16, 11, "#e0578a", 2, "center"); }
    return c;
  }
  function shapeIcon(shape, color, s = 2) {
    const [w, h] = PX.origami.size(shape), c = document.createElement("canvas");
    c.width = w * s; c.height = h * s; PX.origami.draw(c.getContext("2d"), shape, color, 0, 0, s); return c;
  }
  function noteEl(e) {
    const paper = PX.tint(e.color || "#f8bfd3", 0.72);
    const el = document.createElement("div");
    el.className = "note-paper";
    el.style.setProperty("--paper", paper); el.style.setProperty("--ink-line", PX.tint(PX.shade(e.color || "#f8bfd3", 0.1), 0.35));
    el.innerHTML = `<div class="note-top"></div><p class="note-msg"></p><div class="note-foot"><div class="note-from"><span>from.</span><b></b></div><time></time></div>`;
    el.querySelector(".note-top").append(shapeIcon(e.shape || "crane", e.color || "#f8bfd3", 2), avatar(e.avatar));
    const msg = el.querySelector(".note-msg"); msg.textContent = e.message; msg.style.fontFamily = `"${e.font || "Handletter"}", "Galmuri11", sans-serif`;
    el.querySelector(".note-from b").textContent = e.name;
    el.querySelector("time").textContent = fmt(e.createdAt);
    return el;
  }
  function openNote(idx) {
    let i = idx;
    const body = document.createElement("div"); body.className = "note-view";
    const nav = document.createElement("div"); nav.className = "note-nav";
    nav.innerHTML = `<button type="button" class="px-btn sm ghost nv-p">◀ 이전</button><span class="nv-c"></span><button type="button" class="px-btn sm ghost nv-n">다음 ▶</button>`;
    const slot = document.createElement("div"); slot.className = "note-slot";
    body.append(slot, nav);
    const show = () => {
      const e = entries[i]; slot.innerHTML = ""; const n = noteEl(e); n.classList.add("unfold"); slot.appendChild(n);
      nav.querySelector(".nv-c").textContent = `${i + 1} / ${entries.length}`;
      nav.querySelector(".nv-p").disabled = i <= 0; nav.querySelector(".nv-n").disabled = i >= entries.length - 1;
    };
    const m = PX.ui.modal({ title: "NOTE.TXT — 쪽지 펼치기", body, cls: "note-modal" });
    nav.querySelector(".nv-p").onclick = () => { if (i > 0) { i--; show(); PX.sfx("move"); } };
    nav.querySelector(".nv-n").onclick = () => { if (i < entries.length - 1) { i++; show(); PX.sfx("move"); } };
    const key = (e) => { if (!document.body.contains(body)) return document.removeEventListener("keydown", key); if (e.key === "ArrowLeft") nav.querySelector(".nv-p").click(); if (e.key === "ArrowRight") nav.querySelector(".nv-n").click(); };
    document.addEventListener("keydown", key);
    show(); PX.sfx("paint");
  }
  function buildList() {
    const box = PX.$(".bt-list", root); if (!box) return;
    box.innerHTML = "";
    entries.slice().reverse().forEach((e) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "bt-item";
      b.style.setProperty("--paper", PX.tint(e.color || "#f8bfd3", 0.72));
      b.appendChild(shapeIcon(e.shape || "crane", e.color || "#f8bfd3", 2));
      const s = document.createElement("span"); s.innerHTML = `<b></b><i></i>`;
      s.querySelector("b").textContent = e.name; s.querySelector("i").textContent = e.message.slice(0, 40);
      b.appendChild(s); b.onclick = () => openNote(entries.indexOf(e));
      box.appendChild(b);
    });
  }

  /* ---------- 작성 폼 ---------- */
  function buildForm() {
    const shapes = PX.$(".bt-shapes", root); shapes.innerHTML = "";
    PX.origami.list.forEach((o) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "bt-shape" + (draft.shape === o.id ? " is-on" : ""); b.title = o.name;
      b.appendChild(shapeIcon(o.id, draft.color, 2)); const s = document.createElement("span"); s.textContent = o.name; b.appendChild(s);
      b.onclick = () => { draft.shape = o.id; saveDraft(); buildForm(); PX.sfx("move"); };
      shapes.appendChild(b);
    });
    const sw = PX.$(".bt-colors", root); sw.innerHTML = "";
    PX.origami.COLORS.forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "sw" + (draft.color === c ? " is-on" : ""); b.style.setProperty("--c", c);
      b.onclick = () => { draft.color = c; saveDraft(); buildForm(); PX.sfx("move"); };
      sw.appendChild(b);
    });
    sw.appendChild(PX.ui.colorButton({ value: draft.color, cls: "sw-custom" + (PX.origami.COLORS.includes(draft.color) ? "" : " is-on"),
      onInput: (c) => { draft.color = c; preview(); }, onCommit: (c) => { draft.color = c; saveDraft(); buildForm(); } }));
    preview();
  }
  function preview() {
    const ta = PX.$("textarea[name=message]", root);
    ta.style.fontFamily = `"${draft.font}", "Galmuri11", sans-serif`;
    ta.parentElement.style.setProperty("--paper", PX.tint(draft.color, 0.72));
    ta.parentElement.style.setProperty("--ink-line", PX.tint(PX.shade(draft.color, 0.1), 0.35));
    const pv = PX.$(".bt-fold", root); pv.innerHTML = ""; pv.appendChild(shapeIcon(draft.shape, draft.color, 4));
    const av = PX.$(".bt-av", root); av.innerHTML = ""; av.appendChild(avatar(draft.attach ? PX.maker.encode() : null));
    PX.$(".bt-attach", root).classList.toggle("is-on", draft.attach);
  }
  const saveDraft = () => PX.store.set("noteDraft", draft);
  async function submit(e) {
    e.preventDefault();
    const f = e.target, name = f.name.value.trim(), message = f.message.value.trim();
    if (!name || !message) return PX.toast("이름과 쪽지 내용을 모두 적어 주세요");
    const last = PX.store.get("gbLast", 0);
    if (Date.now() - last < COOLDOWN) return PX.toast(`조금만 기다렸다가 다시 넣어 주세요 (${Math.ceil((COOLDOWN - (Date.now() - last)) / 1000)}초)`);
    if (!fb) return PX.toast("방명록 서버에 연결 중이에요. 잠시 후 다시 시도해 주세요");
    const btn = PX.$(".bt-submit", f); btn.disabled = true; btn.textContent = "접는 중…";
    try {
      const data = { name: name.slice(0, 12), message: message.slice(0, 200), shape: draft.shape, color: draft.color.toLowerCase(), font: draft.font, createdAt: fb.serverTimestamp() };
      if (draft.attach) data.avatar = PX.maker.encode();
      await fb.addDoc(col, data);
      PX.store.set("gbLast", Date.now()); PX.store.set("gbName", name);
      f.message.value = ""; count();
      PX.sfx("send"); PX.toast("쪽지를 병에 넣었어요. 고마워요!");
    } catch (err) { console.error(err); PX.sfx("hit"); PX.toast("저장에 실패했어요 (" + (err.code || "error") + ")"); }
    finally { btn.disabled = false; btn.textContent = "쪽지 접어서 병에 넣기"; }
  }
  const count = () => { PX.$(".bt-count", root).textContent = `${PX.$("textarea[name=message]", root).value.length}/200`; };

  function mount(el) {
    root = el;
    jar = PX.$(".bt-jar", el); jx = jar.getContext("2d");
    const form = PX.$(".bt-form", el);
    form.name.value = PX.store.get("gbName", "");
    form.addEventListener("submit", submit);
    form.message.addEventListener("input", count);
    form.message.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) form.requestSubmit(); });
    PX.$(".bt-fontslot", el).appendChild(PX.ui.select({ options: NOTE_FONTS, value: draft.font, fontPreview: true, onChange: (v) => { draft.font = v; saveDraft(); preview(); } }));
    PX.$(".bt-attach", el).onclick = () => { draft.attach = !draft.attach; saveDraft(); preview(); PX.sfx("move"); };
    PX.$(".bt-edit", el).onclick = () => PX.goStage(3);
    PX.$(".bt-prev", el).onclick = () => { if (bottleIdx > 0) { bottleIdx--; updateTag(); PX.sfx("move"); } };
    PX.$(".bt-next", el).onclick = () => { if (bottleIdx < Math.ceil(entries.length / PER) - 1) { bottleIdx++; updateTag(); PX.sfx("move"); } };
    PX.$(".bt-listbtn", el).onclick = () => { const l = PX.$(".bt-list", el); l.hidden = !l.hidden; PX.$(".bt-listbtn", el).textContent = l.hidden ? "쪽지 목록 펼치기" : "쪽지 목록 접기"; };
    const pick = (e) => {
      const r = jar.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * JW, py = ((e.clientY - r.top) / r.height) * JH;
      const lay = layout(current());
      for (let i = lay.length - 1; i >= 0; i--) { const p = lay[i]; if (px >= p.x - 1 && px <= p.x + 21 && py >= p.y - 2 && py <= p.y + 12) return i; }
      return -1;
    };
    jar.addEventListener("pointermove", (e) => { hover = pick(e); jar.style.cursor = hover >= 0 ? "pointer" : "default"; });
    jar.addEventListener("pointerleave", () => (hover = -1));
    jar.addEventListener("click", (e) => { const i = pick(e); if (i >= 0) openNote(bottleIdx * PER + i); });
    PX.maker.onChange(preview);
    buildForm(); count(); updateTag();
    status("병을 여는 중…");
    init().then(listen).catch((err) => { console.error(err); status("방명록 서버에 연결하지 못했어요. 네트워크 상태를 확인해 주세요."); });
  }
  PX.bottle = {
    mount,
    show() { if (!running) { running = true; raf = requestAnimationFrame(loop); } },
    hide() { running = false; }
  };
})();
