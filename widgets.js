/* =========================================================
   WIDGETS — 직접 만든 컬러피커 / 셀렉트 / 스테퍼 / 모달
   (브라우저 기본 컬러피커·셀렉트 사용 안 함)
   ========================================================= */
(function () {
  const PX = window.PX;
  const ui = (PX.ui = {});

  /* ---------- 색 변환 ---------- */
  function rgb2hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, mx ? d / mx : 0, mx];
  }
  function hsv2rgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255].map(Math.round);
  }
  ui.rgb2hsv = rgb2hsv; ui.hsv2rgb = hsv2rgb;

  /* ---------- 스테퍼: [−][숫자][+] ---------- */
  ui.stepper = function ({ value = 0, min = -Infinity, max = Infinity, step = 1, big = 10, suffix = "", onChange, width = 46 }) {
    const el = document.createElement("span");
    el.className = "stepper";
    el.innerHTML = `<button type="button" class="st-btn" data-d="-1" aria-label="줄이기">−</button><input class="st-in" inputmode="numeric" style="width:${width}px"><span class="st-suf">${suffix}</span><button type="button" class="st-btn" data-d="1" aria-label="늘리기">+</button>`;
    const inp = el.querySelector("input");
    let v = value;
    const set = (nv, fire = true) => {
      nv = Math.round(PX.clamp(nv, min, max) / step) * step;
      nv = +nv.toFixed(3);
      v = nv; inp.value = nv;
      if (fire && onChange) onChange(nv);
    };
    set(v, false);
    let hold, rep;
    el.querySelectorAll(".st-btn").forEach((b) => {
      const d = +b.dataset.d;
      const go = (e) => set(v + d * (e && e.shiftKey ? big : step));
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault(); go(e);
        hold = setTimeout(() => (rep = setInterval(() => go(e), 60)), 380);
      });
      const stop = () => { clearTimeout(hold); clearInterval(rep); };
      b.addEventListener("pointerup", stop); b.addEventListener("pointerleave", stop);
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") { e.preventDefault(); set(v + (e.shiftKey ? big : step)); }
      else if (e.key === "ArrowDown") { e.preventDefault(); set(v - (e.shiftKey ? big : step)); }
      else if (e.key === "Enter") inp.blur();
      e.stopPropagation();
    });
    inp.addEventListener("change", () => { const n = parseFloat(inp.value); if (isNaN(n)) inp.value = v; else set(n); });
    el.setValue = (nv) => set(nv, false);
    el.getValue = () => v;
    return el;
  };

  /* ---------- 셀렉트 (커스텀 드롭다운) ---------- */
  let openSelect = null;
  ui.select = function ({ options, value, onChange, fontPreview = false }) {
    const el = document.createElement("div");
    el.className = "xselect";
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "xs-btn";
    el.appendChild(btn);
    let cur = value;
    const paint = () => {
      const o = options.find((x) => x.value === cur) || options[0];
      btn.innerHTML = ""; const s = document.createElement("span"); s.textContent = o.label;
      if (fontPreview && o.font) s.style.fontFamily = o.font;
      btn.appendChild(s); const ar = document.createElement("i"); btn.appendChild(ar);
    };
    paint();
    function close() { const l = el.querySelector(".xs-list"); if (l) l.remove(); el.classList.remove("open"); if (openSelect === close) openSelect = null; }
    function open() {
      if (openSelect) openSelect();
      el.classList.add("open");
      const list = document.createElement("ul"); list.className = "xs-list"; list.tabIndex = -1;
      let hi = Math.max(0, options.findIndex((x) => x.value === cur));
      options.forEach((o, i) => {
        const li = document.createElement("li");
        li.textContent = o.label; if (fontPreview && o.font) li.style.fontFamily = o.font;
        if (o.value === cur) li.classList.add("is-on");
        li.addEventListener("pointerdown", (e) => { e.preventDefault(); choose(o.value); });
        list.appendChild(li);
      });
      const mark = () => list.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-hi", i === hi));
      mark();
      list.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "ArrowDown") { hi = Math.min(options.length - 1, hi + 1); mark(); e.preventDefault(); }
        else if (e.key === "ArrowUp") { hi = Math.max(0, hi - 1); mark(); e.preventDefault(); }
        else if (e.key === "Enter") { choose(options[hi].value); e.preventDefault(); }
        else if (e.key === "Escape") { close(); btn.focus(); }
      });
      list.addEventListener("blur", () => setTimeout(close, 80));
      el.appendChild(list); list.focus();
      openSelect = close;
    }
    function choose(v) { cur = v; paint(); close(); onChange && onChange(v); PX.sfx("move"); }
    btn.addEventListener("click", () => (el.classList.contains("open") ? close() : open()));
    el.setValue = (v) => { cur = v; paint(); };
    return el;
  };

  /* ---------- 컬러피커 ---------- */
  const THEME = ["#ffffff", "#fde8f0", "#f8bfd3", "#e0578a", "#b83a6b", "#3a1d2e", "#c8323f", "#1f8f63", "#a8e6dc", "#d9a441", "#1e1b22", "#f4f2f6"];
  let pk = null;
  function buildPicker() {
    const el = document.createElement("div");
    el.className = "cpick";
    el.innerHTML = `
      <div class="cp-head"><span>COLOR</span><button type="button" class="cp-x" aria-label="닫기">×</button></div>
      <canvas class="cp-sv" width="168" height="112"></canvas>
      <canvas class="cp-hue" width="168" height="12"></canvas>
      <div class="cp-row">
        <div class="cp-prev"><i class="cp-old"></i><i class="cp-new"></i></div>
        <label class="cp-hex"><span>#</span><input maxlength="6" spellcheck="false"></label>
      </div>
      <div class="cp-rgb"></div>
      <div class="cp-label">테마 색</div><div class="cp-sw cp-theme"></div>
      <div class="cp-label">최근 색</div><div class="cp-sw cp-recent"></div>
      <div class="cp-btns"><button type="button" class="px-btn sm ghost cp-cancel">취소 (Esc)</button><button type="button" class="px-btn sm cp-ok">적용 (Enter)</button></div>`;
    return el;
  }
  ui.colorPicker = {
    open({ anchor, value, onInput, onCommit, onCancel }) {
      this.close(true);
      const app = PX.$(".px-app");
      const el = buildPicker();
      app.appendChild(el);
      const sv = el.querySelector(".cp-sv"), hue = el.querySelector(".cp-hue");
      const svx = sv.getContext("2d"), hx = hue.getContext("2d");
      const hexIn = el.querySelector(".cp-hex input");
      const orig = (value || "#ffffff").toLowerCase();
      let [r, g, b] = PX.hexToRgb(orig);
      let [h, s, v] = rgb2hsv(r, g, b);
      const rgbBox = el.querySelector(".cp-rgb");
      const steps = ["R", "G", "B"].map((lab, i) => {
        const w = document.createElement("label"); w.className = "cp-ch"; w.innerHTML = `<span>${lab}</span>`;
        const st = ui.stepper({ value: [r, g, b][i], min: 0, max: 255, step: 1, big: 16, width: 34, onChange: (n) => {
          const a = [r, g, b]; a[i] = n; [r, g, b] = a; [h, s, v] = rgb2hsv(r, g, b); update(true, "rgb");
        } });
        w.appendChild(st); rgbBox.appendChild(w); return st;
      });
      const hexOf = () => PX.rgbToHex(r, g, b);
      function drawHue() {
        for (let x = 0; x < 168; x++) { const [rr, gg, bb] = hsv2rgb((x / 168) * 360, 1, 1); hx.fillStyle = `rgb(${rr},${gg},${bb})`; hx.fillRect(x, 0, 1, 12); }
        const hxp = Math.round((h / 360) * 167);
        hx.fillStyle = "#fff"; hx.fillRect(hxp - 2, 0, 5, 12); hx.fillStyle = "#3a1d2e"; hx.fillRect(hxp - 1, 1, 3, 10);
        const [rr, gg, bb] = hsv2rgb(h, 1, 1); hx.fillStyle = `rgb(${rr},${gg},${bb})`; hx.fillRect(hxp, 2, 1, 8);
      }
      function drawSV() {
        const [hr, hg, hb] = hsv2rgb(h, 1, 1);
        const gx = svx.createLinearGradient(0, 0, 168, 0); gx.addColorStop(0, "#fff"); gx.addColorStop(1, `rgb(${hr},${hg},${hb})`);
        svx.fillStyle = gx; svx.fillRect(0, 0, 168, 112);
        const gy = svx.createLinearGradient(0, 0, 0, 112); gy.addColorStop(0, "rgba(0,0,0,0)"); gy.addColorStop(1, "#000");
        svx.fillStyle = gy; svx.fillRect(0, 0, 168, 112);
        const px = Math.round(s * 167), py = Math.round((1 - v) * 111);
        svx.fillStyle = v > 0.55 ? "#3a1d2e" : "#fff";
        svx.fillRect(px - 5, py, 4, 1); svx.fillRect(px + 2, py, 4, 1); svx.fillRect(px, py - 5, 1, 4); svx.fillRect(px, py + 2, 1, 4);
      }
      function update(fire, from) {
        drawHue(); drawSV();
        const hex = hexOf();
        if (from !== "hex") hexIn.value = hex.slice(1);
        if (from !== "rgb") steps.forEach((st, i) => st.setValue([r, g, b][i]));
        el.querySelector(".cp-new").style.background = hex;
        if (fire && onInput) onInput(hex);
      }
      el.querySelector(".cp-old").style.background = orig;
      const drag = (cv, fn) => {
        const at = (e) => { const rc = cv.getBoundingClientRect(); fn(PX.clamp((e.clientX - rc.left) / rc.width, 0, 1), PX.clamp((e.clientY - rc.top) / rc.height, 0, 1)); };
        cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); at(e); cv._d = true; });
        cv.addEventListener("pointermove", (e) => cv._d && at(e));
        cv.addEventListener("pointerup", () => (cv._d = false));
      };
      drag(sv, (x, y) => { s = x; v = 1 - y; [r, g, b] = hsv2rgb(h, s, v); update(true); });
      drag(hue, (x) => { h = Math.min(359.9, x * 360); [r, g, b] = hsv2rgb(h, s, v); update(true); });
      hexIn.addEventListener("input", () => {
        const t = hexIn.value.replace(/[^0-9a-f]/gi, "");
        if (t.length === 6 || t.length === 3) { [r, g, b] = PX.hexToRgb(t); [h, s, v] = rgb2hsv(r, g, b); update(true, "hex"); }
      });
      const sw = (box, list) => list.forEach((c) => {
        const bt = document.createElement("button"); bt.type = "button"; bt.className = "sw sm"; bt.style.setProperty("--c", c); bt.title = c;
        bt.onclick = () => { [r, g, b] = PX.hexToRgb(c); [h, s, v] = rgb2hsv(r, g, b); update(true); };
        box.appendChild(bt);
      });
      sw(el.querySelector(".cp-theme"), THEME);
      sw(el.querySelector(".cp-recent"), PX.store.get("recentColors", []).slice(0, 12));
      const commit = () => {
        const hex = hexOf();
        const rec = [hex, ...PX.store.get("recentColors", []).filter((c) => c !== hex)].slice(0, 12);
        PX.store.set("recentColors", rec);
        onCommit && onCommit(hex); this.close(true); PX.sfx("select");
      };
      const cancel = () => { onInput && onInput(orig); onCancel && onCancel(orig); this.close(true); };
      el.querySelector(".cp-ok").onclick = commit;
      el.querySelector(".cp-cancel").onclick = cancel;
      el.querySelector(".cp-x").onclick = cancel;
      el.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Escape") cancel();
        if (e.key === "Enter" && e.target.tagName !== "BUTTON") { hexIn.blur(); commit(); }
      });
      // 위치
      const ar = anchor.getBoundingClientRect(), ap = app.getBoundingClientRect();
      const W = 212, Hh = 420;
      let left = ar.left - ap.left, top = ar.bottom - ap.top + 8;
      left = PX.clamp(left, 8, ap.width - W - 8);
      if (top + Hh > ap.height - 8) top = Math.max(8, ar.top - ap.top - Hh - 8);
      el.style.left = left + "px"; el.style.top = top + "px";
      update(false);
      el.tabIndex = -1; setTimeout(() => el.focus(), 0);
      const outside = (e) => { if (!el.contains(e.target) && e.target !== anchor && !anchor.contains(e.target)) commit(); };
      setTimeout(() => document.addEventListener("pointerdown", outside), 0);
      pk = { el, outside };
    },
    close() {
      if (!pk) return;
      document.removeEventListener("pointerdown", pk.outside);
      pk.el.remove(); pk = null;
    },
    isOpen: () => !!pk
  };

  /* 색 버튼: 누르면 커스텀 피커가 열림 */
  ui.colorButton = function ({ value, onInput, onCommit, title = "색 고르기", cls = "" }) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "sw sw-pick " + cls; b.title = title;
    b.style.setProperty("--c", value);
    let cur = value;
    b.onclick = () => ui.colorPicker.open({
      anchor: b, value: cur,
      onInput: (c) => { b.style.setProperty("--c", c); onInput && onInput(c); },
      onCommit: (c) => { cur = c; b.style.setProperty("--c", c); onCommit && onCommit(c); },
      onCancel: (c) => b.style.setProperty("--c", c)
    });
    b.setValue = (c) => { cur = c; b.style.setProperty("--c", c); };
    return b;
  };

  /* ---------- 모달 ---------- */
  ui.modal = function ({ title, body, cls = "", onClose }) {
    const app = PX.$(".px-app");
    const wrap = document.createElement("div");
    wrap.className = "xmodal " + cls;
    wrap.innerHTML = `<div class="xm-win" role="dialog" aria-modal="true"><div class="xm-bar"><span class="xm-title"></span><span class="xm-ctrl"><i></i><i></i><button type="button" class="xm-close" aria-label="닫기">×</button></span></div><div class="xm-body"></div></div>`;
    wrap.querySelector(".xm-title").textContent = title;
    const bd = wrap.querySelector(".xm-body");
    if (typeof body === "string") bd.innerHTML = body; else bd.appendChild(body);
    const close = () => { wrap.classList.add("out"); setTimeout(() => wrap.remove(), 200); document.removeEventListener("keydown", key, true); onClose && onClose(); PX.sfx("back"); };
    const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
    document.addEventListener("keydown", key, true);
    wrap.addEventListener("pointerdown", (e) => { if (e.target === wrap) close(); });
    wrap.querySelector(".xm-close").onclick = close;
    app.appendChild(wrap);
    // 모달이 화면 안에 보이도록
    const win = wrap.querySelector(".xm-win");
    const vy = PX.viewport().top + 20;
    win.style.marginTop = Math.min(vy, Math.max(20, app.offsetHeight - win.offsetHeight - 20)) + "px";
    PX.sfx("select");
    return { el: wrap, body: bd, close };
  };
})();
