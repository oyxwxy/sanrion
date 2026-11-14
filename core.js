/* =========================================================
   CORE — 공용 네임스페이스 / 사운드 / 비트맵 폰트 / 입력
   ========================================================= */
(function () {
  const PX = (window.PX = window.PX || {});
  const CFG = window.SITE_CONFIG;

  /* ---------- storage (iframe 등에서 막혀도 안 터지게) ---------- */
  PX.store = {
    get(k, d) {
      try { const v = localStorage.getItem("pxanniv_" + k); return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("pxanniv_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- 날짜 ---------- */
  PX.daysSinceStart = function () {
    const s = new Date(CFG.startDate + "T00:00:00");
    const n = new Date(); n.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((n - s) / 86400000));
  };

  /* ---------- 사운드 (WebAudio 칩튠 효과음) ---------- */
  let actx = null;
  PX.muted = PX.store.get("muted", false);
  function ac() {
    if (!actx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      actx = new C();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function tone(freq, start, dur, type, vol, slideTo) {
    const a = ac(); if (!a) return;
    const t = a.currentTime + start;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.06, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(start, dur, vol) {
    const a = ac(); if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(), g = a.createGain();
    s.buffer = buf; g.gain.value = vol || 0.05;
    s.connect(g); g.connect(a.destination);
    s.start(a.currentTime + start);
  }
  const SFX = {
    blip: () => tone(880, 0, 0.05, "square", 0.04),
    move: () => tone(660, 0, 0.04, "square", 0.03),
    select: () => { tone(988, 0, 0.06); tone(1318, 0.06, 0.1); },
    back: () => { tone(660, 0, 0.06); tone(440, 0.06, 0.08); },
    jump: () => tone(300, 0, 0.14, "square", 0.05, 700),
    coin: () => { tone(988, 0, 0.06, "square", 0.05); tone(1568, 0.06, 0.16, "square", 0.05); },
    hit: () => { noise(0, 0.25, 0.08); tone(200, 0, 0.25, "square", 0.05, 60); },
    drop: () => tone(520, 0, 0.08, "triangle", 0.08),
    perfect: () => { tone(784, 0, 0.06); tone(1046, 0.06, 0.06); tone(1318, 0.12, 0.12); },
    brick: () => tone(1200, 0, 0.04, "square", 0.04),
    paddle: () => tone(500, 0, 0.04, "square", 0.04),
    lose: () => { tone(494, 0, 0.12); tone(415, 0.12, 0.12); tone(330, 0.24, 0.3); },
    clear: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.08, 0.12)),
    boot: () => { tone(1046, 0, 0.09, "square", 0.05); tone(2093, 0.09, 0.5, "square", 0.04); },
    paint: () => tone(1400, 0, 0.02, "square", 0.015),
    send: () => [659, 784, 988, 1318].forEach((f, i) => tone(f, i * 0.07, 0.1))
  };
  let unlocked = false;
  PX.sfx = function (name) {
    if (PX.muted || !unlocked) return;
    try { SFX[name] && SFX[name](); } catch (e) {}
  };
  PX.unlockAudio = function () { unlocked = true; try { ac(); } catch (e) {} };

  /* ---------- 3x5 비트맵 폰트 (캔버스용, 영문/숫자) ---------- */
  const G = {
    " ": "...............", "-": "......###......", "+": "....#.###.#....", "'": ".#..#..........",
    ",": "..........#.#..", "=": "...###...###...", "(": ".#.#..#..#...#.", ")": ".#...#..#..#.#."
  };
  const rows = (a) => a.join("");
  G.A = rows([".#.", "#.#", "###", "#.#", "#.#"]);
  G.H = rows(["#.#", "#.#", "###", "#.#", "#.#"]);
  G.M = rows(["#.#", "###", "###", "#.#", "#.#"]);
  G.W = rows(["#.#", "#.#", "###", "###", "#.#"]);
  G.N = rows(["##.", "#.#", "#.#", "#.#", "#.#"]);
  G.U = rows(["#.#", "#.#", "#.#", "#.#", "###"]);
  G.V = rows(["#.#", "#.#", "#.#", "#.#", ".#."]);
  G.X = rows(["#.#", "#.#", ".#.", "#.#", "#.#"]);
  G.Y = rows(["#.#", "#.#", ".#.", ".#.", ".#."]);
  G.K = rows(["#.#", "#.#", "##.", "#.#", "#.#"]);
  G.J = rows(["..#", "..#", "..#", "#.#", ".#."]);
  G.Q = rows([".#.", "#.#", "#.#", "##.", ".##"]);
  G.S = rows([".##", "#..", ".#.", "..#", "##."]);
  G.Z = rows(["###", "..#", ".#.", "#..", "###"]);
  G.G = rows([".##", "#..", "#.#", "#.#", ".##"]);
  G.D = rows(["##.", "#.#", "#.#", "#.#", "##."]);
  G.B = rows(["##.", "#.#", "##.", "#.#", "##."]);
  G.R = rows(["##.", "#.#", "##.", "#.#", "#.#"]);
  G.P = rows(["##.", "#.#", "##.", "#..", "#.."]);
  G.O = rows([".#.", "#.#", "#.#", "#.#", ".#."]);
  G.C = rows([".##", "#..", "#..", "#..", ".##"]);
  G.E = rows(["###", "#..", "##.", "#..", "###"]);
  G.F = rows(["###", "#..", "##.", "#..", "#.."]);
  G.I = rows(["###", ".#.", ".#.", ".#.", "###"]);
  G.L = rows(["#..", "#..", "#..", "#..", "###"]);
  G.T = rows(["###", ".#.", ".#.", ".#.", ".#."]);
  G["0"] = rows(["###", "#.#", "#.#", "#.#", "###"]);
  G["1"] = rows([".#.", "##.", ".#.", ".#.", "###"]);
  G["2"] = rows(["##.", "..#", ".#.", "#..", "###"]);
  G["3"] = rows(["##.", "..#", ".#.", "..#", "##."]);
  G["4"] = rows(["#.#", "#.#", "###", "..#", "..#"]);
  G["5"] = rows(["###", "#..", "##.", "..#", "##."]);
  G["6"] = rows([".##", "#..", "###", "#.#", "###"]);
  G["7"] = rows(["###", "..#", ".#.", ".#.", ".#."]);
  G["8"] = rows(["###", "#.#", "###", "#.#", "###"]);
  G["9"] = rows(["###", "#.#", "###", "..#", "##."]);
  G["*"] = rows(["#.#", "###", "###", ".#.", "..."]); // 하트
  G[">"] = rows(["#..", ".#.", "..#", ".#.", "#.."]);
  G["<"] = rows(["..#", ".#.", "#..", ".#.", "..#"]);
  G["!"] = rows([".#.", ".#.", ".#.", "...", ".#."]);
  G["?"] = rows(["##.", "..#", ".#.", "...", ".#."]);
  G[":"] = rows(["...", ".#.", "...", ".#.", "..."]);
  G["."] = rows(["...", "...", "...", "...", ".#."]);
  G["/"] = rows(["..#", "..#", ".#.", "#..", "#.."]);
  G["x"] = rows(["...", "#.#", ".#.", "#.#", "..."]);

  PX.textWidth = (str, s = 1) => str.length * 4 * s - s;
  PX.text = function (ctx, str, x, y, color, s = 1, align = "left") {
    str = String(str).toUpperCase();
    if (align === "center") x = Math.round(x - PX.textWidth(str, s) / 2);
    else if (align === "right") x = Math.round(x - PX.textWidth(str, s));
    ctx.fillStyle = color;
    for (let i = 0; i < str.length; i++) {
      const g = G[str[i]] || G["?"];
      for (let p = 0; p < 15; p++) {
        if (g[p] === "#") ctx.fillRect(x + (p % 3) * s + i * 4 * s, y + Math.floor(p / 3) * s, s, s);
      }
    }
  };

  /* ---------- 입력 (키보드 + 화면 버튼 공용) ---------- */
  const KEYMAP = {
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    KeyZ: "a", Space: "a", KeyJ: "a", KeyX: "b", KeyK: "b",
    Enter: "start", ShiftLeft: "select", ShiftRight: "select", Backspace: "select"
  };
  const input = (PX.input = {
    down: {}, pressed: {}, enabled: false,
    press(k) { if (!this.down[k]) this.pressed[k] = true; this.down[k] = true; },
    release(k) { this.down[k] = false; },
    endFrame() { this.pressed = {}; },
    reset() { this.down = {}; this.pressed = {}; }
  });
  function typing(e) {
    const t = e.target;
    return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  }
  window.addEventListener("keydown", (e) => {
    if (!input.enabled || typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = KEYMAP[e.code];
    if (k) { e.preventDefault(); input.press(k); }
  });
  window.addEventListener("keyup", (e) => {
    const k = KEYMAP[e.code];
    if (k) input.release(k);
  });
  window.addEventListener("blur", () => input.reset());

  PX.bindPad = function (root) {
    root.querySelectorAll("[data-btn]").forEach((el) => {
      const k = el.dataset.btn;
      const on = (e) => { e.preventDefault(); el.classList.add("is-down"); input.press(k); PX.unlockAudio(); };
      const off = () => { el.classList.remove("is-down"); input.release(k); };
      el.addEventListener("pointerdown", on);
      el.addEventListener("pointerup", off);
      el.addEventListener("pointerleave", off);
      el.addEventListener("pointercancel", off);
      el.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  };

  /* ---------- 유틸 ---------- */
  PX.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  PX.rand = (a, b) => a + Math.random() * (b - a);
  PX.randi = (a, b) => Math.floor(PX.rand(a, b + 1));
  PX.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  PX.hexToRgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  PX.rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => PX.clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  // 픽셀아트식 음영: 어둡게 + 살짝 차가운 쪽으로
  PX.shade = (hex, amt = 0.22) => {
    const [r, g, b] = PX.hexToRgb(hex);
    return PX.rgbToHex(r * (1 - amt) - 6, g * (1 - amt) - 4, b * (1 - amt) + 6);
  };
  PX.tint = (hex, amt = 0.3) => {
    const [r, g, b] = PX.hexToRgb(hex);
    return PX.rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  };
  PX.on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  PX.$ = (s, r = document) => r.querySelector(s);
  PX.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  /* 임베드(iframe) 안에서도 "지금 보이는 영역"을 계산 */
  PX.viewport = function () {
    const app = PX.$(".px-app"), r = app.getBoundingClientRect();
    let top = -r.top, h = window.innerHeight;
    try {
      const fe = window.frameElement;
      if (fe) { const fr = fe.getBoundingClientRect(); top = Math.max(top, -fr.top - r.top); h = Math.min(h, window.parent.innerHeight); }
    } catch (e) {}
    return { top: Math.max(0, top), h };
  };
  PX.toast = function (msg) {
    let t = PX.$(".px-toast");
    if (!t) { t = document.createElement("div"); t.className = "px-toast"; PX.$(".px-app").appendChild(t); }
    const v = PX.viewport(), app = PX.$(".px-app");
    t.style.top = Math.min(app.offsetHeight - 60, v.top + v.h - 70) + "px"; t.style.bottom = "auto";
    t.textContent = msg;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2000);
  };
})();
