/* =========================================================
   STAGE 2 — 가로형 휴대용 콘솔 + 미니게임 4종
   256x144 / 핑크 4톤
   ========================================================= */
(function () {
  const PX = window.PX, I = PX.input;
  const S = ["#fbe4ee", "#eea7c2", "#b8486f", "#4a1d34"];
  const W = 256, H = 144;
  let ctx, cv, scene, active = false, raf = null, acc = 0, lastT = 0, paused = false;
  const onSelectCbs = [];

  const rect = (x, y, w, h, c) => { ctx.fillStyle = S[c]; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const txt = (s, x, y, c = 3, sc = 1, al = "left") => PX.text(ctx, s, Math.round(x), Math.round(y), S[c], sc, al);
  function sprite(rows, x, y, flip) {
    x = Math.round(x); y = Math.round(y);
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = flip ? r[r.length - 1 - i] : r[i]; if (ch === ".") continue; ctx.fillStyle = S[+ch]; ctx.fillRect(x + i, y + j, 1, 1); } });
  }
  function panel(x, y, w, h) { rect(x + 1, y, w - 2, h, 3); rect(x, y + 1, w, h - 2, 3); rect(x + 1, y + 1, w - 2, h - 2, 0); rect(x + 2, y + h - 2, w - 4, 1, 1); }
  const pad = (n, l = 5) => String(Math.floor(n)).padStart(l, "0");
  const best = (k) => PX.store.get("best_" + k, 0);
  const setBest = (k, v) => { if (v > best(k)) { PX.store.set("best_" + k, Math.floor(v)); return true; } return false; };
  function overBox(title, lines, overT, newBest, key) {
    panel(W / 2 - 56, 40, 112, 50);
    txt(title, W / 2, 46, 3, 1, "center");
    lines.forEach((l, i) => txt(l, W / 2, 58 + i * 8, 3, 1, "center"));
    const y = 58 + lines.length * 8;
    if (newBest && Math.floor(overT / 15) % 2) txt("NEW RECORD!", W / 2, y, 2, 1, "center");
    else if (!newBest) txt("BEST " + pad(best(key)), W / 2, y, 2, 1, "center");
    if (overT > 35) txt("A: RETRY", W / 2, y + 9, 2, 1, "center");
  }

  function progress(k) {
    const x0 = 74, w = W - 148; k = PX.clamp(k, 0, 1);
    rect(x0, 4, w, 5, 3); rect(x0 + 1, 5, w - 2, 3, 0); rect(x0 + 1, 5, Math.round((w - 2) * k), 3, 2);
    sprite([".33.33.", "3223223", "3222223", ".32223.", "..323..", "...3..."], x0 + w + 2, 3);
  }

  /* 산타 / 오리온 미니 스프라이트 */
  const SANTA_HEAD = ["...333333...", "..33303333..", ".3330333333.", ".3303333333.", "330000000033", "300300003003", "300000000003", "300002200003", ".3000000003."];
  const SANTA_BODY = [".3332223333.", "333330333333"];
  const ORION_HEAD = ["...333333...", "..33333333..", ".3333333333.", ".3333333333.", "333000000333", "330200002033", "331000000133", "330002200033", "333300003333"];
  const ORION_BODY = ["33.300003.33", "32.300003.23"];
  const mk = (h, b) => ({ a: [...h, ...b, "..33....33.."], b: [...h, ...b, "...33..33..."], j: [...h, ...b, ".33......33."] });
  const HEROES = [{ name: "SANTA", spr: mk(SANTA_HEAD, SANTA_BODY) }, { name: "ORION", spr: mk(ORION_HEAD, ORION_BODY) }];
  let hero = PX.store.get("hero", 0);
  const GEM = [".3.3.", "30303", "30003", ".303.", "..3.."];
  const ITEMS = {
    cake: { rows: ["......33", "....3003", "..300003", "30000003", "31111113", "32222223", "31111113", "33333333"], pts: 10 },
    cocoa: { rows: ["..1..1...", ".1..1....", "3333333..", "3000003..", "311111333", "3131113.3", "311111333", ".33333..."], pts: 10 },
    heart: { rows: [".33.33.", "3113113", "3111113", ".31113.", "..313..", "...3..."], pts: 30 },
    coffee: { rows: ["..1..1...", ".1..1....", "3333333..", "3222223..", "322222333", "3222223.3", "322222333", ".33333..."], bad: true },
    toast: { rows: [".333333.", "33333333", "32323233", "33232323", "32323233", "33333333"], bad: true }
  };

  /* ---------- 메뉴 ---------- */
  const GAMES = [
    { id: "runner", title: "JUMP RUN", sub: "JUMP!" },
    { id: "catch", title: "SWEET CATCH", sub: "COCOA+CAKE" },
    { id: "stack", title: "CAKE STACK", sub: "STACK IT" },
    { id: "brick", title: "BRICK BREAK", sub: "BREAK IT" }
  ];
  const menu = {
    sel: 0, t: 0,
    enter() { this.t = 0; onSelectCbs.forEach((f) => f(GAMES[this.sel].id)); },
    move(d) { this.sel = (this.sel + d + GAMES.length) % GAMES.length; PX.sfx("move"); onSelectCbs.forEach((f) => f(GAMES[this.sel].id)); },
    update() {
      this.t++;
      if (I.pressed.left || I.pressed.up) this.move(-1);
      if (I.pressed.right || I.pressed.down) this.move(1);
      if (I.pressed.a || I.pressed.start) { PX.sfx("select"); go(SCENES[GAMES[this.sel].id]); }
    },
    draw() {
      rect(0, 0, W, H, 0);
      for (let y = 0; y < 20; y++) for (let x = y % 2; x < W; x += 2) rect(x, y, 1, 1, 1);
      rect(0, 20, W, 2, 3);
      txt("GAME SELECT", W / 2, 8, 3, 1, "center");
      const cw = 52, gap = 8, x0 = (W - (cw * 4 + gap * 3)) / 2;
      GAMES.forEach((g, i) => {
        const on = i === this.sel, x = x0 + i * (cw + gap), y = 38 - (on ? 3 + (Math.floor(this.t / 20) % 2) : 0);
        rect(x, y, cw, 60, on ? 3 : 2); rect(x + 3, y + 3, cw - 6, 30, on ? 0 : 1);
        rect(x + 6, y + 40, cw - 12, 1, 1); rect(x + 6, y + 43, cw - 12, 1, 1);
        txt(String(i + 1), x + cw / 2, y + 14, on ? 3 : 2, 1, "center");
        txt(g.title.split(" ")[0], x + cw / 2, y + 48, on ? 0 : 1, 1, "center");
        txt(g.title.split(" ")[1] || "", x + cw / 2, y + 54, on ? 0 : 1, 1, "center");
        if (on) txt("V", x + cw / 2, y - 8, 3, 1, "center");
      });
      const g = GAMES[this.sel];
      txt(g.title, W / 2, 104, 3, 1, "center");
      txt("BEST " + pad(best(g.id), 4), W / 2, 113, 2, 1, "center");
      rect(0, 124, W, 1, 2);
      const f = Math.floor(this.t / 12) % 2;
      sprite(f ? HEROES[0].spr.a : HEROES[0].spr.b, W - 40, 127 - (Math.floor(this.t / 24) % 2));
      sprite(f ? HEROES[1].spr.b : HEROES[1].spr.a, W - 24, 127 - (Math.floor((this.t + 12) / 24) % 2), true);
      txt("<> CHOOSE  A:PLAY", 6, 132, 2);
    }
  };

  /* ---------- 1. 점프 런 ---------- */
  const GY = 116, RUN_GOAL = 6000;
  const runner = {
    enter() { Object.assign(this, { x: 36, y: GY - 12, vy: 0, ground: true, dist: 0, bonus: 0, obs: [], gems: [], parts: [], nextObs: 120, over: false, overT: 0, coyote: 0, buffer: 0, newBest: false, t: 0, started: false, speed: 1.8 }); },
    update() {
      this.t++;
      if (this.over) { this.overT++; if (this.overT > 35 && (I.pressed.a || I.pressed.start)) { PX.sfx("select"); this.enter(); } return; }
      if (!this.started) {
        if (I.pressed.left || I.pressed.right) { hero = 1 - hero; PX.store.set("hero", hero); PX.sfx("move"); }
        if (I.pressed.a || I.pressed.up) this.started = true; else return;
      }
      this.speed = Math.min(4.6, 1.8 + this.dist / 2600); this.dist += this.speed;
      if (I.pressed.a || I.pressed.up) this.buffer = 7;
      if (this.ground) this.coyote = 6;
      if (this.buffer > 0 && this.coyote > 0) { this.vy = -4.7; this.ground = false; this.coyote = 0; this.buffer = 0; PX.sfx("jump"); }
      this.buffer--; this.coyote--;
      const holding = I.down.a || I.down.b || I.down.up;
      this.vy += this.vy < 0 && holding ? 0.2 : 0.42;
      if (I.down.down && !this.ground) this.vy += 0.3;
      this.y += this.vy;
      if (this.y >= GY - 12) { this.y = GY - 12; this.vy = 0; this.ground = true; } else this.ground = false;
      if (this.dist >= RUN_GOAL) { toEnding("runner", this.score()); return; }
      this.nextObs -= this.speed;
      if (this.nextObs <= 0 && this.dist < RUN_GOAL - 500) {
        const kind = this.dist > 900 && Math.random() < 0.25 ? "double" : "block";
        const h = PX.pick([8, 10, 12, 14]), w = kind === "double" ? 18 : PX.pick([8, 10]);
        this.obs.push({ x: W + 4, w, h, kind });
        if (Math.random() < 0.55) this.gems.push({ x: W + 4 + w / 2 - 2, y: GY - h - 22 - PX.randi(0, 10), got: false });
        this.nextObs = PX.rand(80, 140) + this.speed * 18;
      }
      this.obs.forEach((o) => (o.x -= this.speed)); this.gems.forEach((g) => (g.x -= this.speed));
      this.obs = this.obs.filter((o) => o.x > -30); this.gems = this.gems.filter((g) => g.x > -10 && !g.got);
      const px = this.x + 2, py = this.y + 2, pw = 8, ph = 9;
      for (const o of this.obs) if (px < o.x + o.w && px + pw > o.x && py + ph > GY - o.h) { this.over = true; this.overT = 0; PX.sfx("hit"); this.newBest = setBest("runner", this.score()); setTimeout(() => this.over && PX.sfx("lose"), 350); return; }
      for (const g of this.gems) if (px < g.x + 5 && px + pw > g.x && py < g.y + 5 && py + ph + 2 > g.y) { g.got = true; this.bonus += 10; PX.sfx("coin"); this.parts.push({ x: g.x, y: g.y, t: 0, txt: "+10" }); }
      this.parts.forEach((p) => { p.t++; p.y -= 0.4; }); this.parts = this.parts.filter((p) => p.t < 40);
    },
    score() { return Math.floor(this.dist / 8) + this.bonus; },
    draw() {
      const t = this.t, off = this.dist;
      rect(0, 0, W, H, 0);
      for (let x = 0; x < W; x++) { const h = 12 + Math.round(6 * Math.sin((x + off * 0.2) / 16) + 3 * Math.sin((x + off * 0.2) / 6)); rect(x, GY - h - 10, 1, h + 10, 1); }
      [[30, 24], [110, 14], [190, 34], [240, 20]].forEach(([cx, cy]) => { const x = ((cx - off * 0.1) % (W + 30) + W + 30) % (W + 30) - 20; rect(x + 2, cy, 10, 2, 1); rect(x, cy + 2, 16, 3, 1); });
      rect(0, GY, W, 1, 3); rect(0, GY + 1, W, H - GY - 1, 2);
      for (let x = -(off % 12); x < W; x += 12) { rect(x, GY + 4, 4, 1, 1); rect(x + 6, GY + 9, 3, 1, 1); rect(x + 2, GY + 15, 5, 1, 1); }
      this.obs.forEach((o) => { rect(o.x, GY - o.h, o.w, o.h, 3); rect(o.x + 1, GY - o.h + 1, o.w - 2, o.h - 1, 2); for (let y = GY - o.h + 3; y < GY; y += 4) rect(o.x + 2, y, o.w - 4, 1, 1); if (o.kind === "double") rect(o.x + o.w / 2 - 1, GY - o.h, 1, o.h, 3); });
      this.gems.forEach((g) => sprite(GEM, g.x, g.y + (Math.floor((t + g.x) / 10) % 2)));
      const HS = HEROES[hero].spr;
      let spr = this.ground ? (Math.floor(t / 6) % 2 ? HS.a : HS.b) : HS.j;
      if (!this.started) spr = Math.floor(t / 30) % 2 ? HS.a : HS.b;
      if (this.over) spr = HS.j;
      if (!(this.over && this.overT < 20 && Math.floor(this.overT / 3) % 2)) sprite(spr, this.x, this.y);
      this.parts.forEach((p) => p.txt && txt(p.txt, p.x - 4, p.y - 6, 3));
      txt("SCORE " + pad(this.score()), 4, 4); txt("HI " + pad(best("runner")), W - 4, 4, 2, 1, "right");
      progress(this.dist / RUN_GOAL);
      if (!this.started) { panel(W / 2 - 56, 34, 112, 42); txt("JUMP RUN", W / 2, 40, 3, 1, "center"); txt("< " + HEROES[hero].name + " >", W / 2, 52, Math.floor(t / 20) % 2 ? 3 : 2, 1, "center"); txt("PRESS A TO JUMP", W / 2, 64, 2, 1, "center"); }
      if (this.over && this.overT > 20) overBox("GAME OVER", ["SCORE " + pad(this.score())], this.overT, this.newBest, "runner");
    }
  };

  /* ---------- 2. 스위트 캐치 (핫초코·케이크 받기, 커피·탄토스트 피하기) ---------- */
  const CATCH_TIME = 60 * 60;
  const caught = {
    enter() { Object.assign(this, { x: W / 2 - 6, items: [], score: 0, lives: 3, t: 0, time: 0, over: false, overT: 0, newBest: false, spawn: 40, parts: [], started: false, flash: 0 }); },
    update() {
      this.t++;
      this.parts.forEach((p) => { p.t++; p.y -= 0.5; }); this.parts = this.parts.filter((p) => p.t < 35);
      if (this.flash) this.flash--;
      if (this.over) { this.overT++; if (this.overT > 35 && (I.pressed.a || I.pressed.start)) { PX.sfx("select"); this.enter(); } return; }
      if (!this.started) {
        if (I.pressed.up || I.pressed.down) { hero = 1 - hero; PX.store.set("hero", hero); PX.sfx("move"); }
        if (I.pressed.a) this.started = true; else return;
      }
      if (++this.time >= CATCH_TIME) { toEnding("catch", this.score); return; }
      const sp = I.down.a || I.down.b ? 3.6 : 2.4;
      if (I.down.left) this.x -= sp; if (I.down.right) this.x += sp;
      this.x = PX.clamp(this.x, 0, W - 12);
      const lvl = Math.min(1, this.t / 3600);
      if (--this.spawn <= 0 && this.time < CATCH_TIME - 120) {
        const r = Math.random();
        const kind = r < 0.36 ? "cake" : r < 0.7 ? "cocoa" : r < 0.78 ? "heart" : r < 0.9 ? "coffee" : "toast";
        this.items.push({ kind, x: PX.rand(4, W - 14), y: -10, vy: PX.rand(0.7, 1.1) + lvl * 1.4 });
        this.spawn = Math.max(14, 46 - lvl * 30 + PX.rand(-6, 6));
      }
      const px = this.x, py = GY - 13;
      this.items.forEach((it) => {
        it.y += it.vy;
        if (!it.done && it.y + 6 > py && it.y < py + 10 && it.x + 7 > px && it.x < px + 12) {
          it.done = true;
          if (ITEMS[it.kind].bad) { this.lives--; this.flash = 20; PX.sfx("hit"); this.parts.push({ x: it.x, y: it.y, t: 0, txt: it.kind === "coffee" ? "BITTER" : "BURNT" }); if (this.lives <= 0) { this.over = true; this.overT = 0; this.newBest = setBest("catch", this.score); setTimeout(() => PX.sfx("lose"), 300); } }
          else { const p = ITEMS[it.kind].pts; this.score += p; PX.sfx(p > 10 ? "perfect" : "coin"); this.parts.push({ x: it.x, y: it.y, t: 0, txt: "+" + p }); }
        }
      });
      this.items = this.items.filter((it) => !it.done && it.y < H);
    },
    draw() {
      const t = this.t;
      rect(0, 0, W, H, 0);
      for (let y = 6; y < GY; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) rect(x + 2, y, 2, 2, 1);
      rect(0, GY, W, 1, 3); rect(0, GY + 1, W, H - GY - 1, 2);
      for (let x = 0; x < W; x += 8) rect(x, GY + 4 + (x / 8) % 2 * 4, 4, 1, 1);
      this.items.forEach((it) => sprite(ITEMS[it.kind].rows, it.x, it.y));
      const HS = HEROES[hero].spr, moving = I.down.left || I.down.right;
      if (!(this.flash && Math.floor(this.flash / 3) % 2)) sprite(moving ? (Math.floor(t / 6) % 2 ? HS.a : HS.b) : HS.a, this.x, GY - 12, I.down.left);
      this.parts.forEach((p) => txt(p.txt, p.x - 4, p.y - 6, 3));
      txt("SCORE " + pad(this.score), 4, 4);
      if (this.started) txt("TIME " + String(Math.ceil((CATCH_TIME - this.time) / 60)).padStart(2, "0"), W / 2, 4, 3, 1, "center");
      for (let i = 0; i < 3; i++) txt("*", W - 10 - i * 7, 4, i < this.lives ? 3 : 1);
      if (!this.started) {
        panel(W / 2 - 70, 26, 140, 66);
        txt("SWEET CATCH", W / 2, 32, 3, 1, "center");
        sprite(ITEMS.cake.rows, W / 2 - 52, 44); sprite(ITEMS.cocoa.rows, W / 2 - 40, 44); sprite(ITEMS.heart.rows, W / 2 - 26, 45);
        txt("CATCH!", W / 2 + 2, 46, 2);
        sprite(ITEMS.coffee.rows, W / 2 - 50, 58); sprite(ITEMS.toast.rows, W / 2 - 38, 58);
        txt("AVOID!", W / 2 + 2, 60, 2);
        txt("^ " + HEROES[hero].name + " v   A: START", W / 2, 78, Math.floor(t / 20) % 2 ? 3 : 2, 1, "center");
      }
      if (this.over && this.overT > 20) overBox("FULL TUMMY", ["SCORE " + pad(this.score)], this.overT, this.newBest, "catch");
    }
  };

  /* ---------- 3. 케이크 쌓기 ---------- */
  const LH = 8, BASE_Y = 128, MAXW = 84, STACK_GOAL = 15;
  const stack = {
    enter() { Object.assign(this, { win: 0, layers: [{ x: (W - MAXW) / 2, w: MAXW }], cur: null, fall: [], cam: 0, over: false, overT: 0, combo: 0, t: 0, flash: 0, newBest: false, msg: null }); this.spawn(); },
    spawn() { const top = this.layers[this.layers.length - 1], n = this.layers.length; const fromLeft = n % 2 === 1; this.cur = { x: fromLeft ? 0 : W - top.w, w: top.w, dir: fromLeft ? 1 : -1, speed: Math.min(3.8, 1.1 + n * 0.08) }; },
    layerY(i) { return BASE_Y - (i + 1) * LH; },
    update() {
      this.t++;
      this.cam += (Math.max(0, (this.layers.length - 9) * LH) - this.cam) * 0.12;
      this.fall.forEach((f) => { f.vy += 0.25; f.y += f.vy; f.x += f.vx; }); this.fall = this.fall.filter((f) => f.y < H + this.cam + 40);
      if (this.flash) this.flash--; if (this.msg && ++this.msg.t > 40) this.msg = null;
      if (this.over) { this.overT++; if (this.overT > 40 && (I.pressed.a || I.pressed.start)) { PX.sfx("select"); this.enter(); } return; }
      if (this.win) { if (++this.win > 70) toEnding("stack", this.layers.length - 1); return; }
      const c = this.cur; c.x += c.dir * c.speed;
      if (c.x > W - c.w + 20 && c.dir > 0) c.dir = -1; if (c.x < -20 && c.dir < 0) c.dir = 1;
      if (I.pressed.a || I.pressed.down) this.drop();
    },
    drop() {
      const c = this.cur, top = this.layers[this.layers.length - 1], y = this.layerY(this.layers.length);
      const l = Math.max(c.x, top.x), r = Math.min(c.x + c.w, top.x + top.w);
      if (r - l <= 0) { this.fall.push({ x: c.x, y, w: c.w, vy: 0, vx: c.dir * 0.6, i: this.layers.length }); this.cur = null; this.over = true; this.overT = 0; PX.sfx("lose"); this.newBest = setBest("stack", this.layers.length - 1); return; }
      if (Math.abs(c.x - top.x) <= 2) {
        this.combo++; let w = top.w, x = top.x;
        if (this.combo >= 3 && w < MAXW) { w = Math.min(MAXW, w + 6); x = Math.max(0, x - 3); }
        this.layers.push({ x, w }); this.flash = 8; PX.sfx("perfect"); this.msg = { t: 0, s: this.combo >= 3 ? "PERFECT x" + this.combo : "PERFECT!" };
      } else {
        this.combo = 0; this.layers.push({ x: l, w: r - l });
        if (c.x < l) this.fall.push({ x: c.x, y, w: l - c.x, vy: 0, vx: -0.5, i: this.layers.length - 1 });
        if (c.x + c.w > r) this.fall.push({ x: r, y, w: c.x + c.w - r, vy: 0, vx: 0.5, i: this.layers.length - 1 });
        PX.sfx("drop");
      }
      if (this.layers.length - 1 >= STACK_GOAL) { this.win = 1; this.cur = null; setBest("stack", this.layers.length - 1); PX.sfx("clear"); return; }
      this.spawn();
    },
    drawLayer(x, y, w, i) {
      y = Math.round(y + this.cam); x = Math.round(x); if (y > H || y < -LH) return;
      const choc = i % 3 === 2; rect(x, y, w, LH, 3);
      if (w > 2) { rect(x + 1, y + 1, w - 2, LH - 2, choc ? 2 : 1); rect(x + 1, y + 1, w - 2, 2, 0); for (let k = x + 3; k < x + w - 2; k += 5) rect(k, y + 3, 1, 1 + ((k + i) % 2), 0); if (!choc) for (let k = x + 4; k < x + w - 3; k += 7) rect(k, y + 5, 2, 1, 2); }
    },
    draw() {
      rect(0, 0, W, H, 0);
      for (let y = 0; y < H; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) { const yy = ((y + this.cam * 0.4) % (H + 12) + H + 12) % (H + 12) - 6; rect(x + 2, yy, 2, 2, 1); }
      const py = Math.round(BASE_Y + this.cam);
      if (py < H + 4) { rect(W / 2 - 52, py, 104, 3, 3); rect(W / 2 - 50, py, 100, 1, 0); rect(W / 2 - 28, py + 3, 56, 3, 2); }
      this.layers.forEach((L, i) => this.drawLayer(L.x, this.layerY(i), L.w, i));
      if (this.flash) { const L = this.layers[this.layers.length - 1], y = this.layerY(this.layers.length - 1) + this.cam; rect(L.x - 2, y - 1, L.w + 4, 1, 3); rect(L.x - 2, y + LH, L.w + 4, 1, 3); }
      if (this.cur) this.drawLayer(this.cur.x, this.layerY(this.layers.length), this.cur.w, this.layers.length);
      this.fall.forEach((f) => this.drawLayer(f.x, f.y, f.w, f.i));
      if (this.win) { const L = this.layers[this.layers.length - 1], y = Math.round(this.layerY(this.layers.length - 1) + this.cam); sprite(HEROES[0].spr.a, L.x + L.w / 2 - 13, y - 12); sprite(HEROES[1].spr.a, L.x + L.w / 2 + 1, y - 12, true); txt("COMPLETE!", W / 2, 24, 3, 1, "center"); }
      if (this.over && this.layers.length > 1) {
        const L = this.layers[this.layers.length - 1], cx = Math.round(L.x + L.w / 2 - 1), cy = Math.round(this.layerY(this.layers.length - 1) + this.cam - 9);
        rect(cx + 1, cy + 2, 1, 7, 3); sprite([".33.33.", "3223223", "3222223", ".32223.", "..323..", "...3..."], cx - 2, cy - 5 - (Math.floor(this.t / 20) % 2));
      }
      rect(0, 0, W, 12, 0); rect(0, 12, W, 1, 3);
      txt("LAYERS " + (this.layers.length - 1) + "/" + STACK_GOAL, 4, 4); txt("HI " + pad(best("stack"), 3), W - 4, 4, 2, 1, "right");
      if (this.msg) txt(this.msg.s, W / 2, 20 - Math.min(4, this.msg.t / 4), 3, 1, "center");
      if (this.layers.length === 1 && !this.over) txt("A: DROP", W / 2, 24, 2, 1, "center");
      if (this.over && this.overT > 25) overBox("TOWER DONE", [(this.layers.length - 1) + " LAYERS"], this.overT, this.newBest, "stack");
    }
  };

  /* ---------- 4. 벽돌 깨기 ---------- */
  const LEVELS = [
    ["..##..##..", ".########.", ".########.", "..######..", "...####...", "....##...."],
    ["....##....", "...###....", "..####....", "....##....", "....##....", "....##....", "..######.."],
    ["##########", "#.#.#.#.#.", "##########", ".#.#.#.#.#", "##########"],
    ["#........#", "##......##", "###....###", "####..####", "##########"]
  ];
  const BW = 22, BS = 25, BX0 = (W - BS * 10 + 3) / 2;
  const brick = {
    enter() { Object.assign(this, { level: 0, score: 0, lives: 3, t: 0, over: false, overT: 0, win: 0, newBest: false, parts: [] }); this.load(); },
    load() {
      this.bricks = [];
      LEVELS[this.level % LEVELS.length].forEach((row, r) => row.split("").forEach((c, i) => { if (c === "#") this.bricks.push({ x: BX0 + i * BS, y: 18 + r * 8, w: BW, h: 6, hp: r === 0 && this.level >= 2 ? 2 : 1 }); }));
      this.pad = { x: W / 2 - 16, w: 32 }; this.ball = { x: 0, y: 0, vx: 0, vy: 0, stuck: true }; this.baseSpeed = 2 + Math.min(1.4, this.level * 0.3);
    },
    update() {
      this.t++;
      this.parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.t++; }); this.parts = this.parts.filter((p) => p.t < 30);
      if (this.over) { this.overT++; if (this.overT > 40 && (I.pressed.a || I.pressed.start)) { PX.sfx("select"); this.enter(); } return; }
      if (this.win) { if (--this.win === 0) { if (this.level >= LEVELS.length - 1) { setBest("brick", this.score); toEnding("brick", this.score); return; } this.level++; this.load(); } return; }
      const p = this.pad, b = this.ball;
      if (I.down.left) p.x -= 3.4; if (I.down.right) p.x += 3.4; p.x = PX.clamp(p.x, 0, W - p.w);
      if (b.stuck) { b.x = p.x + p.w / 2 - 1; b.y = 128; if (I.pressed.a || I.pressed.up) { const a = PX.rand(-0.5, 0.5); Object.assign(b, { vx: Math.sin(a) * this.baseSpeed, vy: -Math.cos(a) * this.baseSpeed, stuck: false }); PX.sfx("paddle"); } return; }
      for (let s = 0; s < 3; s++) {
        b.x += b.vx / 3;
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); PX.sfx("paddle"); } if (b.x > W - 3) { b.x = W - 3; b.vx = -Math.abs(b.vx); PX.sfx("paddle"); }
        if (this.hit()) b.vx = -b.vx;
        b.y += b.vy / 3;
        if (b.y < 14) { b.y = 14; b.vy = Math.abs(b.vy); PX.sfx("paddle"); }
        if (this.hit()) b.vy = -b.vy;
        if (b.vy > 0 && b.y + 3 >= 132 && b.y + 3 <= 136 && b.x + 3 > p.x && b.x < p.x + p.w) {
          const h = ((b.x + 1.5) - (p.x + p.w / 2)) / (p.w / 2), sp = Math.min(4, Math.hypot(b.vx, b.vy) + 0.02), a = PX.clamp(h, -1, 1) * 1.05;
          b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; b.y = 129; PX.sfx("paddle");
        }
      }
      if (b.y > H) { this.lives--; PX.sfx("hit"); if (this.lives <= 0) { this.over = true; this.overT = 0; this.newBest = setBest("brick", this.score); setTimeout(() => PX.sfx("lose"), 300); } else this.ball = { x: 0, y: 0, vx: 0, vy: 0, stuck: true }; }
      if (!this.bricks.length) { this.win = 90; this.score += 100; PX.sfx("clear"); }
    },
    hit() {
      const b = this.ball;
      for (let i = 0; i < this.bricks.length; i++) {
        const k = this.bricks[i];
        if (b.x < k.x + k.w && b.x + 3 > k.x && b.y < k.y + k.h && b.y + 3 > k.y) {
          if (--k.hp <= 0) { this.bricks.splice(i, 1); this.score += 10; for (let j = 0; j < 5; j++) this.parts.push({ x: k.x + 11, y: k.y + 3, vx: PX.rand(-1, 1), vy: PX.rand(-1.5, 0), t: 0 }); }
          PX.sfx("brick"); return true;
        }
      }
      return false;
    },
    draw() {
      rect(0, 0, W, H, 0);
      for (let y = 14; y < H; y += 2) for (let x = (y / 2) % 2 ? 1 : 0; x < W; x += 8) rect(x, y, 1, 1, 1);
      rect(0, 0, W, 12, 3); txt("SCORE " + pad(this.score), 4, 4, 0); txt("LV " + (this.level + 1) + "/" + LEVELS.length, W / 2, 4, 1, 1, "center");
      for (let i = 0; i < this.lives; i++) txt("*", W - 8 - i * 6, 4, 0);
      this.bricks.forEach((k) => { rect(k.x, k.y, k.w, k.h, 3); rect(k.x + 1, k.y + 1, k.w - 2, k.h - 2, k.hp > 1 ? 1 : 2); rect(k.x + 1, k.y + 1, k.w - 2, 1, k.hp > 1 ? 0 : 1); });
      this.parts.forEach((p) => rect(p.x, p.y, 1, 1, 3));
      rect(this.pad.x, 132, this.pad.w, 4, 3); rect(this.pad.x + 1, 133, this.pad.w - 2, 1, 1);
      if (!this.over) { rect(this.ball.x, this.ball.y, 3, 3, 3); }
      if (this.ball.stuck && !this.over) txt("A: LAUNCH", W / 2, 110, 2, 1, "center");
      if (this.win) { panel(W / 2 - 44, 56, 88, 22); txt("STAGE CLEAR!", W / 2, 64, 3, 1, "center"); }
      if (this.over && this.overT > 20) overBox("GAME OVER", ["SCORE " + pad(this.score)], this.overT, this.newBest, "brick");
    }
  };

  /* ---------- 엔딩 ---------- */
  const END_TEXT = { runner: ["RAN ALL THE WAY", "TO SEE YOU!"], catch: ["SHARING SWEETS", "WITH YOU!"], stack: ["OUR WEDDING CAKE", "IS DONE!"], brick: ["NO MORE WALLS", "BETWEEN US!"] };
  const HEART_S = [".33.33.", "3223223", "3222223", ".32223.", "..323..", "...3..."];
  const ending = {
    enter() { this.t = 0; this.hx = -16; PX.sfx("clear"); if (PX.cert) PX.cert.mark(this.game, this.score); },
    update() {
      this.t++;
      const tx = W / 2 - 22;
      if (this.hx < tx) this.hx = Math.min(tx, this.hx + 1.7);
      if (this.hx >= tx && !this.met) { this.met = this.t; PX.sfx("perfect"); }
      if (this.t > 170 && (I.pressed.a || I.pressed.start)) { PX.sfx("select"); const g = this.game, sc = this.score; go(menu); PX.cert && PX.cert.open(g, sc, HEROES[hero].name); }
    },
    draw() {
      const t = this.t;
      rect(0, 0, W, H, 0);
      for (let y = 6; y < GY; y += 12) for (let x = (y / 12) % 2 ? 6 : 0; x < W; x += 12) rect(x + 2, y, 2, 2, 1);
      rect(0, GY, W, 1, 3); rect(0, GY + 1, W, H - GY - 1, 2);
      for (let x = 0; x < W; x += 8) rect(x, GY + 4 + ((x / 8) % 2) * 4, 4, 1, 1);
      const me = HEROES[hero], you = HEROES[1 - hero], arrived = this.hx >= W / 2 - 22;
      sprite(arrived ? (Math.floor(t / 20) % 2 ? me.spr.a : me.spr.j) : (Math.floor(t / 6) % 2 ? me.spr.a : me.spr.b), this.hx, GY - 12 - (arrived && Math.floor(t / 20) % 2 ? 2 : 0));
      sprite(Math.floor(t / 30) % 2 ? you.spr.a : you.spr.b, W / 2 + 10, GY - 12, true);
      if (this.game === "catch") { sprite(ITEMS.cocoa.rows, W / 2 - 5, GY - 26); }
      if (this.game === "stack") { rect(W / 2 - 6, GY - 8, 12, 8, 3); rect(W / 2 - 5, GY - 7, 10, 2, 0); rect(W / 2 - 4, GY - 14, 8, 6, 3); rect(W / 2 - 3, GY - 13, 6, 2, 0); }
      if (this.met) {
        const k = t - this.met;
        for (let i = 0; i < 6; i++) { const hy = GY - 30 - ((k * 0.6 + i * 18) % 70), hx2 = W / 2 - 3 + Math.round(Math.sin((k + i * 40) / 14) * 16); if (hy > 20) sprite(HEART_S, hx2, hy); }
        panel(W / 2 - 66, 18, 132, 42);
        txt(me.name + " * " + you.name, W / 2, 24, 3, 1, "center");
        txt(END_TEXT[this.game][0], W / 2, 34, 3, 1, "center");
        txt(END_TEXT[this.game][1], W / 2, 42, 3, 1, "center");
        txt("SCORE " + pad(this.score), W / 2, 51, 2, 1, "center");
      } else txt("MISSION CLEAR!", W / 2, 24, 3, 1, "center");
      if (t > 170 && Math.floor(t / 25) % 2) txt("A: GET YOUR AWARD", W / 2, 70, 3, 1, "center");
    }
  };
  function toEnding(game, score) { ending.game = game; ending.score = Math.floor(score); ending.met = 0; setBest(game, score); go(ending); }

  const SCENES = { menu, runner, catch: caught, stack, brick, ending };
  function go(s) { scene = s; paused = false; s.enter(); I.reset(); }
  function step() {
    if (scene !== menu) {
      if (I.pressed.select && scene !== ending) { PX.sfx("back"); go(menu); I.endFrame(); return; }
      if (I.pressed.start && scene !== ending && !scene.over && (scene.started !== false)) { paused = !paused; PX.sfx("blip"); I.endFrame(); return; }
      if (I.pressed.b) I.pressed.a = true;
    }
    if (!paused) scene.update();
    I.endFrame();
  }
  function draw() {
    scene.draw();
    if (paused) { panel(W / 2 - 40, 50, 80, 34); txt("PAUSE", W / 2, 56, 3, 1, "center"); txt("START: GO", W / 2, 67, 2, 1, "center"); txt("SELECT: MENU", W / 2, 75, 2, 1, "center"); }
  }
  function loop(t) {
    if (!active) { raf = null; return; }
    const dt = Math.min(0.1, (t - lastT) / 1000 || 0); lastT = t; acc += dt;
    let n = 0; while (acc >= 1 / 60 && n < 5) { step(); acc -= 1 / 60; n++; }
    draw(); raf = requestAnimationFrame(loop);
  }
  PX.games = {
    mount(el) {
      cv = PX.$(".gb-canvas", el); ctx = cv.getContext("2d");
      PX.bindPad(el);
      cv.addEventListener("pointerdown", () => { PX.unlockAudio(); I.press("a"); setTimeout(() => I.release("a"), 80); });
      go(menu); draw();
    },
    setActive(on) {
      active = on; I.enabled = on; I.reset();
      if (on && !raf) { lastT = performance.now(); acc = 0; raf = requestAnimationFrame(loop); }
      if (!on && scene && scene !== menu && !scene.over) paused = true;
    },
    onSelect(fn) { onSelectCbs.push(fn); },
    toEnding
  };
  document.addEventListener("visibilitychange", () => { if (document.hidden && scene && scene !== menu && !scene.over) paused = true; });
})();
