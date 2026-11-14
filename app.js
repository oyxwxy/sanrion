/* ===== 설정 (여기만 수정하세요) ===== */
const START_DATE = '2025-11-15';            // 기념일 시작 날짜
const FIREBASE_CONFIG = {                   // Firebase 콘솔 > 프로젝트 설정 > 웹 앱 구성값
  apiKey: 'YOUR_API_KEY', authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT', appId: 'YOUR_APP_ID'
};
/* =================================== */
const $ = s => document.querySelector(s);

// D+day
$('#days').textContent = Math.max(1, Math.floor((Date.now() - new Date(START_DATE)) / 864e5) + 1);

/* ---------- 게임: 코인 러너 ---------- */
(() => {
  const cv = $('#cv'), c = cv.getContext('2d'), G = 180;
  let p, obs, coins, score, speed, t, run = false, best = +localStorage.getItem('best') || 0;
  $('#best').textContent = best;
  const reset = () => { p = {x: 60, y: G - 28, vy: 0, w: 28, h: 28}; obs = []; coins = []; score = 0; speed = 4; t = 0; run = true; };
  const jump = () => { if (!run) return reset(); if (p.y >= G - p.h) p.vy = -11.5; };
  addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
  cv.addEventListener('pointerdown', jump);
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function hero(x, y, f) {                  // 오리지널 도트 히어로
    c.fillStyle = '#e60012'; c.fillRect(x, y, 28, 8); c.fillRect(x + 4, y - 4, 20, 4);
    c.fillStyle = '#ffcc99'; c.fillRect(x + 4, y + 8, 20, 8);
    c.fillStyle = '#1b1b2f'; c.fillRect(x + 16, y + 10, 4, 4);
    c.fillStyle = '#2a5bd7'; c.fillRect(x + 4, y + 16, 20, 8);
    c.fillStyle = '#4a2a10'; c.fillRect(x + (f ? 4 : 12), y + 24, 12, 4);
  }
  function loop() {
    c.clearRect(0, 0, 640, 220);
    c.fillStyle = '#e69c3c'; c.fillRect(0, G, 640, 40);
    c.fillStyle = '#c84c0c';
    for (let i = 0; i < 17; i++) c.fillRect(((i * 40 - (t * speed) % 40) | 0), G, 4, 40);
    if (run) {
      t++; speed = 4 + score / 150; p.vy += .65; p.y = Math.min(G - p.h, p.y + p.vy);
      if (!(t % Math.max(50, 95 - (score / 10 | 0)))) obs.push({x: 660, y: G - 28, w: 28, h: 28});
      if (!(t % 70)) coins.push({x: 660, y: G - 40 - Math.random() * 60, w: 16, h: 16});
      obs.forEach(o => o.x -= speed); coins.forEach(o => o.x -= speed);
      coins = coins.filter(o => o.x > -20 && !(hit(p, o) && (score += 10)));
      obs = obs.filter(o => o.x > -40);
      if (obs.some(o => hit({x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 4}, o))) {
        run = false; if (score > best) { best = score; localStorage.setItem('best', best); $('#best').textContent = best; }
      }
      score += .05; $('#sc').textContent = score | 0;
    }
    c.fillStyle = '#ffc400'; coins.forEach(o => { c.fillRect(o.x, o.y, 16, 16); c.fillStyle = '#fff'; c.fillRect(o.x + 4, o.y + 3, 4, 8); c.fillStyle = '#ffc400'; });
    obs.forEach(o => { c.fillStyle = '#b5651d'; c.fillRect(o.x, o.y, 28, 28); c.fillStyle = '#fff'; c.fillRect(o.x + 11, o.y + 6, 6, 4); c.fillRect(o.x + 11, o.y + 14, 6, 8); });
    if (p) hero(p.x, p.y, t >> 3 & 1);
    if (!run) { c.fillStyle = '#1b1b2f'; c.font = '16px Galmuri11,monospace'; c.textAlign = 'center';
      c.fillText(p ? 'GAME OVER · 스페이스/클릭으로 다시' : 'START · 스페이스/클릭', 320, 100); }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ---------- 도트 캐릭터 에디터 ---------- */
(() => {
  const N = 16, S = 20, ed = $('#ed'), c = ed.getContext('2d');
  const COLORS = ['#1b1b2f','#ffffff','#e60012','#ff8a00','#ffc400','#00a651','#5c94fc','#2a5bd7',
                  '#8e44ad','#ff7eb6','#ffcc99','#b5651d','#4a2a10','#9aa0a6','#00c2c7','#b8e986'];
  let grid = Array.from({length: N}, () => Array(N).fill(null)), color = COLORS[2], tool = 'pen', down = false;
  // 기본 캐릭터 밑그림
  [[5,3,9,3,'#e60012'],[4,4,11,4,'#e60012'],[4,5,11,7,'#ffcc99'],[6,6,6,6,'#1b1b2f'],[9,6,9,6,'#1b1b2f'],
   [4,8,11,11,'#2a5bd7'],[3,9,3,10,'#ffcc99'],[12,9,12,10,'#ffcc99'],[5,12,6,13,'#4a2a10'],[9,12,10,13,'#4a2a10']]
   .forEach(([x1,y1,x2,y2,col]) => { for (let y=y1;y<=y2;y++) for (let x=x1;x<=x2;x++) grid[y][x]=col; });

  const pal = $('#pal');
  COLORS.forEach(col => { const i = document.createElement('i'); i.style.background = col; i.onclick = () => { color = col; tool = tool === 'erase' ? 'pen' : tool; sync(); };
    i.dataset.c = col; pal.append(i); });
  const sync = () => { pal.querySelectorAll('i').forEach(i => i.classList.toggle('on', i.dataset.c === color));
    document.querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === tool)); };
  document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; sync(); });
  sync();

  function draw() {
    c.clearRect(0, 0, 320, 320);
    grid.forEach((r, y) => r.forEach((v, x) => { if (v) { c.fillStyle = v; c.fillRect(x * S, y * S, S, S); } }));
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.beginPath();
    for (let i = 0; i <= N; i++) { c.moveTo(i * S, 0); c.lineTo(i * S, 320); c.moveTo(0, i * S); c.lineTo(320, i * S); } c.stroke();
  }
  function fill(x, y, to) {
    const from = grid[y][x]; if (from === to) return; const st = [[x, y]];
    while (st.length) { const [a, b] = st.pop(); if (a < 0 || b < 0 || a >= N || b >= N || grid[b][a] !== from) continue;
      grid[b][a] = to; st.push([a+1,b],[a-1,b],[a,b+1],[a,b-1]); }
  }
  function act(e) {
    const r = ed.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * N | 0, y = (e.clientY - r.top) / r.height * N | 0;
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    if (tool === 'fill') { if (e.type === 'pointerdown') fill(x, y, color); } else grid[y][x] = tool === 'erase' ? null : color;
    draw();
  }
  ed.addEventListener('pointerdown', e => { down = true; ed.setPointerCapture(e.pointerId); act(e); });
  ed.addEventListener('pointermove', e => down && act(e));
  addEventListener('pointerup', () => down = false);
  $('#clr').onclick = () => { grid = grid.map(r => r.map(() => null)); draw(); };
  $('#save').onclick = () => {
    const o = document.createElement('canvas'); o.width = o.height = 512; const x = o.getContext('2d'); x.imageSmoothingEnabled = false;
    grid.forEach((r, yy) => r.forEach((v, xx) => { if (v) { x.fillStyle = v; x.fillRect(xx * 32, yy * 32, 32, 32); } }));
    o.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'my-pixel-character.png'; a.click(); URL.revokeObjectURL(a.href); });
  };
  draw();
})();

/* ---------- 방명록 (Firebase Firestore, 미설정 시 로컬 데모) ---------- */
(() => {
  const list = $('#gl'), stat = $('#gstat'), live = FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY' && window.firebase;
  const render = items => { list.replaceChildren(...items.map(d => { const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = d.name; const m = document.createElement('div'); m.textContent = d.msg;
    const s = document.createElement('small'); s.textContent = d.at ? new Date(d.at).toLocaleString('ko-KR') : ''; li.append(b, m, s); return li; })); };
  let db;
  if (live) {
    firebase.initializeApp(FIREBASE_CONFIG); db = firebase.firestore();
    db.collection('guestbook').orderBy('createdAt', 'desc').limit(50).onSnapshot(
      q => render(q.docs.map(x => { const d = x.data(); return {name: d.name, msg: d.msg, at: d.createdAt && d.createdAt.toMillis()}; })),
      () => stat.textContent = '방명록을 불러오지 못했어요. Firestore 규칙을 확인해 주세요.');
  } else {
    stat.textContent = '⚠ Firebase 미설정: 이 브라우저에만 저장되는 데모 모드입니다.';
    render(JSON.parse(localStorage.getItem('gb') || '[]'));
  }
  $('#gf').onsubmit = async e => {
    e.preventDefault(); const name = $('#gn').value.trim(), msg = $('#gm').value.trim(); if (!name || !msg) return;
    try {
      if (live) await db.collection('guestbook').add({name, msg, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
      else { const a = JSON.parse(localStorage.getItem('gb') || '[]'); a.unshift({name, msg, at: Date.now()}); localStorage.setItem('gb', JSON.stringify(a)); render(a); }
      e.target.reset();
    } catch (err) { stat.textContent = '등록에 실패했어요. 잠시 후 다시 시도해 주세요.'; }
  };
})();
